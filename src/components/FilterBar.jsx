import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { F2L_GROUPS } from '../data/f2lCases';
import { resolveAssetUrl } from '../utils/assetUrl';

const FILTER_COLLAPSED_KEY = 'cube_tutor_filter_collapsed_v1';

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

  // Requirement 5: Collapsible filter bar to save vertical space
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(FILTER_COLLAPSED_KEY);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(FILTER_COLLAPSED_KEY, String(next));
      } catch {}
      return next;
    });
  };

  const categoryGroups = Object.entries(groups).map(([key, info]) => ({
    key,
    en: info.code || key,
    zh: info.abbrZh || info.nameZh,
    desc: info.desc,
    count: groupCounts[key] || 0,
    img: info.iconImg,
    color: info.color
  }));

  const currentActiveGroup = groups[selectedGroup];

  return (
    <div className={`border-2 p-2 sm:p-2.5 flex flex-col gap-2 shrink-0 transition-colors ${
      isDark 
        ? 'bg-[#0a0a0a] border-zinc-800 text-zinc-100' 
        : 'bg-[#ffffff] border-black text-black'
    }`}>
      {/* Category Header: Technical Title & Controls */}
      <div className="flex items-center justify-between px-0.5 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-2 h-2 bg-[#ff5b00] inline-block shrink-0" />
          <span className="font-mono text-xs sm:text-sm font-black tracking-tight uppercase truncate">
            {title}
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] opacity-60 hidden xs:inline shrink-0">
            {subtitle}
          </span>

          {/* If collapsed, show current category tag directly in header */}
          {isCollapsed && (
            <span className="font-mono text-[10px] sm:text-xs px-1.5 py-0.5 border border-[#ff5b00] text-[#ff5b00] font-bold shrink-0 truncate">
              [当前: {selectedGroup === 'all' ? '全部' : (currentActiveGroup?.abbrZh || currentActiveGroup?.nameZh)}]
            </span>
          )}
        </div>

        {/* Right Action Buttons: "ALL" + "收起/展开" */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Dedicated "全部" (All) button */}
          <button
            onClick={() => onSelectGroup('all')}
            title={`显示全部 ${totalCount} 种手法`}
            className={`flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 font-mono text-xs font-black transition-colors border ${
              selectedGroup === 'all'
                ? 'bg-[#ff5b00] text-black border-black'
                : isDark
                  ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-white hover:text-black hover:border-white'
                  : 'bg-zinc-100 border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            <span>ALL // 全部</span>
            <span className={`text-[10px] px-1 font-bold ${
              selectedGroup === 'all' 
                ? 'bg-black text-white' 
                : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {groupCounts.all || totalCount}
            </span>
          </button>

          {/* Requirement 5: Collapse / Expand Toggle Button */}
          <button
            onClick={toggleCollapsed}
            title={isCollapsed ? "展开分类九宫格" : "收起分类九宫格以节约垂直空间"}
            className={`flex items-center gap-1 px-2 py-0.5 sm:py-1 font-mono text-xs font-bold border transition-colors ${
              isDark 
                ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500' 
                : 'bg-zinc-100 border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            <span>{isCollapsed ? '展开分类' : '收起分类'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Categories Grid (Collapsible): 3 cols for 9 categories, 4 cols for 8 categories */}
      {!isCollapsed && (
        <div className={`grid ${categoryGroups.length === 8 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-1.5 sm:gap-2 animate-in fade-in duration-100`}>
          {categoryGroups.map((g) => {
            const isSelected = selectedGroup === g.key;

            return (
              <button
                key={g.key}
                onClick={() => onSelectGroup(g.key)}
                title={`${g.en} · ${g.zh} (${g.count}个) - ${g.desc}`}
                className={`group relative p-1 sm:p-1.5 text-left transition-colors flex items-center gap-1.5 sm:gap-2 border overflow-hidden ${
                  isSelected
                    ? 'border-2 border-[#ff5b00] bg-[#ff5b00]/10 text-black dark:text-white'
                    : isDark
                      ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
                      : 'bg-zinc-50 border-zinc-300 hover:border-black hover:bg-zinc-100'
                }`}
              >
                {/* Active Indicator Strip */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff5b00]" />
                )}

                {/* 3D Cube Graphic Thumbnail */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-white p-0.5 shrink-0 overflow-hidden flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                  <img
                    src={resolveAssetUrl(g.img)}
                    alt={g.en}
                    className="w-full h-full object-contain filter contrast-105"
                  />
                </div>

                {/* Information */}
                <div className="flex flex-col min-w-0 flex-1 leading-tight overflow-hidden pl-0.5">
                  <div className="flex items-center justify-between gap-0.5">
                    <span className={`font-mono text-[10px] sm:text-xs font-black tracking-tight uppercase truncate ${
                      isSelected ? 'text-[#ff5b00]' : isDark ? 'text-zinc-200' : 'text-zinc-900'
                    }`}>
                      {g.en}
                    </span>
                    <span className={`font-mono text-[9px] sm:text-[10px] px-1 font-bold shrink-0 ${
                      isSelected
                        ? 'bg-[#ff5b00] text-black'
                        : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
                    }`}>
                      {g.count}
                    </span>
                  </div>
                  <span className={`text-[9px] sm:text-[11px] truncate leading-tight mt-0.5 font-sans ${
                    isSelected 
                      ? 'font-bold' 
                      : isDark ? 'text-zinc-400 group-hover:text-zinc-200' : 'text-zinc-600 group-hover:text-black'
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
  );
}