import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from "recharts";
import { 
  BarChart3, TrendingUp, Users, Globe2, Smartphone, Download, 
  RefreshCw, Play, Compass, Laptop, CheckCircle2, ArrowUpRight, Lock, LogIn, UserPlus, Sparkles
} from "lucide-react";
import { AnalyticsSummary, LinkItem, UserProfile } from "../types";

interface AnalyticsDashboardProps {
  links: LinkItem[];
  selectedCode: string;
  onSelectCode: (code: string) => void;
  user: UserProfile | null;
  onOpenAuthModal: (tab?: 'login' | 'signup') => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  links,
  selectedCode,
  onSelectCode,
  user,
  onOpenAuthModal,
}) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [targetLink, setTargetLink] = useState<LinkItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'14d' | '7d' | '30d'>('14d');

  // Click simulator state
  const [simCountry, setSimCountry] = useState("United States");
  const [simReferrer, setSimReferrer] = useState("Twitter / X");
  const [simDevice, setSimDevice] = useState<"Desktop" | "Mobile" | "Tablet">("Mobile");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState<string | null>(null);

  // Click stream filter
  const [clickSearch, setClickSearch] = useState("");

  const fetchAnalytics = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/${selectedCode}`);
      const json = await res.json();
      if (res.ok) {
        setData(json.summary);
        setTargetLink(json.link || null);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [selectedCode, user]);

  const handleSimulateClick = async () => {
    const codeToTest = selectedCode === "all" ? (links[0]?.shortCode || "summersale") : selectedCode;
    setIsSimulating(true);
    setSimSuccessMsg(null);
    try {
      const res = await fetch("/api/click/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortCode: codeToTest,
          referrer: simReferrer,
          country: simCountry,
          device: simDevice,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setSimSuccessMsg(`Click registered! Total clicks now: ${json.linkClicks}`);
        fetchAnalytics();
        setTimeout(() => setSimSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error("Click simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExportCsv = () => {
    if (!user) {
      onOpenAuthModal('login');
      return;
    }
    window.location.href = `/api/analytics/export/${selectedCode}`;
  };

  // If user is not signed in, show modern monochromatic Auth Gate
  if (!user) {
    return (
      <div className="space-y-6 animate-fade-in relative">
        {/* Auth Gate Hero Box */}
        <div className="bg-white border border-[#e4e4e7] rounded-[16px] p-8 sm:p-12 shadow-sm text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-[12px] bg-[#09090b] text-white flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-2xl font-bold text-[#09090b] tracking-tight"
            >
              Analytics is available after sign up or log in
            </h2>
            <p className="text-xs sm:text-sm text-[#71717a] leading-relaxed max-w-md mx-auto">
              Create an account or sign in to track real-time click volume, monitor top referral channels, explore visitor geography, and export analytics CSV reports.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-analytics-login"
              onClick={() => onOpenAuthModal('login')}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#09090b] hover:bg-[#27272a] active:bg-black text-white rounded-[10px] text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log In to View Analytics</span>
            </button>

            <button
              id="btn-analytics-signup"
              onClick={() => onOpenAuthModal('signup')}
              className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-[#f4f4f5] text-[#09090b] border border-[#e4e4e7] rounded-[10px] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
            </button>
          </div>

          {/* Feature highlights */}
          <div className="pt-4 border-t border-[#e4e4e7] grid grid-cols-3 gap-3 text-left">
            <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
              <span className="font-bold text-[#09090b] text-[11px] block">Click Velocity</span>
              <span className="text-[10px] text-[#71717a]">7, 14 & 30-day time-series</span>
            </div>
            <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
              <span className="font-bold text-[#09090b] text-[11px] block">Referral Channels</span>
              <span className="text-[10px] text-[#71717a]">Twitter, Reddit, Google</span>
            </div>
            <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
              <span className="font-bold text-[#09090b] text-[11px] block">Device Platform</span>
              <span className="text-[10px] text-[#71717a]">Mobile, Desktop & Browsers</span>
            </div>
          </div>
        </div>

        {/* Locked Preview Underneath */}
        <div className="pointer-events-none select-none filter blur-[2.5px] opacity-40 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
              <div className="text-xs font-bold uppercase text-[#71717a] mb-1">Total Clicks</div>
              <div className="text-3xl font-extrabold text-[#09090b]" style={{ fontFamily: "'Outfit', sans-serif" }}>2,963</div>
            </div>
            <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
              <div className="text-xs font-bold uppercase text-[#71717a] mb-1">Unique Visitors</div>
              <div className="text-3xl font-extrabold text-[#09090b]" style={{ fontFamily: "'Outfit', sans-serif" }}>1,840</div>
            </div>
            <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
              <div className="text-xs font-bold uppercase text-[#71717a] mb-1">Top Referrer</div>
              <div className="text-xl font-bold text-[#09090b]" style={{ fontFamily: "'Outfit', sans-serif" }}>Twitter / X</div>
            </div>
            <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
              <div className="text-xs font-bold uppercase text-[#71717a] mb-1">Top Country</div>
              <div className="text-xl font-bold text-[#09090b]" style={{ fontFamily: "'Outfit', sans-serif" }}>United States</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredClickLogs = (data?.recentClicks || []).filter(c => {
    if (!clickSearch) return true;
    const q = clickSearch.toLowerCase();
    return (
      c.country.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.referrer.toLowerCase().includes(q) ||
      c.browser.toLowerCase().includes(q) ||
      c.shortCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls Bar */}
      <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#09090b] text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-lg sm:text-xl font-bold text-[#09090b] tracking-tight"
            >
              {selectedCode === "all" ? "Global Click Analytics" : `Analytics: /r/${targetLink?.shortCode || selectedCode}`}
            </h2>
            <p className="text-xs text-[#71717a]">
              {selectedCode === "all"
                ? "Aggregated telemetry across all active shortened URLs"
                : targetLink?.title || "Per-link performance and visitor demographics"}
            </p>
          </div>
        </div>

        {/* Filter Switcher & Export */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
          {/* Target link selector */}
          <div className="flex-1 md:flex-none">
            <select
              id="select-analytics-target"
              value={selectedCode}
              onChange={(e) => onSelectCode(e.target.value)}
              className="w-full md:w-auto px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-xs font-semibold text-[#09090b] outline-none focus:border-[#09090b] focus:ring-3 focus:ring-black/5 cursor-pointer"
            >
              <option value="all">🌐 All Links (Global Overview)</option>
              {links.map((l) => (
                <option key={l.id} value={l.shortCode}>
                  /{l.shortCode} - {l.title.slice(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-export-csv"
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white border border-[#e4e4e7] hover:bg-[#f4f4f5] text-[#09090b] text-xs font-semibold rounded-[10px] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchAnalytics}
            title="Refresh Data"
            className="p-2 bg-white hover:bg-[#f4f4f5] text-[#52525b] hover:text-[#09090b] rounded-[10px] border border-[#e4e4e7] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#71717a] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Total Clicks</span>
            <span className="p-1.5 bg-[#f1f5f9] text-[#09090b] rounded-[8px]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-2xl sm:text-3xl font-extrabold text-[#09090b]"
          >
            {data?.totalClicks.toLocaleString() ?? "—"}
          </div>
          <p className="text-[11px] text-[#059669] font-semibold mt-1 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>Active telemetry stream</span>
          </p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#71717a] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Unique Visitors</span>
            <span className="p-1.5 bg-[#f1f5f9] text-[#09090b] rounded-[8px]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-2xl sm:text-3xl font-extrabold text-[#09090b]"
          >
            {data?.uniqueVisitors.toLocaleString() ?? "—"}
          </div>
          <p className="text-[11px] text-[#71717a] font-medium mt-1">
            Distinct IP footprint
          </p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#71717a] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Top Referrer</span>
            <span className="p-1.5 bg-[#f1f5f9] text-[#09090b] rounded-[8px]">
              <Compass className="w-4 h-4" />
            </span>
          </div>
          <div 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-lg sm:text-xl font-bold text-[#09090b] truncate"
          >
            {data?.referrers[0]?.name || "Direct / Email"}
          </div>
          <p className="text-[11px] text-[#09090b] font-semibold mt-1">
            {data?.referrers[0] ? `${data.referrers[0].percentage}% of total traffic` : "No referrers yet"}
          </p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#71717a] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">Top Country</span>
            <span className="p-1.5 bg-[#f1f5f9] text-[#09090b] rounded-[8px]">
              <Globe2 className="w-4 h-4" />
            </span>
          </div>
          <div 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-lg sm:text-xl font-bold text-[#09090b] truncate"
          >
            {data?.locations[0]?.country || "United States"}
          </div>
          <p className="text-[11px] text-[#71717a] font-medium mt-1">
            {data?.locations[0] ? `${data.locations[0].count} clicks (${data.locations[0].percentage}%)` : "—"}
          </p>
        </div>
      </div>

      {/* Main Charts: Clicks Over Time */}
      <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-base font-bold text-[#09090b]"
            >
              Clicks Velocity Over Time
            </h3>
            <p className="text-xs text-[#71717a]">Daily click activity and peak redirection times</p>
          </div>
          <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-[10px] text-xs font-semibold">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-[8px] transition-colors cursor-pointer ${timeRange === '7d' ? 'bg-white text-[#09090b] shadow-2xs font-bold' : 'text-[#71717a]'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1 rounded-[8px] transition-colors cursor-pointer ${timeRange === '14d' ? 'bg-white text-[#09090b] shadow-2xs font-bold' : 'text-[#71717a]'}`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-[8px] transition-colors cursor-pointer ${timeRange === '30d' ? 'bg-white text-[#09090b] shadow-2xs font-bold' : 'text-[#71717a]'}`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full">
          {data?.clicksOverTime && data.clicksOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.clicksOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#09090b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#09090b" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#09090b',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#09090b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#clickGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#71717a] text-xs">
              No click time-series data recorded
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Grid: Referrers & Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 sm:p-6 shadow-xs">
          <h3 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-base font-bold text-[#09090b] mb-1"
          >
            Traffic Channels & Referrers
          </h3>
          <p className="text-xs text-[#71717a] mb-4">Where your visitors are originating from</p>

          <div className="space-y-3">
            {data?.referrers && data.referrers.length > 0 ? (
              data.referrers.slice(0, 6).map((ref, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#09090b]">{ref.name}</span>
                    <span className="text-[#71717a]">
                      {ref.count.toLocaleString()} clicks ({ref.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#09090b] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(ref.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#71717a] py-4 text-center">No referrer data recorded yet</p>
            )}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 sm:p-6 shadow-xs">
          <h3 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-base font-bold text-[#09090b] mb-1"
          >
            Top Geographies & Cities
          </h3>
          <p className="text-xs text-[#71717a] mb-4">Country distribution of worldwide visitors</p>

          <div className="space-y-3">
            {data?.locations && data.locations.length > 0 ? (
              data.locations.slice(0, 6).map((loc, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#09090b] flex items-center gap-1.5">
                      <span className="w-5 text-center font-mono text-[10px] bg-[#f1f5f9] px-1 py-0.5 rounded text-[#52525b] border border-[#e4e4e7]">
                        {loc.countryCode}
                      </span>
                      <span>{loc.country}</span>
                    </span>
                    <span className="text-[#71717a]">
                      {loc.count.toLocaleString()} ({loc.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#f1f5f9] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#27272a] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(loc.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#71717a] py-4 text-center">No geographic data recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Devices / OS & Live Click Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device & Browser Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#e4e4e7] rounded-[14px] p-5 sm:p-6 shadow-xs">
          <h3 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-base font-bold text-[#09090b] mb-1"
          >
            Devices & Client Environment
          </h3>
          <p className="text-xs text-[#71717a] mb-4">Hardware platforms and browser breakdown</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Devices */}
            <div className="p-3.5 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
              <span className="font-bold text-[#09090b] block mb-2 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#09090b]" />
                <span>Device Form Factor</span>
              </span>
              <div className="space-y-2">
                {data?.devices.map((d, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[#71717a]">{d.device}</span>
                    <span className="font-bold text-[#09090b]">{d.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Operating Systems */}
            <div className="p-3.5 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
              <span className="font-bold text-[#09090b] block mb-2 flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-[#09090b]" />
                <span>Operating System</span>
              </span>
              <div className="space-y-2">
                {data?.osList.slice(0, 4).map((os, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[#71717a]">{os.os}</span>
                    <span className="font-bold text-[#09090b]">{os.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Browsers */}
            <div className="p-3.5 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
              <span className="font-bold text-[#09090b] block mb-2 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-[#09090b]" />
                <span>Top Browser</span>
              </span>
              <div className="space-y-2">
                {data?.browsers.slice(0, 4).map((b, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-[#71717a]">{b.browser}</span>
                    <span className="font-bold text-[#09090b]">{b.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Click Simulator Box */}
        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#09090b] animate-pulse"></span>
              <h3 
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-sm font-bold text-[#09090b]"
              >
                Live Click Stream Simulator
              </h3>
            </div>
            <p className="text-[11px] text-[#71717a] mb-3 leading-relaxed">
              Test ingestion pipeline in real-time. Triggering a click updates charts and logs instantly.
            </p>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#09090b] mb-1">Source Channel</label>
                <select
                  value={simReferrer}
                  onChange={(e) => setSimReferrer(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
                >
                  <option value="Twitter / X">Twitter / X</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Direct / Email">Direct / Email</option>
                  <option value="Hacker News">Hacker News</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#09090b] mb-1">Origin Country</label>
                <select
                  value={simCountry}
                  onChange={(e) => setSimCountry(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
                >
                  <option value="United States">United States</option>
                  <option value="Germany">Germany</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Japan">Japan</option>
                  <option value="Canada">Canada</option>
                  <option value="India">India</option>
                  <option value="France">France</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#09090b] mb-1">Device Type</label>
                <select
                  value={simDevice}
                  onChange={(e) => setSimDevice(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
                >
                  <option value="Mobile">Mobile (iOS / Android)</option>
                  <option value="Desktop">Desktop (macOS / Windows)</option>
                  <option value="Tablet">Tablet (iPad)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#e4e4e7]">
            {simSuccessMsg && (
              <div className="text-[11px] text-[#059669] font-semibold mb-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{simSuccessMsg}</span>
              </div>
            )}

            <button
              id="btn-simulate-click"
              onClick={handleSimulateClick}
              disabled={isSimulating}
              className="w-full px-3 py-2 bg-[#09090b] hover:bg-[#27272a] active:bg-black text-white font-semibold text-xs rounded-[10px] shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSimulating ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Simulate Live Visitor Click</span>
            </button>
          </div>
        </div>
      </div>

      {/* Raw Real-Time Click Stream Logs Table */}
      <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-base font-bold text-[#09090b]"
            >
              Real-Time Ingestion Log
            </h3>
            <p className="text-xs text-[#71717a]">Live raw clickstream with IP metadata & client environment</p>
          </div>

          <input
            type="text"
            value={clickSearch}
            onChange={(e) => setClickSearch(e.target.value)}
            placeholder="Search click events..."
            className="px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs w-full sm:w-64 outline-none focus:border-[#09090b] focus:ring-3 focus:ring-black/5 text-[#09090b]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#09090b]">
            <thead className="bg-[#f8fafc] border-b border-[#e4e4e7] text-[11px] font-bold text-[#71717a] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Short Link</th>
                <th className="py-2.5 px-3">Referrer</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Device / OS</th>
                <th className="py-2.5 px-3">Browser</th>
                <th className="py-2.5 px-3">IP Mask</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4e7]">
              {filteredClickLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[#71717a] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#09090b]">
                    /r/{log.shortCode}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-[#09090b]">
                    {log.referrer}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-[#09090b]">{log.city}</span>, <span className="text-[#71717a]">{log.country}</span>
                  </td>
                  <td className="py-2.5 px-3 text-[#71717a]">
                    {log.device} • {log.os}
                  </td>
                  <td className="py-2.5 px-3 text-[#71717a]">
                    {log.browser}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#71717a]">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
