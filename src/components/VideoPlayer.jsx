import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { 
  Play, Pause, RotateCcw, Repeat, ChevronLeft, ChevronRight, 
  Volume2, VolumeX, Maximize2, Copy, Check, Eye, FastForward, Rewind,
  Sparkles, Hand, ExternalLink
} from 'lucide-react';
import { VIDEO_PATH, F2L_GROUPS } from '../data/f2lCases';

const VideoPlayer = forwardRef(function VideoPlayer({
  currentCase,
  casesList,
  onSelectCase,
  onViewCard,
  isMastered,
  onToggleMastered
}, ref) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Jump to startSec when currentCase changes
  useEffect(() => {
    if (!currentCase || !videoRef.current) return;
    const v = videoRef.current;
    v.currentTime = currentCase.startSec;
    setCurrentTime(currentCase.startSec);
    v.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      setIsPlaying(false);
    });
  }, [currentCase]);

  // Handle timeupdate for looping & progress
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || !currentCase) return;
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
  }, [currentCase, isLooping, casesList, onSelectCase]);

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
    const newTime = Math.max(currentCase.startSec, Math.min(currentCase.endSec, videoRef.current.currentTime + delta));
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

  const handleCopy = () => {
    if (!currentCase) return;
    navigator.clipboard.writeText(currentCase.algorithm);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const caseProgress = currentCase 
    ? Math.min(100, Math.max(0, ((currentTime - currentCase.startSec) / (currentCase.endSec - currentCase.startSec)) * 100))
    : 0;

  const groupInfo = currentCase ? F2L_GROUPS[currentCase.group] : null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
      {/* Video Container */}
      <div className="relative aspect-video bg-black w-full overflow-hidden select-none group">
        <video
          ref={videoRef}
          src={VIDEO_PATH}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onError={() => setVideoError(true)}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        />

        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-6">
            <p className="text-red-400 font-bold mb-2">未找到视频文件或格式受限</p>
            <p className="text-xs text-slate-400 max-w-md">
              请确保根目录中的视频文件已正确链接至 public/video.mp4
            </p>
          </div>
        )}

        {/* Video Bottom Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800/80">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 transition-all duration-100"
            style={{ width: `${caseProgress}%` }}
          />
        </div>

        {/* Quick status pill at top right */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={toggleLooping}
            title={isLooping ? "已开启单 Case 循环模式 (快捷键 L)" : "已开启顺序播放 (快捷键 L)"}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 backdrop-blur-md border transition shadow-lg ${
              isLooping 
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/35' 
                : 'bg-slate-950/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Repeat className={`w-3.5 h-3.5 ${isLooping ? 'animate-spin-slow' : ''}`} />
            <span>{isLooping ? '循环练习' : '顺序连播'}</span>
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Playback & Navigation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            title="上一个 Case (←)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleStep(-2)}
            title="快退 2 秒 (J)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-0.5"
          >
            <Rewind className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">-2s</span>
          </button>

          <button
            onClick={togglePlay}
            title={isPlaying ? "暂停 (空格)" : "播放 (空格)"}
            className="p-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition transform active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span className="text-xs">暂停</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span className="text-xs">播放</span>
              </>
            )}
          </button>

          <button
            onClick={handleReplay}
            title="重播当前手法 (R)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleStep(2)}
            title="快进 2 秒 (K)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs flex items-center gap-0.5"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">+2s</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!hasNext}
            title="下一个 Case (→)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selection */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-500 px-1 font-mono uppercase">倍速:</span>
          {[0.5, 0.75, 1.0, 1.25].map(rate => (
            <button
              key={rate}
              onClick={() => changeSpeed(rate)}
              className={`px-2 py-0.5 rounded-lg text-xs font-mono transition ${
                playbackRate === rate
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Mute & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            title={isMuted ? "取消静音 (M)" : "静音 (M)"}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={requestFullscreen}
            title="全屏播放 (F)"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Details & Algorithm Box */}
      {currentCase && (
        <div className="p-3 sm:p-4 bg-slate-950/80 flex flex-col gap-2.5">
          {/* Top row: Thumbnail & Metadata */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="relative group/thumb cursor-pointer shrink-0" 
                onClick={() => onViewCard(currentCase)}
                title="点击查看视频原图解截图"
              >
                <img 
                  src={currentCase.cubeImg} 
                  alt={currentCase.code} 
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white p-1 object-contain shadow-md border border-slate-700 group-hover/thumb:border-blue-400 transition"
                />
                <span className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition text-[9px] text-white font-semibold">
                  大图
                </span>
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {currentCase.code}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    csTimer #{currentCase.csTimerNum}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium">
                    {groupInfo?.nameZh}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1">
                    <Hand className="w-2.5 h-2.5" />
                    {currentCase.grip}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="truncate">{currentCase.description}</span>
                  <span className="text-slate-600 hidden sm:inline">·</span>
                  <span className="text-[11px] text-slate-500 font-mono shrink-0 hidden sm:inline">
                    时间轴: {currentCase.timestamp} ~ {Math.floor(currentCase.endSec / 60).toString().padStart(2, '0')}:{Math.floor(currentCase.endSec % 60).toString().padStart(2, '0')} ({currentCase.duration}s)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleMastered(currentCase.id)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  isMastered 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${isMastered ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{isMastered ? '已掌握' : '标记掌握'}</span>
              </button>

              <button
                onClick={() => onViewCard(currentCase)}
                title="查看原视频图解卡片"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom row: Large Algorithm Banner with Copy Button */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider shrink-0 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                推荐手法
              </span>
              <div className="font-mono text-base sm:text-lg font-black text-amber-300 tracking-wider select-all truncate">
                {currentCase.algorithm}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition flex items-center justify-center gap-1.5 border border-slate-700 shrink-0 text-xs font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '复制公式'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;

