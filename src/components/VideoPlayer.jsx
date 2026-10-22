import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { 
  Play, Pause, RotateCcw, Repeat, ChevronLeft, ChevronRight, 
  Maximize2, Copy, Check, FastForward, Rewind,
  Hand, ChevronDown, ChevronUp
} from 'lucide-react';
import { VIDEO_PATH, F2L_GROUPS, invertAlgorithm } from '../data/f2lCases';
import { resolveAssetUrl } from '../utils/assetUrl';

const VideoPlayer = forwardRef(function VideoPlayer({
  currentCase,
  casesList,
  onSelectCase,
  isMastered,
  onToggleMastered,
  theme = 'dark',
  videoPath = VIDEO_PATH,
  groups = F2L_GROUPS
}, ref) {
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [copiedScramble, setCopiedScramble] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverRatio, setHoverRatio] = useState(null);
  const [isMobileDetailsExpanded, setIsMobileDetailsExpanded] = useState(true);

  const isDark = theme === 'dark';

  // Compute inverted scramble (setup formula)
  const scramble = React.useMemo(() => invertAlgorithm(currentCase?.algorithm), [currentCase]);

  // Case duration and progress
  const caseDuration = currentCase ? Math.max(0.1, currentCase.endSec - currentCase.startSec) : 1;
  const currentOffset = currentCase ? Math.max(0, Math.min(caseDuration, currentTime - currentCase.startSec)) : 0;
  const progressPercent = Math.min(100, Math.max(0, (currentOffset / caseDuration) * 100));

  // Jump to startSec when currentCase or videoPath changes
  useEffect(() => {
    if (!currentCase || !videoRef.current) return;
    const v = videoRef.current;
    v.muted = true;
    v.currentTime = currentCase.startSec;
    setCurrentTime(currentCase.startSec);
    v.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  }, [currentCase?.id, videoPath]);

  // Handle timeupdate for looping & progress
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !currentCase || isDragging) return;
    const v = videoRef.current;
    const now = v.currentTime;
    setCurrentTime(now);

    // If reaching the end of current case
    if (now >= currentCase.endSec - 0.1) {
      if (isLooping) {
        v.currentTime = currentCase.startSec;
        v.play().catch(() => {});
      } else {
        const currentIndex = casesList.findIndex(c => c.id === currentCase.id);
        if (currentIndex !== -1 && currentIndex + 1 < casesList.length) {
          onSelectCase(casesList[currentIndex + 1]);
        } else {
          v.pause();
          setIsPlaying(false);
        }
      }
    }
  }, [currentCase, isLooping, casesList, onSelectCase, isDragging]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleReplay = useCallback(() => {
    if (!videoRef.current || !currentCase) return;
    videoRef.current.currentTime = currentCase.startSec;
    videoRef.current.play();
    setIsPlaying(true);
  }, [currentCase]);

  const handleStep = useCallback((delta) => {
    if (!videoRef.current || !currentCase) return;
    const newTime = Math.max(
      currentCase.startSec, 
      Math.min(currentCase.endSec - 0.05, videoRef.current.currentTime + delta)
    );
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [currentCase]);

  const changeSpeed = useCallback((rate) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const toggleLooping = useCallback(() => {
    setIsLooping(prev => !prev);
  }, []);

  const requestFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen();
  }, []);

  // Expose methods to parent ref for global shortcuts
  useImperativeHandle(ref, () => ({
    togglePlay,
    handleReplay,
    handleStep,
    changeSpeed,
    toggleLooping,
    requestFullscreen
  }), [togglePlay, handleReplay, handleStep, changeSpeed, toggleLooping, requestFullscreen]);

  // Drag / Click to seek
  const seekToPosition = useCallback((clientX) => {
    if (!progressBarRef.current || !currentCase || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetSec = currentCase.startSec + ratio * caseDuration;
    videoRef.current.currentTime = targetSec;
    setCurrentTime(targetSec);
  }, [currentCase, caseDuration]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    seekToPosition(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverRatio(ratio);

    if (isDragging) {
      seekToPosition(e.clientX);
    }
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleCopyScramble = () => {
    if (!scramble) return;
    navigator.clipboard.writeText(scramble);
    setCopiedScramble(true);
    setTimeout(() => setCopiedScramble(false), 2000);
  };

  const handleCopySolution = () => {
    if (!currentCase) return;
    navigator.clipboard.writeText(currentCase.algorithm);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const currentIndex = casesList.findIndex(c => c.id === currentCase?.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < casesList.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) onSelectCase(casesList[currentIndex - 1]);
  }, [hasPrev, casesList, currentIndex, onSelectCase]);

  const handleNext = useCallback(() => {
    if (hasNext) onSelectCase(casesList[currentIndex + 1]);
  }, [hasNext, casesList, currentIndex, onSelectCase]);

  const groupInfo = currentCase && groups ? groups[currentCase.group] : null;

  const formatTime = (seconds) => {
    const s = Math.floor(Math.max(0, seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-full border-2 overflow-hidden flex flex-col justify-between transition-colors ${
      isDark 
        ? 'bg-[#0a0a0a] border-zinc-800 text-zinc-100' 
        : 'bg-[#ffffff] border-black text-black'
    }`}>
      {/* 1. Video Container with LineLore stark frame */}
      <div className="relative aspect-video lg:max-h-[calc(100%-200px)] bg-black w-full overflow-hidden select-none group flex items-center justify-center border-b border-black dark:border-zinc-800">
        <video
          ref={videoRef}
          src={resolveAssetUrl(videoPath)}
          playsInline
          muted
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setVideoError(true)}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Crisp Industrial Pause Indicator */}
        {!isPlaying && (
          <div 
            onClick={togglePlay}
            title="点击继续播放 (快捷键: 空格)"
            className="absolute bottom-3 right-3 px-3 py-1.5 bg-black border border-white text-white font-mono text-xs font-bold tracking-wider cursor-pointer hover:bg-[#ff5b00] hover:text-black hover:border-black transition-colors flex items-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>PAUSED // 空格播放</span>
          </div>
        )}

        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-center p-6 font-mono">
            <p className="text-[#ff5b00] font-black mb-1">[ ERR: VIDEO_NOT_FOUND ]</p>
            <p className="text-xs text-zinc-400">
              请确保 public/videos 目录下视频文件已就绪
            </p>
          </div>
        )}

        {/* Looping / Sequence Toggle at Top-Right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
          <button
            onClick={toggleLooping}
            title={isLooping ? "当前: 单 Case 循环 (快捷键 L)" : "当前: 顺序连播 (快捷键 L)"}
            className={`px-2 py-0.5 font-mono text-[11px] font-bold border transition-colors flex items-center gap-1 ${
              isLooping 
                ? 'bg-[#ff5b00] text-black border-black' 
                : 'bg-black/80 text-zinc-300 border-zinc-700 hover:text-white hover:border-white'
            }`}
          >
            <Repeat className="w-3 h-3" />
            <span>{isLooping ? 'LOOP // 循环' : 'SEQ // 连播'}</span>
          </button>
        </div>
      </div>

      {/* 2. LineLore Safety Orange Draggable Scrubber */}
      <div 
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseLeave={() => setHoverRatio(null)}
        title="拖动或点击跳转 (← 快退 2s / → 快进 2s)"
        className={`relative w-full h-3 cursor-pointer group/progress transition-all select-none flex items-center border-b ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-200 border-black'
        }`}
      >
        {/* Track */}
        <div className="w-full h-1.5 group-hover/progress:h-2 transition-all relative overflow-hidden bg-zinc-300 dark:bg-zinc-800">
          {/* Progress fill */}
          <div 
            className="h-full bg-[#ff5b00] transition-[width] duration-75 relative"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Square Thumb Scrubber */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-black dark:border-white pointer-events-none group-hover/progress:scale-125 transition-transform"
          style={{ left: `${progressPercent}%` }}
        />

        {/* Hover preview marker */}
        {hoverRatio !== null && !isDragging && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-black dark:bg-white pointer-events-none"
            style={{ left: `${hoverRatio * 100}%` }}
          />
        )}
      </div>

      {/* 3. Control Toolbar */}
      <div className={`px-2.5 sm:px-3 py-1.5 border-b flex flex-wrap items-center justify-between gap-2 transition-colors ${
        isDark ? 'bg-[#0a0a0a] border-zinc-800' : 'bg-zinc-50 border-black'
      }`}>
        {/* Playback Controls */}
        <div className="flex items-center gap-1">
          {/* Previous Case */}
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            title="上一个 Case ([)"
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border transition-colors disabled:opacity-30 ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-white hover:text-black' 
                : 'bg-white border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Rewind 2s */}
          <button
            onClick={() => handleStep(-2)}
            title="快退 2 秒 (← / J)"
            className={`px-2 h-7 sm:h-8 flex items-center gap-0.5 border font-mono text-xs font-bold transition-colors ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-white hover:text-black' 
                : 'bg-white border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            <Rewind className="w-3 h-3" />
            <span>-2s</span>
          </button>

          {/* Play/Pause Primary Button */}
          <button
            onClick={togglePlay}
            title={isPlaying ? "暂停 (空格键)" : "播放 (空格键)"}
            className="px-3 sm:px-4 h-7 sm:h-8 bg-[#ff5b00] hover:bg-[#e05000] text-black font-mono font-black text-xs uppercase flex items-center gap-1.5 border border-black transition-colors"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-black" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>PLAY</span>
              </>
            )}
          </button>

          {/* Replay */}
          <button
            onClick={handleReplay}
            title="重播当前手法 (R)"
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border transition-colors ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-white hover:text-black' 
                : 'bg-white border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Forward 2s */}
          <button
            onClick={() => handleStep(2)}
            title="快进 2 秒 (→ / K)"
            className={`px-2 h-7 sm:h-8 flex items-center gap-0.5 border font-mono text-xs font-bold transition-colors ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-white hover:text-black' 
                : 'bg-white border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            <span>+2s</span>
            <FastForward className="w-3 h-3" />
          </button>

          {/* Next Case */}
          <button
            onClick={handleNext}
            disabled={!hasNext}
            title="下一个 Case (])"
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border transition-colors disabled:opacity-30 ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-white hover:text-black' 
                : 'bg-white border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Precision Time Counter */}
          <div className={`ml-1 text-[11px] font-mono px-2 h-7 sm:h-8 border hidden sm:flex items-center gap-1 ${
            isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-white border-black text-black'
          }`}>
            <span className="text-[#ff5b00] font-black">{formatTime(currentOffset)}</span>
            <span className="opacity-40">/</span>
            <span>{formatTime(caseDuration)}</span>
          </div>
        </div>

        {/* Speed Controls & Fullscreen */}
        <div className="flex items-center gap-1.5">
          {/* Speed Selection */}
          <div className={`flex items-center p-0.5 border font-mono text-xs ${
            isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-black'
          }`}>
            {/* Mobile speed toggle */}
            <button
              onClick={() => {
                const rates = [0.5, 0.75, 1.0, 1.25];
                const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
                changeSpeed(rates[nextIndex]);
              }}
              title="切换播放倍速"
              className="sm:hidden px-2 py-0.5 font-bold text-[#ff5b00]"
            >
              [{playbackRate}x]
            </button>

            {/* Desktop speed tabs */}
            <div className="hidden sm:flex items-center">
              {[0.5, 0.75, 1.0, 1.25].map(rate => (
                <button
                  key={rate}
                  onClick={() => changeSpeed(rate)}
                  className={`px-1.5 py-0.5 text-[11px] font-bold transition-colors ${
                    playbackRate === rate
                      ? isDark 
                        ? 'bg-white text-black' 
                        : 'bg-black text-white'
                      : isDark 
                        ? 'text-zinc-400 hover:text-white' 
                        : 'text-zinc-600 hover:text-black'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={requestFullscreen}
            title="全屏播放 (F)"
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border transition-colors ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-white hover:text-black' 
                : 'bg-white border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4. Case Details & Technical Algorithm Card */}
      {currentCase && (
        <>
          {/* Mobile Collapsed State */}
          {!isMobileDetailsExpanded && (
            <div className={`lg:hidden px-2.5 py-1.5 border-t flex items-center justify-between gap-2 font-mono transition-colors ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-black'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src={resolveAssetUrl(currentCase.cubeImg)} 
                  alt={currentCase.code} 
                  className="w-7 h-7 bg-white p-0.5 object-contain border border-black shrink-0"
                />
                <span className="font-mono font-black text-sm shrink-0">
                  {currentCase.code}
                </span>
                <span className="text-xs text-[#ff5b00] font-bold truncate">
                  {currentCase.algorithm}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onToggleMastered(currentCase.id)}
                  title={isMastered ? "已掌握 (点击取消)" : "标记为已掌握"}
                  className={`px-2 py-0.5 border text-[11px] font-bold transition-colors flex items-center gap-1 ${
                    isMastered 
                      ? 'bg-[#ff5b00] text-black border-black' 
                      : isDark ? 'bg-zinc-900 text-zinc-300 border-zinc-700' : 'bg-white text-black border-black'
                  }`}
                >
                  <span>{isMastered ? '已掌握' : '待练'}</span>
                </button>

                <button
                  onClick={() => setIsMobileDetailsExpanded(true)}
                  title="展开公式详情"
                  className={`px-2 py-0.5 border text-[11px] font-bold flex items-center gap-0.5 ${
                    isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
                  }`}
                >
                  <span>展开</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Expanded State: Spec-sheet Editorial Style */}
          <div className={`${!isMobileDetailsExpanded ? 'hidden lg:flex' : 'flex'} flex-1 min-h-0 px-3 sm:px-4 py-2 sm:py-3 flex-col justify-between gap-2 transition-colors ${
            isDark ? 'bg-[#0a0a0a]' : 'bg-white'
          }`}>
            {/* Header Row: Thumbnail + Case ID + Tags + Mastered Status */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* Cube Thumbnail in crisp frame */}
                <div className="shrink-0">
                  <img 
                    src={resolveAssetUrl(currentCase.cubeImg)} 
                    alt={currentCase.code} 
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white p-1 object-contain border-2 border-black dark:border-zinc-700 shrink-0"
                  />
                </div>

                {/* Case Code & Metadata */}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="font-mono text-base sm:text-xl md:text-2xl font-black tracking-tight flex items-center gap-1.5">
                      <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#ff5b00] inline-block" />
                      <span>{currentCase.code}</span>
                    </span>

                    {groupInfo?.nameZh && (
                      <span className={`font-mono text-[10px] sm:text-xs px-1.5 py-0.5 border font-bold ${
                        isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-black text-black'
                      }`}>
                        [{groupInfo.nameZh}]
                      </span>
                    )}

                    {currentCase.subName && (
                      <span className="font-mono text-[10px] sm:text-xs px-1.5 py-0.5 border border-[#ff5b00] text-[#ff5b00] font-bold">
                        [{currentCase.subName}]
                      </span>
                    )}

                    {currentCase.grip && (
                      <span className={`font-mono text-[10px] sm:text-xs px-1.5 py-0.5 border font-bold flex items-center gap-1 ${
                        isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-black text-black'
                      }`}>
                        <Hand className="w-2.5 h-2.5" />
                        <span>{currentCase.grip}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mastered Toggle & Mobile Collapse */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onToggleMastered(currentCase.id)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 border-2 font-mono text-xs sm:text-sm font-black flex items-center gap-1.5 transition-colors ${
                    isMastered 
                      ? 'bg-[#ff5b00] text-black border-black shadow-xs' 
                      : isDark 
                        ? 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-white hover:text-black' 
                        : 'bg-white text-black border-black hover:bg-black hover:text-white'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isMastered ? 'text-black stroke-[3]' : 'opacity-40'}`} />
                  <span>{isMastered ? '已掌握' : '未掌握'}</span>
                </button>

                {/* Mobile collapse trigger */}
                <button
                  onClick={() => setIsMobileDetailsExpanded(false)}
                  title="收起公式详情"
                  className={`lg:hidden p-1.5 border font-mono text-xs ${
                    isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-black text-black'
                  }`}
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Two-Line Technical Spec Formula Panels */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              {/* Line 1: 打乱公式 */}
              <div className={`border px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between gap-2 transition-colors ${
                isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-black'
              }`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 px-1.5 py-0.5 border ${
                    isDark ? 'bg-zinc-950 border-zinc-700 text-zinc-300' : 'bg-white border-black text-black'
                  }`}>
                    SCRAMBLE // 打乱
                  </span>
                  <div className={`font-mono text-xs sm:text-sm md:text-base font-black tracking-wider select-all truncate ${
                    isDark ? 'text-zinc-100' : 'text-black'
                  }`}>
                    {scramble}
                  </div>
                </div>

                <button
                  onClick={handleCopyScramble}
                  title="复制打乱公式"
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 border font-mono text-[11px] sm:text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
                    copiedScramble
                      ? 'bg-[#ff5b00] text-black border-black'
                      : isDark 
                        ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-white hover:text-black' 
                        : 'bg-white border-black text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {copiedScramble ? <Check className="w-3 h-3 text-black stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  <span className="hidden xs:inline">{copiedScramble ? '已复制' : '复制打乱'}</span>
                </button>
              </div>

              {/* Line 2: 求解公式 */}
              <div className={`border px-2.5 py-1.5 sm:px-3 sm:py-2 flex items-center justify-between gap-2 transition-colors ${
                isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-zinc-50 border-black'
              }`}>
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 px-1.5 py-0.5 border bg-[#ff5b00] border-black text-black">
                    SOLUTION // 求解
                  </span>
                  <div className="font-mono text-xs sm:text-sm md:text-base font-black text-[#ff5b00] tracking-wider select-all truncate">
                    {currentCase.algorithm}
                  </div>
                </div>

                <button
                  onClick={handleCopySolution}
                  title="复制求解公式"
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 border font-mono text-[11px] sm:text-xs font-bold shrink-0 transition-colors flex items-center gap-1 ${
                    copiedSolution
                      ? 'bg-[#ff5b00] text-black border-black'
                      : isDark 
                        ? 'bg-zinc-950 border-zinc-700 text-zinc-300 hover:bg-white hover:text-black' 
                        : 'bg-white border-black text-black hover:bg-black hover:text-white'
                  }`}
                >
                  {copiedSolution ? <Check className="w-3 h-3 text-black stroke-[3]" /> : <Copy className="w-3 h-3" />}
                  <span className="hidden xs:inline">{copiedSolution ? '已复制' : '复制公式'}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default VideoPlayer;