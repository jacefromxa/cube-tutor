import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import FilterBar from './components/FilterBar';
import CaseCard from './components/CaseCard';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { F2L_CASES, F2L_GROUPS } from './data/f2lCases';
import { OLL_CASES, OLL_GROUPS, OLL_VIDEO_PATH } from './data/ollCases';
import { PLL_CASES, PLL_VIDEO_PATH } from './data/pllCases';
import { AlertCircle } from 'lucide-react';

const THEME_STORAGE_KEY = 'cube_tutor_theme_mode_v1';
const MODULE_STORAGE_KEY = 'cube_tutor_active_module_v1';

const MODULE_CONFIGS = {
  f2l: {
    name: 'F2L',
    cases: F2L_CASES,
    groups: F2L_GROUPS,
    videoPath: '/videos/f2l.mp4',
    storageKey: 'f2l_mastered_cases_v1',
    filterTitle: 'F2L情况分类',
    filterSubtitle: '(9大类)',
    allTitle: 'All 41 F2L Cases',
    allDesc: '涵盖基础入槽、旋转棱块、顶白翻角、连体错配、钥匙孔分离与底槽情况等 41 种指法',
    allLiteral: '全部形态（41 种常规情况）'
  },
  oll: {
    name: 'OLL',
    cases: OLL_CASES,
    groups: OLL_GROUPS,
    videoPath: OLL_VIDEO_PATH,
    storageKey: 'cube_tutor_mastered_oll_v1',
    filterTitle: 'OLL形态分类',
    filterSubtitle: '(9大类)',
    allTitle: 'All 57 OLL Cases',
    allDesc: '涵盖十字O、点O、小鱼、狙击枪、闪电、L字、菜刀、一字及特殊组合形态等 57 种保稳手法',
    allLiteral: '全部形态（57 种顶面色向情况）'
  },
  pll: {
    name: 'PLL',
    cases: PLL_CASES,
    groups: null, // PLL has no category bar as requested
    videoPath: PLL_VIDEO_PATH,
    storageKey: 'cube_tutor_mastered_pll_v1',
    filterTitle: null,
    filterSubtitle: null,
    allTitle: 'All 21 PLL Cases',
    allDesc: '涵盖三棱换、四棱换、三角换、四角换、邻角邻棱、G排列及对角置换等 21 种 SUB1 极速指法',
    allLiteral: '全部形态（21 种顶层置换情况）'
  }
};

