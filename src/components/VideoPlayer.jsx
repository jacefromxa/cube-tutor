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
  const [isMuted, setIsMuted] = useState(false);
  const [copiedScramble, setCopiedScramble] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverRatio, setHoverRatio] = useState(null);
  const [isMobileDetailsExpanded, setIsMobileDetailsExpanded] = useState(true);
  const [showScramble, setShowScramble] = useState(true);

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

  // Jump step (evaluation: 3 seconds is the golden interval for 10-15s clips)
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

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
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
    toggleMute,
    toggleLooping,
    requestFullscreen
  }), [togglePlay, handleReplay, handleStep, changeSpeed, toggleMute, toggleLooping, requestFullscreen]);

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

  const groupInfo = currentCase ? F2L_GROUPS[currentCase.group] : null;

  // Format helper (mm:ss)
  const formatTime = (seconds) => {
    const s = Math.floor(Math.max(0, seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-full border rounded-md overflow-hidden flex flex-col justify-between shadow-xl transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Video Container */}
      <div className="relative aspect-video lg:max-h-[calc(100%-210px)] bg-black w-full overflow-hidden select-none group flex items-center justify-center">
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

        {/* Pause indicator at bottom-right of video playback window */}
        {!isPlaying && (
          <div 
            onClick={togglePlay}
            title="点击继续播放 (快捷键: 空格)"
            className="absolute bottom-3 right-3 p-2 rounded-md bg-black/60 backdrop-blur-md border border-white/25 text-white shadow-xl cursor-pointer hover:bg-black/80 hover:scale-110 transition-all flex items-center justify-center group/pause animate-in fade-in duration-150"
          >
            <Pause className="w-5 h-5 fill-white text-white transition-transform group-hover/pause:scale-110" />
          </div>
        )}

        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-6">
            <p className="text-red-400 font-bold mb-2">未找到视频文件或格式受限</p>
            <p className="text-xs text-slate-400 max-w-md">
              请确保根目录中的视频文件已正确链接至 public/video.mp4
            </p>
          </div>
        )}

        {/* Quick status pill at top right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
          <button
            onClick={toggleLooping}
            title={isLooping ? "已开启单 Case 循环模式 (快捷键 L)" : "已开启顺序播放 (快捷键 L)"}
            className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 backdrop-blur-md border transition shadow ${
              isLooping 
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/35' 
                : 'bg-slate-950/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Repeat className={`w-3 h-3 ${isLooping ? 'animate-spin-slow' : ''}`} />
            <span>{isLooping ? '循环练习' : '顺序连播'}</span>
          </button>
        </div>
      </div>

      {/* Requirement 1: Interactive Draggable Progress Bar with Scrubbing */}
      <div 
        ref={progressBarRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseLeave={() => setHoverRatio(null)}
        title="拖动或点击进度条跳转 (← 快退 2s / → 快进 2s)"
        className={`relative w-full h-3 cursor-pointer group/progress transition-all select-none flex items-center ${
          isDark ? 'bg-slate-950 hover:bg-slate-900' : 'bg-slate-200 hover:bg-slate-300'
        }`}
      >
        {/* Background track */}
        <div className={`w-full h-1.5 group-hover/progress:h-2.5 transition-all ${
          isDark ? 'bg-slate-800' : 'bg-slate-300'
        }`}>
          {/* Progress fill */}
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 transition-[width] duration-75 relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Draggable Scrubber Knob */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-blue-500 opacity-90 group-hover/progress:scale-125 transition-transform" />
          </div>
        </div>

        {/* Hover preview line */}
        {hoverRatio !== null && !isDragging && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white/60 pointer-events-none"
            style={{ left: `${hoverRatio * 100}%` }}
          />
        )}
      </div>

      {/* Control Toolbar */}
      <div className={`px-3 py-2 border-b flex flex-wrap items-center justify-between gap-2 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        {/* Playback & Navigation Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            title="上一个 Case ([)"
            className={`p-1.5 rounded border transition disabled:opacity-30 ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleStep(-2)}
            title="快退 2 秒 (← 方向键 / J)"
            className={`px-2 py-1.5 rounded border transition text-xs flex items-center gap-0.5 font-mono ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <Rewind className="w-3 h-3" />
            <span className="text-[11px]">-2s</span>
          </button>

          <button
            onClick={togglePlay}
            title={isPlaying ? "暂停 (空格键)" : "播放 (空格键)"}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition transform active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span className="text-xs">暂停</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span className="text-xs">播放</span>
              </>
            )}
          </button>

          <button
            onClick={handleReplay}
            title="重播当前手法 (R)"
            className={`p-1.5 rounded border transition ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => handleStep(2)}
            title="快进 2 秒 (→ 方向键 / K)"
            className={`px-2 py-1.5 rounded border transition text-xs flex items-center gap-0.5 font-mono ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <span className="text-[11px]">+2s</span>
            <FastForward className="w-3 h-3" />
          </button>

          <button
            onClick={handleNext}
            disabled={!hasNext}
            title="下一个 Case (])"
            className={`p-1.5 rounded border transition disabled:opacity-30 ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Time Counter inside Case */}
          <div className={`ml-1 text-[11px] font-mono px-2 py-1 rounded border hidden sm:flex items-center gap-1 ${
            isDark ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-white text-slate-700 border-slate-300'
          }`}>
            <span className="text-blue-500 font-semibold">{formatTime(currentOffset)}</span>
            <span className="opacity-40">/</span>
            <span>{formatTime(caseDuration)}</span>
          </div>
        </div>

        {/* Speed Selection */}
        <div className={`flex items-center gap-0.5 p-0.5 rounded border ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          {/* Mobile Speed Cycle Button */}
          <button
            onClick={() => {
              const rates = [0.5, 0.75, 1.0, 1.25];
              const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
              changeSpeed(rates[nextIndex]);
            }}
            title="点击切换播放倍速 (0.5x / 0.75x / 1.0x / 1.25x)"
            className="sm:hidden px-2 py-0.5 rounded text-xs font-mono font-bold text-blue-500 hover:bg-blue-500/10 transition flex items-center gap-0.5"
          >
            <span>{playbackRate}x</span>
          </button>

          {/* Desktop Full Speed Selector */}
          <div className="hidden sm:flex items-center gap-0.5">
            <span className="text-[10px] text-slate-400 px-1 font-mono uppercase">倍速:</span>
            {[0.5, 0.75, 1.0, 1.25].map(rate => (
              <button
                key={rate}
                onClick={() => changeSpeed(rate)}
                className={`px-1.5 py-0.5 rounded text-xs font-mono transition ${
                  playbackRate === rate
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : isDark 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Fullscreen */}
        <div className="flex items-center gap-1">
          <button
            onClick={requestFullscreen}
            title="全屏播放 (F)"
            className={`p-1.5 rounded border transition ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Case Details & Algorithm Box:
          - Desktop (lg:): Permanently expanded, stretches vertically to align 0px with right column
          - Mobile (< lg): Compact by default, with one-tap collapse to allow maximum browsing space
      */}
      {currentCase && (
        <>
          {/* Collapsed state on Mobile (< lg) */}
          {!isMobileDetailsExpanded && (
            <div className={`lg:hidden px-2.5 py-1.5 border-t flex items-center justify-between gap-2 transition-colors ${
              isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src={resolveAssetUrl(currentCase.cubeImg)} 
                  alt={currentCase.code} 
                  className={`w-7 h-7 rounded bg-white p-0.5 object-contain shadow-xs border shrink-0 ${
                    isDark ? 'border-slate-700' : 'border-slate-300'
                  }`}
                />
                <span className={`font-mono font-black text-sm tracking-tight shrink-0 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {currentCase.code}
                </span>
                <span className="font-mono text-xs text-blue-500 font-semibold truncate">
                  {currentCase.algorithm}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onToggleMastered(currentCase.id)}
                  title={isMastered ? "已掌握 (点击取消)" : "标记为已掌握"}
                  className={`p-1 rounded border text-[11px] font-bold transition flex items-center gap-1 ${
                    isMastered 
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40' 
                      : isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-500 border-slate-300'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${isMastered ? 'text-emerald-500' : 'opacity-40'}`} />
                  <span className="hidden xs:inline">{isMastered ? '已掌握' : '未掌握'}</span>
                </button>

                <button
                  onClick={() => setIsMobileDetailsExpanded(true)}
                  title="展开公式详情"
                  className={`px-1.5 py-1 rounded border text-[11px] font-medium transition flex items-center gap-0.5 ${
                    isDark ? 'bg-blue-600/20 text-blue-400 border-blue-500/40' : 'bg-blue-50 text-blue-600 border-blue-200'
                  }`}
                >
                  <span>展开公式</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Expanded state (Always visible on lg:, toggled on mobile) */}
          <div className={`${!isMobileDetailsExpanded ? 'hidden lg:flex' : 'flex'} flex-1 min-h-0 px-2.5 sm:px-3.5 py-1.5 sm:py-3 flex-col justify-between gap-1.5 sm:gap-2.5 transition-colors ${
            isDark ? 'bg-slate-950/90' : 'bg-slate-50/90'
          }`}>
            {/* Top row: Thumbnail, Title, Mastery Button & Mobile Collapse Toggle */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="shrink-0">
                  <img 
                    src={resolveAssetUrl(currentCase.cubeImg)} 
                    alt={currentCase.code} 
                    className={`w-9 h-9 sm:w-12 sm:h-12 rounded-md bg-white p-0.5 sm:p-1 object-contain shadow-xs border transition ${
                      isDark ? 'border-slate-700' : 'border-slate-300'
                    }`}
                  />
                </div>

                <div className="flex flex-col justify-center gap-0.5 sm:gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className={`text-base sm:text-xl md:text-2xl font-black tracking-tight font-mono ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {currentCase.code}
                    </span>
                    {groupInfo?.nameZh && (
                      <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/30 font-semibold font-mono">
                        {groupInfo.nameZh}
                      </span>
                    )}
                    {currentCase.subName && (
                      <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                        {currentCase.subName}
                      </span>
                    )}
                    {currentCase.name && currentCase.name !== currentCase.code && !currentCase.subName && (
                      <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold">
                        {currentCase.name}
                      </span>
                    )}
                    {currentCase.grip && (
                      <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 font-semibold flex items-center gap-1">
                        <Hand className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {currentCase.grip}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions: Mastered Toggle + Mobile Collapse Toggle */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onToggleMastered(currentCase.id)}
                  className={`px-2 py-1 sm:px-3.5 sm:py-2 rounded-md border text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5 transition ${
                    isMastered 
                      ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40 hover:bg-emerald-500/30 shadow-xs'
                      : isDark 
                        ? 'bg-slate-800 hover:bg-slate-750 text-slate-400 border-slate-700' 
                        : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-300 shadow-xs'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isMastered ? 'text-emerald-500' : 'text-slate-400 opacity-60'}`} />
                  <span>{isMastered ? '已掌握' : '未掌握'}</span>
                </button>

                {/* Mobile-only collapse toggle */}
                <button
                  onClick={() => setIsMobileDetailsExpanded(false)}
                  title="收起公式详情以扩大列表浏览空间"
                  className={`lg:hidden p-1 sm:p-1.5 rounded-md border text-slate-400 hover:text-slate-200 transition ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                  }`}
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Two-Line Formulas: Line 1 (打乱公式) & Line 2 (求解公式) */}
            <div className="flex flex-col gap-1 sm:gap-2">
              {/* Line 1: 打乱公式 */}
              <div className={`border rounded-md px-2 py-1 sm:px-3 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 shadow-xs transition-colors ${
                isDark ? 'bg-slate-950/80 border-slate-800/90' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-hidden">
                  <span className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded border font-bold ${
                    isDark ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    打乱公式
                  </span>
                  <div className="font-mono text-xs sm:text-sm md:text-base font-black text-amber-500 tracking-wider select-all truncate">
                    {scramble}
                  </div>
                </div>

                <button
                  onClick={handleCopyScramble}
                  title="复制打乱公式"
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transition flex items-center justify-center gap-1 border shrink-0 text-[11px] sm:text-xs font-semibold ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {copiedScramble ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  <span className="hidden xs:inline">{copiedScramble ? '已复制' : '复制打乱'}</span>
                </button>
              </div>

              {/* Line 2: 求解公式 */}
              <div className={`border rounded-md px-2 py-1 sm:px-3 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 shadow-xs transition-colors ${
                isDark ? 'bg-slate-950/80 border-slate-800/90' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-hidden">
                  <span className={`text-[10px] sm:text-xs font-mono uppercase tracking-wider shrink-0 px-1.5 py-0.5 rounded border font-bold ${
                    isDark ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    求解公式
                  </span>
                  <div className="font-mono text-xs sm:text-sm md:text-base font-black text-blue-500 tracking-wider select-all truncate">
                    {currentCase.algorithm}
                  </div>
                </div>

                <button
                  onClick={handleCopySolution}
                  title="复制求解公式"
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded transition flex items-center justify-center gap-1 border shrink-0 text-[11px] sm:text-xs font-semibold ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  {copiedSolution ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
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
