import React, { useState, useEffect } from "react";
import { X, Download, Copy, Check, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { LinkItem } from "../types";

interface QrCodeModalProps {
  link: LinkItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ link, isOpen, onClose }) => {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [colorDark, setColorDark] = useState<string>("#09090b");
  const [colorLight] = useState<string>("#ffffff");
  const [copied, setCopied] = useState(false);

  const hostUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullShortUrl = link ? `${hostUrl}/r/${link.shortCode}` : "";

  useEffect(() => {
    if (link && isOpen) {
      QRCode.toDataURL(fullShortUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: colorDark,
          light: colorLight,
        },
      })
        .then((url) => {
          setDataUrl(url);
        })
        .catch((err) => {
          console.error("QR Code generation error:", err);
        });
    }
  }, [link, isOpen, colorDark, colorLight, fullShortUrl]);

  if (!isOpen || !link) return null;

  const downloadPNG = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `linksnip_qr_${link.shortCode}.png`;
    a.click();
  };

  const downloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(fullShortUrl, {
        type: "svg",
        color: { dark: colorDark, light: colorLight },
      });
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linksnip_qr_${link.shortCode}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("SVG generation error:", err);
    }
  };

  const copyImageToClipboard = async () => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const colorPresets = [
    { label: "Classic Black", dark: "#000000" },
    { label: "Slate Dark", dark: "#09090b" },
    { label: "Midnight Blue", dark: "#1e293b" },
    { label: "Royal Indigo", dark: "#4338ca" },
    { label: "Emerald Green", dark: "#059669" },
    { label: "Amber Orange", dark: "#d97706" },
  ];

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
              QR Code Generator
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

        {/* QR Display */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#f8fafc]">
          <div className="p-4 bg-white rounded-[14px] shadow-xs border border-[#e4e4e7] mb-4">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR code for ${link.title}`}
                className="w-52 h-52 rounded-[8px] object-contain"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-[#71717a] text-xs">
                Generating QR...
              </div>
            )}
          </div>

          <p className="text-xs font-semibold text-[#09090b] text-center max-w-xs truncate mb-1">
            {link.title}
          </p>
          <span className="text-xs font-mono text-[#09090b] font-bold">
            {fullShortUrl}
          </span>
        </div>

        {/* Color Customization & Actions */}
        <div className="p-5 border-t border-[#e4e4e7] space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#09090b] mb-2">QR Code Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {colorPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setColorDark(preset.dark)}
                  className={`w-7 h-7 rounded-full transition-transform border-2 cursor-pointer ${
                    colorDark === preset.dark ? 'scale-110 border-[#09090b] ring-2 ring-black/10' : 'border-white hover:scale-105 shadow-2xs'
                  }`}
                  style={{ backgroundColor: preset.dark }}
                  title={preset.label}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={copyImageToClipboard}
              className="px-3 py-2 bg-white hover:bg-[#f4f4f5] text-[#09090b] border border-[#e4e4e7] rounded-[10px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#059669]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              onClick={downloadPNG}
              className="px-3 py-2 bg-[#09090b] hover:bg-[#27272a] text-white rounded-[10px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>PNG</span>
            </button>

            <button
              onClick={downloadSVG}
              className="px-3 py-2 bg-white hover:bg-[#f4f4f5] text-[#09090b] border border-[#e4e4e7] rounded-[10px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
