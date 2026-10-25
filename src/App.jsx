import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import FilterBar from './components/FilterBar';
import CaseCard from './components/CaseCard';
import ZbllSetBar from './components/ZbllSetBar';
import { useLanguage } from './context/LanguageContext';
import { F2L_CASES, F2L_GROUPS } from './data/f2lCases';
import { OLL_CASES, OLL_GROUPS, OLL_VIDEO_PATH } from './data/ollCases';
import { PLL_CASES, PLL_VIDEO_PATH } from './data/pllCases';
import { ZBLL_SETS } from './data/zbllCases';
import { CMLL_CASES, CMLL_GROUPS, CMLL_VIDEO_PATH } from './data/cmllCases';
import { AlertCircle } from 'lucide-react';

const THEME_STORAGE_KEY = 'cubedex_theme_mode_v1';
const MODULE_STORAGE_KEY = 'cubedex_active_module_v1';
const ZBLL_SET_STORAGE_KEY = 'cubedex_active_zbll_set_v1';

const MODULE_CONFIGS = {
  f2l: {
    name: 'F2L',
    cases: F2L_CASES,
    groups: F2L_GROUPS,
    videoPath: '/videos/f2l.mp4',
    storageKey: 'cubedex_mastered_f2l_v1',
    storageKeyOld: 'f2l_mastered_cases_v1',
    filterTitleZh: 'F2L情况分类',
    filterTitleEn: 'F2L CATEGORIES',
    filterSubtitleZh: '(9大类)',
    filterSubtitleEn: '(9 Groups)',
    allTitleZh: 'ALL 41 F2L CASES',
    allTitleEn: 'ALL 41 F2L CASES',
    allDescZh: '涵盖基础入槽、旋转棱块、顶白翻角、连体错配、钥匙孔分离与底槽情况等 41 种指法',
    allDescEn: 'Comprehensive coverage of 41 standard F2L cases including basic insertions, rotated edges, white-up corners & split slots',
    allLiteralZh: '全部形态（41 种常规情况）',
    allLiteralEn: 'All 41 Standard Cases'
  },
  oll: {
    name: 'OLL',
    cases: OLL_CASES,
    groups: OLL_GROUPS,
    videoPath: OLL_VIDEO_PATH,
    storageKey: 'cubedex_mastered_oll_v1',
    storageKeyOld: 'cube_tutor_mastered_oll_v1',
    filterTitleZh: 'OLL形态分类',
    filterTitleEn: 'OLL CATEGORIES',
    filterSubtitleZh: '(9大类)',
    filterSubtitleEn: '(9 Groups)',
    allTitleZh: 'ALL 57 OLL CASES',
    allTitleEn: 'ALL 57 OLL CASES',
    allDescZh: '涵盖十字O、点O、小鱼、狙击枪、闪电、L字、菜刀、一字及特殊组合形态等 57 种保稳手法',
    allDescEn: 'Comprehensive coverage of 57 OLL cases across Cross, Dot, Fish, Gun, Lightning, L-Shape & Line groups',
    allLiteralZh: '全部形态（57 种顶面色向情况）',
    allLiteralEn: 'All 57 Orientation Cases'
  },
  pll: {
    name: 'PLL',
    cases: PLL_CASES,
    groups: null,
    videoPath: PLL_VIDEO_PATH,
    storageKey: 'cubedex_mastered_pll_v1',
    storageKeyOld: 'cube_tutor_mastered_pll_v1',
    filterTitleZh: null,
    filterTitleEn: null,
    filterSubtitleZh: null,
    filterSubtitleEn: null,
    allTitleZh: 'ALL 21 PLL CASES',
    allTitleEn: 'ALL 21 PLL CASES',
    allDescZh: '涵盖三棱换、四棱换、三角换、四角换、邻角邻棱、G排列及对角置换等 21 种 SUB1 极速指法',
    allDescEn: 'Comprehensive coverage of 21 fast PLL cases including U/H/Z perms, A/E perms, T/J/R/F perms, G-perms & V/Y/N perms',
    allLiteralZh: '全部形态（21 种顶层置换情况）',
    allLiteralEn: 'All 21 Permutation Cases'
  },
  cmll: {
    name: 'CMLL',
    cases: CMLL_CASES,
    groups: CMLL_GROUPS,
    videoPath: CMLL_VIDEO_PATH,
    storageKey: 'cubedex_mastered_cmll_v1',
    storageKeyOld: 'cube_tutor_mastered_cmll_v1',
    filterTitleZh: 'CMLL形态分类',
    filterTitleEn: 'CMLL CATEGORIES',
    filterSubtitleZh: '(8大类 · 42种情况)',
    filterSubtitleEn: '(8 Groups · 42 Cases)',
    allTitleZh: 'ALL 42 CMLL CASES (ROUX)',
    allTitleEn: 'ALL 42 CMLL CASES (ROUX)',
    allDescZh: '涵盖顶角全归位、纯角换、双头灯、变色龙、小鱼与领结等 42 种 Roux 桥式顶角极速手法',
    allDescEn: 'Comprehensive coverage of all 42 Roux CMLL corner cases across U, T, L, H, Pi, Sune, Anti-Sune & O groups',
    allLiteralZh: '全部形态（42 种顶角全排列情况）',
    allLiteralEn: 'All 42 Corner Permutations'
  }
};

