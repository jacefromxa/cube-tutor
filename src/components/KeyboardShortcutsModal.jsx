import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal({ onClose, theme = 'dark' }) {
  const isDark = theme === 'dark';

  const shortcuts = [
    { key: '空格 (Space)', action: '播放 / 暂停视频' },
    { key: '← / → (方向键)', action: '快退 2 秒 / 快进 2 秒 (精准微调手法)' },
    { key: 'J / K', action: '快退 2 秒 / 快进 2 秒 (双手速拧备用键)' },
    { key: '[ / ] 或 P / N', action: '切换上一个 / 下一个 Case' },
    { key: 'R', action: '重新播放当前 Case' },
    { key: 'L', action: '开启 / 关闭单段循环模式' },
    { key: '1 ~ 4', action: '切换播放倍速 (0.5x, 0.75x, 1x, 1.25x)' },
    { key: 'Shift + 1/2/3', action: '极速切换模块 (F2L / OLL / PLL)' },
    { key: 'F', action: '全屏模式切换' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div 
        className={`relative max-w-lg w-full border-2 overflow-hidden flex flex-col font-mono shadow-2xl ${
          isDark ? 'bg-[#0a0a0a] border-zinc-700 text-white' : 'bg-white border-black text-black'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`p-3.5 border-b-2 flex items-center justify-between ${
          isDark ? 'border-zinc-800 bg-zinc-950' : 'border-black bg-zinc-100'
        }`}>
          <div className="flex items-center gap-2 font-black text-sm tracking-tight uppercase">
            <span className="w-2 h-2 bg-[#ff5b00] inline-block" />
            <span>[ SHORTCUTS // 键盘操作指南 ]</span>
          </div>
          <button
            onClick={onClose}
            className={`w-7 h-7 flex items-center justify-center border transition-colors ${
              isDark 
                ? 'border-zinc-700 text-zinc-400 hover:bg-[#ff5b00] hover:text-black hover:border-black' 
                : 'border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 flex flex-col gap-2">
          {shortcuts.map((s, idx) => (
            <div key={idx} className={`flex items-center justify-between py-1.5 border-b last:border-0 ${
              isDark ? 'border-zinc-800/80' : 'border-zinc-200'
            }`}>
              <span className={`text-xs font-sans font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                {s.action}
              </span>
              <kbd className={`px-2 py-0.5 border font-mono text-[11px] font-bold ${
                isDark 
                  ? 'bg-zinc-900 border-zinc-700 text-[#ff5b00]' 
                  : 'bg-zinc-100 border-black text-black'
              }`}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className={`p-3 border-t-2 text-center text-[11px] font-sans ${
          isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-black text-zinc-700'
        }`}>
          建议双手速拧练习时保持开启“循环模式”，敲击空格键控制播放。
        </div>
      </div>
    </div>
  );
}