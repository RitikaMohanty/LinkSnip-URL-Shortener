import React, { useState } from "react";
import { Copy, Check, QrCode, BarChart3, ExternalLink, MoreVertical, Edit3, Trash2, Lock, Calendar, MousePointerClick, Folder, Tag, AlertTriangle, ShieldCheck, Power } from "lucide-react";
import { LinkItem, UserProfile } from "../types";

interface LinkCardProps {
  link: LinkItem;
  isSelected: boolean;
  user?: UserProfile | null;
  onToggleSelect: (id: string) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (shortCode: string) => void;
  onOpenQrModal: (link: LinkItem) => void;
  onViewAnalytics: (shortCode: string) => void;
  onToggleStatus: (shortCode: string, currentStatus: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  isSelected,
  user,
  onToggleSelect,
  onEdit,
  onDelete,
  onOpenQrModal,
  onViewAnalytics,
  onToggleStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const hostUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shortUrl = `${hostUrl}/r/${link.shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = link.status === "expired" || (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now());
  const isDisabled = link.status === "disabled";

  let domain = "";
  try {
    domain = new URL(link.originalUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = link.originalUrl;
  }

  return (
    <div
      className={`group relative bg-white border rounded-[14px] p-4 sm:p-5 transition-all hover:shadow-xs ${
        isSelected
          ? 'border-[#09090b] bg-[#f8fafc] ring-1 ring-[#09090b]'
          : isDisabled
          ? 'border-[#e4e4e7] bg-[#f4f4f5]/60 opacity-80'
          : isExpired
          ? 'border-[#fed7aa] bg-[#fffaf5]'
          : 'border-[#e4e4e7] hover:border-[#d4d4d8]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Checkbox & Header Details */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(link.id)}
            className="mt-1 rounded text-[#09090b] focus:ring-black cursor-pointer h-4 w-4 border-[#d4d4d8]"
          />

          <div className="min-w-0 flex-1">
            {/* Title & Status Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-sm sm:text-base font-bold text-[#09090b] truncate tracking-tight"
              >
                {link.title || link.shortCode}
              </h3>

              {/* Status Pill */}
              {isExpired ? (
                <span className="px-2 py-0.5 bg-[#fef3c7] text-[#b45309] text-[10px] font-bold rounded-full border border-[#fde68a] flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Expired
                </span>
              ) : isDisabled ? (
                <span className="px-2 py-0.5 bg-[#f4f4f5] text-[#71717a] text-[10px] font-bold rounded-full border border-[#e4e4e7] flex items-center gap-1">
                  <Power className="w-3 h-3" />
                  Disabled
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-[#ecfdf5] text-[#059669] text-[10px] font-bold rounded-full border border-[#a7f3d0]">
                  Active
                </span>
              )}

              {/* Password Protected Badge */}
              {link.isPasswordProtected && (
                <span className="px-2 py-0.5 bg-[#eff6ff] text-[#2563eb] text-[10px] font-bold rounded-full border border-[#bfdbfe] flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Protected
                </span>
              )}

              {/* Security indicator */}
              {link.safetyScore === 'flagged' ? (
                <span className="px-2 py-0.5 bg-[#fef2f2] text-[#dc2626] text-[10px] font-bold rounded-full border border-[#fecaca]">
                  Flagged URL
                </span>
              ) : (
                <span className="text-[10px] text-[#059669] font-medium hidden sm:flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Safe
                </span>
              )}
            </div>

            {/* Short Link & Copy */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold font-mono text-[#09090b]">
                /r/{link.shortCode}
              </span>

              <button
                id={`btn-copy-${link.shortCode}`}
                onClick={handleCopy}
                title="Copy short link"
                className="px-2 py-0.5 text-[#52525b] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[6px] border border-[#e4e4e7] bg-white transition-colors text-xs flex items-center gap-1 cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-semibold">{copied ? "Copied" : "Copy"}</span>
              </button>

              <a
                href={`/r/${link.shortCode}`}
                target="_blank"
                rel="noreferrer"
                title="Open short link"
                className="p-1 text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[6px] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Destination URL */}
            <div className="flex items-center gap-1.5 text-xs text-[#71717a] mb-2.5">
              <span className="font-mono text-[#52525b] truncate max-w-xs sm:max-w-md">
                {link.originalUrl}
              </span>
              <span className="text-[11px] text-[#71717a] bg-[#f1f5f9] px-1.5 py-0.5 rounded border border-[#e4e4e7] shrink-0">
                {domain}
              </span>
            </div>

            {/* Tags & Folder Metadata */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {link.folderName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f1f5f9] text-[#09090b] text-[11px] font-semibold rounded-[6px] border border-[#e4e4e7]">
                  <Folder className="w-3 h-3 text-[#71717a]" />
                  {link.folderName}
                </span>
              )}

              {link.tags && link.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-[#52525b] text-[11px] font-medium rounded-[6px] border border-[#e4e4e7]"
                >
                  <Tag className="w-2.5 h-2.5 text-[#71717a]" />
                  {t}
                </span>
              ))}

              {link.expiresAt && (
                <span className="text-[11px] text-[#71717a] flex items-center gap-1 bg-[#f8fafc] px-2 py-0.5 rounded border border-[#e4e4e7]">
                  <Calendar className="w-3 h-3" />
                  Expires: {new Date(link.expiresAt).toLocaleDateString()}
                </span>
              )}

              {link.maxClicks && (
                <span className="text-[11px] text-[#71717a] flex items-center gap-1 bg-[#f8fafc] px-2 py-0.5 rounded border border-[#e4e4e7]">
                  <MousePointerClick className="w-3 h-3" />
                  Limit: {link.clicks}/{link.maxClicks}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Stats & Action Menu */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Clicks Metric Card */}
          <button
            onClick={() => onViewAnalytics(link.shortCode)}
            title={user ? "View Link Analytics" : "Sign in to view link analytics"}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e4e4e7] hover:border-[#d4d4d8] rounded-[10px] transition-all cursor-pointer group/stat shadow-2xs"
          >
            <div className="text-right">
              <div 
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-sm sm:text-base font-extrabold text-[#09090b]"
              >
                {link.clicks.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#71717a] font-semibold uppercase tracking-wider">
                Clicks
              </div>
            </div>
            {user ? (
              <BarChart3 className="w-4 h-4 text-[#71717a] group-hover/stat:text-[#09090b] transition-colors" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#71717a] group-hover/stat:text-[#09090b] transition-colors" />
            )}
          </button>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              id={`btn-qr-${link.shortCode}`}
              onClick={() => onOpenQrModal(link)}
              title="Show QR Code"
              className="p-2 text-[#52525b] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[8px] transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              id={`btn-analytics-${link.shortCode}`}
              onClick={() => onViewAnalytics(link.shortCode)}
              title={user ? "Detailed Analytics" : "Sign in to view analytics"}
              className="p-2 text-[#52525b] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[8px] transition-colors cursor-pointer relative"
            >
              <BarChart3 className="w-4 h-4" />
              {!user && (
                <Lock className="w-2.5 h-2.5 text-[#71717a] absolute top-1 right-1" />
              )}
            </button>

            {/* Overflow Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-[#52525b] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[8px] transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-white border border-[#e4e4e7] rounded-[10px] shadow-lg z-30 py-1 text-xs">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(link);
                      }}
                      className="w-full text-left px-3.5 py-2 text-[#09090b] hover:bg-[#f4f4f5] flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#71717a]" />
                      Edit Link & Rules
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onToggleStatus(link.shortCode, link.status);
                      }}
                      className="w-full text-left px-3.5 py-2 text-[#09090b] hover:bg-[#f4f4f5] flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5 text-[#71717a]" />
                      {link.status === "disabled" ? "Activate Link" : "Disable Link"}
                    </button>

                    <div className="my-1 border-t border-[#e4e4e7]" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(link.shortCode);
                      }}
                      className="w-full text-left px-3.5 py-2 text-[#dc2626] hover:bg-[#fef2f2] flex items-center gap-2 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Link
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
