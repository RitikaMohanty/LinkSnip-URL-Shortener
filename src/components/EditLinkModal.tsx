import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Lock, Calendar, MousePointerClick, Tag, Folder } from "lucide-react";
import { LinkItem, FolderItem, UserProfile } from "../types";

interface EditLinkModalProps {
  link: LinkItem | null;
  folders: FolderItem[];
  isOpen: boolean;
  user?: UserProfile | null;
  onClose: () => void;
  onSaved: (updatedLink: LinkItem) => void;
  onOpenAuthModal?: (tab?: 'login' | 'signup') => void;
}

export const EditLinkModal: React.FC<EditLinkModalProps> = ({
  link,
  folders,
  isOpen,
  user,
  onClose,
  onSaved,
  onOpenAuthModal,
}) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxClicks, setMaxClicks] = useState<string>("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [redirectType, setRedirectType] = useState<301 | 302>(301);
  const [status, setStatus] = useState<'active' | 'expired' | 'disabled'>('active');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (link) {
      setOriginalUrl(link.originalUrl);
      setCustomAlias(link.customAlias || link.shortCode);
      setTitle(link.title);
      setFolderId(link.folderId || "");
      setTagsInput(link.tags?.join(", ") || "");
      setExpiresAt(link.expiresAt ? new Date(link.expiresAt).toISOString().slice(0, 16) : "");
      setMaxClicks(link.maxClicks ? link.maxClicks.toString() : "");
      setIsPasswordProtected(link.isPasswordProtected);
      setPassword(link.password || "");
      setRedirectType(link.redirectType || 301);
      setStatus(link.status || 'active');
      setErrorMsg(null);
    }
  }, [link]);

  if (!isOpen || !link) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) {
      setErrorMsg("Destination URL is required");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const tags = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch(`/api/links/${link.shortCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: originalUrl.trim(),
          customAlias: customAlias.trim() || undefined,
          title: title.trim() || undefined,
          folderId: folderId || "",
          tags,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          maxClicks: maxClicks ? parseInt(maxClicks, 10) : null,
          password: isPasswordProtected && password.trim() ? password.trim() : undefined,
          redirectType,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update link");
      }

      onSaved(data.link);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-[16px] max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e4e4e7]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e4e4e7]">
          <div>
            <h2 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-lg font-bold text-[#09090b]"
            >
              Edit Short Link
            </h2>
            <p className="text-xs text-[#71717a] font-mono">/r/{link.shortCode}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[8px] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 bg-[#fef2f2] border border-[#fecaca] text-[#dc2626] text-xs rounded-[10px]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2626]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Destination URL */}
          <div>
            <label className="block font-semibold text-[#09090b] mb-1">
              Destination URL (Dynamic Target)
            </label>
            <input
              id="edit-destination-url"
              type="text"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] font-mono text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
            />
            <span className="text-[11px] text-[#71717a] mt-1 block">
              You can modify the destination target anytime without changing the short link.
            </span>
          </div>

          {/* Title & Custom Alias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Link Title</label>
              <input
                id="edit-link-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1 flex items-center justify-between">
                <span>Custom Back-Half / Slug</span>
                {!user && (
                  <span className="text-[10px] text-[#71717a] flex items-center gap-1 font-normal">
                    <Lock className="w-3 h-3" />
                    Sign in to change
                  </span>
                )}
              </label>
              <input
                id="edit-custom-alias"
                type="text"
                disabled={!user}
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                className={`w-full px-3 py-2 border border-[#e4e4e7] rounded-[10px] text-[#09090b] font-mono text-xs outline-none ${
                  user
                    ? 'bg-white focus:border-[#09090b] focus:ring-3 focus:ring-black/5'
                    : 'bg-[#f1f5f9] text-[#71717a] cursor-not-allowed opacity-75'
                }`}
              />
            </div>
          </div>

          {/* Folder & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#09090b] mb-1 flex items-center gap-1">
                <Folder className="w-3.5 h-3.5 text-[#71717a]" />
                <span>Folder</span>
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none cursor-pointer"
              >
                <option value="">No Folder (Unfiled)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#71717a]" />
                <span>Tags (comma separated)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[10px] text-[#09090b] text-xs focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>
          </div>

          {/* Expiration Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
            <div>
              <label className="block font-semibold text-[#09090b] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#71717a]" />
                <span>Expires At (Date & Time)</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1 flex items-center gap-1">
                <MousePointerClick className="w-3.5 h-3.5 text-[#71717a]" />
                <span>Max Clicks Limit</span>
              </label>
              <input
                type="number"
                min="1"
                value={maxClicks}
                onChange={(e) => setMaxClicks(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
              />
            </div>
          </div>

          {/* Password Protection & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-[#09090b] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#71717a]" />
                  <span>Password Protection</span>
                </label>
                <input
                  type="checkbox"
                  checked={isPasswordProtected}
                  onChange={(e) => setIsPasswordProtected(e.target.checked)}
                  className="rounded text-[#09090b] focus:ring-black cursor-pointer"
                />
              </div>
              {isPasswordProtected && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set access passcode"
                  className="w-full px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs mt-1 text-[#09090b] outline-none focus:border-[#09090b]"
                />
              )}
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Link Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b] cursor-pointer"
              >
                <option value="active">Active (Redirecting)</option>
                <option value="disabled">Disabled (Paused)</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Redirect Code */}
          <div className="flex items-center gap-4 pt-1">
            <span className="font-semibold text-[#09090b]">HTTP Redirect:</span>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#09090b]">
              <input
                type="radio"
                name="editRedirect"
                checked={redirectType === 301}
                onChange={() => setRedirectType(301)}
                className="text-[#09090b]"
              />
              <span>301 (Permanent)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-[#09090b]">
              <input
                type="radio"
                name="editRedirect"
                checked={redirectType === 302}
                onChange={() => setRedirectType(302)}
                className="text-[#09090b]"
              />
              <span>302 (Temporary)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e4e4e7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#f4f4f5] text-[#09090b] border border-[#e4e4e7] rounded-[10px] font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-[#09090b] hover:bg-[#27272a] text-white rounded-[10px] font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
