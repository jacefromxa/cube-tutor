import React from 'react';
import { Layers } from 'lucide-react';
import { F2L_GROUPS } from '../data/f2lCases';

const GROUP_THEMES = {
  all: {
    border: 'border-slate-700',
    activeBgDark: 'bg-blue-600 border-blue-500 shadow-blue-500/25 text-white',
    activeBgLight: 'bg-blue-600 border-blue-500 shadow-blue-500/25 text-white',
    textColor: 'text-blue-400'
  },
  Easy: {
    activeBgDark: 'bg-emerald-950/90 border-emerald-400 text-emerald-300',
    activeBgLight: 'bg-emerald-100 border-emerald-500 text-emerald-900',
    textColor: 'text-emerald-500'
  },
  RE: {
    activeBgDark: 'bg-blue-950/90 border-blue-400 text-blue-300',
    activeBgLight: 'bg-blue-100 border-blue-500 text-blue-900',
    textColor: 'text-blue-500'
  },
  REFC: {
    activeBgDark: 'bg-amber-950/90 border-amber-400 text-amber-300',
    activeBgLight: 'bg-amber-100 border-amber-500 text-amber-900',
    textColor: 'text-amber-500'
  },
  PMS: {
    activeBgDark: 'bg-purple-950/90 border-purple-400 text-purple-300',
    activeBgLight: 'bg-purple-100 border-purple-500 text-purple-900',
    textColor: 'text-purple-500'
  },
  SPGO: {
    activeBgDark: 'bg-cyan-950/90 border-cyan-400 text-cyan-300',
    activeBgLight: 'bg-cyan-100 border-cyan-500 text-cyan-900',
    textColor: 'text-cyan-500'
  },
  Weird: {
    activeBgDark: 'bg-rose-950/90 border-rose-400 text-rose-300',
    activeBgLight: 'bg-rose-100 border-rose-500 text-rose-900',
    textColor: 'text-rose-500'
  },
  CPEU: {
    activeBgDark: 'bg-indigo-950/90 border-indigo-400 text-indigo-300',
    activeBgLight: 'bg-indigo-100 border-indigo-500 text-indigo-900',
    textColor: 'text-indigo-500'
  },
  EPCU: {
    activeBgDark: 'bg-orange-950/90 border-orange-400 text-orange-300',
    activeBgLight: 'bg-orange-100 border-orange-500 text-orange-900',
    textColor: 'text-orange-500'
  },
  ECP: {
    activeBgDark: 'bg-teal-950/90 border-teal-400 text-teal-300',
    activeBgLight: 'bg-teal-100 border-teal-500 text-teal-900',
    textColor: 'text-teal-500'
  }
};

export default function FilterBar({
  selectedGroup,
  onSelectGroup,
  groupCounts = {},
  theme = 'dark'
}) {
  const isDark = theme === 'dark';

  const groupsList = [
    { 
      key: 'all', 
      en: 'ALL', 
      zh: '全部形态',
      desc: '全部 41 种常规手法',
      count: groupCounts.all || 41,
      img: '/assets/cubes/Easy-01.png'
    },
    ...Object.entries(F2L_GROUPS).map(([key, info]) => ({
      key,
      en: key,
      zh: info.abbrZh || info.nameZh,
      desc: info.desc,
      count: groupCounts[key] || 0,
      img: info.iconImg
    }))
  ];

  return (
    <div className={`border rounded-md p-2 flex flex-col gap-1.5 shrink-0 transition-colors ${
      isDark 
        ? 'bg-slate-900/95 border-slate-800 shadow-md' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Category Header: Ultra-slim row */}
      <div className="flex items-center justify-between px-0.5 leading-none">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span className={`text-xs font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            csTimer 分类
          </span>
          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            (共 41 式)
          </span>
        </div>

        {selectedGroup !== 'all' && (
          <button
            onClick={() => onSelectGroup('all')}
            className="text-[11px] text-blue-500 hover:underline font-semibold"
          >
            显示全部 (重置)
          </button>
        )}
      </div>

      {/* 10 Visual Category Buttons in 5 Columns x 2 Rows: Highly Economical & Zero Scrolling! */}
      <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-5 gap-1.5 overflow-hidden">
        {groupsList.map(g => {
          const isSelected = selectedGroup === g.key;
          const themeConfig = GROUP_THEMES[g.key] || GROUP_THEMES.all;
          const activeClass = isDark ? themeConfig.activeBgDark : themeConfig.activeBgLight;

          return (
            <button
              key={g.key}
              onClick={() => onSelectGroup(g.key)}
              title={`${g.en} · ${g.zh} (${g.count}个) - ${g.desc}`}
              className={`group relative rounded p-1 text-left transition-all duration-150 flex items-center gap-1.5 border overflow-hidden ${
                isSelected
                  ? `${activeClass} ring-1.5 ring-blue-500/40 shadow-sm scale-[1.01]`
                  : isDark
                    ? 'bg-slate-950/70 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* 3D Cube Graphic Thumbnail */}
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded bg-white p-0.5 shrink-0 overflow-hidden flex items-center justify-center border shadow-inner ${
                isDark ? 'border-slate-700/60' : 'border-slate-200'
              }`}>
                <img
                  src={g.img}
                  alt={g.en}
                  className="w-full h-full object-contain filter contrast-105"
                />
              </div>

              {/* Text info: English + Count on top, Chinese on bottom */}
              <div className="flex flex-col min-w-0 flex-1 leading-tight overflow-hidden">
                <div className="flex items-center justify-between gap-0.5">
                  <span className={`text-[10px] font-black tracking-tight uppercase truncate ${
                    isSelected 
                      ? (isDark ? 'text-white' : 'text-blue-900 font-bold') 
                      : (themeConfig.textColor || (isDark ? 'text-slate-200' : 'text-slate-700'))
                  }`}>
                    {g.en}
                  </span>
                  <span className={`text-[9px] font-mono px-1 rounded font-semibold shrink-0 ${
                    isSelected
                      ? (isDark ? 'bg-white/20 text-white' : 'bg-blue-600 text-white')
                      : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                  }`}>
                    {g.count}
                  </span>
                </div>
                <span className={`text-[9px] truncate leading-none mt-0.5 ${
                  isSelected 
                    ? (isDark ? 'text-slate-200 font-medium' : 'text-blue-800 font-medium')
                    : (isDark ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700')
                }`}>
                  {g.zh}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
