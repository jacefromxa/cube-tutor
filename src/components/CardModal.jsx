import React from 'react';
import { X, Play } from 'lucide-react';
import { F2L_GROUPS } from '../data/f2lCases';

export default function CardModal({ caseItem, onClose, onPlay }) {
  if (!caseItem) return null;
  const group = F2L_GROUPS[caseItem.group];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-black text-white">{caseItem.code}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-medium">
              csTimer #{caseItem.csTimerNum} · {group?.nameZh}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
              {caseItem.grip}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Card Snapshot from Video */}
        <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center gap-4">
          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-white max-w-lg w-full">
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
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">操作手法:</span>
            <span className="font-mono text-base font-bold text-amber-300">
              {caseItem.algorithm}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onPlay(caseItem);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>跳转播放实况</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

