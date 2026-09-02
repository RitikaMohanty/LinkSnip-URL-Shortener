import React, { useState } from "react";
import { X, Upload, FileText, Download, CheckCircle2, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { LinkItem, FolderItem } from "../types";

interface BulkShortenModalProps {
  folders: FolderItem[];
  onLinksCreated: (newLinks: LinkItem[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const BulkShortenModal: React.FC<BulkShortenModalProps> = ({
  folders,
  onLinksCreated,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'csv' | 'paste'>('csv');
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [textUrls, setTextUrls] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [bulkTag, setBulkTag] = useState("BulkImport");

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    totalCreated: number;
    errors: { row: number; url: string; error: string }[];
    createdLinks: LinkItem[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setCsvContent(content || "");
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const template = `originalUrl,customAlias,title,tags
https://example.com/summer-sale,summer-deal,Summer Sale Promotion,Promo,Social
https://myblog.io/2026/how-to-scale,scale-article,Scale Guide 2026,Blog,Tech
https://github.com/myorg/sdk,sdk-repo,Official Developer SDK,DevRel,GitHub`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linksnip_bulk_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvLines = (text: string) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const items: any[] = [];
    const hasHeader = lines[0].toLowerCase().includes("url") || lines[0].toLowerCase().includes("http");
    const startIndex = hasHeader && lines[0].toLowerCase().includes("url") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(",").map(p => p.trim().replace(/^["']|["']$/g, ""));
      if (parts.length > 0 && parts[0]) {
        items.push({
          originalUrl: parts[0],
          customAlias: parts[1] || undefined,
          title: parts[2] || undefined,
          tags: parts[3] ? [parts[3], bulkTag] : [bulkTag],
          folderId: selectedFolder || undefined,
        });
      }
    }
    return items;
  };

  const parseTextPasted = (text: string) => {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    return lines.map((url, idx) => ({
      originalUrl: url,
      title: `Batch Link #${idx + 1}`,
      tags: [bulkTag],
      folderId: selectedFolder || undefined,
    }));
  };

  const handleSubmit = async () => {
    let itemsToProcess: any[] = [];

    if (activeTab === 'csv') {
      itemsToProcess = parseCsvLines(csvContent);
    } else {
      itemsToProcess = parseTextPasted(textUrls);
    }

    if (itemsToProcess.length === 0) {
      alert("No valid URLs found to shorten. Please upload a CSV file or paste URLs.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToProcess }),
      });

      const data = await res.json();
      if (res.ok) {
        setResults({
          totalCreated: data.totalCreated,
          errors: data.errors || [],
          createdLinks: data.links || [],
        });
        if (data.links && data.links.length > 0) {
          onLinksCreated(data.links);
        }
      }
    } catch (err) {
      console.error("Bulk shorten failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-[16px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e4e4e7]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e4e4e7]">
          <div>
            <h2 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-lg font-bold text-[#09090b]"
            >
              Bulk URL Shortening
            </h2>
            <p className="text-xs text-[#71717a]">Shorten multiple links simultaneously via CSV upload or batch list.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#09090b] hover:bg-[#f1f5f9] rounded-[8px] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-[#e4e4e7] pb-2">
            <button
              onClick={() => { setActiveTab('csv'); setResults(null); }}
              className={`px-3 py-1.5 rounded-[8px] font-semibold transition-colors cursor-pointer ${
                activeTab === 'csv'
                  ? 'bg-[#09090b] text-white'
                  : 'text-[#71717a] hover:bg-[#f1f5f9] hover:text-[#09090b]'
              }`}
            >
              CSV File Upload
            </button>
            <button
              onClick={() => { setActiveTab('paste'); setResults(null); }}
              className={`px-3 py-1.5 rounded-[8px] font-semibold transition-colors cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-[#09090b] text-white'
                  : 'text-[#71717a] hover:bg-[#f1f5f9] hover:text-[#09090b]'
              }`}
            >
              Paste URL List
            </button>
          </div>

          {/* CSV View */}
          {activeTab === 'csv' && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-[#e4e4e7] rounded-[14px] p-6 text-center hover:border-[#09090b] transition-colors bg-[#f8fafc]">
                <Upload className="w-8 h-8 text-[#71717a] mx-auto mb-2" />
                <p className="font-semibold text-[#09090b] text-sm mb-1">
                  {fileName ? fileName : "Upload your CSV file"}
                </p>
                <p className="text-[#71717a] text-xs mb-3">
                  Expected header: <span className="font-mono text-[#09090b]">originalUrl,customAlias,title,tags</span>
                </p>

                <label className="px-4 py-2 bg-[#09090b] hover:bg-[#27272a] text-white font-semibold rounded-[10px] inline-block cursor-pointer shadow-xs transition-colors">
                  <span>Browse CSV File</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-[#09090b] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV Template</span>
                </button>
              </div>
            </div>
          )}

          {/* Paste URLs View */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="block font-semibold text-[#09090b]">
                Paste Destination URLs (one per line)
              </label>
              <textarea
                rows={6}
                value={textUrls}
                onChange={(e) => setTextUrls(e.target.value)}
                placeholder="https://example.com/item-1&#10;https://example.com/item-2&#10;https://example.com/item-3"
                className="w-full p-3 bg-white border border-[#e4e4e7] rounded-[10px] font-mono text-xs text-[#09090b] focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
              />
            </div>
          )}

          {/* Common Batch Configurations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#f8fafc] rounded-[10px] border border-[#e4e4e7]">
            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Assign to Folder</label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
              >
                <option value="">No Folder (General)</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#09090b] mb-1">Batch Tag</label>
              <input
                type="text"
                value={bulkTag}
                onChange={(e) => setBulkTag(e.target.value)}
                placeholder="e.g. Bulk2026"
                className="w-full px-3 py-1.5 bg-white border border-[#e4e4e7] rounded-[8px] text-xs text-[#09090b] outline-none focus:border-[#09090b]"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          {results && (
            <div className="p-4 bg-[#ecfdf5] border border-[#a7f3d0] rounded-[10px] space-y-2">
              <div className="flex items-center gap-2 text-[#059669] font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                <span>Successfully generated {results.totalCreated} short links!</span>
              </div>
              {results.errors.length > 0 && (
                <div className="text-[#b45309] text-[11px] pt-1">
                  <span className="font-semibold">{results.errors.length} rows skipped due to invalid URLs:</span>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    {results.errors.slice(0, 3).map((err, i) => (
                      <li key={i}>Row {err.row}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e4e4e7]">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#f4f4f5] text-[#09090b] border border-[#e4e4e7] rounded-[10px] font-semibold transition-colors cursor-pointer"
            >
              {results ? "Close" : "Cancel"}
            </button>

            {!results && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-5 py-2 bg-[#09090b] hover:bg-[#27272a] text-white rounded-[10px] font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Generate Short Links</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
