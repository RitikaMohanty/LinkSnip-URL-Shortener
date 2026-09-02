import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowUpDown, Trash2, Archive, Folder, CheckSquare, Square, RefreshCw, Layers } from "lucide-react";
import { LinkItem, FolderItem, UserProfile } from "../types";
import { LinkCard } from "./LinkCard";

interface LinkListProps {
  links: LinkItem[];
  folders: FolderItem[];
  isLoading: boolean;
  user?: UserProfile | null;
  onRefresh: () => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (shortCode: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkArchive: (ids: string[]) => void;
  onOpenQrModal: (link: LinkItem) => void;
  onViewAnalytics: (shortCode: string) => void;
  onToggleStatus: (shortCode: string, currentStatus: string) => void;
}

export const LinkList: React.FC<LinkListProps> = ({
  links,
  folders,
  isLoading,
  user,
  onRefresh,
  onEdit,
  onDelete,
  onBulkDelete,
  onBulkArchive,
  onOpenQrModal,
  onViewAnalytics,
  onToggleStatus,
}) => {
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Collect unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    links.forEach(l => l.tags?.forEach(t => set.add(t)));
    return Array.from(set);
  }, [links]);
  const [selectedTag, setSelectedTag] = useState("all");

  // Filter and Sort links
  const filteredLinks = useMemo(() => {
    let result = [...links];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        l =>
          l.title.toLowerCase().includes(q) ||
          l.shortCode.toLowerCase().includes(q) ||
          l.originalUrl.toLowerCase().includes(q) ||
          l.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (selectedFolder !== "all") {
      if (selectedFolder === "unfiled") {
        result = result.filter(l => !l.folderId);
      } else {
        result = result.filter(l => l.folderId === selectedFolder);
      }
    }

    if (selectedTag !== "all") {
      result = result.filter(l => l.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()));
    }

    if (selectedStatus !== "all") {
      if (selectedStatus === "expired") {
        result = result.filter(l => l.status === "expired" || (l.expiresAt && new Date(l.expiresAt).getTime() < Date.now()));
      } else if (selectedStatus === "protected") {
        result = result.filter(l => l.isPasswordProtected);
      } else {
        result = result.filter(l => l.status === selectedStatus);
      }
    }

    if (sortBy === "clicks_desc") {
      result.sort((a, b) => b.clicks - a.clicks);
    } else if (sortBy === "clicks_asc") {
      result.sort((a, b) => a.clicks - b.clicks);
    } else if (sortBy === "title_asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [links, search, selectedFolder, selectedTag, selectedStatus, sortBy]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredLinks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLinks.map(l => l.id));
    }
  };

  const isAllSelected = filteredLinks.length > 0 && selectedIds.length === filteredLinks.length;

  return (
    <div className="space-y-4">
      {/* Search, Filters, and Sorters Bar */}
      <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-links"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search links by title, slug, destination URL, or tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e4e4e7] rounded-[10px] text-xs sm:text-sm text-[#09090b] placeholder-[#71717a] focus:outline-none focus:border-[#09090b] focus:ring-3 focus:ring-black/5 transition-all"
            />
          </div>

          {/* Controls Group */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Folder Filter */}
            <div className="flex items-center bg-white border border-[#e4e4e7] rounded-[10px] px-3 py-2 text-xs text-[#09090b]">
              <Folder className="w-3.5 h-3.5 text-[#71717a] mr-2" />
              <select
                id="filter-folder"
                value={selectedFolder}
                onChange={e => setSelectedFolder(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#09090b] outline-none cursor-pointer"
              >
                <option value="all">All Folders ({links.length})</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
                <option value="unfiled">Unorganized</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-white border border-[#e4e4e7] rounded-[10px] px-3 py-2 text-xs text-[#09090b]">
              <Filter className="w-3.5 h-3.5 text-[#71717a] mr-2" />
              <select
                id="filter-status"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#09090b] outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active Links</option>
                <option value="expired">Expired</option>
                <option value="protected">Password Protected</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center bg-white border border-[#e4e4e7] rounded-[10px] px-3 py-2 text-xs text-[#09090b]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#71717a] mr-2" />
              <select
                id="select-sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-[#09090b] outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="clicks_desc">Most Clicks</option>
                <option value="clicks_asc">Fewest Clicks</option>
                <option value="title_asc">Title (A-Z)</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              id="btn-refresh-links"
              onClick={onRefresh}
              title="Refresh Links"
              className="p-2.5 text-[#52525b] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[10px] border border-[#e4e4e7] transition-colors cursor-pointer bg-white"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tag pills filter row */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
            <span className="text-[#71717a] text-[11px] font-semibold mr-1">Tags:</span>
            <button
              onClick={() => setSelectedTag("all")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                selectedTag === "all"
                  ? 'bg-[#09090b] text-white shadow-2xs'
                  : 'bg-[#f1f5f9] text-[#52525b] hover:text-[#09090b] hover:bg-[#e4e4e7]'
              }`}
            >
              All Tags
            </button>
            {allTags.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  selectedTag === t
                    ? 'bg-[#09090b] text-white shadow-2xs'
                    : 'bg-[#f1f5f9] text-[#52525b] hover:text-[#09090b] hover:bg-[#e4e4e7]'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Bar (Visible when items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-[#09090b] text-white rounded-[12px] shadow-sm animate-fade-in text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-white" />
            <span>{selectedIds.length} link{selectedIds.length > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkArchive(selectedIds)}
              className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer border border-[#3f3f46]"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Disable / Archive</span>
            </button>

            <button
              onClick={() => onBulkDelete(selectedIds)}
              className="px-3 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-[8px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Header with Select All */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-[#71717a]">
        <button
          onClick={handleSelectAll}
          className="flex items-center gap-2 hover:text-[#09090b] transition-colors cursor-pointer"
        >
          {isAllSelected ? (
            <CheckSquare className="w-4 h-4 text-[#09090b]" />
          ) : (
            <Square className="w-4 h-4 text-[#71717a]" />
          )}
          <span>Select All ({filteredLinks.length})</span>
        </button>

        <span>Showing {filteredLinks.length} of {links.length} links</span>
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-[10px] bg-[#f1f5f9] text-[#09090b] mx-auto flex items-center justify-center mb-3 border border-[#e4e4e7]">
            <Layers className="w-6 h-6" />
          </div>
          <h3 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="text-base font-bold text-[#09090b] mb-1"
          >
            No Links Found
          </h3>
          <p className="text-xs text-[#71717a] max-w-sm mx-auto">
            {search || selectedFolder !== "all" || selectedTag !== "all"
              ? "No links matched your active filter or search query. Try clearing filters."
              : "You haven't shortened any URLs yet. Use the shortener above or import a CSV file."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map(link => (
            <LinkCard
              key={link.id}
              link={link}
              isSelected={selectedIds.includes(link.id)}
              user={user}
              onToggleSelect={handleToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpenQrModal={onOpenQrModal}
              onViewAnalytics={onViewAnalytics}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
