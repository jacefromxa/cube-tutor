import React from 'react';
import { X, Play } from 'lucide-react';
import { F2L_GROUPS } from '../data/f2lCases';

export default function CardModal({ caseItem, onClose, onPlay, theme = 'dark' }) {
  if (!caseItem) return null;
  const isDark = theme === 'dark';
  const group = F2L_GROUPS[caseItem.group];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className={`relative max-w-xl w-full border rounded-lg overflow-hidden shadow-2xl flex flex-col ${
          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-3.5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black">{caseItem.code}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/30 font-medium">
              csTimer #{caseItem.csTimerNum} · {group?.nameZh}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 font-medium">
              {caseItem.grip}
            </span>
          </div>

          <button
            onClick={onClose}
            className={`p-1 rounded transition ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Original Card Snapshot from Video */}
        <div className={`p-4 flex flex-col items-center justify-center gap-3 ${
          isDark ? 'bg-slate-950' : 'bg-slate-100'
        }`}>
          <div className={`rounded overflow-hidden border shadow bg-white max-w-md w-full ${
            isDark ? 'border-slate-800' : 'border-slate-300'
          }`}>
            <img
              src={caseItem.cardImg}
              alt={caseItem.code}
              className="w-full h-auto object-contain"
            />
          </div>
          <p className="text-xs text-slate-500 font-mono text-center">
            杜宇生（2023）教程原视频截图 · 时间点 {caseItem.timestamp}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className={`p-3.5 border-t flex items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">操作手法:</span>
            <span className="font-mono text-sm sm:text-base font-bold text-amber-500">
              {caseItem.algorithm}
            </span>
          </div>

          <button
            onClick={() => {
              onPlay(caseItem);
              onClose();
            }}
            className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>跳转播放实况</span>
          </button>
        </div>
      </div>
    </div>
  );
}
