import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal({ onClose }) {
  const shortcuts = [
    { key: '空格 (Space)', action: '播放 / 暂停视频' },
    { key: '← / →', action: '切换上一个 / 下一个 Case 手法' },
    { key: 'R', action: '重新播放当前 Case' },
    { key: 'L', action: '开启 / 关闭单段循环模式' },
    { key: 'J / K', action: '快退 2 秒 / 快进 2 秒' },
    { key: '1 ~ 4', action: '切换播放倍速 (0.5x, 0.75x, 1x, 1.25x)' },
    { key: 'M', action: '静音 / 取消静音' },
    { key: 'F', action: '视频全屏模式' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <span>键盘快捷键指南</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
              <span className="text-sm text-slate-300">{s.action}</span>
              <kbd className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-amber-300 shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-500">
            提示：在进行魔方实操时，双手握魔方可使用空格键与方向键快速循环操练。
          </p>
        </div>
      </div>
    </div>
  );
}

