import React from 'react';
import { Layers } from 'lucide-react';
import { F2L_GROUPS } from '../data/f2lCases';

const COLOR_THEMES = {
  emerald: {
    activeBgDark: 'bg-emerald-950/90 border-emerald-400 text-emerald-300',
    activeBgLight: 'bg-emerald-100 border-emerald-500 text-emerald-900',
    textColor: 'text-emerald-500'
  },
  blue: {
    activeBgDark: 'bg-blue-950/90 border-blue-400 text-blue-300',
    activeBgLight: 'bg-blue-100 border-blue-500 text-blue-900',
    textColor: 'text-blue-500'
  },
  amber: {
    activeBgDark: 'bg-amber-950/90 border-amber-400 text-amber-300',
    activeBgLight: 'bg-amber-100 border-amber-500 text-amber-900',
    textColor: 'text-amber-500'
  },
  purple: {
    activeBgDark: 'bg-purple-950/90 border-purple-400 text-purple-300',
    activeBgLight: 'bg-purple-100 border-purple-500 text-purple-900',
    textColor: 'text-purple-500'
  },
  cyan: {
    activeBgDark: 'bg-cyan-950/90 border-cyan-400 text-cyan-300',
    activeBgLight: 'bg-cyan-100 border-cyan-500 text-cyan-900',
    textColor: 'text-cyan-500'
  },
  rose: {
    activeBgDark: 'bg-rose-950/90 border-rose-400 text-rose-300',
    activeBgLight: 'bg-rose-100 border-rose-500 text-rose-900',
    textColor: 'text-rose-500'
  },
  indigo: {
    activeBgDark: 'bg-indigo-950/90 border-indigo-400 text-indigo-300',
    activeBgLight: 'bg-indigo-100 border-indigo-500 text-indigo-900',
    textColor: 'text-indigo-500'
  },
  orange: {
    activeBgDark: 'bg-orange-950/90 border-orange-400 text-orange-300',
    activeBgLight: 'bg-orange-100 border-orange-500 text-orange-900',
    textColor: 'text-orange-500'
  },
  teal: {
    activeBgDark: 'bg-teal-950/90 border-teal-400 text-teal-300',
    activeBgLight: 'bg-teal-100 border-teal-500 text-teal-900',
    textColor: 'text-teal-500'
  }
};

const DEFAULT_THEME = {
  border: 'border-slate-700',
  activeBgDark: 'bg-blue-600 border-blue-500 shadow-blue-500/25 text-white',
  activeBgLight: 'bg-blue-600 border-blue-500 shadow-blue-500/25 text-white',
  textColor: 'text-blue-400'
};

export default function FilterBar({
  groups = F2L_GROUPS,
  selectedGroup,
  onSelectGroup,
  groupCounts = {},
  theme = 'dark',
  title = '情况分类',
  subtitle = '(9大类)',
  totalCount = 41
}) {
  const isDark = theme === 'dark';

  // Categories in grid (without 'all', which is placed separately in the top-right header)
  const categoryGroups = Object.entries(groups).map(([key, info]) => ({
    key,
    en: info.code || key,
    zh: info.abbrZh || info.nameZh,
    desc: info.desc,
    count: groupCounts[key] || 0,
    img: info.iconImg,
    color: info.color
  }));

  return (
    <div className={`border rounded-md p-2 sm:p-2.5 flex flex-col gap-2 shrink-0 transition-colors ${
      isDark 
        ? 'bg-slate-900/95 border-slate-800 shadow-md' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Category Header: Section Title on Left + Dedicated "全部" Button on Right */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-500" />
          <span className={`text-xs sm:text-sm font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {title}
          </span>
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {subtitle}
          </span>
        </div>

        {/* Dedicated "全部" (All) button in the top-right corner */}
        <button
          onClick={() => onSelectGroup('all')}
          title={`显示全部 ${totalCount} 种手法`}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded text-xs font-bold transition-all duration-150 border ${
            selectedGroup === 'all'
              ? 'bg-blue-600 border-blue-500 text-white shadow-xs'
              : isDark
                ? 'bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-300'
          }`}
        >
          <span>全部</span>
          <span className={`text-[10px] font-mono px-1 rounded font-semibold ${
            selectedGroup === 'all'
              ? 'bg-white/20 text-white'
              : isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-600'
          }`}>
            {groupCounts.all || totalCount}
          </span>
        </button>
      </div>

      {/* 9 Categories in 3 Columns x 3 Rows: Spacious, clear 3D thumbnails, and readable text */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {categoryGroups.map(g => {
          const isSelected = selectedGroup === g.key;
          const themeConfig = COLOR_THEMES[g.color] || DEFAULT_THEME;
          const activeClass = isDark ? themeConfig.activeBgDark : themeConfig.activeBgLight;

          return (
            <button
              key={g.key}
              onClick={() => onSelectGroup(g.key)}
              title={`${g.en} · ${g.zh} (${g.count}个) - ${g.desc}`}
              className={`group relative rounded p-1.5 text-left transition-all duration-150 flex items-center gap-2 border overflow-hidden ${
                isSelected
                  ? `${activeClass} ring-1.5 ring-blue-500/40 shadow-sm scale-[1.01]`
                  : isDark
                    ? 'bg-slate-950/70 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Enlarged 3D Cube Graphic Thumbnail */}
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded bg-white p-0.5 shrink-0 overflow-hidden flex items-center justify-center border shadow-xs ${
                isDark ? 'border-slate-700/60' : 'border-slate-200'
              }`}>
                <img
                  src={g.img}
                  alt={g.en}
                  className="w-full h-full object-contain filter contrast-105"
                />
              </div>

              {/* Text info: Category Code & Count on top, Chinese description on bottom */}
              <div className="flex flex-col min-w-0 flex-1 leading-tight overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs sm:text-sm font-black tracking-tight uppercase truncate ${
                    isSelected 
                      ? (isDark ? 'text-white' : 'text-blue-900 font-bold') 
                      : (themeConfig.textColor || (isDark ? 'text-slate-200' : 'text-slate-700'))
                  }`}>
                    {g.en}
                  </span>
                  <span className={`text-[10px] font-mono px-1 rounded font-semibold shrink-0 ${
                    isSelected
                      ? (isDark ? 'bg-white/20 text-white' : 'bg-blue-600 text-white')
                      : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                  }`}>
                    {g.count}
                  </span>
                </div>
                <span className={`text-[10px] sm:text-[11px] truncate leading-tight mt-0.5 ${
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
