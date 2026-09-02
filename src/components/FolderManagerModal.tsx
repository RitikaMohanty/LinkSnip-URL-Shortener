import React, { useState } from "react";
import { X, FolderPlus, Folder, Trash2 } from "lucide-react";
import { FolderItem } from "../types";

interface FolderManagerModalProps {
  folders: FolderItem[];
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: (newFolder: FolderItem) => void;
  onFolderDeleted: (id: string) => void;
}

const PRESET_COLORS = [
  "#09090b", // deep black
  "#2563eb", // blue
  "#059669", // emerald
  "#8b5cf6", // purple
  "#d97706", // amber
  "#e11d48", // rose
  "#475569", // slate
];

export const FolderManagerModal: React.FC<FolderManagerModalProps> = ({
  folders,
  isOpen,
  onClose,
  onFolderCreated,
  onFolderDeleted,
}) => {
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setErrorMsg("Folder name is required");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          color: selectedColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create folder");

      onFolderCreated(data.folder);
      setNewFolderName("");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not create folder");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this folder? Associated links will become unorganized.")) return;
    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (res.ok) {
        onFolderDeleted(id);
      }
    } catch (err) {
      console.error("Delete folder failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-[16px] max-w-md w-full shadow-2xl border border-[#e4e4e7] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e4e4e7]">
          <div>
            <h2 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-base font-bold text-[#09090b]"
            >
              Manage Folders
            </h2>
            <p className="text-xs text-[#71717a]">Organize campaigns and related short links</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[8px] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Create new folder form */}
          <form onSubmit={handleCreateFolder} className="p-4 bg-[#f8fafc] rounded-[12px] border border-[#e4e4e7] space-y-3">
            <span className="font-semibold text-[#09090b] block">Create New Folder</span>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Q3 Growth Campaign"
              className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b] focus:ring-3 focus:ring-black/5"
            />

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                      selectedColor === c ? 'scale-125 border-[#09090b] ring-2 ring-black/10' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-3.5 py-1.5 bg-[#09090b] hover:bg-[#27272a] text-white font-semibold rounded-[8px] shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Add Folder</span>
              </button>
            </div>

            {errorMsg && <p className="text-[#dc2626] text-[11px]">{errorMsg}</p>}
          </form>

          {/* Existing folders list */}
          <div className="space-y-2">
            <span className="font-semibold text-[#71717a] block text-[11px] uppercase tracking-wider">
              Existing Folders ({folders.length})
            </span>

            {folders.length === 0 ? (
              <p className="text-[#71717a] py-4 text-center">No custom folders created yet</p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {folders.map((fld) => (
                  <div
                    key={fld.id}
                    className="flex items-center justify-between p-2.5 bg-white border border-[#e4e4e7] rounded-[10px] hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: fld.color }} />
                      <span className="font-semibold text-[#09090b]">{fld.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteFolder(fld.id)}
                      title="Delete folder"
                      className="p-1 text-[#71717a] hover:text-[#dc2626] hover:bg-[#fef2f2] rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#e4e4e7] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#e4e4e7] hover:bg-[#f4f4f5] text-[#09090b] font-semibold rounded-[8px] text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
