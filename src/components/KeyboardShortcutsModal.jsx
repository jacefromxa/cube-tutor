import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal({ onClose, theme = 'dark' }) {
  const isDark = theme === 'dark';

  const shortcuts = [
    { key: '空格 (Space)', action: '播放 / 暂停视频' },
    { key: '← / → (方向键)', action: '快退 3 秒 / 快进 3 秒 (精准微调手法)' },
    { key: 'J / K', action: '快退 3 秒 / 快进 3 秒 (双手速拧备用键)' },
    { key: '[ / ] 或 P / N', action: '切换上一个 / 下一个 Case' },
    { key: 'R', action: '重新播放当前 Case' },
    { key: 'L', action: '开启 / 关闭单段循环模式' },
    { key: '1 ~ 4', action: '切换播放倍速 (0.5x, 0.75x, 1x, 1.25x)' },
    { key: 'M', action: '静音 / 取消静音' },
    { key: 'F', action: '视频全屏模式' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className={`relative max-w-md w-full border rounded-lg overflow-hidden shadow-2xl flex flex-col ${
          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-3.5 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <Keyboard className="w-4 h-4 text-blue-500" />
            <span>键盘快捷键指南</span>
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

        <div className="p-4 flex flex-col gap-2.5">
          {shortcuts.map((s, idx) => (
            <div key={idx} className={`flex items-center justify-between py-1 border-b last:border-0 ${
              isDark ? 'border-slate-800/60' : 'border-slate-100'
            }`}>
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{s.action}</span>
              <kbd className={`px-2 py-0.5 rounded text-[11px] font-mono shadow-sm border ${
                isDark 
                  ? 'bg-slate-950 border-slate-700 text-amber-400' 
                  : 'bg-slate-100 border-slate-300 text-amber-700'
              }`}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className={`p-3 border-t text-center ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <p className="text-[11px] text-slate-500">
            提示：双手复原魔方练习时，建议开启“循环练习”，按空格键随时暂停与继续。
          </p>
        </div>
      </div>
    </div>
  );
}