export default function App() {
  // Active module: 'f2l' | 'oll' | 'pll'
  const [activeModule, setActiveModule] = useState(() => {
    try {
      const saved = localStorage.getItem(MODULE_STORAGE_KEY);
      return saved && MODULE_CONFIGS[saved] ? saved : 'f2l';
    } catch {
      return 'f2l';
    }
  });

  const activeConfig = MODULE_CONFIGS[activeModule];
  const activeCasesList = activeConfig.cases;

  // Selected case & group filter
  const [currentCase, setCurrentCase] = useState(() => activeCasesList[0]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [masteredFilter, setMasteredFilter] = useState('all');
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

  const isDark = theme === 'dark';
  const playerRef = useRef(null);
  const caseListScrollRef = useRef(null);

  // Mastered cases per module
  const [masteredMap, setMasteredMap] = useState(() => {
    const loadSaved = (key) => {
      try {
        const s = localStorage.getItem(key);
        return s ? JSON.parse(s) : [];
      } catch {
        return [];
      }
    };
    return {
      f2l: loadSaved(MODULE_CONFIGS.f2l.storageKey),
      oll: loadSaved(MODULE_CONFIGS.oll.storageKey),
      pll: loadSaved(MODULE_CONFIGS.pll.storageKey)
    };
  });

  const currentMasteredIds = masteredMap[activeModule] || [];
  const masteredSet = useMemo(() => new Set(currentMasteredIds), [currentMasteredIds]);

  // Handle module switching
  const handleSelectModule = useCallback((mod) => {
    if (!MODULE_CONFIGS[mod] || mod === activeModule) return;
    setActiveModule(mod);
    setSelectedGroup('all');
    setMasteredFilter('all');
    setCurrentCase(MODULE_CONFIGS[mod].cases[0]);
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, mod);
    } catch {}
    if (caseListScrollRef.current) {
      caseListScrollRef.current.scrollTop = 0;
    }
  }, [activeModule]);

  // Toggle mastered for a case
  const toggleMastered = useCallback((caseId) => {
    setMasteredMap(prev => {
      const curList = prev[activeModule] || [];
      const set = new Set(curList);
      const isNowMastered = !set.has(caseId);
      if (isNowMastered) {
        set.add(caseId);
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10b981', '#3b82f6', '#f59e0b']
          });
        } catch {}
      } else {
        set.delete(caseId);
      }
      const updated = Array.from(set);
      try {
        localStorage.setItem(activeConfig.storageKey, JSON.stringify(updated));
      } catch {}
      return {
        ...prev,
        [activeModule]: updated
      };
    });
  }, [activeModule, activeConfig.storageKey]);

  // Reset progress for current module
  const resetProgress = useCallback(() => {
    if (window.confirm(`确定要清空 ${activeConfig.name} 的已掌握学习进度吗？`)) {
      setMasteredMap(prev => {
        try {
          localStorage.removeItem(activeConfig.storageKey);
        } catch {}
        return {
          ...prev,
          [activeModule]: []
        };
      });
    }
  }, [activeConfig.name, activeConfig.storageKey, activeModule]);

  // Group counts calculation (for F2L and OLL)
  const groupCounts = useMemo(() => {
    const counts = { all: activeCasesList.length };
    if (activeConfig.groups) {
      activeCasesList.forEach(c => {
        if (c.group) {
          counts[c.group] = (counts[c.group] || 0) + 1;
        }
      });
    }
    return counts;
  }, [activeCasesList, activeConfig.groups]);

  // Filter Cases
  const filteredCases = useMemo(() => {
    let list = [...activeCasesList];

    // Group filter (if module has groups)
    if (activeConfig.groups && selectedGroup !== 'all') {
      list = list.filter(c => c.group === selectedGroup);
    }

    // Mastered filter
    if (masteredFilter === 'mastered') {
      list = list.filter(c => masteredSet.has(c.id));
    } else if (masteredFilter === 'unmastered') {
      list = list.filter(c => !masteredSet.has(c.id));
    }

    return list;
  }, [activeCasesList, activeConfig.groups, selectedGroup, masteredFilter, masteredSet]);

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
      // Arrow Left/Right controls 2-second rapid jump
      else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (e.shiftKey) {
          const activeList = filteredCases.length > 0 ? filteredCases : activeCasesList;
          const idx = activeList.findIndex(c => c.id === currentCase?.id);
          if (idx > 0) handleSelectCase(activeList[idx - 1]);
        } else {
          playerRef.current?.handleStep(-2);
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (e.shiftKey) {
          const activeList = filteredCases.length > 0 ? filteredCases : activeCasesList;
          const idx = activeList.findIndex(c => c.id === currentCase?.id);
          if (idx !== -1 && idx < activeList.length - 1) handleSelectCase(activeList[idx + 1]);
        } else {
          playerRef.current?.handleStep(2);
        }
      } 
      // [ / ] or P / N for Case switching
      else if (e.code === 'BracketLeft' || e.code === 'KeyP') {
        e.preventDefault();
        const activeList = filteredCases.length > 0 ? filteredCases : activeCasesList;
        const idx = activeList.findIndex(c => c.id === currentCase?.id);
        if (idx > 0) handleSelectCase(activeList[idx - 1]);
      } else if (e.code === 'BracketRight' || e.code === 'KeyN') {
        e.preventDefault();
        const activeList = filteredCases.length > 0 ? filteredCases : activeCasesList;
        const idx = activeList.findIndex(c => c.id === currentCase?.id);
        if (idx !== -1 && idx < activeList.length - 1) handleSelectCase(activeList[idx + 1]);
      } 
      // J / K for 2s step
      else if (e.code === 'KeyJ') {
        e.preventDefault();
        playerRef.current?.handleStep(-2);
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        playerRef.current?.handleStep(2);
      }
      // R: Replay current case
      else if (e.code === 'KeyR') {
        e.preventDefault();
        playerRef.current?.handleReplay();
      }
      // L: Toggle Loop
      else if (e.code === 'KeyL') {
        e.preventDefault();
        playerRef.current?.toggleLooping();
      }
      // F: Fullscreen
      else if (e.code === 'KeyF') {
        e.preventDefault();
        playerRef.current?.requestFullscreen();
      }
      // 1-4: Speed change
      else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code) && !e.shiftKey) {
        e.preventDefault();
        const speedMap = { Digit1: 0.5, Digit2: 0.75, Digit3: 1.0, Digit4: 1.25 };
        playerRef.current?.changeSpeed(speedMap[e.code]);
      }
      // Shift + 1/2/3: Quick switch module (F2L / OLL / PLL)
      else if (e.shiftKey && e.code === 'Digit1') {
        e.preventDefault();
        handleSelectModule('f2l');
      } else if (e.shiftKey && e.code === 'Digit2') {
        e.preventDefault();
        handleSelectModule('oll');
      } else if (e.shiftKey && e.code === 'Digit3') {
        e.preventDefault();
        handleSelectModule('pll');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCase, filteredCases, activeCasesList, handleSelectCase, handleSelectModule]);

  const activeGroupInfo = activeConfig.groups && selectedGroup !== 'all' ? activeConfig.groups[selectedGroup] : null;

  return (
    <div className={`min-h-screen lg:h-screen flex flex-col font-sans select-none overflow-y-auto lg:overflow-hidden transition-colors duration-150 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      {/* Header: Product Title Cube-Tutor + 3-Segment Switcher (F2L / OLL / PLL) + Controls */}
      <Header
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        moduleCounts={{
          f2l: MODULE_CONFIGS.f2l.cases.length,
          oll: MODULE_CONFIGS.oll.cases.length,
          pll: MODULE_CONFIGS.pll.cases.length
        }}
        totalCases={activeCasesList.length}
        masteredCount={currentMasteredIds.length}
        masteredFilter={masteredFilter}
        onMasteredFilterChange={setMasteredFilter}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetProgress={resetProgress}
        onOpenShortcuts={() => setShowShortcuts(true)}
      />

      {/* Main Responsive Layout:
          - Desktop (lg:): Fixed Dual-Column Viewport with pixel-perfect bottom alignment
          - Mobile (< lg): Natural vertical flow where users can browse video, formulas, categories and cases seamlessly
      */}
      <main className="flex-1 min-h-0 max-w-[1920px] w-full mx-auto px-2 sm:px-3 lg:px-5 py-2 sm:py-2.5 flex flex-col lg:flex-row gap-2.5 sm:gap-3 lg:gap-4 items-stretch lg:overflow-hidden">
        
        {/* LEFT COLUMN: Video Player & Action Bar */}
        <div className="w-full lg:w-[57%] xl:w-[61%] 2xl:w-[64%] shrink-0 h-auto lg:h-full flex flex-col justify-start">
          <VideoPlayer
            ref={playerRef}
            currentCase={currentCase}
            casesList={filteredCases.length > 0 ? filteredCases : activeCasesList}
            onSelectCase={handleSelectCase}
            isMastered={masteredSet.has(currentCase?.id)}
            onToggleMastered={toggleMastered}
            theme={theme}
            videoPath={activeConfig.videoPath}
            groups={activeConfig.groups}
            moduleType={activeModule}
          />
        </div>

        {/* RIGHT COLUMN: Selection Menu & Independent Scrollable Case Grid */}
        <div className="flex-1 min-w-0 h-auto lg:h-full flex flex-col gap-2">
          {/* Category Filter Bar (Only shown for F2L and OLL; PLL cases are shown directly) */}
          {activeConfig.groups && (
            <FilterBar
              groups={activeConfig.groups}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
              groupCounts={groupCounts}
              theme={theme}
              title={activeConfig.filterTitle}
              subtitle={activeConfig.filterSubtitle}
              totalCount={activeCasesList.length}
            />
          )}

          {/* Unified Case Area: Header Fused Directly with Case Scroll Grid */}
          <div className={`flex-1 min-h-0 flex flex-col border rounded-md overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {/* Category Explanation Banner as Integrated Section Header */}
            <div className={`px-3 py-2 border-b flex flex-col gap-0.5 shrink-0 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50/95 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded text-xs font-black uppercase border font-mono shrink-0 ${
                  activeModule === 'f2l'
                    ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    : activeModule === 'oll'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}>
                  {selectedGroup === 'all' ? (activeModule.toUpperCase()) : activeGroupInfo?.code}
                </span>
                <span className="font-mono text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 shrink-0">
                  {selectedGroup === 'all' ? activeConfig.allTitle : activeGroupInfo?.fullEn}
                </span>
                <span className={`text-xs sm:text-sm font-bold px-1.5 py-0.5 rounded ${
                  isDark ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                }`}>
                  {selectedGroup === 'all' ? activeConfig.allLiteral : activeGroupInfo?.literalZh}
                </span>
              </div>
              <p className={`text-xs leading-tight truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {selectedGroup === 'all' 
                  ? activeConfig.allDesc
                  : activeGroupInfo?.desc
                }
              </p>
            </div>

            {/* CASE CONTAINER (Naturally scrolls on mobile, independently scrolls inside container on desktop) */}
            <div 
              ref={caseListScrollRef}
              className="flex-1 min-h-0 lg:overflow-y-auto p-2 overscroll-contain scrollbar-thin"
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
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 my-auto">
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
        </div>

      </main>

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
