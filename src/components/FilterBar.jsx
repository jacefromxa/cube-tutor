import React, { useState } from 'react';
import { Search, ArrowUpDown, X, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { F2L_GROUPS } from '../data/f2lCases';

const GROUP_THEMES = {
  all: {
    border: 'border-slate-700',
    activeBg: 'bg-blue-600 border-blue-500 shadow-blue-500/25',
    activeRing: 'ring-blue-500/30',
    textColor: 'text-white'
  },
  Easy: {
    border: 'border-emerald-500/30',
    activeBg: 'bg-emerald-950/90 border-emerald-400 shadow-emerald-500/20 text-emerald-300',
    activeRing: 'ring-emerald-500/30',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    textColor: 'text-emerald-400'
  },
  RE: {
    border: 'border-blue-500/30',
    activeBg: 'bg-blue-950/90 border-blue-400 shadow-blue-500/20 text-blue-300',
    activeRing: 'ring-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    textColor: 'text-blue-400'
  },
  REFC: {
    border: 'border-amber-500/30',
    activeBg: 'bg-amber-950/90 border-amber-400 shadow-amber-500/20 text-amber-300',
    activeRing: 'ring-amber-500/30',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    textColor: 'text-amber-400'
  },
  PMS: {
    border: 'border-purple-500/30',
    activeBg: 'bg-purple-950/90 border-purple-400 shadow-purple-500/20 text-purple-300',
    activeRing: 'ring-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    textColor: 'text-purple-400'
  },
  SPGO: {
    border: 'border-cyan-500/30',
    activeBg: 'bg-cyan-950/90 border-cyan-400 shadow-cyan-500/20 text-cyan-300',
    activeRing: 'ring-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    textColor: 'text-cyan-400'
  },
  Weird: {
    border: 'border-rose-500/30',
    activeBg: 'bg-rose-950/90 border-rose-400 shadow-rose-500/20 text-rose-300',
    activeRing: 'ring-rose-500/30',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    textColor: 'text-rose-400'
  },
  CPEU: {
    border: 'border-indigo-500/30',
    activeBg: 'bg-indigo-950/90 border-indigo-400 shadow-indigo-500/20 text-indigo-300',
    activeRing: 'ring-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    textColor: 'text-indigo-400'
  },
  EPCU: {
    border: 'border-orange-500/30',
    activeBg: 'bg-orange-950/90 border-orange-400 shadow-orange-500/20 text-orange-300',
    activeRing: 'ring-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    textColor: 'text-orange-400'
  },
  ECP: {
    border: 'border-teal-500/30',
    activeBg: 'bg-teal-950/90 border-teal-400 shadow-teal-500/20 text-teal-300',
    activeRing: 'ring-teal-500/30',
    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    textColor: 'text-teal-400'
  }
};

export default function FilterBar({
  selectedGroup,
  onSelectGroup,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  masteredFilter,
  onMasteredFilterChange,
  groupCounts
}) {
  const [isCategoriesCollapsed, setIsCategoriesCollapsed] = useState(false);

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
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-3 sm:p-3.5 flex flex-col gap-2.5 shadow-xl shrink-0">
      {/* Row 1: Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="搜索编号、分组、公式 (如: 15, SPGO, R U R')..."
          className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Row 2: Sort & Mastered Filter Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs flex-1 min-w-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer w-full truncate"
          >
            <option value="category" className="bg-slate-900 text-slate-200">csTimer 分类</option>
            <option value="csTimerNum" className="bg-slate-900 text-slate-200">编号 (#01-41)</option>
            <option value="videoOrder" className="bg-slate-900 text-slate-200">视频时间轴</option>
          </select>
        </div>

        {/* Mastered Status Filter */}
        <div className="flex items-center gap-0.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
          {[
            { key: 'all', label: '全部' },
            { key: 'unmastered', label: '待练' },
            { key: 'mastered', label: '已会' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => onMasteredFilterChange(tab.key)}
              className={`px-2 py-0.5 rounded-lg text-xs font-medium transition ${
                masteredFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Category Buttons Header & Grid */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/60">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>分类选择（英文 + 中文 + 图形）</span>
          </span>
          <div className="flex items-center gap-2">
            {selectedGroup !== 'all' && (
              <button
                onClick={() => onSelectGroup('all')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                重置
              </button>
            )}
            <button
              onClick={() => setIsCategoriesCollapsed(!isCategoriesCollapsed)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
              title={isCategoriesCollapsed ? "展开分类" : "收起分类"}
            >
              {isCategoriesCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 10 Visual Category Buttons in 2 columns (Compact and clean in left sidebar) */}
        {!isCategoriesCollapsed && (
          <div className="grid grid-cols-2 gap-1.5 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin">
            {groupsList.map(g => {
              const isSelected = selectedGroup === g.key;
              const theme = GROUP_THEMES[g.key] || GROUP_THEMES.all;

              return (
                <button
                  key={g.key}
                  onClick={() => onSelectGroup(g.key)}
                  className={`group relative rounded-xl p-1.5 text-left transition-all duration-150 flex items-center gap-2 border ${
                    isSelected
                      ? `${theme.activeBg} ring-1.5 ${theme.activeRing} shadow-md scale-[1.01]`
                      : 'bg-slate-950/70 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* 3D Cube Graphic Thumbnail */}
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white p-0.5 shrink-0 overflow-hidden flex items-center justify-center shadow-inner border border-slate-700/60 group-hover:scale-105 transition-transform">
                    <img
                      src={g.img}
                      alt={g.en}
                      className="w-full h-full object-contain filter contrast-105"
                    />
                  </div>

                  {/* English + Chinese + Count Badge */}
                  <div className="flex flex-col min-w-0 flex-1 leading-tight">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[11px] font-black tracking-tight uppercase truncate ${
                        isSelected ? 'text-white' : (theme.textColor || 'text-slate-200')
                      }`}>
                        {g.en}
                      </span>
                      <span className={`text-[9px] font-mono px-1 rounded-full font-semibold shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {g.count}
                      </span>
                    </div>
                    <span className={`text-[10px] truncate mt-0.5 ${
                      isSelected ? 'text-slate-200 font-medium' : 'text-slate-400 group-hover:text-slate-300'
                    }`}>
                      {g.zh}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