export { ZBLL_SETS };

export default function App() {
  const { lang, t } = useLanguage();

  const [activeModule, setActiveModule] = useState(() => {
    try {
      const saved = localStorage.getItem(MODULE_STORAGE_KEY) || localStorage.getItem('cube_tutor_active_module_v1');
      return saved && (MODULE_CONFIGS[saved] || saved === 'zbll') ? saved : 'f2l';
    } catch {
      return 'f2l';
    }
  });

  const [activeZbllSet, setActiveZbllSet] = useState(() => {
    try {
      const saved = localStorage.getItem(ZBLL_SET_STORAGE_KEY) || localStorage.getItem('cube_tutor_active_zbll_set_v1');
      return saved && ZBLL_SETS[saved] ? saved : 't';
    } catch {
      return 't';
    }
  });

  const activeConfig = useMemo(() => {
    if (activeModule === 'zbll') {
      return ZBLL_SETS[activeZbllSet] || ZBLL_SETS.t;
    }
    return MODULE_CONFIGS[activeModule] || MODULE_CONFIGS.f2l;
  }, [activeModule, activeZbllSet]);

  const activeCasesList = activeConfig.cases;

  const [currentCase, setCurrentCase] = useState(() => activeCasesList[0] || ZBLL_SETS.t.cases[0]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [masteredFilter, setMasteredFilter] = useState('all');
  
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem('cube_tutor_theme_mode_v1');
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

  const [masteredMap, setMasteredMap] = useState(() => {
    const loadSaved = (key, oldKey) => {
      try {
        const s = localStorage.getItem(key) || (oldKey ? localStorage.getItem(oldKey) : null);
        return s ? JSON.parse(s) : [];
      } catch {
        return [];
      }
    };
    return {
      f2l: loadSaved(MODULE_CONFIGS.f2l.storageKey, MODULE_CONFIGS.f2l.storageKeyOld),
      oll: loadSaved(MODULE_CONFIGS.oll.storageKey, MODULE_CONFIGS.oll.storageKeyOld),
      pll: loadSaved(MODULE_CONFIGS.pll.storageKey, MODULE_CONFIGS.pll.storageKeyOld),
      zbll: loadSaved('cubedex_mastered_zbll_v1', 'cube_tutor_mastered_zbll_v1'),
      cmll: loadSaved(MODULE_CONFIGS.cmll.storageKey, MODULE_CONFIGS.cmll.storageKeyOld)
    };
  });

  const currentMasteredIds = masteredMap[activeModule] || [];
  const masteredSet = useMemo(() => new Set(currentMasteredIds), [currentMasteredIds]);

  const handleSelectModule = useCallback((mod) => {
    if (mod === activeModule) return;
    if (mod !== 'zbll' && !MODULE_CONFIGS[mod]) return;
    setActiveModule(mod);
    setSelectedGroup('all');
    setMasteredFilter('all');
    if (mod === 'zbll') {
      const targetSet = ZBLL_SETS[activeZbllSet] || ZBLL_SETS.t;
      setCurrentCase(targetSet.cases[0]);
    } else {
      setCurrentCase(MODULE_CONFIGS[mod].cases[0]);
    }
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, mod);
    } catch {}
    if (caseListScrollRef.current) {
      caseListScrollRef.current.scrollTop = 0;
    }
  }, [activeModule, activeZbllSet]);

  const handleSelectZbllSet = useCallback((setId) => {
    if (setId === activeZbllSet) return;
    const targetSet = ZBLL_SETS[setId];
    if (!targetSet || !targetSet.cases || targetSet.cases.length === 0) {
      return;
    }
    setActiveZbllSet(setId);
    setSelectedGroup('all');
    setCurrentCase(targetSet.cases[0]);
    try {
      localStorage.setItem(ZBLL_SET_STORAGE_KEY, setId);
    } catch {}
    if (caseListScrollRef.current) {
      caseListScrollRef.current.scrollTop = 0;
    }
  }, [activeZbllSet]);

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
            colors: ['#ff5b00', '#0a0a0a', '#ffffff']
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

  const resetProgress = useCallback(() => {
    if (window.confirm(t('resetConfirm', { name: activeConfig.name }))) {
      setMasteredMap(prev => {
        try {
          localStorage.removeItem(activeConfig.storageKey);
          if (activeConfig.storageKeyOld) {
            localStorage.removeItem(activeConfig.storageKeyOld);
          }
        } catch {}
        return {
          ...prev,
          [activeModule]: []
        };
      });
    }
  }, [activeConfig.name, activeConfig.storageKey, activeConfig.storageKeyOld, activeModule, t]);

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

  const filteredCases = useMemo(() => {
    let list = [...activeCasesList];

    if (activeConfig.groups && selectedGroup !== 'all') {
      list = list.filter(c => c.group === selectedGroup);
    }

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
        playerRef.current?.handleStep(-2);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        playerRef.current?.handleStep(2);
      } else if (e.code === 'KeyJ') {
        e.preventDefault();
        playerRef.current?.handleStep(-2);
      } else if (e.code === 'KeyK') {
        e.preventDefault();
        playerRef.current?.handleStep(2);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        playerRef.current?.handleReplay();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        playerRef.current?.toggleLooping();
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code) && !e.shiftKey) {
        e.preventDefault();
        const speedMap = { Digit1: 0.5, Digit2: 0.75, Digit3: 1.0, Digit4: 1.25 };
        playerRef.current?.changeSpeed(speedMap[e.code]);
      } else if (e.shiftKey && e.code === 'Digit1') {
        e.preventDefault();
        handleSelectModule('f2l');
      } else if (e.shiftKey && e.code === 'Digit2') {
        e.preventDefault();
        handleSelectModule('oll');
      } else if (e.shiftKey && e.code === 'Digit3') {
        e.preventDefault();
        handleSelectModule('pll');
      } else if (e.shiftKey && e.code === 'Digit4') {
        e.preventDefault();
        handleSelectModule('zbll');
      } else if (e.shiftKey && e.code === 'Digit5') {
        e.preventDefault();
        handleSelectModule('cmll');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentCase, filteredCases, activeCasesList, handleSelectCase, handleSelectModule]);

  const activeGroupInfo = activeConfig.groups && selectedGroup !== 'all' ? activeConfig.groups[selectedGroup] : null;

  return (
    <div className={`min-h-screen lg:h-screen flex flex-col font-sans select-none overflow-visible lg:overflow-hidden transition-colors duration-150 ${
      isDark ? 'bg-[#0a0a0a] text-zinc-100' : 'bg-[#f4f4f5] text-black'
    }`}>
      {/* Header: LineLore Swiss Style Header */}
      <Header
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
        moduleCounts={{
          f2l: MODULE_CONFIGS.f2l.cases.length,
          oll: MODULE_CONFIGS.oll.cases.length,
          pll: MODULE_CONFIGS.pll.cases.length,
          zbll: 472,
          cmll: MODULE_CONFIGS.cmll.cases.length
        }}
        totalCases={activeCasesList.length}
        masteredCount={currentMasteredIds.length}
        masteredFilter={masteredFilter}
        onMasteredFilterChange={setMasteredFilter}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetProgress={resetProgress}
      />

      {/* Main Dual-Column Viewport:
          - Desktop (lg:): Fixed Dual-Column Viewport with pixel-perfect bottom alignment
          - Mobile (< lg): Sticky Video Player at top (locked at header bottom), natural scroll below
      */}
      <main className="flex-1 min-h-0 max-w-[1920px] w-full mx-auto px-0 sm:px-4 lg:px-6 pt-0 lg:pt-2 pb-2 sm:pb-3 flex flex-col lg:flex-row gap-2 sm:gap-4 items-stretch lg:overflow-hidden">
        
        {/* LEFT COLUMN: Video Player & Control Spec Area (Position-locked directly below header on mobile) */}
        <div 
          style={{ top: 'var(--header-height, 74px)' }}
          className={`w-full lg:w-[57%] xl:w-[61%] 2xl:w-[64%] shrink-0 h-auto lg:h-full flex flex-col justify-start sticky lg:static z-30 transition-colors px-2.5 sm:px-0 pt-1 lg:pt-0 pb-1.5 lg:pb-0 border-b-2 lg:border-b-0 border-black dark:border-zinc-800 shadow-sm lg:shadow-none ${
            isDark ? 'bg-[#0a0a0a]' : 'bg-[#f4f4f5]'
          }`}
        >
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

        {/* RIGHT COLUMN: Filter Grid & Case Selection List */}
        <div className="flex-1 min-w-0 h-auto lg:h-full flex flex-col gap-2 sm:gap-2.5 px-2.5 sm:px-0">
          {/* Level 1 Category: 7 Big Letter Sets (Pure text buttons, low height, no graphics) */}
          {activeModule === 'zbll' && (
            <ZbllSetBar
              activeSet={activeZbllSet}
              onSelectSet={handleSelectZbllSet}
              theme={theme}
            />
          )}

          {/* Level 2 Category: Existing FilterBar drawer with diagrams & counts */}
          {activeConfig.groups && (
            <FilterBar
              groups={activeConfig.groups}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
              groupCounts={groupCounts}
              theme={theme}
              title={lang === 'en' ? (activeConfig.filterTitleEn || activeConfig.filterTitle) : (activeConfig.filterTitleZh || activeConfig.filterTitle)}
              subtitle={lang === 'en' ? (activeConfig.filterSubtitleEn || activeConfig.filterSubtitle) : (activeConfig.filterSubtitleZh || activeConfig.filterSubtitle)}
              totalCount={activeCasesList.length}
            />
          )}

          {/* Unified Case Area */}
          <div className={`flex-1 min-h-0 flex flex-col border-2 overflow-hidden transition-colors ${
            isDark ? 'bg-[#0a0a0a] border-zinc-800' : 'bg-white border-black'
          }`}>
            {/* Category Explanation Banner */}
            <div className={`px-3 py-2 border-b-2 flex flex-col gap-0.5 shrink-0 transition-colors ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-black'
            }`}>
              <div className="flex items-center justify-between gap-2 flex-wrap font-mono">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-1.5 py-0.5 border text-xs font-black uppercase ${
                    activeModule === 'cmll'
                      ? 'bg-emerald-400 border-emerald-500 text-black'
                      : activeModule === 'zbll'
                      ? 'bg-cyan-500 border-cyan-400 text-black'
                      : 'bg-[#ff5b00] border-black text-black'
                  }`}>
                    {selectedGroup === 'all' 
                      ? (activeModule === 'zbll' 
                          ? `ZBLL · ${activeZbllSet.toUpperCase()}` 
                          : activeModule === 'cmll'
                          ? 'ROUX · CMLL'
                          : activeModule.toUpperCase()) 
                      : activeGroupInfo?.code}
                  </span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-tight text-black dark:text-white">
                    {selectedGroup === 'all' 
                      ? (lang === 'en' ? (activeConfig.allTitleEn || activeConfig.allTitle) : (activeConfig.allTitleZh || activeConfig.allTitle))
                      : (lang === 'en' ? (activeGroupInfo?.fullEn || activeGroupInfo?.code) : (activeGroupInfo?.nameZh || activeGroupInfo?.fullEn))}
                  </span>
                  {((selectedGroup === 'all' && (activeConfig.allLiteralZh || activeConfig.allLiteral)) || (selectedGroup !== 'all' && (activeGroupInfo?.literalZh || activeGroupInfo?.fullEn))) ? (
                    <span className={`text-[11px] sm:text-xs font-bold px-1.5 py-0.5 border ${
                      isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-300' : 'bg-white border-zinc-300 text-black'
                    }`}>
                      {selectedGroup === 'all' 
                        ? (lang === 'en' ? (activeConfig.allLiteralEn || activeConfig.allLiteral) : (activeConfig.allLiteralZh || activeConfig.allLiteral))
                        : (lang === 'en' ? (activeGroupInfo?.fullEn || activeGroupInfo?.code) : (activeGroupInfo?.literalZh || activeGroupInfo?.nameZh))}
                    </span>
                  ) : null}
                </div>

                {/* Mobile Filter Tabs in Case Area Header */}
                <div className={`flex sm:hidden items-center p-0.5 border text-[11px] font-mono shrink-0 ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-300'
                }`}>
                  {[
                    { id: 'all', label: t('progressAll') },
                    { id: 'unmastered', label: t('progressUnmastered') },
                    { id: 'mastered', label: t('progressMastered') }
                  ].map(f => {
                    const active = masteredFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setMasteredFilter(f.id)}
                        className={`px-1.5 py-0.5 font-bold transition-colors ${
                          active
                            ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                            : isDark ? 'text-zinc-400' : 'text-zinc-600'
                        }`}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {((selectedGroup === 'all' && (activeConfig.allDescZh || activeConfig.allDesc)) || (selectedGroup !== 'all' && activeGroupInfo?.desc)) ? (
                <p className={`text-xs leading-relaxed truncate font-sans mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {selectedGroup === 'all' 
                    ? (lang === 'en' ? (activeConfig.allDescEn || activeConfig.allDesc) : (activeConfig.allDescZh || activeConfig.allDesc))
                    : (lang === 'en' ? (activeGroupInfo?.fullEn || activeGroupInfo?.desc) : activeGroupInfo?.desc)
                  }
                </p>
              ) : null}
            </div>

            {/* Case Grid Scroll Area */}
            <div 
              ref={caseListScrollRef}
              className="flex-1 min-h-0 lg:overflow-y-auto p-2 overscroll-contain"
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
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 my-auto font-mono">
                  <AlertCircle className="w-6 h-6 text-zinc-400" />
                  <p className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    {t('noCasesFound')}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedGroup('all');
                      setMasteredFilter('all');
                    }}
                    className="mt-1 px-4 py-1.5 border border-black bg-[#ff5b00] text-black text-xs font-black uppercase hover:bg-[#e05000] transition-colors"
                  >
                    {t('resetToAll')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}