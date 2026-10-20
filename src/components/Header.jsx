import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, RotateCcw, Video, BookOpen, Layers } from 'lucide-react';

export default function Header({ 
  totalCases = 41, 
  masteredCount = 0, 
  onResetProgress,
  onOpenShortcuts
}) {
  const percent = Math.round((masteredCount / totalCases) * 100);

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/85 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 to-amber-300 text-lg">
              3×3
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                CFOP · F2L 41 种常规手法
              </h1>
              <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                杜宇生（2023）
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              基于 csTimer 科学分类与时间轴实况解析 · 点击图形直达对应手法
            </p>
          </div>
        </div>

        {/* Right: Progress & Actions */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Progress Pill */}
          <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 shadow-inner">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200">
                  {masteredCount} <span className="text-slate-500 font-normal">/ {totalCases}</span>
                </span>
                <span className="text-[11px] font-medium text-emerald-400">
                  {percent}%
                </span>
              </div>
              <div className="w-16 sm:w-20 bg-slate-800 rounded-full h-1 overflow-hidden mt-0.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Shortcuts Help */}
          <button
            onClick={onOpenShortcuts}
            title="快捷键指南"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

