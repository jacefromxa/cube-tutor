import React from 'react';
import { HelpCircle, CheckCircle2, RotateCcw, Sun, Moon } from 'lucide-react';

export default function Header({ 
  totalCases = 41, 
  masteredCount = 0, 
  masteredFilter = 'all',
  onMasteredFilterChange,
  theme = 'dark',
  onToggleTheme,
  onResetProgress,
  onOpenShortcuts
}) {
  const percent = Math.round((masteredCount / totalCases) * 100);
  const unmasteredCount = totalCases - masteredCount;

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-150 ${
      isDark 
        ? 'bg-slate-950/90 border-slate-800 text-white' 
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-3">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center shrink-0">
            <div className={`w-full h-full rounded-[4px] flex items-center justify-center font-black text-sm ${
              isDark ? 'bg-slate-900 text-amber-300' : 'bg-white text-blue-600'
            }`}>
              3×3
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight">
                CFOP · F2L 41 种常规手法
              </h1>
              <span className={`hidden md:inline-flex text-[11px] font-semibold px-1.5 py-0.2 rounded border ${
                isDark 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                  : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                杜宇生（2023）
              </span>
            </div>
            <p className={`text-[11px] hidden lg:block leading-none mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              基于 csTimer 科学分类与时间轴实况解析 · 点击图形直达对应手法
            </p>
          </div>
        </div>

        {/* Right: Mastery Filter Tabs + Progress Bar + Theme Toggle + Shortcuts */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Requirement 3: 全部 / 待练习 / 已掌握 Filter Tabs placed beside progress */}
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

          {/* Progress Pill */}
          <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border ${
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

          {/* Requirement 4: Dark / Light Mode Switch */}
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

          {/* Reset progress (compact) */}
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
