import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  DEFAULT_DEVICES, 
  DEMO_URLS, 
  type DevicePreset 
} from '../data/devices';
import { type SupportedLanguage } from '../i18n/utils';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  RefreshCw,
  Search,
  History,
  X,
  Plus,
  Trash2,
  Check,
  Smartphone,
  Tablet,
  Laptop,
  Sliders,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface ResponsiveTesterProps {
  currentLang: SupportedLanguage;
  translations: {
    controls: Record<string, string>;
    stage: Record<string, string>;
    troubleshoot: Record<string, string>;
  };
}

const STORAGE_KEYS = {
  RECENT_URLS: 'rv_recent_urls',
  CUSTOM_PRESETS: 'rv_custom_presets',
  LAST_URL: 'rv_last_url',
  LAST_DEVICE: 'rv_last_device_id',
  AUTO_FIT: 'rv_auto_fit',
  SHOW_BEZEL: 'rv_show_bezel',
  SHOW_ISLAND: 'rv_show_island',
  CYCLE_SPEED: 'rv_cycle_speed'
};

export const ResponsiveTester: React.FC<ResponsiveTesterProps> = ({ translations }) => {
  const t = translations.controls;
  const tStage = translations.stage;
  const tTrouble = translations.troubleshoot;

  // URL state
  const [urlInput, setUrlInput] = useState<string>('http://localhost:3000');
  const [activeUrl, setActiveUrl] = useState<string>('http://localhost:3000');
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [isLoadingIframe, setIsLoadingIframe] = useState<boolean>(false);
  
  // Recent URLs
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [isRecentOpen, setIsRecentOpen] = useState<boolean>(false);

  // Device & Custom Presets state
  const [customPresets, setCustomPresets] = useState<DevicePreset[]>([]);
  const allPresets = useMemo(() => [...DEFAULT_DEVICES, ...customPresets], [customPresets]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('iphone-16-pro');
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState<boolean>(false);
  const [deviceSearch, setDeviceSearch] = useState<string>('');
  const [deviceCategoryFilter, setDeviceCategoryFilter] = useState<'all' | 'mobile' | 'tablet' | 'desktop' | 'custom'>('all');

  // Custom device modal/popover state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('Custom Viewport');
  const [customWidth, setCustomWidth] = useState<number>(375);
  const [customHeight, setCustomHeight] = useState<number>(812);

  // Orientation & Stage Display state
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [showBezel, setShowBezel] = useState<boolean>(true);
  const [showIsland, setShowIsland] = useState<boolean>(true);
  
  // Zoom & Scale state
  const [isFitActive, setIsFitActive] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 25% - 150%
  const [stageDimensions, setStageDimensions] = useState<{ width: number; height: number }>({ width: 1200, height: 800 });

  // Auto-play presentation state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [cycleSpeed, setCycleSpeed] = useState<number>(5); // 3, 5, or 8 seconds
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Troubleshooting Modal
  const [isTroubleshootOpen, setIsTroubleshootOpen] = useState<boolean>(false);

  // DOM Refs
  const stageRef = useRef<HTMLDivElement>(null);
  const deviceDropdownRef = useRef<HTMLDivElement>(null);
  const recentDropdownRef = useRef<HTMLDivElement>(null);

  // Load saved preferences from LocalStorage
  useEffect(() => {
    try {
      const savedLastUrl = localStorage.getItem(STORAGE_KEYS.LAST_URL);
      if (savedLastUrl) {
        setUrlInput(savedLastUrl);
        setActiveUrl(savedLastUrl);
      }

      const savedRecent = localStorage.getItem(STORAGE_KEYS.RECENT_URLS);
      if (savedRecent) {
        setRecentUrls(JSON.parse(savedRecent));
      } else {
        setRecentUrls(['http://localhost:3000', 'https://example.com']);
      }

      const savedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRESETS);
      if (savedCustom) {
        setCustomPresets(JSON.parse(savedCustom));
      }

      const savedDevice = localStorage.getItem(STORAGE_KEYS.LAST_DEVICE);
      if (savedDevice) {
        setSelectedDeviceId(savedDevice);
      }

      const savedFit = localStorage.getItem(STORAGE_KEYS.AUTO_FIT);
      if (savedFit !== null) {
        setIsFitActive(savedFit === 'true');
      }

      const savedBezel = localStorage.getItem(STORAGE_KEYS.SHOW_BEZEL);
      if (savedBezel !== null) {
        setShowBezel(savedBezel === 'true');
      }

      const savedIsland = localStorage.getItem(STORAGE_KEYS.SHOW_ISLAND);
      if (savedIsland !== null) {
        setShowIsland(savedIsland === 'true');
      }

      const savedSpeed = localStorage.getItem(STORAGE_KEYS.CYCLE_SPEED);
      if (savedSpeed) {
        setCycleSpeed(Number(savedSpeed));
      }
    } catch (e) {
      console.warn('LocalStorage not available:', e);
    }
  }, []);

  // Monitor Stage Dimensions via ResizeObserver
  useEffect(() => {
    if (!stageRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setStageDimensions({ width, height });
      }
    });

    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  // Active Device Object
  const activeDevice = useMemo(() => {
    return allPresets.find(d => d.id === selectedDeviceId) || DEFAULT_DEVICES[0];
  }, [allPresets, selectedDeviceId]);

  // Actual pixel dimensions based on orientation
  const viewportWidth = isLandscape ? activeDevice.height : activeDevice.width;
  const viewportHeight = isLandscape ? activeDevice.width : activeDevice.height;

  // Frame outer padding if bezel is shown
  const bezelPaddingX = showBezel ? (activeDevice.category === 'desktop' ? 16 : 24) : 0;
  const bezelPaddingY = showBezel ? (activeDevice.category === 'desktop' ? 36 : 32) : 0;
  const totalDeviceWidth = viewportWidth + bezelPaddingX;
  const totalDeviceHeight = viewportHeight + bezelPaddingY;

  // Dynamic Fit Calculation
  const calculatedFitScale = useMemo(() => {
    if (!stageDimensions.width || !stageDimensions.height) return 1;
    // Allow generous padding so device never touches edges
    const availableW = Math.max(stageDimensions.width - 64, 200);
    const availableH = Math.max(stageDimensions.height - 80, 200);

    const scaleW = availableW / totalDeviceWidth;
    const scaleH = availableH / totalDeviceHeight;
    const fit = Math.min(scaleW, scaleH, 1.0); // Don't blow up beyond 100% on huge monitors
    return Math.max(Number(fit.toFixed(3)), 0.2);
  }, [stageDimensions, totalDeviceWidth, totalDeviceHeight]);

  // Current Applied Scale
  const currentScale = isFitActive ? calculatedFitScale : zoomLevel / 100;

  // URL Submit Handler
  const handleUrlSubmit = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    let trimmed = urlInput.trim();
    if (!trimmed) return;

    // Prepend protocol if missing
    if (!/^https?:\/\//i.test(trimmed)) {
      if (trimmed.startsWith('localhost') || trimmed.startsWith('127.0.0.1')) {
        trimmed = 'http://' + trimmed;
      } else {
        trimmed = 'https://' + trimmed;
      }
    }

    setUrlInput(trimmed);
    setActiveUrl(trimmed);
    setIsLoadingIframe(true);
    setIframeKey(Date.now());

    // Save to LocalStorage & Recent URLs
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_URL, trimmed);
      setRecentUrls(prev => {
        const filtered = prev.filter(u => u.toLowerCase() !== trimmed.toLowerCase());
        const updated = [trimmed, ...filtered].slice(0, 10);
        localStorage.setItem(STORAGE_KEYS.RECENT_URLS, JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const handleSelectRecent = (url: string) => {
    setUrlInput(url);
    setActiveUrl(url);
    setIsLoadingIframe(true);
    setIframeKey(Date.now());
    setIsRecentOpen(false);
  };

  const handleClearRecent = () => {
    setRecentUrls([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.RECENT_URLS);
    } catch (err) {
      console.warn(err);
    }
    setIsRecentOpen(false);
  };

  // Reload Iframe
  const handleReload = () => {
    setIsLoadingIframe(true);
    setIframeKey(Date.now());
  };

  // Switch Device
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setIsDeviceMenuOpen(false);
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_DEVICE, deviceId);
    } catch (err) {
      console.warn(err);
    }
  };

  // Previous & Next Device in Auto-Play cycle
  const handlePrevDevice = useCallback(() => {
    const currentIndex = allPresets.findIndex(d => d.id === selectedDeviceId);
    const prevIndex = (currentIndex - 1 + allPresets.length) % allPresets.length;
    handleDeviceChange(allPresets[prevIndex].id);
    setProgressPercent(0);
  }, [allPresets, selectedDeviceId]);

  const handleNextDevice = useCallback(() => {
    const currentIndex = allPresets.findIndex(d => d.id === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % allPresets.length;
    handleDeviceChange(allPresets[nextIndex].id);
    setProgressPercent(0);
  }, [allPresets, selectedDeviceId]);

  // Auto-Play Cycle State Machine
  useEffect(() => {
    if (!isPlaying) {
      setProgressPercent(0);
      return;
    }

    const intervalMs = 50;
    const totalDuration = cycleSpeed * 1000;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalMs;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgressPercent(progress);

      if (elapsed >= totalDuration) {
        elapsed = 0;
        handleNextDevice();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, cycleSpeed, handleNextDevice]);

  // Handle Close Dropdowns on Click Outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deviceDropdownRef.current && !deviceDropdownRef.current.contains(e.target as Node)) {
        setIsDeviceMenuOpen(false);
      }
      if (recentDropdownRef.current && !recentDropdownRef.current.contains(e.target as Node)) {
        setIsRecentOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Devices for Dropdown
  const filteredDevices = useMemo(() => {
    return allPresets.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(deviceSearch.toLowerCase()) ||
        `${d.width}x${d.height}`.includes(deviceSearch);
      const matchesCategory = deviceCategoryFilter === 'all' || d.category === deviceCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allPresets, deviceSearch, deviceCategoryFilter]);

  // Save Custom Preset
  const handleSaveCustomPreset = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!customWidth || !customHeight) return;

    const newPreset: DevicePreset = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || `Custom ${customWidth}x${customHeight}`,
      category: 'custom',
      width: Number(customWidth),
      height: Number(customHeight),
      deviceType: customWidth > 1000 ? 'desktop' : customWidth > 600 ? 'tablet' : 'ios',
      isCustom: true
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    setSelectedDeviceId(newPreset.id);
    setIsCustomModalOpen(false);
  };

  const handleDeleteCustomPreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PRESETS, JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    if (selectedDeviceId === id) {
      setSelectedDeviceId(DEFAULT_DEVICES[0].id);
    }
  };

  return (
    <div className="relative w-full flex flex-col min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
      
      {/* =========================================================================
          FLOATING STUDIO CONTROL BAR
         ========================================================================= */}
      <div className="w-full px-2 sm:px-4 py-3 z-30 flex justify-center sticky top-14 sm:top-16 pointer-events-none">
        <div role="toolbar" aria-label="Studio Viewport Control Bar" className="w-full max-w-6xl pointer-events-auto bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md rounded-2xl sm:rounded-full p-2 sm:px-4 sm:py-2.5 shadow-pill dark:shadow-pill-dark border border-gray-200/90 dark:border-[#334155] flex flex-col md:flex-row items-center justify-between gap-2.5 transition-all">
          
          {/* Top/Left Row: URL Input, Recent Pills, & GO */}
          <div className="w-full md:w-auto flex-1 flex items-center gap-1.5 sm:gap-2">
            
            {/* Recent URLs dropdown toggle */}
            <div className="relative" ref={recentDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRecentOpen(!isRecentOpen)}
                aria-label={t.recentUrls}
                aria-haspopup="true"
                aria-expanded={isRecentOpen}
                className="p-2 text-gray-500 hover:text-[#213555] dark:text-gray-400 dark:hover:text-[#E5D283] hover:bg-gray-100 dark:hover:bg-[#0F172A] rounded-xl sm:rounded-full transition-colors"
                title={t.recentUrls}
              >
                <History className="w-4 h-4" />
              </button>

              {/* Recent URLs Menu */}
              {isRecentOpen && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#334155] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span>{t.recentUrls}</span>
                    {recentUrls.length > 0 && (
                      <button
                        onClick={handleClearRecent}
                        aria-label={t.clearRecent}
                        className="text-[11px] text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t.clearRecent}</span>
                      </button>
                    )}
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {recentUrls.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-400">
                        No recent URLs yet.
                      </div>
                    ) : (
                      recentUrls.map((rUrl, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectRecent(rUrl)}
                          className="w-full text-left px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-[#0F172A] rounded-lg truncate flex items-center gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4F709C] group-hover:bg-[#213555] dark:group-hover:bg-[#E5D283]" />
                          <span className="truncate">{rUrl}</span>
                        </button>
                      ))
                    )}
                  </div>
                  
                  {/* Quick Test Demo URL Pills */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t.quickDemo}
                    </div>
                    <div className="flex flex-wrap gap-1 px-1">
                      {DEMO_URLS.map((demo, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectRecent(demo.url)}
                          className="px-2 py-1 text-[11px] font-medium bg-gray-100 dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 hover:bg-[#213555] hover:text-white dark:hover:bg-[#4F709C] rounded-md transition-colors"
                        >
                          {demo.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* URL input field */}
            <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center relative">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={t.urlPlaceholder}
                aria-label="Website URL to preview"
                className="w-full pl-3 pr-8 py-1.5 text-xs sm:text-sm font-mono bg-gray-100/90 dark:bg-[#0F172A] text-gray-900 dark:text-gray-100 placeholder-gray-400 border border-transparent focus:border-[#4F709C] focus:bg-white dark:focus:bg-[#0F172A] rounded-xl sm:rounded-full outline-none transition-all shadow-inner"
              />
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  aria-label="Clear URL input"
                  className="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Deep Navy #213555 "GO" Button */}
            <button
              type="button"
              onClick={() => handleUrlSubmit()}
              aria-label="Load preview for URL"
              className="px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-extrabold bg-[#213555] text-white hover:bg-[#1a2b45] active:scale-95 rounded-xl sm:rounded-full shadow-sm transition-all flex items-center gap-1 shrink-0"
            >
              <span>{t.goButton}</span>
            </button>

            {/* Reload Preview Button */}
            <button
              type="button"
              onClick={handleReload}
              aria-label={t.reloadTooltip}
              className={`p-2 text-gray-500 hover:text-[#213555] dark:text-gray-400 dark:hover:text-[#E5D283] hover:bg-gray-100 dark:hover:bg-[#0F172A] rounded-xl sm:rounded-full transition-colors shrink-0 ${isLoadingIframe ? 'animate-spin text-[#4F709C]' : ''}`}
              title={t.reloadTooltip}
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Divider on Desktop */}
          <div className="hidden md:block w-px h-6 bg-gray-200 dark:bg-[#334155]" />

          {/* Bottom/Right Row: Player Controls, Device Selector, Rotate & Zoom */}
          <div className="w-full md:w-auto flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            
            {/* Automated Player Controls (Prev, Play/Pause, Next) */}
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-[#0F172A] p-0.5 rounded-xl sm:rounded-full border border-gray-200 dark:border-gray-800" role="group" aria-label="Device presentation player controls">
              <button
                type="button"
                onClick={handlePrevDevice}
                aria-label={t.prevDevice}
                className="p-1.5 text-gray-600 hover:text-[#213555] dark:text-gray-300 dark:hover:text-white rounded-lg sm:rounded-full transition-colors"
                title={t.prevDevice}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Play / Pause Auto-Cycle with Progress Ring */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? t.pauseCycle : t.playCycle}
                  aria-pressed={isPlaying}
                  className={`relative p-2 rounded-xl sm:rounded-full font-bold transition-all ${
                    isPlaying 
                      ? 'bg-[#E5D283] text-[#213555] shadow-sm' 
                      : 'bg-[#213555] text-white hover:bg-[#1a2b45]'
                  }`}
                  title={isPlaying ? t.pauseCycle : t.playCycle}
                >
                  {/* Subtle Progress Ring indicator when playing */}
                  {isPlaying && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#213555"
                        strokeWidth="2.5"
                        strokeDasharray="100"
                        strokeDashoffset={100 - progressPercent}
                        strokeLinecap="round"
                        className="transition-all duration-75"
                      />
                    </svg>
                  )}
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-[#213555] stroke-[#213555]" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white stroke-white ml-0.5" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextDevice}
                aria-label={t.nextDevice}
                className="p-1.5 text-gray-600 hover:text-[#213555] dark:text-gray-300 dark:hover:text-white rounded-lg sm:rounded-full transition-colors"
                title={t.nextDevice}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Speed Selector (3s, 5s, 8s) */}
              <select
                value={cycleSpeed}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setCycleSpeed(s);
                  try {
                    localStorage.setItem(STORAGE_KEYS.CYCLE_SPEED, String(s));
                  } catch (err) {
                    console.warn(err);
                  }
                }}
                aria-label={t.speed}
                className="text-[11px] font-mono font-bold bg-transparent text-gray-700 dark:text-gray-300 px-1 py-1 rounded outline-none cursor-pointer"
                title={t.speed}
              >
                <option value={3} className="dark:bg-[#1E293B]">3s</option>
                <option value={5} className="dark:bg-[#1E293B]">5s</option>
                <option value={8} className="dark:bg-[#1E293B]">8s</option>
              </select>
            </div>

            {/* Categorized Device Selector Dropdown */}
            <div className="relative" ref={deviceDropdownRef}>
              <button
                type="button"
                onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
                aria-label={t.selectDevice}
                aria-haspopup="listbox"
                aria-expanded={isDeviceMenuOpen}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold bg-gray-100 dark:bg-[#0F172A] hover:bg-gray-200 dark:hover:bg-[#334155] text-gray-800 dark:text-gray-200 rounded-xl sm:rounded-full border border-gray-200 dark:border-gray-800 transition-colors"
                title={t.selectDevice}
              >
                {activeDevice.category === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-[#4F709C]" />}
                {activeDevice.category === 'tablet' && <Tablet className="w-3.5 h-3.5 text-[#4F709C]" />}
                {activeDevice.category === 'desktop' && <Laptop className="w-3.5 h-3.5 text-[#4F709C]" />}
                {activeDevice.category === 'custom' && <Sliders className="w-3.5 h-3.5 text-[#E5D283]" />}
                
                <span className="max-w-[100px] sm:max-w-[130px] truncate">{activeDevice.name}</span>
                <span className="hidden xl:inline text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  {viewportWidth}×{viewportHeight}
                </span>
              </button>

              {/* Categorized Device Menu */}
              {isDeviceMenuOpen && (
                <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#334155] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150" role="listbox" aria-label="Available device viewports">
                  
                  {/* Search inside device dropdown */}
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      value={deviceSearch}
                      onChange={(e) => setDeviceSearch(e.target.value)}
                      placeholder={t.searchDevices}
                      aria-label={t.searchDevices}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-[#0F172A] text-gray-800 dark:text-gray-200 placeholder-gray-400 rounded-lg outline-none border border-transparent focus:border-[#4F709C]"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex gap-1 mb-2 pb-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto" role="tablist" aria-label="Filter device categories">
                    {(['all', 'mobile', 'tablet', 'desktop', 'custom'] as const).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setDeviceCategoryFilter(cat)}
                        role="tab"
                        aria-selected={deviceCategoryFilter === cat}
                        className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-colors shrink-0 ${
                          deviceCategoryFilter === cat
                            ? 'bg-[#213555] text-white dark:bg-[#4F709C]'
                            : 'bg-gray-100 dark:bg-[#0F172A] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        {cat === 'all' ? t.allCategories : 
                         cat === 'mobile' ? t.categoryMobile :
                         cat === 'tablet' ? t.categoryTablet :
                         cat === 'desktop' ? t.categoryDesktop : t.categoryCustom}
                      </button>
                    ))}
                  </div>

                  {/* Preset List */}
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    {filteredDevices.map(device => {
                      const isCurrent = device.id === selectedDeviceId;
                      return (
                        <div
                          key={device.id}
                          onClick={() => handleDeviceChange(device.id)}
                          role="option"
                          aria-selected={isCurrent}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-[#213555] dark:text-[#E5D283] font-bold'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0F172A]'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {device.category === 'mobile' && <Smartphone className="w-3.5 h-3.5 text-[#4F709C] shrink-0" />}
                            {device.category === 'tablet' && <Tablet className="w-3.5 h-3.5 text-[#4F709C] shrink-0" />}
                            {device.category === 'desktop' && <Laptop className="w-3.5 h-3.5 text-[#4F709C] shrink-0" />}
                            {device.category === 'custom' && <Sliders className="w-3.5 h-3.5 text-[#E5D283] shrink-0" />}
                            <span className="truncate">{device.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                              {device.width}×{device.height}
                            </span>
                            {device.isCustom && (
                              <button
                                onClick={(e) => handleDeleteCustomPreset(device.id, e)}
                                aria-label={`Delete custom preset ${device.name}`}
                                className="p-1 text-gray-400 hover:text-red-500 rounded"
                                title="Delete preset"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            {isCurrent && <Check className="w-3.5 h-3.5 text-[#4F709C] dark:text-[#E5D283]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Custom Preset Button */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDeviceMenuOpen(false);
                        setIsCustomModalOpen(true);
                      }}
                      aria-label={t.customPreset}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-[#213555] dark:text-[#E5D283] bg-gray-100 dark:bg-[#0F172A] hover:bg-gray-200 dark:hover:bg-[#334155] rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.customPreset}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Portrait / Landscape Rotate Button (⟳) */}
            <button
              type="button"
              onClick={() => setIsLandscape(!isLandscape)}
              aria-label={t.rotate}
              aria-pressed={isLandscape}
              className={`p-2 rounded-xl sm:rounded-full border transition-all ${
                isLandscape
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-[#4F709C] dark:text-[#E5D283] border-[#4F709C]'
                  : 'bg-gray-100 dark:bg-[#0F172A] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-200 dark:hover:bg-[#334155]'
              }`}
              title={t.rotate}
            >
              <RotateCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isLandscape ? 'rotate-90' : 'rotate-0'}`} />
            </button>

            {/* Zoom Slider (25% to 150%) + 1-Click "FIT" Toggle */}
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#0F172A] px-2 py-1 rounded-xl sm:rounded-full border border-gray-200 dark:border-gray-800" role="group" aria-label="Viewport magnification controls">
              {/* 1-Click "FIT" button */}
              <button
                type="button"
                onClick={() => {
                  const nextFit = !isFitActive;
                  setIsFitActive(nextFit);
                  try {
                    localStorage.setItem(STORAGE_KEYS.AUTO_FIT, String(nextFit));
                  } catch (err) {
                    console.warn(err);
                  }
                }}
                aria-label={t.fitTooltip}
                aria-pressed={isFitActive}
                className={`px-2 py-0.5 text-[10px] sm:text-xs font-extrabold rounded-md transition-all ${
                  isFitActive
                    ? 'bg-[#4F709C] text-white shadow-xs'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={t.fitTooltip}
              >
                {t.fitToggle}
              </button>

              {/* Slider */}
              <input
                type="range"
                min="25"
                max="150"
                step="5"
                value={isFitActive ? Math.round(calculatedFitScale * 100) : zoomLevel}
                onChange={(e) => {
                  setIsFitActive(false);
                  setZoomLevel(Number(e.target.value));
                }}
                aria-label={t.zoom}
                aria-valuemin={25}
                aria-valuemax={150}
                aria-valuenow={Math.round(currentScale * 100)}
                className="w-16 sm:w-20 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#4F709C]"
                title={t.zoom}
              />

              <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-700 dark:text-gray-300 w-9 text-right" aria-live="polite">
                {Math.round(currentScale * 100)}%
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          ANIMATED DEVICE MOCKUP STAGE (DOTTED ARCHITECTURAL CANVAS)
         ========================================================================= */}
      <main
        ref={stageRef}
        role="region"
        aria-label="Device Viewport Preview Canvas"
        className="relative flex-1 w-full flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#F0F0F0] dark:bg-[#0F172A] transition-colors duration-200"
        style={{
          backgroundImage: `radial-gradient(rgba(79, 112, 156, 0.22) 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px'
        }}
      >
        {/* Top-Left Floating Pill Badge: Current Device & Exact Dimensions */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
          <div className="bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 dark:border-[#334155] shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-mono font-bold tracking-wider text-[#213555] dark:text-[#E5D283] uppercase">
              {activeDevice.name} • {viewportWidth} × {viewportHeight}PX ({isLandscape ? tStage.badgeLandscape : tStage.badgePortrait})
            </span>
          </div>

          {/* Quick Bezel Toggle Chip */}
          <button
            type="button"
            onClick={() => {
              const next = !showBezel;
              setShowBezel(next);
              try {
                localStorage.setItem(STORAGE_KEYS.SHOW_BEZEL, String(next));
              } catch (err) {
                console.warn(err);
              }
            }}
            aria-label={t.bezelToggle}
            aria-pressed={showBezel}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
              showBezel
                ? 'bg-white dark:bg-[#1E293B] text-[#4F709C] border-gray-200 dark:border-[#334155] shadow-xs'
                : 'bg-transparent text-gray-400 border-dashed border-gray-300 dark:border-gray-700'
            }`}
            title={t.bezelToggle}
          >
            {t.bezelToggle} {showBezel ? 'ON' : 'OFF'}
          </button>

          {/* Quick Dynamic Island / Notch Toggle Chip (Mobile devices only) */}
          {showBezel && activeDevice.category === 'mobile' && (activeDevice.hasIsland || activeDevice.hasNotch || activeDevice.hasHolePunch) && (
            <button
              type="button"
              onClick={() => {
                const next = !showIsland;
                setShowIsland(next);
                try {
                  localStorage.setItem(STORAGE_KEYS.SHOW_ISLAND, String(next));
                } catch (err) {
                  console.warn(err);
                }
              }}
              aria-label={t.islandToggle}
              aria-pressed={showIsland}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                showIsland
                  ? 'bg-white dark:bg-[#1E293B] text-[#4F709C] border-gray-200 dark:border-[#334155] shadow-xs'
                  : 'bg-transparent text-gray-400 border-dashed border-gray-300 dark:border-gray-700'
              }`}
              title={t.islandToggle}
            >
              {t.islandToggle} {showIsland ? 'ON' : 'OFF'}
            </button>
          )}
        </div>

        {/* Central Device Frame Container */}
        <div
          className="relative transition-transform duration-300 ease-out flex items-center justify-center"
          style={{
            transform: `scale(${currentScale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Realistic Bezel Frame */}
          <div
            className={`relative transition-all duration-300 ease-in-out ${
              showBezel
                ? activeDevice.category === 'desktop'
                  ? 'p-3 pb-8 rounded-2xl bg-[#213555] dark:bg-[#1E293B] shadow-device dark:shadow-device-dark border-4 border-gray-700 dark:border-gray-600'
                  : 'p-3 pb-4 rounded-[44px] bg-[#1a2536] dark:bg-[#0b1120] shadow-device dark:shadow-device-dark border-[6px] border-[#2d3748] dark:border-[#1e293b]'
                : 'p-0 shadow-xl rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700'
            }`}
            style={{
              width: totalDeviceWidth,
              height: totalDeviceHeight
            }}
          >
            {/* Notch or Dynamic Island (when enabled on mobile) */}
            {showBezel && showIsland && activeDevice.category === 'mobile' && (
              <>
                {/* Dynamic Island for modern iPhones */}
                {activeDevice.hasIsland && !isLandscape && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-20 flex items-center justify-between px-2.5 shadow-inner">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111827] border border-gray-800" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/70" />
                  </div>
                )}

                {/* Notch for iPhone XR / 12 Pro */}
                {activeDevice.hasNotch && !isLandscape && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-36 h-5 bg-black rounded-b-xl z-20 flex items-center justify-center">
                    <div className="w-10 h-1 bg-gray-800 rounded-full" />
                  </div>
                )}

                {/* Hole punch for Android */}
                {activeDevice.hasHolePunch && !isLandscape && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-20 border border-gray-800" />
                )}
              </>
            )}

            {/* Desktop Webcam & Bezel Accents */}
            {showBezel && activeDevice.category === 'desktop' && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-900 border border-gray-700" />
            )}

            {/* Actual Iframe Viewport Frame */}
            <div
              className="relative w-full h-full bg-white dark:bg-gray-900 overflow-hidden"
              style={{
                width: viewportWidth,
                height: viewportHeight,
                borderRadius: showBezel 
                  ? activeDevice.category === 'desktop' ? '8px' : '36px' 
                  : '6px'
              }}
            >
              {/* HTML5 Iframe */}
              <iframe
                key={iframeKey}
                src={activeUrl}
                title={`Responsive Preview - ${activeDevice.name}`}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                onLoad={() => setIsLoadingIframe(false)}
              />

              {/* Bottom Home Indicator Bar for Touch Devices */}
              {showBezel && activeDevice.category === 'mobile' && !isLandscape && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400/50 hover:bg-gray-400 rounded-full z-10 pointer-events-none transition-colors" />
              )}
            </div>

            {/* Desktop Laptop Stand Chin */}
            {showBezel && activeDevice.category === 'desktop' && (
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-36 h-3 bg-gray-400 dark:bg-gray-700 rounded-b-md shadow-md" />
            )}
          </div>
        </div>

        {/* Bottom Interactive Notice & Hint */}
        <div className="absolute bottom-3 left-4 z-20 hidden md:flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-[#1E293B]/70 backdrop-blur px-2.5 py-1 rounded-full border border-gray-200/50 dark:border-gray-800/50">
          <Sparkles className="w-3 h-3 text-[#E5D283]" />
          <span>{tStage.interactiveHint}</span>
        </div>

        {/* =========================================================================
            PREVIEW BLANK HELPER BUTTON (BOTTOM-RIGHT)
           ========================================================================= */}
        <button
          type="button"
          onClick={() => setIsTroubleshootOpen(true)}
          aria-label={tTrouble.button}
          aria-haspopup="dialog"
          className="absolute bottom-4 right-4 z-30 flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-500 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 border border-amber-400"
          title={tTrouble.button}
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="tracking-wide">{tTrouble.button}</span>
        </button>
      </main>

      {/* =========================================================================
          TROUBLESHOOTING MODAL ("⚠️ PREVIEW BLANK?")
         ========================================================================= */}
      {isTroubleshootOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#334155] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="troubleshoot-dialog-title"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-[#334155] flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="troubleshoot-dialog-title" className="font-extrabold text-base sm:text-lg text-[#213555] dark:text-white">
                    {tTrouble.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {tTrouble.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTroubleshootOpen(false)}
                aria-label="Close troubleshooting dialog"
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              
              {/* Causes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-gray-50 dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-gray-800">
                  <h4 className="font-bold text-[#213555] dark:text-[#E5D283] mb-1">
                    {tTrouble.cause1Title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {tTrouble.cause1Desc}
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-[#0F172A] rounded-xl border border-gray-200 dark:border-gray-800">
                  <h4 className="font-bold text-[#213555] dark:text-[#E5D283] mb-1">
                    {tTrouble.cause2Title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {tTrouble.cause2Desc}
                  </p>
                </div>
              </div>

              {/* Solutions */}
              <div className="pt-2">
                <h4 className="font-extrabold text-[#213555] dark:text-white uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#4F709C] dark:text-[#E5D283]" />
                  <span>{tTrouble.solutionHeader}</span>
                </h4>

                <div className="space-y-3">
                  {/* Solution 1: Localhost */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="font-bold text-emerald-800 dark:text-emerald-400 mb-1">
                      {tTrouble.sol1Title}
                    </div>
                    <div className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                      {tTrouble.sol1Desc}
                    </div>
                  </div>

                  {/* Solution 2: Extension */}
                  <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="font-bold text-blue-800 dark:text-blue-400 mb-1">
                      {tTrouble.sol2Title}
                    </div>
                    <div className="text-xs text-blue-900/80 dark:text-blue-300/80 leading-relaxed">
                      {tTrouble.sol2Desc}
                    </div>
                  </div>

                  {/* Solution 3: Tunnels */}
                  <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20">
                    <div className="font-bold text-purple-800 dark:text-purple-400 mb-1">
                      {tTrouble.sol3Title}
                    </div>
                    <div className="text-xs text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
                      {tTrouble.sol3Desc}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-[#334155] flex justify-end bg-gray-50 dark:bg-[#0F172A]">
              <button
                type="button"
                onClick={() => setIsTroubleshootOpen(false)}
                className="px-5 py-2 font-bold text-xs sm:text-sm bg-[#213555] text-white hover:bg-[#1a2b45] rounded-xl shadow-sm transition-all"
              >
                {tTrouble.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CUSTOM PRESET MODAL
         ========================================================================= */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#334155] p-5 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="custom-preset-dialog-title"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <h3 id="custom-preset-dialog-title" className="font-bold text-base text-[#213555] dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#4F709C] dark:text-[#E5D283]" />
                <span>{t.customPreset}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                aria-label="Close custom preset dialog"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomPreset} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Preset Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. My Phone or Surface Duo"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-100 dark:bg-[#0F172A] text-gray-900 dark:text-white rounded-lg border border-transparent focus:border-[#4F709C] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t.width} (px)
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="3840"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-gray-100 dark:bg-[#0F172A] text-gray-900 dark:text-white rounded-lg border border-transparent focus:border-[#4F709C] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {t.height} (px)
                  </label>
                  <input
                    type="number"
                    min="200"
                    max="2160"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono bg-gray-100 dark:bg-[#0F172A] text-gray-900 dark:text-white rounded-lg border border-transparent focus:border-[#4F709C] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#213555] text-white hover:bg-[#1a2b45] dark:bg-[#4F709C] dark:hover:bg-[#3d5a80] rounded-lg shadow-sm"
                >
                  {t.savePreset}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
