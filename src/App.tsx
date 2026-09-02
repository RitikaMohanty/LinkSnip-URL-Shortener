import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./components/LandingPage";
import { QuickShortenCard } from "./components/QuickShortenCard";
import { LinkList } from "./components/LinkList";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { BulkShortenModal } from "./components/BulkShortenModal";
import { EditLinkModal } from "./components/EditLinkModal";
import { QrCodeModal } from "./components/QrCodeModal";
import { FolderManagerModal } from "./components/FolderManagerModal";
import { ApiDocsView } from "./components/ApiDocsView";
import { SecurityScannerView } from "./components/SecurityScannerView";
import { AccountSettingsModal } from "./components/AccountSettingsModal";
import { LinkItem, FolderItem, UserProfile } from "./types";
import { Sparkles, Link2, BarChart3, Upload, ShieldCheck, ArrowRight } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'links' | 'analytics' | 'bulk' | 'api' | 'security'>('links');
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);

  // Analytics focus
  const [selectedAnalyticsCode, setSelectedAnalyticsCode] = useState<string>("all");

  // Modals
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [qrModalLink, setQrModalLink] = useState<LinkItem | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalTab, setAccountModalTab] = useState<'login' | 'signup' | 'settings'>('login');

  // Fetch initial data
  const fetchInitialData = async () => {
    setIsLoadingLinks(true);
    try {
      const [linksRes, foldersRes, authRes] = await Promise.all([
        fetch("/api/links"),
        fetch("/api/folders"),
        fetch("/api/auth/me"),
      ]);

      if (linksRes.ok) {
        const data = await linksRes.json();
        setLinks(data.links || []);
      }
      if (foldersRes.ok) {
        const data = await foldersRes.json();
        setFolders(data.folders || []);
      }
      if (authRes.ok) {
        const data = await authRes.json();
        setUser(data.user || null);
      }
    } catch (err) {
      console.error("Initial data loading error:", err);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleOpenAuthModal = (tab: 'login' | 'signup' | 'settings' = 'login') => {
    setAccountModalTab(tab);
    setIsAccountModalOpen(true);
  };

  // Handlers
  const handleLinkCreated = (newLink: LinkItem) => {
    setLinks(prev => [newLink, ...prev.filter(l => l.id !== newLink.id)]);
  };

  const handleLinkUpdated = (updatedLink: LinkItem) => {
    setLinks(prev => prev.map(l => (l.id === updatedLink.id ? updatedLink : l)));
  };

  const handleDeleteLink = async (shortCode: string) => {
    if (!confirm(`Are you sure you want to delete /r/${shortCode}?`)) return;
    try {
      const res = await fetch(`/api/links/${shortCode}`, { method: "DELETE" });
      if (res.ok) {
        setLinks(prev => prev.filter(l => l.shortCode !== shortCode));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Permanently delete ${ids.length} selected links?`)) return;
    try {
      const res = await fetch("/api/links/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const idSet = new Set(ids);
        setLinks(prev => prev.filter(l => !idSet.has(l.id)));
      }
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
  };

  const handleBulkArchive = async (ids: string[]) => {
    try {
      const res = await fetch("/api/links/bulk-archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status: "disabled" }),
      });
      if (res.ok) {
        const idSet = new Set(ids);
        setLinks(prev => prev.map(l => (idSet.has(l.id) ? { ...l, status: "disabled" } : l)));
      }
    } catch (err) {
      console.error("Bulk archive failed:", err);
    }
  };

  const handleToggleStatus = async (shortCode: string, currentStatus: string) => {
    const nextStatus = currentStatus === "disabled" ? "active" : "disabled";
    try {
      const res = await fetch(`/api/links/${shortCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        handleLinkUpdated(data.link);
      }
    } catch (err) {
      console.error("Toggle status failed:", err);
    }
  };

  const handleViewAnalytics = (code: string) => {
    if (!user) {
      handleOpenAuthModal('login');
      return;
    }
    setSelectedAnalyticsCode(code);
    setActiveTab("analytics");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRegenerateKey = async () => {
    try {
      const res = await fetch("/api/auth/regenerate-api-key", { method: "POST" });
      const data = await res.json();
      if (res.ok && user) {
        setUser({ ...user, apiKey: data.apiKey });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#09090b] flex flex-col font-sans">
      {showLandingPage ? (
        <>
          {/* Landing Page Navbar */}
          <header className="sticky top-0 z-40 bg-white/95 border-b border-[#e4e4e7] shadow-xs backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div
                  className="flex items-center gap-2.5 cursor-pointer"
                  onClick={() => setShowLandingPage(true)}
                >
                  <div className="w-9 h-9 rounded-[10px] bg-[#09090b] text-white flex items-center justify-center shadow-sm">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', color: '#09090b' }}>
                    LinkSnip
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {user ? (
                    <button
                      onClick={() => { setShowLandingPage(false); setActiveTab('links'); }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#09090b] hover:bg-[#27272a] text-white text-sm font-semibold rounded-[10px] shadow-sm transition-all cursor-pointer"
                    >
                      <span>Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenAuthModal('login')}
                        className="px-3.5 py-2 text-[#52525b] hover:text-[#09090b] hover:bg-[#f1f5f9] text-sm font-medium rounded-[10px] transition-all cursor-pointer"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => { setShowLandingPage(false); setActiveTab('links'); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#09090b] hover:bg-[#27272a] text-white text-sm font-semibold rounded-[10px] shadow-sm transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Get Started</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Landing Page Content */}
          <main className="flex-1" style={{ background: '#f8fafc' }}>
            <LandingPage
              folders={folders}
              user={user}
              onLinkCreated={handleLinkCreated}
              onEnterDashboard={() => { setShowLandingPage(false); setActiveTab('links'); }}
              onOpenAuthModal={handleOpenAuthModal}
            />
          </main>

          {/* Landing Page Footer */}
          <footer className="border-t border-[#e4e4e7] bg-white py-6 text-xs text-[#71717a]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#09090b]" style={{ fontFamily: "'Outfit', sans-serif" }}>LinkSnip</span>
                <span>•</span>
                <span>Fast 301/302 Redirection &lt; 100ms</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <button onClick={() => { setShowLandingPage(false); setActiveTab('api'); }} className="hover:text-[#09090b] transition-colors cursor-pointer">
                  REST API Docs
                </button>
                <button onClick={() => { setShowLandingPage(false); setActiveTab('security'); }} className="hover:text-[#09090b] transition-colors cursor-pointer">
                  Safe Browsing
                </button>
              </div>
            </div>
          </footer>

          {/* Account Settings Modal (needed for login from landing page) */}
          <AccountSettingsModal
            user={user}
            isOpen={isAccountModalOpen}
            initialTab={accountModalTab}
            onClose={() => setIsAccountModalOpen(false)}
            onUserUpdated={(u) => setUser(u)}
          />
        </>
      ) : (
        <>
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAccountModal={handleOpenAuthModal}
        onOpenFolderModal={() => setIsFolderModalOpen(true)}
        onQuickShortenClick={() => {
          setActiveTab("links");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onGoHome={() => setShowLandingPage(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* TAB 1: LINKS & SHORTENER */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            {/* Quick Shortener Hero Card */}
            <QuickShortenCard
              folders={folders}
              user={user}
              onLinkCreated={handleLinkCreated}
              onOpenQrModal={(link) => setQrModalLink(link)}
              onViewAnalytics={handleViewAnalytics}
              onOpenAuthModal={handleOpenAuthModal}
            />

            {/* Links List View */}
            <LinkList
              links={links}
              folders={folders}
              isLoading={isLoadingLinks}
              user={user}
              onRefresh={fetchInitialData}
              onEdit={(link) => setEditingLink(link)}
              onDelete={handleDeleteLink}
              onBulkDelete={handleBulkDelete}
              onBulkArchive={handleBulkArchive}
              onOpenQrModal={(link) => setQrModalLink(link)}
              onViewAnalytics={handleViewAnalytics}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        )}

        {/* TAB 2: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            links={links}
            selectedCode={selectedAnalyticsCode}
            onSelectCode={setSelectedAnalyticsCode}
            user={user}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {/* TAB 3: BULK SHORTENER */}
        {activeTab === 'bulk' && (
          <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-xl font-bold text-[#09090b]"
                >
                  Bulk Link Creation
                </h2>
                <p className="text-xs text-[#71717a]">Upload CSV spreadsheets or paste multiple long URLs.</p>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2 bg-[#09090b] hover:bg-[#27272a] text-white rounded-[10px] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Open Bulk Wizard</span>
              </button>
            </div>

            <div className="p-8 border-2 border-dashed border-[#e4e4e7] rounded-[14px] text-center bg-[#f8fafc]">
              <div className="w-12 h-12 rounded-[10px] bg-white border border-[#e4e4e7] text-[#09090b] mx-auto mb-3 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <h3 
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-base font-bold text-[#09090b] mb-1"
              >
                Batch Import Engine
              </h3>
              <p className="text-xs text-[#71717a] max-w-md mx-auto mb-4">
                Generate up to 100 shortened links in a single payload with custom aliases, folders, tags, and expiration parameters.
              </p>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-5 py-2.5 bg-[#09090b] hover:bg-[#27272a] text-white rounded-[10px] text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Launch Bulk CSV Uploader &rarr;
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: REST API & OPENAPI DOCS */}
        {activeTab === 'api' && (
          <ApiDocsView
            user={user}
            onRegenerateKey={handleRegenerateKey}
          />
        )}

        {/* TAB 5: SAFE BROWSING SECURITY SCANNER */}
        {activeTab === 'security' && (
          <SecurityScannerView />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#e4e4e7] bg-white py-6 text-xs text-[#71717a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="font-bold text-[#09090b]"
            >
              LinkSnip URL Shortener
            </span>
            <span>•</span>
            <span>Fast 301/302 Redirection &lt; 100ms</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={() => setActiveTab('api')} className="hover:text-[#09090b] transition-colors cursor-pointer">
              REST API Docs
            </button>
            <button onClick={() => setActiveTab('security')} className="hover:text-[#09090b] transition-colors cursor-pointer">
              Safe Browsing
            </button>
            <button onClick={() => setIsFolderModalOpen(true)} className="hover:text-[#09090b] transition-colors cursor-pointer">
              Folders
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EditLinkModal
        link={editingLink}
        folders={folders}
        isOpen={Boolean(editingLink)}
        user={user}
        onClose={() => setEditingLink(null)}
        onSaved={handleLinkUpdated}
        onOpenAuthModal={handleOpenAuthModal}
      />

      <QrCodeModal
        link={qrModalLink}
        isOpen={Boolean(qrModalLink)}
        onClose={() => setQrModalLink(null)}
      />

      <BulkShortenModal
        folders={folders}
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onLinksCreated={(newLinks) => setLinks(prev => [...newLinks, ...prev])}
      />

      <FolderManagerModal
        folders={folders}
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onFolderCreated={(folder) => setFolders(prev => [...prev, folder])}
        onFolderDeleted={(id) => {
          setFolders(prev => prev.filter(f => f.id !== id));
          setLinks(prev => prev.map(l => l.folderId === id ? { ...l, folderId: undefined, folderName: undefined } : l));
        }}
      />

      <AccountSettingsModal
        user={user}
        isOpen={isAccountModalOpen}
        initialTab={accountModalTab}
        onClose={() => setIsAccountModalOpen(false)}
        onUserUpdated={(u) => setUser(u)}
      />
        </>
      )}
    </div>
  );
}
