import React from 'react';
import { HelpCircle, CheckSquare, RotateCcw, Sun, Moon } from 'lucide-react';

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
    <header className={`sticky top-0 z-40 border-b transition-colors duration-150 ${
      isDark 
        ? 'bg-[#0a0a0a] border-zinc-800 text-zinc-100' 
        : 'bg-[#ffffff] border-black text-black'
    }`}>
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-0 sm:h-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        
        {/* Row 1 Mobile / Left Group Desktop */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          {/* LineLore Signature Brandmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Square geometric badge */}
            <div className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-mono font-black text-xs border ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-white' 
                : 'bg-black border-black text-white'
            }`}>
              3³
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-base sm:text-lg tracking-tight uppercase flex items-center gap-1.5">
                <span>CUBE:TUTOR</span>
                <span className="w-2 h-2 bg-[#ff5b00] inline-block shrink-0" title="LineLore System" />
              </span>
              <span className={`hidden md:inline-block font-mono text-[10px] tracking-widest uppercase px-1.5 py-0.5 border ${
                isDark ? 'bg-zinc-900 text-zinc-400 border-zinc-800' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
              }`}>
                [CFOP // SPEC]
              </span>
            </div>
          </div>

          {/* Quick utility controls on mobile (Right aligned on Row 1) */}
          <div className="flex sm:hidden items-center gap-1.5">
            {/* Mobile Progress Pill */}
            <div className={`flex items-center gap-1 px-2 py-0.5 border font-mono text-[11px] font-bold ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-zinc-100 border-black text-black'
            }`}>
              <span className="w-1.5 h-1.5 bg-[#ff5b00] inline-block" />
              <span>{masteredCount}/{totalCases}</span>
              <span className="text-[#ff5b00]">({percent}%)</span>
            </div>

            {/* Dark mode switch */}
            <button
              onClick={onToggleTheme}
              title={isDark ? "切换为明亮模式" : "切换为暗黑模式"}
              className={`w-7 h-7 flex items-center justify-center border transition-colors ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-[#ff5b00] hover:text-black hover:border-[#ff5b00]' 
                  : 'bg-white border-black text-black hover:bg-black hover:text-white'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Shortcuts Help */}
            <button
              onClick={onOpenShortcuts}
              title="键盘快捷键指南"
              className={`w-7 h-7 flex items-center justify-center border transition-colors ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-[#ff5b00] hover:text-black hover:border-[#ff5b00]' 
                  : 'bg-white border-black text-black hover:bg-black hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: Industrial 3-Module Switcher (F2L | OLL | PLL) + Mobile Mastered Filter */}
        <div className="flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2">
          {/* Module Switcher Tabs */}
          <div className={`flex items-center p-0.5 border ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-black'
          }`}>
            {[
              { id: 'f2l', label: 'F2L', count: moduleCounts.f2l || 41 },
              { id: 'oll', label: 'OLL', count: moduleCounts.oll || 57 },
              { id: 'pll', label: 'PLL', count: moduleCounts.pll || 21 }
            ].map(mod => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => onSelectModule && onSelectModule(mod.id)}
                  className={`px-3 py-1 font-mono text-xs sm:text-sm font-black transition-all flex items-center gap-1 border-r last:border-r-0 ${
                    isDark ? 'border-zinc-800' : 'border-zinc-300'
                  } ${
                    isActive
                      ? isDark
                        ? 'bg-[#ff5b00] text-black shadow-xs'
                        : 'bg-black text-white shadow-xs'
                      : isDark
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'text-zinc-600 hover:text-black hover:bg-white'
                  }`}
                >
                  <span>{mod.label}</span>
                  <span className={`text-[10px] font-normal ${isActive ? (isDark ? 'text-black' : 'text-zinc-300') : 'opacity-60'}`}>
                    [{mod.count}]
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter tabs on mobile (Row 2 right) */}
          <div className={`flex sm:hidden items-center p-0.5 border text-[11px] font-mono shrink-0 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-black'
          }`}>
            {[
              { id: 'all', label: '全部' },
              { id: 'unmastered', label: '待练' },
              { id: 'mastered', label: '已过' }
            ].map(f => {
              const active = masteredFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onMasteredFilterChange(f.id)}
                  className={`px-2 py-0.5 font-bold transition-colors ${
                    active
                      ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                      : isDark ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right side controls on desktop (Hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {/* Mastered Filter Segmented Tabs */}
          <div className={`flex items-center p-0.5 border font-mono text-xs ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-black'
          }`}>
            {[
              { id: 'all', label: '全部', count: totalCases },
              { id: 'unmastered', label: '待练习', count: unmasteredCount },
              { id: 'mastered', label: '已掌握', count: masteredCount }
            ].map(f => {
              const active = masteredFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onMasteredFilterChange(f.id)}
                  className={`px-2.5 py-1 font-bold transition-colors flex items-center gap-1.5 ${
                    active
                      ? isDark 
                        ? 'bg-white text-black' 
                        : 'bg-black text-white'
                      : isDark 
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' 
                        : 'text-zinc-600 hover:text-black hover:bg-white'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] ${active ? (isDark ? 'text-black' : 'text-zinc-300') : 'opacity-60'}`}>
                    [{f.count}]
                  </span>
                </button>
              );
            })}
          </div>

          {/* Technical Progress Pill */}
          <div className={`flex items-center gap-2.5 px-3 py-1 border font-mono ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-black'
          }`}>
            <span className="w-2 h-2 bg-[#ff5b00] inline-block" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className={`text-[11px] font-bold ${isDark ? 'text-zinc-300' : 'text-black'}`}>
                  {masteredCount}/{totalCases}
                </span>
                <span className="text-[11px] font-black text-[#ff5b00]">
                  {percent}%
                </span>
              </div>
              <div className={`w-16 h-1 mt-1 ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`}>
                <div 
                  className="bg-[#ff5b00] h-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Theme Switch */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "切换为明亮模式" : "切换为暗黑模式"}
            className={`w-8 h-8 flex items-center justify-center border transition-colors ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-[#ff5b00] hover:text-black hover:border-[#ff5b00]' 
                : 'bg-white border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Reset progress */}
          {masteredCount > 0 && (
            <button
              onClick={onResetProgress}
              title="重置当前模块学习进度"
              className={`w-8 h-8 flex items-center justify-center border transition-colors ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500' 
                  : 'bg-white border-black text-zinc-600 hover:text-red-600 hover:border-red-600'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Shortcuts Help */}
          <button
            onClick={onOpenShortcuts}
            title="查看键盘快捷键指南"
            className={`w-8 h-8 flex items-center justify-center border transition-colors ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800' 
                : 'bg-white border-black text-zinc-700 hover:bg-black hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}