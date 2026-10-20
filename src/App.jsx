import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import FilterBar from './components/FilterBar';
import CaseCard from './components/CaseCard';
import CardModal from './components/CardModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { F2L_CASES, F2L_GROUPS, TOTAL_CASES } from './data/f2lCases';
import { Layers, Sparkles, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'f2l_mastered_cases_v1';

export default function App() {
  const [currentCase, setCurrentCase] = useState(() => F2L_CASES[0]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('category');
  const [masteredFilter, setMasteredFilter] = useState('all');
  const [modalCase, setModalCase] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      return arr;
    });
  }, []);

  const resetProgress = useCallback(() => {
    if (window.confirm('确定要清空已掌握的学习进度吗？')) {
      setMasteredIds([]);
      localStorage.removeItem(STORAGE_KEY);
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

  // Filter & Sort Cases
  const filteredCases = useMemo(() => {
    let list = [...F2L_CASES];

    // Group filter
    if (selectedGroup !== 'all') {
      list = list.filter(c => c.group === selectedGroup);
    }

    // Mastered filter
    if (masteredFilter === 'mastered') {
      list = list.filter(c => masteredSet.has(c.id));
    } else if (masteredFilter === 'unmastered') {
      list = list.filter(c => !masteredSet.has(c.id));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        c.code.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q) ||
        c.algorithm.toLowerCase().includes(q) ||
        c.grip.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.csTimerNum.toString().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'csTimerNum') {
        return a.csTimerNum - b.csTimerNum;
      }
      if (sortBy === 'videoOrder') {
        return a.videoOrder - b.videoOrder;
      }
      return 0;
    });

    return list;
  }, [selectedGroup, masteredFilter, searchQuery, sortBy, masteredSet]);

  const handleSelectCase = useCallback((item) => {
    setCurrentCase(item);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        playerRef.current?.togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const activeList = filteredCases.length > 0 ? filteredCases : F2L_CASES;
        const idx = activeList.findIndex(c => c.id === currentCase?.id);
        if (idx > 0) handleSelectCase(activeList[idx - 1]);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const activeList = filteredCases.length > 0 ? filteredCases : F2L_CASES;
        const idx = activeList.findIndex(c => c.id === currentCase?.id);
        if (idx !== -1 && idx < activeList.length - 1) handleSelectCase(activeList[idx + 1]);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        playerRef.current?.handleReplay();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        playerRef.current?.toggleLooping();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        playerRef.current?.toggleMute();
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        playerRef.current?.requestFullscreen();
      } else if (e.code === 'KeyJ') {
        e.preventDefault();
        playerRef.current?.handleStep(-2);
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        playerRef.current?.handleStep(2);
      } else if (e.key === '1') {
        playerRef.current?.changeSpeed(0.5);
      } else if (e.key === '2') {
        playerRef.current?.changeSpeed(0.75);
      } else if (e.key === '3') {
        playerRef.current?.changeSpeed(1.0);
      } else if (e.key === '4') {
        playerRef.current?.changeSpeed(1.25);
      } else if (e.key === 'Escape') {
        setModalCase(null);
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCases, currentCase, handleSelectCase]);

  const activeGroupInfo = selectedGroup !== 'all' ? F2L_GROUPS[selectedGroup] : null;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header (Fixed at top) */}
      <Header
        totalCases={TOTAL_CASES}
        masteredCount={masteredIds.length}
        onResetProgress={resetProgress}
        onOpenShortcuts={() => setShowShortcuts(true)}
      />

      {/* Main Dual-Column Layout:
          - Left: Compact Menu / Selection Area (Search, Categories with 3D icons, Case Grid with independent scroll)
          - Right: Enlarged Hero Video Area (Always fixed and prominently displayed!)
      */}
      <main className="flex-1 min-h-0 max-w-[1920px] w-full mx-auto px-3 sm:px-4 lg:px-6 py-3 flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch overflow-hidden">
        
        {/* LEFT COLUMN: Option Menu (Compact, Independent Scroll, Category Buttons + 41 Case Grid) */}
        <div className="w-full lg:w-[380px] xl:w-[420px] 2xl:w-[460px] shrink-0 h-full flex flex-col gap-2.5 overflow-hidden">
          {/* Filter Bar with English + Chinese + 3D Image Category Buttons */}
          <FilterBar
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            masteredFilter={masteredFilter}
            onMasteredFilterChange={setMasteredFilter}
            groupCounts={groupCounts}
          />

          {/* Active Category Mini Tag */}
          {activeGroupInfo && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-1.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedGroup}
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {activeGroupInfo.nameZh}
                </span>
              </div>
              <button
                onClick={() => setSelectedGroup('all')}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                重置
              </button>
            </div>
          )}

          {/* INDEPENDENT CASE SCROLL CONTAINER (Scrolls smoothly without moving the page or the video!) */}
          <div 
            ref={caseListScrollRef}
            className="flex-1 min-h-0 overflow-y-auto pr-1.5 pb-2 overscroll-contain scrollbar-thin"
          >
            {filteredCases.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {filteredCases.map(item => (
                  <CaseCard
                    key={item.id}
                    caseItem={item}
                    isActive={currentCase?.id === item.id}
                    isMastered={masteredSet.has(item.id)}
                    onSelect={handleSelectCase}
                    onToggleMastered={toggleMastered}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-2 my-auto">
                <AlertCircle className="w-7 h-7 text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">未找到匹配的 Case</p>
                <button
                  onClick={() => {
                    setSelectedGroup('all');
                    setSearchQuery('');
                    setMasteredFilter('all');
                  }}
                  className="mt-1 px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition"
                >
                  重置筛选
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Enlarged Video & Action Stage (Always Visible & Prominently Positioned!) */}
        <div className="flex-1 min-w-0 h-full flex flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin">
          <VideoPlayer
            ref={playerRef}
            currentCase={currentCase}
            casesList={filteredCases.length > 0 ? filteredCases : F2L_CASES}
            onSelectCase={handleSelectCase}
            onViewCard={(item) => setModalCase(item)}
            isMastered={masteredSet.has(currentCase?.id)}
            onToggleMastered={toggleMastered}
          />

          {/* Quick Practice Tip Box */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-400 flex items-start gap-2.5 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-semibold text-slate-200">
                杜宇生 F2L 常规手法速拧要点:
              </span>
              <p className="text-slate-400">
                本套 41 式精选自杜宇生常规指法体系，特点是无转体入槽、后槽顺手做以及 D 层 Keyhole 提速。建议开启右上角“循环练习”，配合键盘空格键与 0.5x / 0.75x 慢放反复巩固肌肉记忆。
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Snapshot Card Lightbox Modal */}
      {modalCase && (
        <CardModal
          caseItem={modalCase}
          onClose={() => setModalCase(null)}
          onPlay={handleSelectCase}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}
