import React from 'react';
import { Play, Check, Clock, Hand } from 'lucide-react';

const GROUP_COLOR_MAP = {
  Easy: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  RE: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  REFC: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  PMS: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  SPGO: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30',
  Weird: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
  CPEU: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30',
  EPCU: 'bg-orange-500/15 text-orange-500 border-orange-500/30',
  ECP: 'bg-teal-500/15 text-teal-500 border-teal-500/30'
};

const GRIP_COLOR_MAP = {
  '中起手': 'bg-slate-700/40 text-slate-300 border-slate-600/50',
  '上起手': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  '下起手': 'bg-blue-500/20 text-blue-400 border-blue-500/40'
};

export default function CaseCard({
  caseItem,
  isActive,
  isMastered,
  onSelect,
  onToggleMastered,
  theme = 'dark'
}) {
  const isDark = theme === 'dark';
  const groupBadgeClass = GROUP_COLOR_MAP[caseItem.group] || 'bg-slate-700/30 text-slate-400 border-slate-700';
  const gripBadgeClass = GRIP_COLOR_MAP[caseItem.grip] || 'bg-slate-700/30 text-slate-400';

  // Card container theme and mastered style calculation
  let containerStyle = '';
  if (isMastered) {
    if (isActive) {
      containerStyle = isDark
        ? 'bg-emerald-950/90 border-emerald-400 ring-2 ring-emerald-400/80 shadow-lg shadow-emerald-500/25 text-white'
        : 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-500/80 shadow-md shadow-emerald-500/20 text-emerald-950';
    } else {
      containerStyle = isDark
        ? 'bg-emerald-950/50 hover:bg-emerald-900/60 border-emerald-600/60 hover:border-emerald-500 text-emerald-100'
        : 'bg-emerald-50/95 hover:bg-emerald-100/90 border-emerald-400 hover:border-emerald-500 text-emerald-950 shadow-sm';
    }
  } else {
    if (isActive) {
      containerStyle = isDark
        ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/20 text-white'
        : 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/50 shadow-md shadow-blue-500/20 text-blue-950';
    } else {
      containerStyle = isDark
        ? 'bg-slate-900/90 hover:bg-slate-850 border-slate-800/90 hover:border-slate-700 text-slate-200'
        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm';
    }
  }

  return (
    <div
      onClick={() => onSelect(caseItem)}
      className={`relative group rounded-md p-2 transition-all duration-150 cursor-pointer flex flex-col justify-between border ${containerStyle}`}
    >
      {/* Top Header: Code, Badges & Master Toggle */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className={`font-bold text-xs sm:text-sm tracking-tight truncate ${
            isMastered 
              ? (isDark ? 'text-emerald-200' : 'text-emerald-900') 
              : (isDark ? 'text-white' : 'text-slate-900')
          }`}>
            {caseItem.code}
          </span>
          <span className={`text-[9px] font-semibold px-1 py-0.2 rounded border shrink-0 ${groupBadgeClass}`}>
            {caseItem.group}
          </span>
        </div>

        {/* Mastered checkbox button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMastered(caseItem.id);
          }}
          title={isMastered ? "已掌握 (点击取消)" : "标记为已掌握"}
          className={`w-5 h-5 rounded flex items-center justify-center transition border shrink-0 ${
            isMastered
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
              : isDark
                ? 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
                : 'bg-slate-100 text-slate-400 border-slate-300 hover:text-slate-700 hover:border-slate-400'
          }`}
        >
          <Check className="w-3 h-3" />
        </button>
      </div>

      {/* Middle: Prominent 3D Cube Graphic (Unobstructed, Never blurred or blocked) */}
      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded bg-white p-1.5 my-1 overflow-hidden flex items-center justify-center shadow-inner group/cube shrink-0 border transition-all ${
        isActive
          ? (isMastered ? 'ring-2 ring-emerald-500 border-emerald-400' : 'ring-2 ring-blue-500 border-blue-400')
          : (isMastered 
              ? (isDark ? 'border-emerald-600/40' : 'border-emerald-300') 
              : (isDark ? 'border-slate-700/60' : 'border-slate-200'))
      }`}>
        <img
          src={caseItem.cubeImg}
          alt={caseItem.code}
          loading="lazy"
          className="w-full h-full object-contain filter contrast-105 transition-transform duration-200 group-hover/cube:scale-105"
        />

        {/* Non-intrusive playing badge (Pinned to top-left corner, zero obstruction of cube facets) */}
        {isActive && (
          <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-blue-600/90 text-white text-[9px] font-bold flex items-center gap-1 shadow-sm pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>播放中</span>
          </div>
        )}
      </div>

      {/* Bottom Info: Timestamp & Grip & Formula */}
      <div className={`mt-1 pt-1 border-t flex flex-col gap-1 ${
        isMastered 
          ? (isDark ? 'border-emerald-800/40' : 'border-emerald-200') 
          : (isDark ? 'border-slate-800/80' : 'border-slate-200')
      }`}>
        <div className="flex items-center justify-between text-[10px]">
          <span className={`flex items-center gap-0.5 font-mono ${
            isMastered 
              ? (isDark ? 'text-emerald-300/80' : 'text-emerald-700') 
              : (isDark ? 'text-slate-400' : 'text-slate-500')
          }`}>
            <Clock className="w-2.5 h-2.5 opacity-70" />
            {caseItem.timestamp}
          </span>
          <span className={`text-[9px] px-1 py-0.2 rounded border font-medium flex items-center gap-0.5 ${gripBadgeClass}`}>
            <Hand className="w-2 h-2" />
            {caseItem.grip}
          </span>
        </div>

        {/* Algorithm text */}
        <div 
          className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold truncate border ${
            isMastered 
              ? isDark 
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800/60' 
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : isDark
                ? 'bg-slate-950/90 text-amber-300/90 border-slate-800/60'
                : 'bg-slate-50 text-amber-800 border-slate-200'
          }`} 
          title={caseItem.algorithm}
        >
          {caseItem.algorithm}
        </div>
      </div>
    </div>
  );
}
