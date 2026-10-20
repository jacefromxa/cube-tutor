import React from 'react';
import { HelpCircle, CheckCircle2, RotateCcw, Sun, Moon } from 'lucide-react';

export default function Header({ 
  activeModule = 'f2l',
  onSelectModule,
  moduleCounts = { f2l: 41, oll: 57, pll: 21 },
  totalCases = 41, 
  masteredCount = 0, 
  masteredFilter = 'all',
  onMasteredFilterChange,
  theme = 'dark',
  onToggleTheme,
  onResetProgress,
  onOpenShortcuts
}) {
  const percent = totalCases > 0 ? Math.round((masteredCount / totalCases) * 100) : 0;
  const unmasteredCount = Math.max(0, totalCases - masteredCount);

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-150 ${
      isDark 
        ? 'bg-slate-950/90 border-slate-800 text-white' 
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-[1920px] mx-auto px-2.5 sm:px-4 lg:px-6 py-1.5 sm:py-0 sm:h-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
        {/* Top bar on mobile / Left group on desktop */}
        <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3">
          {/* Logo & Product Name: Cube-Tutor */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
              <div className={`w-full h-full rounded-[4px] flex items-center justify-center font-black text-xs sm:text-base font-mono ${
                isDark ? 'bg-slate-900 text-amber-300' : 'bg-white text-blue-600'
              }`}>
                3×3
              </div>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg md:text-xl font-black tracking-tight font-mono">
                Cube-Tutor
              </h1>
              <span className={`hidden xl:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                isDark ? 'bg-slate-800/80 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}>
                CFOP 精讲
              </span>
            </div>
          </div>

          {/* Quick utility controls on mobile (Right aligned on Row 1) */}
          <div className="flex sm:hidden items-center gap-1.5">
            {/* Progress pill on mobile */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono font-bold ${
              isDark ? 'bg-slate-900 border-slate-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'
            }`}>
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>{masteredCount}/{totalCases}</span>
              <span className="opacity-70">({percent}%)</span>
            </div>

            {/* Dark mode switch */}
            <button
              onClick={onToggleTheme}
              title={isDark ? "切换为明亮模式" : "切换为暗黑模式"}
              className={`p-1.5 rounded border transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-amber-300' 
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Shortcuts Help */}
            <button
              onClick={onOpenShortcuts}
              title="查看快捷键指南"
              className={`p-1.5 rounded border transition ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-400' 
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Prominent 3-Segment Navigation Switcher (F2L | OLL | PLL) + Mobile Filters */}
        <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2">
          {/* 3 Module Switcher */}
          <div className={`flex items-center p-0.5 sm:p-1 rounded-lg border shadow-xs transition-colors shrink-0 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-300/80'
          }`}>
            {/* F2L Tab */}
            <button
              onClick={() => onSelectModule && onSelectModule('f2l')}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-black transition-all flex items-center gap-1 sm:gap-1.5 ${
                activeModule === 'f2l'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : isDark 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span className="font-mono">F2L</span>
              <span className="text-[10px] sm:text-[11px] font-mono opacity-80 font-normal">({moduleCounts.f2l || 41})</span>
            </button>

            {/* OLL Tab */}
            <button
              onClick={() => onSelectModule && onSelectModule('oll')}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-black transition-all flex items-center gap-1 sm:gap-1.5 ${
                activeModule === 'oll'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                  : isDark 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span className="font-mono">OLL</span>
              <span className="text-[10px] sm:text-[11px] font-mono opacity-80 font-normal">({moduleCounts.oll || 57})</span>
            </button>

            {/* PLL Tab */}
            <button
              onClick={() => onSelectModule && onSelectModule('pll')}
              className={`px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-black transition-all flex items-center gap-1 sm:gap-1.5 ${
                activeModule === 'pll'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
                  : isDark 
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span className="font-mono">PLL</span>
              <span className="text-[10px] sm:text-[11px] font-mono opacity-80 font-normal">({moduleCounts.pll || 21})</span>
            </button>
          </div>

          {/* Filter tabs on mobile (Row 2 right) */}
          <div className={`flex sm:hidden items-center p-0.5 rounded-md border text-[11px] shrink-0 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => onMasteredFilterChange('all')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                masteredFilter === 'all'
                  ? isDark ? 'bg-blue-600 text-white font-semibold' : 'bg-white text-blue-600 font-semibold shadow-xs'
                  : isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => onMasteredFilterChange('unmastered')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                masteredFilter === 'unmastered'
                  ? isDark ? 'bg-amber-600 text-white font-semibold' : 'bg-white text-amber-600 font-semibold shadow-xs'
                  : isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              待练
            </button>
            <button
              onClick={() => onMasteredFilterChange('mastered')}
              className={`px-2 py-0.5 rounded font-medium transition ${
                masteredFilter === 'mastered'
                  ? isDark ? 'bg-emerald-600 text-white font-semibold' : 'bg-white text-emerald-600 font-semibold shadow-xs'
                  : isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              已掌握
            </button>
          </div>
        </div>

        {/* Right side controls on desktop (Hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
          {/* 全部 / 待练习 / 已掌握 Filter Tabs */}
          <div className={`flex items-center p-0.5 rounded-md border text-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => onMasteredFilterChange('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                masteredFilter === 'all'
                  ? isDark 
                    ? 'bg-blue-600 text-white shadow-sm font-semibold' 
                    : 'bg-white text-blue-600 shadow-sm font-semibold'
                  : isDark 
                    ? 'text-slate-400 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 <span className="opacity-75 text-[11px]">({totalCases})</span>
            </button>

            <button
              onClick={() => onMasteredFilterChange('unmastered')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                masteredFilter === 'unmastered'
                  ? isDark 
                    ? 'bg-amber-600 text-white shadow-sm font-semibold' 
                    : 'bg-white text-amber-600 shadow-sm font-semibold'
                  : isDark 
                    ? 'text-slate-400 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              待练习 <span className="opacity-75 text-[11px]">({unmasteredCount})</span>
            </button>

            <button
              onClick={() => onMasteredFilterChange('mastered')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                masteredFilter === 'mastered'
                  ? isDark 
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold' 
                    : 'bg-white text-emerald-600 shadow-sm font-semibold'
                  : isDark 
                    ? 'text-slate-400 hover:text-white' 
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              已掌握 <span className="opacity-75 text-[11px]">({masteredCount})</span>
            </button>
          </div>

          {/* Progress Pill on desktop */}
          <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className={`text-[11px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {masteredCount} / {totalCases}
                </span>
                <span className="text-[11px] font-bold text-emerald-500 font-mono">
                  {percent}%
                </span>
              </div>
              <div className={`w-14 sm:w-16 rounded-sm h-1 overflow-hidden mt-1 ${
                isDark ? 'bg-slate-800' : 'bg-slate-300'
              }`}>
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Theme Switch */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "切换为明亮模式" : "切换为暗黑模式"}
            className={`p-1.5 rounded-md border transition flex items-center justify-center ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-850 hover:border-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Reset progress */}
          {masteredCount > 0 && (
            <button
              onClick={onResetProgress}
              title="重置学习进度"
              className={`p-1.5 rounded-md border transition text-slate-400 hover:text-red-400 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:border-red-900/40' 
                  : 'bg-slate-100 border-slate-200 hover:border-red-300'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Shortcuts Help */}
          <button
            onClick={onOpenShortcuts}
            title="查看快捷键指南"
            className={`p-1.5 rounded-md border transition ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
