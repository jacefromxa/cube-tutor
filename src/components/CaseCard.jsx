import React from 'react';
import { Check, Hand } from 'lucide-react';
import { resolveAssetUrl } from '../utils/assetUrl';

export default function CaseCard({
  caseItem,
  isActive,
  isMastered,
  onSelect,
  onToggleMastered,
  theme = 'dark'
}) {
  const isDark = theme === 'dark';

  return (
    <div
      onClick={() => onSelect(caseItem)}
      className={`relative p-2 transition-all duration-100 cursor-pointer flex flex-col justify-between border-2 select-none ${
        isActive
          ? 'border-[#ff5b00] ring-1 ring-[#ff5b00] ' + (isDark ? 'bg-zinc-900/90 text-white' : 'bg-orange-50/50 text-black')
          : isMastered
            ? (isDark 
                ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 text-zinc-200' 
                : 'bg-white border-zinc-300 hover:border-black text-black')
            : (isDark 
                ? 'bg-[#0a0a0a] border-zinc-800 hover:border-zinc-600 text-zinc-300' 
                : 'bg-white border-zinc-300 hover:border-black text-black')
      }`}
    >
      {/* Top Header: Code, Grip Badge & Mastered Checkbox */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`font-mono font-black text-xs sm:text-sm tracking-tight truncate flex items-center gap-1 ${
            isActive ? 'text-[#ff5b00]' : isDark ? 'text-white' : 'text-black'
          }`}>
            {isActive && <span className="w-1.5 h-1.5 bg-[#ff5b00] inline-block shrink-0" />}
            <span>{caseItem.code}</span>
          </span>

          {caseItem.grip && (
            <span className={`font-mono text-[9px] px-1 py-0.2 border font-bold flex items-center gap-0.5 shrink-0 ${
              isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-zinc-100 border-zinc-300 text-zinc-700'
            }`}>
              <Hand className="w-2 h-2" />
              <span>{caseItem.grip}</span>
            </span>
          )}
        </div>

        {/* Mastered Square Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMastered(caseItem.id);
          }}
          title={isMastered ? "已掌握 (点击取消)" : "标记为已掌握"}
          className={`w-5 h-5 flex items-center justify-center border transition-colors shrink-0 ${
            isMastered
              ? 'bg-[#ff5b00] text-black border-black font-black'
              : isDark
                ? 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-500'
                : 'bg-zinc-100 border-zinc-300 text-zinc-400 hover:border-black'
          }`}
        >
          {isMastered ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-1.5 h-1.5 bg-zinc-400/40" />}
        </button>
      </div>

      {/* Middle: Crisp 3D Cube Graphic Specimen (Border removed to avoid duplication) */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white p-1 my-0.5 overflow-hidden flex items-center justify-center shrink-0">
        <img
          src={resolveAssetUrl(caseItem.cubeImg)}
          alt={caseItem.code}
          decoding="async"
          className="w-full h-full object-contain filter contrast-105"
        />
      </div>

      {/* Dedicated Active Playing Indicator Slot (Off-image to avoid obscuring cube) */}
      <div className="h-4 flex items-center justify-center my-0.5 shrink-0">
        {isActive && (
          <span className="px-1.5 py-0.2 bg-[#ff5b00] text-black border border-black font-mono font-black text-[9px] flex items-center gap-1 shadow-xs animate-pulse">
            <span className="w-1 h-1 bg-black inline-block" />
            <span>PLAYING</span>
          </span>
        )}
      </div>

      {/* Bottom: Technical Monospace Formula Box */}
      <div className="mt-1 pt-1.5 border-t border-black/10 dark:border-zinc-800 flex flex-col">
        <div 
          className={`px-1.5 py-1 font-mono text-[11px] sm:text-xs font-bold text-center truncate border ${
            isActive
              ? 'bg-[#ff5b00] text-black border-black'
              : isDark
                ? 'bg-zinc-900 text-zinc-200 border-zinc-800'
                : 'bg-zinc-100 text-black border-zinc-300'
          }`}
          title={caseItem.algorithm}
        >
          {caseItem.algorithm}
        </div>
      </div>
    </div>
  );
}
