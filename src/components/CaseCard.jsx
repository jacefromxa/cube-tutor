import React from 'react';
import { Play, Check, Clock, Hand } from 'lucide-react';
import { F2L_GROUPS } from '../data/f2lCases';

const GROUP_COLOR_MAP = {
  Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  RE: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  REFC: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  PMS: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  SPGO: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  Weird: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  CPEU: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  EPCU: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  ECP: 'bg-teal-500/15 text-teal-400 border-teal-500/30'
};

const GRIP_COLOR_MAP = {
  '中起手': 'bg-slate-800 text-slate-300',
  '上起手': 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  '下起手': 'bg-blue-900/40 text-blue-300 border-blue-700/50'
};

export default function CaseCard({
  caseItem,
  isActive,
  isMastered,
  onSelect,
  onToggleMastered
}) {
  const groupBadgeClass = GROUP_COLOR_MAP[caseItem.group] || 'bg-slate-800 text-slate-300 border-slate-700';
  const gripBadgeClass = GRIP_COLOR_MAP[caseItem.grip] || 'bg-slate-800 text-slate-300';

  return (
    <div
      onClick={() => onSelect(caseItem)}
      className={`relative group rounded-xl p-2 sm:p-2.5 transition-all duration-150 cursor-pointer flex flex-col justify-between border ${
        isActive
          ? 'bg-gradient-to-b from-blue-950/70 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/20 ring-1.5 ring-blue-500/40'
          : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800/90 hover:border-slate-700 shadow-sm hover:shadow'
      }`}
    >
      {/* Top Header: Code, Badges & Master Toggle */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-bold text-xs sm:text-sm text-white tracking-tight truncate">
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
              : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300 hover:border-slate-600'
          }`}
        >
          <Check className="w-3 h-3" />
        </button>
      </div>

      {/* Middle: Compact 3D Cube Graphic (Reduced ~50% in size for maximum screen efficiency) */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-lg bg-white p-1 my-1 overflow-hidden flex items-center justify-center shadow-inner group/cube shrink-0">
        <img
          src={caseItem.cubeImg}
          alt={caseItem.code}
          loading="lazy"
          className="w-full h-full object-contain filter contrast-105 transition-transform duration-200 group-hover/cube:scale-110"
        />

        {/* Hover play prompt */}
        <div className={`absolute inset-0 bg-blue-950/60 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center gap-0.5 text-white transition-opacity duration-150 ${
          isActive ? 'opacity-100 bg-blue-900/40' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/50">
            <Play className="w-2.5 h-2.5 fill-white translate-x-0.2" />
          </div>
          <span className="text-[9px] font-medium leading-none">
            {isActive ? '播放中' : '播放'}
          </span>
        </div>

        {/* Active playing indicator badge */}
        {isActive && (
          <span className="absolute top-1 left-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
      </div>

      {/* Bottom Info: Timestamp & Grip & Formula */}
      <div className="mt-1 pt-1 border-t border-slate-800/80 flex flex-col gap-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-400 flex items-center gap-0.5 font-mono">
            <Clock className="w-2.5 h-2.5 text-slate-500" />
            {caseItem.timestamp}
          </span>
          <span className={`text-[9px] px-1 py-0.2 rounded border font-medium flex items-center gap-0.5 ${gripBadgeClass}`}>
            <Hand className="w-2 h-2" />
            {caseItem.grip}
          </span>
        </div>

        {/* Algorithm text */}
        <div className="bg-slate-950/90 rounded px-1.5 py-1 font-mono text-[11px] font-semibold text-amber-300/90 truncate border border-slate-800/60" title={caseItem.algorithm}>
          {caseItem.algorithm}
        </div>
      </div>
    </div>
  );
}
