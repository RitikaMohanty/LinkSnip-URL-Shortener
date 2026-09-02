import React from "react";
import { Link2, BarChart3, Upload, Code2, FolderPlus, ShieldCheck, User, Sparkles, LogIn, UserPlus } from "lucide-react";
import { UserProfile } from "../types";

interface NavbarProps {
  activeTab: 'links' | 'analytics' | 'bulk' | 'api' | 'security';
  setActiveTab: (tab: 'links' | 'analytics' | 'bulk' | 'api' | 'security') => void;
  user: UserProfile | null;
  onOpenAccountModal: (tab?: 'login' | 'signup' | 'settings') => void;
  onOpenFolderModal: () => void;
  onQuickShortenClick: () => void;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAccountModal,
  onOpenFolderModal,
  onQuickShortenClick,
  onGoHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-[#e4e4e7] shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <div 
              id="brand-logo" 
              onClick={() => onGoHome ? onGoHome() : setActiveTab('links')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-[10px] bg-[#09090b] text-white flex items-center justify-center shadow-xs group-hover:bg-[#27272a] transition-colors">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="font-extrabold text-xl tracking-tight text-[#09090b]"
                  >
                    LinkSnip
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f1f5f9] text-[#52525b] px-2 py-0.5 rounded-full border border-[#e4e4e7]">
                    v1.0
                  </span>
                </div>
                <p className="text-xs text-[#71717a] font-medium hidden sm:block">URL Shortener & Analytics</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1.5">
              <button
                id="nav-tab-links"
                onClick={() => setActiveTab('links')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'links'
                    ? 'bg-[#09090b] text-white shadow-xs'
                    : 'text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9]'
                }`}
              >
                <Link2 className="w-4 h-4" />
                Links
              </button>

              <button
                id="nav-tab-analytics"
                onClick={() => {
                  if (!user) {
                    onOpenAccountModal('login');
                  } else {
                    setActiveTab('analytics');
                  }
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#09090b] text-white shadow-xs'
                    : 'text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
                {!user && <Lock className="w-3 h-3 text-[#71717a]" />}
              </button>

              <button
                id="nav-tab-bulk"
                onClick={() => setActiveTab('bulk')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'bulk'
                    ? 'bg-[#09090b] text-white shadow-xs'
                    : 'text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9]'
                }`}
              >
                <Upload className="w-4 h-4" />
                Bulk CSV
              </button>

              <button
                id="nav-tab-api"
                onClick={() => setActiveTab('api')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'api'
                    ? 'bg-[#09090b] text-white shadow-xs'
                    : 'text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9]'
                }`}
              >
                <Code2 className="w-4 h-4" />
                REST API
              </button>

              <button
                id="nav-tab-security"
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'bg-[#09090b] text-white shadow-xs'
                    : 'text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Safe Browsing
              </button>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {user && (
              <button
                id="btn-nav-folders"
                onClick={onOpenFolderModal}
                title="Manage Folders"
                className="p-2 text-[#52525b] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[10px] transition-colors border border-[#e4e4e7] hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-white cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-[#71717a]" />
                Folders
              </button>
            )}

            <button
              id="btn-nav-quick-shorten"
              onClick={onQuickShortenClick}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#09090b] hover:bg-[#27272a] text-white text-xs sm:text-sm font-semibold rounded-[10px] shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Shorten URL</span>
            </button>

            {/* User Profile / Auth Action Buttons */}
            {user ? (
              <button
                id="btn-user-profile"
                onClick={() => onOpenAccountModal('settings')}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 border border-[#e4e4e7] rounded-[10px] hover:bg-[#f4f4f5] transition-colors bg-white shadow-2xs cursor-pointer"
              >
                <div className="w-7 h-7 rounded-[8px] bg-[#f1f5f9] text-[#09090b] flex items-center justify-center font-bold text-xs border border-[#e4e4e7]">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-[#09090b] leading-none">{user.name || "My Account"}</p>
                  <span className="text-[10px] text-[#059669] font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block"></span>
                    {user.plan || "Pro"} Plan
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-login"
                  onClick={() => onOpenAccountModal('login')}
                  className="px-3.5 py-2 text-[#52525b] hover:text-[#09090b] hover:bg-[#f1f5f9] text-xs font-semibold rounded-[10px] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  id="btn-nav-signup"
                  onClick={() => onOpenAccountModal('signup')}
                  className="hidden sm:flex px-3.5 py-2 bg-[#09090b] hover:bg-[#27272a] text-white text-xs font-semibold rounded-[10px] shadow-xs transition-all items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2.5 space-x-2 border-t border-[#e4e4e7] text-xs font-medium">
          <button
            onClick={() => setActiveTab('links')}
            className={`px-3 py-1.5 rounded-[8px] shrink-0 font-semibold cursor-pointer ${activeTab === 'links' ? 'bg-[#09090b] text-white' : 'bg-[#f1f5f9] text-[#52525b]'}`}
          >
            Links
          </button>
          <button
            onClick={() => {
              if (!user) {
                onOpenAccountModal('login');
              } else {
                setActiveTab('analytics');
              }
            }}
            className={`px-3 py-1.5 rounded-[8px] shrink-0 font-semibold flex items-center gap-1 cursor-pointer ${activeTab === 'analytics' ? 'bg-[#09090b] text-white' : 'bg-[#f1f5f9] text-[#52525b]'}`}
          >
            <span>Analytics</span>
            {!user && <Lock className="w-3 h-3 text-[#71717a]" />}
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3 py-1.5 rounded-[8px] shrink-0 font-semibold cursor-pointer ${activeTab === 'bulk' ? 'bg-[#09090b] text-white' : 'bg-[#f1f5f9] text-[#52525b]'}`}
          >
            Bulk CSV
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-[8px] shrink-0 font-semibold cursor-pointer ${activeTab === 'api' ? 'bg-[#09090b] text-white' : 'bg-[#f1f5f9] text-[#52525b]'}`}
          >
            REST API
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-[8px] shrink-0 font-semibold cursor-pointer ${activeTab === 'security' ? 'bg-[#09090b] text-white' : 'bg-[#f1f5f9] text-[#52525b]'}`}
          >
            Safe Browsing
          </button>
        </div>
      </div>
    </header>
  );
};
