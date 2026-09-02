import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Search, CheckCircle2, Lock, Sparkles } from "lucide-react";

export const SecurityScannerView: React.FC = () => {
  const [testUrl, setTestUrl] = useState("https://shop.acmebrand.com/summer-sale");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    score: 'safe' | 'suspicious' | 'flagged';
    reason?: string;
    checkedUrl: string;
    timestamp: string;
  } | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;

    setIsScanning(true);
    try {
      const res = await fetch("/api/security/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl }),
      });
      const data = await res.json();
      setScanResult({
        score: data.score,
        reason: data.reason,
        checkedUrl: testUrl,
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const sampleUrls = [
    { label: "Legitimate E-Commerce", url: "https://shop.acmebrand.com/deals" },
    { label: "Official Docs", url: "https://developer.mozilla.org/en-US/" },
    { label: "Phishing Test Pattern", url: "https://secure-login-account-verify-login-security.com/update" },
    { label: "IP Literal Pattern", url: "http://192.168.1.100/admin" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-[#09090b] text-white rounded-[10px]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-xl font-bold text-[#09090b]"
            >
              Safe Browsing & Security Scanner
            </h2>
            <p className="text-xs text-[#71717a]">
              LinkSnip screens destination links against malware, phishing signatures, and deceptive domain patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Scanner Box */}
      <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-6 shadow-xs space-y-4">
        <h3 
          style={{ fontFamily: "'Outfit', sans-serif" }}
          className="text-sm font-bold text-[#09090b]"
        >
          Inspect Any URL in Real-Time
        </h3>

        <form onSubmit={handleScan} className="flex flex-col sm:flex-row items-stretch gap-2.5">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter full destination URL to inspect..."
            required
            className="flex-1 px-4 py-3 bg-white border border-[#e4e4e7] rounded-[10px] text-xs sm:text-sm font-mono text-[#09090b] focus:border-[#09090b] focus:ring-3 focus:ring-black/5 outline-none"
          />
          <button
            type="submit"
            disabled={isScanning}
            className="px-6 py-3 bg-[#09090b] hover:bg-[#27272a] text-white font-semibold text-xs sm:text-sm rounded-[10px] shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isScanning ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Scan URL Safety</span>
          </button>
        </form>

        {/* Quick Sample Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-[#71717a] font-semibold text-[11px]">Test Presets:</span>
          {sampleUrls.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setTestUrl(s.url); }}
              className="px-2.5 py-1 bg-[#f1f5f9] hover:bg-[#e4e4e7] text-[#52525b] hover:text-[#09090b] rounded-[6px] text-[11px] font-medium transition-colors cursor-pointer"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Scan Result Card */}
        {scanResult && (
          <div
            className={`p-5 rounded-[12px] border mt-4 animate-fade-in ${
              scanResult.score === 'safe'
                ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                : scanResult.score === 'suspicious'
                ? 'bg-[#fffbeb] border-[#fde68a] text-[#92400e]'
                : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.score === 'safe' ? (
                <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0 mt-0.5" />
              ) : scanResult.score === 'suspicious' ? (
                <AlertTriangle className="w-6 h-6 text-[#d97706] shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-[#dc2626] shrink-0 mt-0.5" />
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                    className="text-base font-bold capitalize"
                  >
                    Status: {scanResult.score === 'safe' ? 'Clean & Safe to Redirect' : `${scanResult.score} Risk Identified`}
                  </h4>
                  <span className="text-[11px] opacity-75 font-mono">
                    Scanned at {scanResult.timestamp}
                  </span>
                </div>

                <p className="text-xs font-mono break-all opacity-90">
                  {scanResult.checkedUrl}
                </p>

                {scanResult.reason && (
                  <p className="text-xs font-semibold pt-1">
                    Threat Details: {scanResult.reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security Architecture Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
          <div className="p-2 bg-[#f1f5f9] text-[#09090b] rounded-[8px] w-fit mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="font-bold text-[#09090b] mb-1"
          >
            Pre-Ingestion Screening
          </h4>
          <p className="text-[#71717a] leading-relaxed">
            Every shortened link undergoes automated heuristics for deceptive homographs, phishing keywords, and unverified IP literals.
          </p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
          <div className="p-2 bg-[#f1f5f9] text-[#09090b] rounded-[8px] w-fit mb-3">
            <Lock className="w-4 h-4" />
          </div>
          <h4 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="font-bold text-[#09090b] mb-1"
          >
            Passcode Access Gates
          </h4>
          <p className="text-[#71717a] leading-relaxed">
            Protect confidential documents and sensitive previews with custom access passphrases verified before redirection.
          </p>
        </div>

        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
          <div className="p-2 bg-[#f1f5f9] text-[#09090b] rounded-[8px] w-fit mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            className="font-bold text-[#09090b] mb-1"
          >
            Automated Expiration
          </h4>
          <p className="text-[#71717a] leading-relaxed">
            Configure links to automatically expire once a maximum click threshold or scheduled deadline is reached.
          </p>
        </div>
      </div>
    </div>
  );
};
