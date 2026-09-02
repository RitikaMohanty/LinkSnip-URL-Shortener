import React, { useState } from "react";
import { Code2, Copy, Check, Play, KeyRound, ExternalLink } from "lucide-react";
import { UserProfile } from "../types";

interface ApiDocsViewProps {
  user: UserProfile | null;
  onRegenerateKey: () => void;
}

export const ApiDocsView: React.FC<ApiDocsViewProps> = ({ user, onRegenerateKey }) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'openapi' | 'tester'>('endpoints');

  // Interactive tester states
  const [testEndpoint, setTestEndpoint] = useState("/api/shorten");
  const [testMethod, setTestMethod] = useState<"GET" | "POST">("POST");
  const [testBody, setTestBody] = useState(
    JSON.stringify(
      {
        originalUrl: "https://stripe.com/docs/api",
        customAlias: "stripe-docs",
        title: "Stripe API Documentation",
        tags: ["Payments", "API"],
      },
      null,
      2
    )
  );
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const apiKey = user?.apiKey || "ls_live_9a87d6f5e4c3b2a10987654321fedcba";

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    if (id === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCurl(id);
      setTimeout(() => setCopiedCurl(null), 2000);
    }
  };

  const executeApiTest = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const options: RequestInit = {
        method: testMethod,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
      };
      if (testMethod === "POST" && testBody) {
        options.body = testBody;
      }
      const res = await fetch(testEndpoint, options);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  const curlExampleShorten = `curl -X POST "${typeof window !== "undefined" ? window.location.origin : ""}/api/shorten" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "originalUrl": "https://example.com/special-deal",
    "customAlias": "deal2026",
    "title": "Summer Promotion",
    "tags": ["Marketing", "Promo"]
  }'`;

  const curlExampleAnalytics = `curl -X GET "${typeof window !== "undefined" ? window.location.origin : ""}/api/analytics/deal2026" \\
  -H "Authorization: Bearer ${apiKey}"`;

  const jsExample = `// Node.js / Browser Fetch
const response = await fetch('/api/shorten', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    originalUrl: 'https://news.ycombinator.com',
    customAlias: 'hn-frontpage'
  })
});
const data = await response.json();
console.log('Short URL:', data.link.shortCode);`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & API Key */}
      <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-[#09090b] text-white rounded-[10px]">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-xl font-bold text-[#09090b]"
            >
              Developer REST API & OpenAPI
            </h2>
          </div>
          <p className="text-xs text-[#71717a]">
            Build integrations, automate URL shortening pipelines, and consume real-time analytics telemetry.
          </p>
        </div>

        {/* API Key Box */}
        <div className="bg-[#f8fafc] border border-[#e4e4e7] rounded-[12px] p-3 w-full md:w-auto">
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="text-[11px] font-bold text-[#71717a] uppercase tracking-wider flex items-center gap-1">
              <KeyRound className="w-3 h-3 text-[#09090b]" />
              Active API Token
            </span>
            <button
              onClick={onRegenerateKey}
              className="text-[11px] text-[#09090b] hover:underline font-semibold cursor-pointer"
            >
              Regenerate
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="px-2.5 py-1 bg-white border border-[#e4e4e7] rounded-[6px] font-mono text-xs text-[#09090b] font-semibold select-all">
              {apiKey.slice(0, 16)}••••••••
            </code>
            <button
              id="btn-copy-api-token"
              onClick={() => handleCopy(apiKey, "key")}
              className="px-2.5 py-1 bg-white hover:bg-[#f4f4f5] border border-[#e4e4e7] text-[#09090b] rounded-[6px] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e4e4e7] pb-2">
        <button
          onClick={() => setActiveTab('endpoints')}
          className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'endpoints' ? 'bg-[#09090b] text-white shadow-xs' : 'text-[#71717a] hover:bg-[#f1f5f9] hover:text-[#09090b]'
          }`}
        >
          REST Endpoints & Code Snippets
        </button>
        <button
          onClick={() => setActiveTab('tester')}
          className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'tester' ? 'bg-[#09090b] text-white shadow-xs' : 'text-[#71717a] hover:bg-[#f1f5f9] hover:text-[#09090b]'
          }`}
        >
          Interactive API Console
        </button>
        <button
          onClick={() => setActiveTab('openapi')}
          className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'openapi' ? 'bg-[#09090b] text-white shadow-xs' : 'text-[#71717a] hover:bg-[#f1f5f9] hover:text-[#09090b]'
          }`}
        >
          OpenAPI Specification JSON
        </button>
      </div>

      {/* Tab: Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="space-y-6">
          {/* POST /api/shorten */}
          <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#09090b] text-white font-bold rounded-[6px] text-xs font-mono">
                  POST
                </span>
                <span className="font-mono text-sm font-bold text-[#09090b]">/api/shorten</span>
              </div>
              <button
                onClick={() => handleCopy(curlExampleShorten, "shorten")}
                className="px-2.5 py-1 text-[#09090b] hover:bg-[#f4f4f5] border border-[#e4e4e7] rounded-[8px] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedCurl === "shorten" ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy cURL</span>
              </button>
            </div>
            <p className="text-xs text-[#71717a] mb-3">
              Generates a new shortened link with optional custom slug, tags, expiration rules, or password protection.
            </p>
            <div className="bg-[#09090b] rounded-[10px] p-4 text-[#f1f5f9] font-mono text-xs overflow-x-auto border border-[#27272a]">
              <pre>{curlExampleShorten}</pre>
            </div>
          </div>

          {/* GET /api/analytics/:code */}
          <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#27272a] text-white font-bold rounded-[6px] text-xs font-mono">
                  GET
                </span>
                <span className="font-mono text-sm font-bold text-[#09090b]">/api/analytics/:code</span>
              </div>
              <button
                onClick={() => handleCopy(curlExampleAnalytics, "analytics")}
                className="px-2.5 py-1 text-[#09090b] hover:bg-[#f4f4f5] border border-[#e4e4e7] rounded-[8px] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedCurl === "analytics" ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy cURL</span>
              </button>
            </div>
            <p className="text-xs text-[#71717a] mb-3">
              Fetches full click velocity time-series, referrers breakdown, visitor geography, and client device stats.
            </p>
            <div className="bg-[#09090b] rounded-[10px] p-4 text-[#f1f5f9] font-mono text-xs overflow-x-auto border border-[#27272a]">
              <pre>{curlExampleAnalytics}</pre>
            </div>
          </div>

          {/* JavaScript Fetch Example */}
          <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-5 shadow-xs">
            <h3 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-sm font-bold text-[#09090b] mb-2"
            >
              JavaScript / TypeScript SDK Pattern
            </h3>
            <div className="bg-[#09090b] rounded-[10px] p-4 text-[#f1f5f9] font-mono text-xs overflow-x-auto border border-[#27272a]">
              <pre>{jsExample}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Interactive Console */}
      {activeTab === 'tester' && (
        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-6 shadow-xs space-y-4">
          <div>
            <h3 
              style={{ fontFamily: "'Outfit', sans-serif" }}
              className="text-base font-bold text-[#09090b]"
            >
              Interactive API Playground
            </h3>
            <p className="text-xs text-[#71717a]">Test live requests against the LinkSnip REST engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#09090b] mb-1">HTTP Method</label>
              <select
                value={testMethod}
                onChange={(e) => setTestMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[8px] text-xs font-bold font-mono text-[#09090b] outline-none"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-[#09090b] mb-1">Endpoint Path</label>
              <input
                type="text"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#e4e4e7] rounded-[8px] text-xs font-mono text-[#09090b] outline-none focus:border-[#09090b] focus:ring-3 focus:ring-black/5"
              />
            </div>
          </div>

          {testMethod === "POST" && (
            <div>
              <label className="block text-xs font-semibold text-[#09090b] mb-1">JSON Request Body</label>
              <textarea
                rows={5}
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                className="w-full p-3 bg-[#09090b] text-[#f1f5f9] border border-[#27272a] rounded-[10px] font-mono text-xs outline-none"
              />
            </div>
          )}

          <button
            onClick={executeApiTest}
            disabled={isTesting}
            className="px-5 py-2.5 bg-[#09090b] hover:bg-[#27272a] text-white rounded-[10px] font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            {isTesting ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Send Request</span>
          </button>

          {testResponse && (
            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#09090b] mb-1">HTTP Response Body</label>
              <div className="bg-[#09090b] rounded-[10px] p-4 text-[#f1f5f9] border border-[#27272a] font-mono text-xs overflow-x-auto max-h-72">
                <pre>{testResponse}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: OpenAPI JSON */}
      {activeTab === 'openapi' && (
        <div className="bg-white border border-[#e4e4e7] rounded-[14px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 
                style={{ fontFamily: "'Outfit', sans-serif" }}
                className="text-base font-bold text-[#09090b]"
              >
                OpenAPI 3.0 Specification
              </h3>
              <p className="text-xs text-[#71717a]">Live endpoint at <span className="font-mono text-[#09090b]">/api/docs/openapi.json</span></p>
            </div>
            <a
              href="/api/docs/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-white border border-[#e4e4e7] hover:bg-[#f4f4f5] text-[#09090b] rounded-[8px] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>View Raw JSON</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="bg-[#09090b] rounded-[10px] p-4 text-[#f1f5f9] border border-[#27272a] font-mono text-xs overflow-x-auto max-h-96">
            <pre>
              {JSON.stringify(
                {
                  openapi: "3.0.0",
                  info: {
                    title: "LinkSnip REST API",
                    version: "1.0.0",
                    description: "High-performance URL shortening, dynamic routing, safe browsing, and real-time click stream analytics API.",
                  },
                  paths: {
                    "/shorten": { post: { summary: "Create Short Link", responses: { 201: { description: "Created" } } } },
                    "/links": { get: { summary: "List Links" } },
                    "/links/{code}": { get: { summary: "Get Link Details" }, patch: { summary: "Update Link Target" }, delete: { summary: "Delete Link" } },
                    "/analytics/{code}": { get: { summary: "Get Link Analytics" } },
                    "/bulk": { post: { summary: "Bulk Shorten URLs" } },
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
