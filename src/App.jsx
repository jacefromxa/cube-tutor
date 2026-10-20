import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import FilterBar from './components/FilterBar';
import CaseCard from './components/CaseCard';
import CardModal from './components/CardModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { F2L_CASES, F2L_GROUPS, TOTAL_CASES } from './data/f2lCases';
import { AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'f2l_mastered_cases_v1';
const THEME_STORAGE_KEY = 'f2l_theme_mode_v1';

export default function App() {
  const [currentCase, setCurrentCase] = useState(() => F2L_CASES[0]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [masteredFilter, setMasteredFilter] = useState('all');
  const [modalCase, setModalCase] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Theme state: light | dark (default: light)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved || 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const playerRef = useRef(null);
  const caseListScrollRef = useRef(null);

  // Mastered cases persisted in localStorage
  const [masteredIds, setMasteredIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const masteredSet = useMemo(() => new Set(masteredIds), [masteredIds]);

  const toggleMastered = useCallback((caseId) => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      const isNowMastered = !next.has(caseId);
      if (isNowMastered) {
        next.add(caseId);
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10b981', '#3b82f6', '#f59e0b']
          });
        } catch {}
      } else {
        next.delete(caseId);
      }
      const arr = Array.from(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      } catch {}
      return arr;
    });
  }, []);

  const resetProgress = useCallback(() => {
    if (window.confirm('确定要清空已掌握的学习进度吗？')) {
      setMasteredIds([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }, []);

  // Group counts calculation
  const groupCounts = useMemo(() => {
    const counts = { all: F2L_CASES.length };
    F2L_CASES.forEach(c => {
      counts[c.group] = (counts[c.group] || 0) + 1;
    });
    return counts;
  }, []);

  // Filter Cases: strictly csTimer classification order (search and sorting dropdown removed)
  const filteredCases = useMemo(() => {
    let list = [...F2L_CASES];

    // Group filter (csTimer category)
    if (selectedGroup !== 'all') {
      list = list.filter(c => c.group === selectedGroup);
    }

    // Mastered filter (all / unmastered / mastered)
    if (masteredFilter === 'mastered') {
      list = list.filter(c => masteredSet.has(c.id));
    } else if (masteredFilter === 'unmastered') {
      list = list.filter(c => !masteredSet.has(c.id));
    }

    return list;
  }, [selectedGroup, masteredFilter, masteredSet]);

  const handleSelectCase = useCallback((item) => {
    setCurrentCase(item);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      // Space: Toggle Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        playerRef.current?.togglePlay();
      } 
      // Requirement 1: Arrow Left/Right controls 3-second rapid jump
      else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift + ArrowLeft switches to previous case
          const activeList = filteredCases.length > 0 ? filteredCases : F2L_CASES;
          const idx = activeList.findIndex(c => c.id === currentCase?.id);
          if (idx > 0) handleSelectCase(activeList[idx - 1]);
        } else {
          // Step 3s back
          playerRef.current?.handleStep(-3);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift + ArrowRight switches to next case
          const activeList = filteredCases.length > 0 ? filteredCases : F2L_CASES;
          const idx = activeList.findIndex(c => c.id === currentCase?.id);
          if (idx !== -1 && idx < activeList.length - 1) handleSelectCase(activeList[idx + 1]);
        } else {
          // Step 3s forward
          playerRef.current?.handleStep(3);
        }
      } 
      // [ / ] or P / N for Case switching
      else if (e.code === 'BracketLeft' || e.code === 'KeyP') {
        e.preventDefault();
        const activeList = filteredCases.length > 0 ? filteredCases : F2L_CASES;
        const idx = activeList.findIndex(c => c.id === currentCase?.id);
        if (idx > 0) handleSelectCase(activeList[idx - 1]);
      } else if (e.code === 'BracketRight' || e.code === 'KeyN') {
        e.preventDefault();
        const activeList = filteredCases.length > 0 ? filteredCases : F2L_CASES;
        const idx = activeList.findIndex(c => c.id === currentCase?.id);
        if (idx !== -1 && idx < activeList.length - 1) handleSelectCase(activeList[idx + 1]);
      } 
      // J / K for 3s step (two-hand speedsolving backup)
      else if (e.code === 'KeyJ') {
        e.preventDefault();
        playerRef.current?.handleStep(-3);
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        playerRef.current?.handleStep(3);
      } 
      // R: Replay
      else if (e.code === 'KeyR') {
        e.preventDefault();
        playerRef.current?.handleReplay();
      } 
      // L: Toggle Loop
      else if (e.code === 'KeyL') {
        e.preventDefault();
        playerRef.current?.toggleLooping();
      } 
      // M: Mute
      else if (e.code === 'KeyM') {
        e.preventDefault();
        playerRef.current?.toggleMute();
      } 
      // F: Fullscreen
      else if (e.code === 'KeyF') {
        e.preventDefault();
        playerRef.current?.requestFullscreen();
      } 
      // Number keys for speed
      else if (e.key === '1') {
        playerRef.current?.changeSpeed(0.5);
      } else if (e.key === '2') {
        playerRef.current?.changeSpeed(0.75);
      } else if (e.key === '3') {
        playerRef.current?.changeSpeed(1.0);
      } else if (e.key === '4') {
        playerRef.current?.changeSpeed(1.25);
      } 
      // Escape closes modals
      else if (e.key === 'Escape') {
        setModalCase(null);
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCases, currentCase, handleSelectCase]);

  const activeGroupInfo = selectedGroup !== 'all' ? F2L_GROUPS[selectedGroup] : null;
  const isDark = theme === 'dark';

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col font-sans transition-colors duration-150 ${
      isDark 
        ? 'bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white' 
        : 'bg-slate-100 text-slate-900 selection:bg-blue-500 selection:text-white'
    }`}>
      {/* Header (Fixed at top, with theme toggle & mastery tabs) */}
      <Header
        totalCases={TOTAL_CASES}
        masteredCount={masteredIds.length}
        masteredFilter={masteredFilter}
        onMasteredFilterChange={setMasteredFilter}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetProgress={resetProgress}
        onOpenShortcuts={() => setShowShortcuts(true)}
      />

      {/* Main Dual-Column Layout:
          - Left: Maximized Video Stage (Fixed, No scroll away, Maximized height, Interactive Scrubber)
          - Right: Option Menu (Compact csTimer Categories, Case cards with prominent mastery color switch, Independent scroll container)
      */}
      <main className="flex-1 min-h-0 max-w-[1920px] w-full mx-auto px-2.5 sm:px-3 lg:px-5 py-2 sm:py-2.5 flex flex-col lg:flex-row gap-2.5 sm:gap-3 lg:gap-4 items-stretch overflow-hidden">
        
        {/* LEFT COLUMN: Maximized Video Player & Action Bar (Permanently Fixed in Viewport!) */}
        <div className="w-full lg:w-[57%] xl:w-[61%] 2xl:w-[64%] shrink-0 h-full flex flex-col justify-start overflow-hidden">
          <VideoPlayer
            ref={playerRef}
            currentCase={currentCase}
            casesList={filteredCases.length > 0 ? filteredCases : F2L_CASES}
            onSelectCase={handleSelectCase}
            onViewCard={(item) => setModalCase(item)}
            isMastered={masteredSet.has(currentCase?.id)}
            onToggleMastered={toggleMastered}
            theme={theme}
          />
        </div>

        {/* RIGHT COLUMN: Selection Menu & Independent Scrollable Case Grid */}
        <div className="flex-1 min-w-0 h-full flex flex-col gap-2 overflow-hidden">
          {/* Category Filter Bar (Search and sort dropdown removed, only csTimer categories kept) */}
          <FilterBar
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            groupCounts={groupCounts}
            theme={theme}
          />

          {/* Category Top Explanation Area (英文缩写 + 英语单词原文 + 中文直译标注 + 要点说明，已取消"显示全部") */}
          <div className={`border rounded px-2.5 py-1.5 flex flex-col gap-0.5 shrink-0 text-xs transition-colors ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-blue-500/15 text-blue-500 border border-blue-500/30 font-mono shrink-0">
                {selectedGroup === 'all' ? 'ALL' : activeGroupInfo?.code}
              </span>
              <span className="font-mono text-xs font-bold text-amber-500 shrink-0">
                {selectedGroup === 'all' ? 'All 41 F2L Cases' : activeGroupInfo?.fullEn}
              </span>
              <span className={`text-[11px] font-semibold px-1 rounded ${
                isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800'
              }`}>
                直译: {selectedGroup === 'all' ? '全部形态 / 41 种常规情况' : activeGroupInfo?.literalZh}
              </span>
            </div>
            <p className={`text-[11px] leading-tight truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {selectedGroup === 'all' 
                ? '涵盖基础入槽、旋转棱块、顶白翻角、连体错配、钥匙孔分离与底槽情况等 41 种指法' 
                : activeGroupInfo?.desc
              }
            </p>
          </div>

          {/* INDEPENDENT CASE SCROLL CONTAINER (Scrolls smoothly without moving the page or the video!) */}
          <div 
            ref={caseListScrollRef}
            className="flex-1 min-h-0 overflow-y-auto pr-1 pb-2 overscroll-contain scrollbar-thin"
          >
            {filteredCases.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {filteredCases.map(item => (
                  <CaseCard
                    key={item.id}
                    caseItem={item}
                    isActive={currentCase?.id === item.id}
                    isMastered={masteredSet.has(item.id)}
                    onSelect={handleSelectCase}
                    onToggleMastered={toggleMastered}
                    theme={theme}
                  />
                ))}
              </div>
            ) : (
              <div className={`border rounded-lg p-6 text-center flex flex-col items-center justify-center gap-2 my-auto ${
                isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <AlertCircle className="w-6 h-6 text-slate-400" />
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  暂无匹配的 Case
                </p>
                <button
                  onClick={() => {
                    setSelectedGroup('all');
                    setMasteredFilter('all');
                  }}
                  className="mt-1 px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition"
                >
                  重置为全部
                </button>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Snapshot Card Lightbox Modal */}
      {modalCase && (
        <CardModal
          caseItem={modalCase}
          onClose={() => setModalCase(null)}
          onPlay={handleSelectCase}
          theme={theme}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal 
          onClose={() => setShowShortcuts(false)} 
          theme={theme}
        />
      )}
    </div>
  );
}
