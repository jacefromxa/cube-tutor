import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import FilterBar from './components/FilterBar';
import CaseCard from './components/CaseCard';
import CardModal from './components/CardModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { F2L_CASES, F2L_GROUPS, TOTAL_CASES } from './data/f2lCases';
import { Layers, Sparkles, AlertCircle, ArrowUp } from 'lucide-react';

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

      {/* Main Dual-Column Stage (No whole-page scroll!) */}
      <main className="flex-1 min-h-0 max-w-[1720px] w-full mx-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-4 flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch overflow-hidden">
        
        {/* LEFT COLUMN: Sticky / Fixed Video Player & Case Details (Always Visible!) */}
        <div className="w-full lg:w-[480px] xl:w-[560px] 2xl:w-[620px] shrink-0 flex flex-col gap-3 overflow-y-auto pr-1 scrollbar-thin">
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

        {/* RIGHT COLUMN: FilterBar + Scrollable Case Grid Container */}
        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
          {/* Top of right column: Filter Bar with Visual Category Buttons */}
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

          {/* Active Group Description Banner (if filtering by group) */}
          {activeGroupInfo && (
            <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/40 rounded-2xl px-4 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedGroup}
                </span>
                <div>
                  <span className="text-xs font-bold text-white mr-2">
                    {activeGroupInfo.nameZh}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {activeGroupInfo.desc}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGroup('all')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium shrink-0"
              >
                查看全部 41 种
              </button>
            </div>
          )}

          {/* INDEPENDENT SCROLL CONTAINER: ONLY THIS BOX SCROLLS UP AND DOWN */}
          <div 
            ref={caseListScrollRef}
            className="flex-1 min-h-0 overflow-y-auto pr-1.5 pb-4 overscroll-contain scrollbar-thin"
          >
            {filteredCases.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
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
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-2.5 my-auto">
                <AlertCircle className="w-8 h-8 text-slate-600" />
                <p className="text-sm font-semibold text-slate-300">未找到符合条件的 F2L Case</p>
                <p className="text-xs text-slate-500">
                  请尝试更改搜索词，或重置分类筛选和掌握状态条件。
                </p>
                <button
                  onClick={() => {
                    setSelectedGroup('all');
                    setSearchQuery('');
                    setMasteredFilter('all');
                  }}
                  className="mt-1 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition"
                >
                  重置筛选
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
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
}
