import React from 'react';

export const ZBLL_SET_LIST = [
  { id: 't', letter: 'T', count: 72, ready: true },
  { id: 'u', letter: 'U', count: 72, ready: true },
  { id: 'l', letter: 'L', count: 72, ready: true },
  { id: 'h', letter: 'H', count: 40, ready: true },
  { id: 'pi', letter: 'Pi', count: 72, ready: true },
  { id: 's', letter: 'S', count: 72, ready: true },
  { id: 'as', letter: 'AS', count: 72, ready: true },
];

export default function ZbllSetBar({
  activeSet = 't',
  onSelectSet,
  theme = 'dark'
}) {
  const isDark = theme === 'dark';

  return (
    <div className={`p-0.5 border grid grid-cols-7 w-full shrink-0 transition-colors select-none ${
      isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-black'
    }`}>
      {ZBLL_SET_LIST.map((s) => {
        const isActive = activeSet === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelectSet && onSelectSet(s.id)}
            title={`Set ${s.letter} (${s.count} Cases)`}
            className={`h-7 sm:h-7.5 px-0.5 sm:px-1 font-mono transition-all flex items-center justify-center gap-0.5 sm:gap-1 border-r last:border-r-0 overflow-hidden ${
              isDark ? 'border-zinc-800' : 'border-zinc-300'
            } ${
              isActive
                ? isDark
                  ? 'bg-cyan-500 text-black shadow-xs font-black'
                  : 'bg-cyan-600 text-white shadow-xs font-black'
                : isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  : 'text-zinc-600 hover:text-black hover:bg-white'
            }`}
          >
            <span className="text-xs sm:text-xs font-black">{s.letter}</span>
            <span className={`text-[9px] sm:text-[10px] font-normal tracking-tighter ${
              isActive 
                ? isDark ? 'text-black/80 font-bold' : 'text-white/90 font-bold' 
                : 'opacity-50'
            }`}>
              [{s.count}]
            </span>
          </button>
        );
      })}
    </div>
  );
}
