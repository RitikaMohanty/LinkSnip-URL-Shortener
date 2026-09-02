import React, { useState } from "react";
import {
  Link2,
  Sparkles,
  BarChart3,
  QrCode,
  Lock,
  Timer,
  Code2,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Zap,
  Globe,
  Shield,
} from "lucide-react";
import { LinkItem, FolderItem, UserProfile } from "../types";

interface LandingPageProps {
  folders: FolderItem[];
  user: UserProfile | null;
  onLinkCreated: (newLink: LinkItem) => void;
  onEnterDashboard: () => void;
  onOpenAuthModal: (tab?: "login" | "signup") => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  folders,
  user,
  onLinkCreated,
  onEnterDashboard,
  onOpenAuthModal,
}) => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdLink, setCreatedLink] = useState<LinkItem | null>(null);
  const [copied, setCopied] = useState(false);

  const hostUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalUrl.trim()) {
      setErrorMsg("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl: originalUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to shorten link");
      }

      setCreatedLink(data.link);
      onLinkCreated(data.link);
      setOriginalUrl("");
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

  const features = [
    {
      icon: <Link2 className="lp-feature-icon" />,
      title: "Custom Aliases",
      description:
        "Create memorable, branded short links with custom back-halves like /r/my-brand instead of random strings.",
    },
    {
      icon: <BarChart3 className="lp-feature-icon" />,
      title: "Real-Time Analytics",
      description:
        "Track clicks, referrers, geography, devices, and browsers with detailed charts and time-series data.",
    },
    {
      icon: <QrCode className="lp-feature-icon" />,
      title: "QR Code Generation",
      description:
        "Instantly generate downloadable QR codes for any short link. Customize colors and export as PNG or SVG.",
    },
    {
      icon: <Lock className="lp-feature-icon" />,
      title: "Password Protection",
      description:
        "Gate access to sensitive links with password-protected redirects. Only authorized visitors can proceed.",
    },
    {
      icon: <Timer className="lp-feature-icon" />,
      title: "Expiring Links",
      description:
        "Set expiration dates or click limits on any short link. Auto-disable after reaching your thresholds.",
    },
    {
      icon: <Code2 className="lp-feature-icon" />,
      title: "Developer REST API",
      description:
        "Full programmatic access via a RESTful API with API key authentication. Build integrations and automate.",
    },
  ];

  return (
    <div className="lp-container">
      {/* Hero Section */}
      <section className="lp-hero-section">
        <div className="lp-hero-pill">
          <Sparkles size={14} />
          <span>Next-Gen URL Shortening & Real-Time Intelligence</span>
        </div>

        <h1 className="lp-hero-title">
          Shorten. Share.
          <br />
          Measure Everything.
        </h1>

        <p className="lp-hero-subtitle">
          Transform long, cumbersome URLs into fast, branded short links. Gain
          instant visibility into clicks, referrers, geography, and devices.
        </p>

        {/* Inline URL Shortener Card */}
        <div className="lp-shortener-card">
          <form onSubmit={handleSubmit}>
            <div className="lp-shortener-input-row">
              <input
                type="text"
                className="lp-shortener-url-input"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="Paste your long URL here..."
              />
              <button
                type="submit"
                disabled={isLoading}
                className="lp-btn lp-btn-primary"
              >
                {isLoading ? (
                  <span className="lp-spinner" />
                ) : (
                  <Sparkles size={16} />
                )}
                <span>Shorten</span>
              </button>
            </div>

          </form>

          {/* Error */}
          {errorMsg && <div className="lp-error-msg">{errorMsg}</div>}

          {/* Result */}
          {createdLink && (
            <div className="lp-result-box">
              <div className="lp-result-url-group">
                <span className="lp-result-short-url">
                  {hostUrl}/r/{createdLink.shortCode}
                </span>
                <span className="lp-result-original-url">
                  → {createdLink.originalUrl}
                </span>
              </div>
              <div className="lp-result-actions">
                <button
                  onClick={() =>
                    handleCopy(`${hostUrl}/r/${createdLink.shortCode}`)
                  }
                  className="lp-btn lp-btn-secondary lp-btn-sm"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
                <a
                  href={`/r/${createdLink.shortCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="lp-btn lp-btn-primary lp-btn-sm"
                >
                  <span>Visit</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Strip */}
      <section className="lp-stats-strip">
        <div className="lp-stat-item">
          <Zap size={20} />
          <div>
            <div className="lp-stat-value">&lt; 100ms</div>
            <div className="lp-stat-label">Redirect Speed</div>
          </div>
        </div>
        <div className="lp-stat-item">
          <Globe size={20} />
          <div>
            <div className="lp-stat-value">301/302</div>
            <div className="lp-stat-label">HTTP Redirects</div>
          </div>
        </div>
        <div className="lp-stat-item">
          <Shield size={20} />
          <div>
            <div className="lp-stat-value">Safe Browsing</div>
            <div className="lp-stat-label">Malware Scanner</div>
          </div>
        </div>
        <div className="lp-stat-item">
          <BarChart3 size={20} />
          <div>
            <div className="lp-stat-value">Real-Time</div>
            <div className="lp-stat-label">Click Analytics</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="lp-features-section">
        <h2 className="lp-features-title">
          Everything you need to manage links at scale
        </h2>
        <p className="lp-features-subtitle">
          Powerful features for marketers, developers, and teams who need
          control over their links.
        </p>
        <div className="lp-features-grid">
          {features.map((feature, i) => (
            <div key={i} className="lp-feature-card">
              <div className="lp-feature-icon-box">{feature.icon}</div>
              <h3 className="lp-feature-card-title">{feature.title}</h3>
              <p className="lp-feature-card-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="lp-bottom-cta">
        <h2 className="lp-bottom-cta-title">
          Ready to shorten smarter?
        </h2>
        <p className="lp-bottom-cta-subtitle">
          Start creating branded, trackable short links in seconds — no credit card required.
        </p>
        <div className="lp-bottom-cta-actions">
          {!user ? (
            <>
              <button
                onClick={() => onOpenAuthModal("signup")}
                className="lp-btn lp-btn-primary lp-btn-lg"
              >
                <span>Create Free Account</span>
              </button>
              <button
                onClick={() => onOpenAuthModal("login")}
                className="lp-btn lp-btn-secondary lp-btn-lg"
              >
                <span>Sign In</span>
              </button>
            </>
          ) : (
            <button
              onClick={onEnterDashboard}
              className="lp-btn lp-btn-primary lp-btn-lg"
            >
              <span>View My Links</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
