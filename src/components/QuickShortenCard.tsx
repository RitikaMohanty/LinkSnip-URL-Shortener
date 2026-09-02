import React, { useState } from "react";
import { Link2, Sparkles, Copy, Check, QrCode, ExternalLink, Lock, Calendar, MousePointerClick, Tag, Folder, BarChart3, AlertCircle, LogIn, UserPlus, ShieldAlert } from "lucide-react";
import { LinkItem, FolderItem, CreateLinkInput, UserProfile } from "../types";

interface QuickShortenCardProps {
  folders: FolderItem[];
  user: UserProfile | null;
  onLinkCreated: (newLink: LinkItem) => void;
  onOpenQrModal: (link: LinkItem) => void;
  onViewAnalytics: (shortCode: string) => void;
  onOpenAuthModal: (initialTab?: 'login' | 'signup') => void;
}

export const QuickShortenCard: React.FC<QuickShortenCardProps> = ({
  folders,
  user,
  onLinkCreated,
  onOpenQrModal,
  onViewAnalytics,
  onOpenAuthModal,
}) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxClicks, setMaxClicks] = useState<string>("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [redirectType, setRedirectType] = useState<301 | 302>(301);

  // UTM builder
  const [showUtm, setShowUtm] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [securityOverrideNeeded, setSecurityOverrideNeeded] = useState(false);
  const [allowRisk, setAllowRisk] = useState(false);
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent, forceRisk = false) => {
    e.preventDefault();
    if (!originalUrl.trim()) {
      setErrorMsg("Please enter a valid destination URL");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const tagsArray = tagInput
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const payload: CreateLinkInput & { allowRisk?: boolean } = {
      originalUrl: originalUrl.trim(),
      customAlias: user && customAlias.trim() ? customAlias.trim() : undefined,
      title: user && title.trim() ? title.trim() : undefined,
      tags: user && tagsArray.length > 0 ? tagsArray : undefined,
      folderId: user && selectedFolder ? selectedFolder : undefined,
      expiresAt: user && expiresAt ? new Date(expiresAt).toISOString() : null,
      maxClicks: user && maxClicks ? parseInt(maxClicks, 10) : null,
      password: user && isPasswordProtected && password.trim() ? password.trim() : undefined,
      redirectType: user ? redirectType : 301,
      utmSource: user && utmSource.trim() ? utmSource.trim() : undefined,
      utmMedium: user && utmMedium.trim() ? utmMedium.trim() : undefined,
      utmCampaign: user && utmCampaign.trim() ? utmCampaign.trim() : undefined,
      allowRisk: forceRisk || allowRisk,
    };

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.canOverride) {
          setSecurityOverrideNeeded(true);
        }
        throw new Error(data.error || "Failed to shorten link");
      }

      setCreatedLink(data.link);
      onLinkCreated(data.link);
      setSecurityOverrideNeeded(false);
      setAllowRisk(false);
      // Reset fields
      setOriginalUrl("");
      setCustomAlias("");
      setTitle("");
      setTagInput("");
      setExpiresAt("");
      setMaxClicks("");
      setPassword("");
      setIsPasswordProtected(false);
      setShowAdvanced(false);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hostUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-6 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-xl font-bold text-[#09090b] tracking-tight flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#09090b] inline-block animate-pulse"></span>
            Shorten a Long URL
          </h2>
          <p className="text-xs text-[#71717a] font-medium mt-0.5">
            Create branded, trackable short links with real-time click analytics & QR codes.
          </p>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        {/* Main Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#71717a]">
              <Link2 className="w-5 h-5" />
            </div>
            <input
              id="input-original-url"
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="Paste long link here (e.g. https://example.com/product/summer-deals-2026)..."
              required
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#e4e4e7] rounded-[10px] text-sm text-[#09090b] placeholder-[#71717a] focus:outline-none focus:border-[#09090b] focus:ring-3 focus:ring-black/5 transition-all"
            />
          </div>

          <button
            id="btn-submit-shorten"
            type="submit"
            disabled={isLoading}
            className="sm:w-auto px-6 py-3 bg-[#09090b] hover:bg-[#27272a] active:bg-black text-white font-semibold text-sm rounded-[10px] shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Shorten Link</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex flex-col gap-2 p-3.5 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-xs rounded-[10px]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2626]" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
            {securityOverrideNeeded && (
              <div className="mt-1 pt-2 border-t border-[#fecaca] flex items-center justify-between">
                <span className="text-[11px] text-[#b91c1c]">Bypass safe-browsing security check for this URL?</span>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="px-3 py-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-semibold rounded-[6px] transition-colors cursor-pointer"
                >
                  Confirm & Create Anyway
                </button>
              </div>
            )}
          </div>
        )}

        {/* Link Customization Options (Available for logged-in members) */}
        {user && (
          <div className="pt-4 border-t border-[#e4e4e7] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
              {/* Custom Alias */}
              <div>
                <label className="block font-semibold text-[#09090b] mb-1.5 flex items-center gap-1.5">
                  <span>Custom Back-Half / Alias</span>
                  <span className="text-[11px] text-[#71717a] font-normal">(optional, 3–30 chars)</span>
                </label>
                <div className="flex items-center rounded-[10px] border border-[#e4e4e7] bg-white overflow-hidden focus-within:border-[#09090b] focus-within:ring-3 focus-within:ring-black/5 transition-all">
                  <span className="px-3 py-2 text-[#71717a] font-mono text-xs border-r border-[#e4e4e7] bg-[#f8fafc]">
                    /r/
                  </span>
                  <input
                    id="input-custom-alias"
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                    placeholder="my-custom-slug"
                    maxLength={30}
                    className="flex-1 px-3 py-2 bg-transparent text-[#09090b] text-xs font-mono outline-none"
                  />
                </div>
              </div>

              {/* Title / Description */}
              <div>
                <label className="block font-semibold text-[#09090b] mb-1.5">
                  Link Title / Label
                </label>
                <input
                  id="input-link-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Promotion Campaign"
                  className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-xs text-[#09090b] outline-none focus:border-[#09090b] focus:ring-3 focus:ring-black/5 transition-all"
                />
              </div>

              {/* Folder Selector */}
              <div>
                <label className="block font-semibold text-[#09090b] mb-1.5 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-[#71717a]" />
                  <span>Organize into Folder</span>
                </label>
                <select
                  id="select-folder"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-xs text-[#09090b] outline-none focus:border-[#09090b] focus:ring-3 focus:ring-black/5 cursor-pointer"
                >
                  <option value="">No Folder (General)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-semibold text-[#09090b] mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#71717a]" />
                  <span>Tags (comma separated)</span>
                </label>
                <input
                  id="input-tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Marketing, Promo, 2026"
                  className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-xs text-[#09090b] outline-none focus:border-[#09090b] focus:ring-3 focus:ring-black/5 transition-all"
                />
              </div>

              {/* Expiration Rules (Date & Max Clicks) */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#f8fafc] rounded-[12px] border border-[#e4e4e7]">
                <div>
                  <label className="block font-semibold text-[#09090b] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#71717a]" />
                    <span>Expiration Date (Optional)</span>
                  </label>
                  <input
                    id="input-expires-at"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#09090b] mb-1.5 flex items-center gap-1.5">
                    <MousePointerClick className="w-3.5 h-3.5 text-[#71717a]" />
                    <span>Expire after Max Clicks (Optional)</span>
                  </label>
                  <input
                    id="input-max-clicks"
                    type="number"
                    min="1"
                    value={maxClicks}
                    onChange={(e) => setMaxClicks(e.target.value)}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
                  />
                </div>
              </div>

              {/* Password Protection & HTTP Redirect Code */}
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#f8fafc] rounded-[12px] border border-[#e4e4e7]">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-[#09090b] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#71717a]" />
                      <span>Password Protection</span>
                    </label>
                    <input
                      type="checkbox"
                      id="chk-password-protect"
                      checked={isPasswordProtected}
                      onChange={(e) => setIsPasswordProtected(e.target.checked)}
                      className="rounded text-[#09090b] focus:ring-black cursor-pointer"
                    />
                  </div>
                  {isPasswordProtected && (
                    <input
                      id="input-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter access passcode..."
                      required={isPasswordProtected}
                      className="w-full px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b] mt-1"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#09090b] mb-1.5">
                    HTTP Redirect Type
                  </label>
                  <div className="flex items-center gap-4 mt-1.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#09090b]">
                      <input
                        type="radio"
                        name="redirectType"
                        checked={redirectType === 301}
                        onChange={() => setRedirectType(301)}
                        className="text-[#09090b]"
                      />
                      <span>301 (Permanent)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#09090b]">
                      <input
                        type="radio"
                        name="redirectType"
                        checked={redirectType === 302}
                        onChange={() => setRedirectType(302)}
                        className="text-[#09090b]"
                      />
                      <span>302 (Temporary)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* UTM Tag Builder Toggle */}
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowUtm(!showUtm)}
                  className="text-xs text-[#09090b] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{showUtm ? "Hide UTM Parameters" : "+ Add UTM Campaign Parameters (Source, Medium, Campaign)"}</span>
                </button>
                {showUtm && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2.5 p-3.5 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#09090b] mb-1">utm_source</label>
                      <input
                        type="text"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        placeholder="e.g. twitter, email"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#09090b] mb-1">utm_medium</label>
                      <input
                        type="text"
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        placeholder="e.g. social, cpc"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#09090b] mb-1">utm_campaign</label>
                      <input
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        placeholder="e.g. summer_promo_26"
                        className="w-full px-2.5 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>

      {/* Immediate Result Card */}
      {createdLink && (
        <div className="mt-5 p-4 sm:p-5 bg-[#f8fafc] border border-[#e4e4e7] rounded-[12px] animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#ecfdf5] text-[#059669] text-[11px] font-bold rounded-full border border-[#a7f3d0]">
                  ✓ Short Link Created
                </span>
                <span className="text-xs font-semibold text-[#09090b] truncate max-w-xs">
                  {createdLink.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold font-mono text-[#09090b] tracking-tight">
                  {hostUrl}/r/{createdLink.shortCode}
                </span>
                <button
                  id="btn-copy-short-link"
                  onClick={() => handleCopy(`${hostUrl}/r/${createdLink.shortCode}`)}
                  className="p-1.5 bg-white border border-[#e4e4e7] hover:border-[#09090b] text-[#09090b] rounded-[8px] shadow-2xs hover:bg-[#f4f4f5] transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#71717a] truncate max-w-md">
                Destination: <span className="text-[#09090b] font-mono">{createdLink.originalUrl}</span>
              </p>
            </div>

            {/* Result actions */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e4e4e7]">
              <button
                id="btn-result-qr"
                onClick={() => onOpenQrModal(createdLink)}
                className="px-3 py-2 bg-white hover:bg-[#f4f4f5] text-[#09090b] border border-[#e4e4e7] text-xs font-semibold rounded-[10px] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>

              <button
                id="btn-result-analytics"
                onClick={() => {
                  if (!user) {
                    onOpenAuthModal('login');
                  } else {
                    onViewAnalytics(createdLink.shortCode);
                  }
                }}
                className="px-3 py-2 bg-white hover:bg-[#f4f4f5] text-[#09090b] border border-[#e4e4e7] text-xs font-semibold rounded-[10px] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
                {!user && <Lock className="w-3 h-3 text-[#71717a]" />}
              </button>

              <a
                id="btn-result-visit"
                href={`/r/${createdLink.shortCode}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-[#09090b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-[10px] flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Visit</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
