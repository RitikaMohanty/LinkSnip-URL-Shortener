// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};
var __dirname = getDirname();
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT) : 3e3;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var rateLimits = /* @__PURE__ */ new Map();
function rateLimiter(limit = 180, windowMs = 60 * 1e3) {
  return (req, res, next) => {
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
    const now = Date.now();
    let entry = rateLimits.get(ip);
    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      rateLimits.set(ip, entry);
    } else {
      entry.count++;
    }
    const remaining = Math.max(0, limit - entry.count);
    const resetSec = Math.ceil((entry.resetAt - now) / 1e3);
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", resetSec);
    if (entry.count > limit) {
      return res.status(429).json({
        error: "Too many requests. Rate limit exceeded. Please try again later.",
        retryAfter: resetSec
      });
    }
    next();
  };
}
app.use("/api", rateLimiter(180, 60 * 1e3));
var BASE62_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function generateShortCode(length = 6) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS.charAt(Math.floor(Math.random() * BASE62_CHARS.length));
  }
  return result;
}
function scanUrlSafety(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const flaggedKeywords = ["phishing", "stealer", "malware-drop", "account-verify-login-security", "free-crypto-giveaway-claim"];
    const suspiciousTlds = [".xyz-danger", ".top-malicious", ".download-exe"];
    for (const kw of flaggedKeywords) {
      if (url.toLowerCase().includes(kw)) {
        return { score: "flagged", reason: `High-risk signature detected matching: "${kw}"` };
      }
    }
    for (const tld of suspiciousTlds) {
      if (host.endsWith(tld)) {
        return { score: "suspicious", reason: `Uncommon high-risk domain extension "${tld}"` };
      }
    }
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
      return { score: "suspicious", reason: "Direct IP address destination instead of standard domain name" };
    }
    return { score: "safe" };
  } catch {
    return { score: "suspicious", reason: "Unusual URL formatting or protocol structure" };
  }
}
function parseUserAgent(ua = "") {
  let device = "Desktop";
  if (/iPad|Tablet|PlayBook/i.test(ua)) device = "Tablet";
  else if (/Mobile|Android|iPhone|iPod|BlackBerry/i.test(ua)) device = "Mobile";
  let browser = "Chrome";
  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/OPR|Opera/i.test(ua)) browser = "Opera";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else browser = "Other";
  let os = "macOS";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS|Macintosh/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";
  return { device, browser, os };
}
function normalizeReferrer(ref = "") {
  if (!ref || ref.trim() === "") return "Direct / Email";
  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host.includes("google")) return "Google Search";
    if (host.includes("twitter") || host.includes("t.co") || host.includes("x.com")) return "Twitter / X";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("reddit")) return "Reddit";
    if (host.includes("youtube")) return "YouTube";
    if (host.includes("github")) return "GitHub";
    if (host.includes("tiktok")) return "TikTok";
    if (host.includes("medium")) return "Medium";
    if (host.includes("news.ycombinator.com")) return "Hacker News";
    return host;
  } catch {
    return ref.slice(0, 30);
  }
}
var SAMPLE_CITIES = [
  { city: "San Francisco", country: "United States", countryCode: "US" },
  { city: "New York", country: "United States", countryCode: "US" },
  { city: "London", country: "United Kingdom", countryCode: "GB" },
  { city: "Berlin", country: "Germany", countryCode: "DE" },
  { city: "Tokyo", country: "Japan", countryCode: "JP" },
  { city: "Toronto", country: "Canada", countryCode: "CA" },
  { city: "Bengaluru", country: "India", countryCode: "IN" },
  { city: "Paris", country: "France", countryCode: "FR" },
  { city: "Sydney", country: "Australia", countryCode: "AU" },
  { city: "Singapore", country: "Singapore", countryCode: "SG" },
  { city: "Amsterdam", country: "Netherlands", countryCode: "NL" },
  { city: "Stockholm", country: "Sweden", countryCode: "SE" }
];
function getRandomGeo() {
  return SAMPLE_CITIES[Math.floor(Math.random() * SAMPLE_CITIES.length)];
}
var currentUser = null;
var folders = [
  { id: "fld_social", name: "Social Campaigns", color: "#6366f1", userId: "user_pro_01", createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1e3).toISOString() },
  { id: "fld_product", name: "Product Launches", color: "#0ea5e9", userId: "user_pro_01", createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1e3).toISOString() },
  { id: "fld_docs", name: "Documentation & SDKs", color: "#10b981", userId: "user_pro_01", createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1e3).toISOString() },
  { id: "fld_promos", name: "Seasonal Discounts", color: "#f59e0b", userId: "user_pro_01", createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1e3).toISOString() }
];
var links = [
  {
    id: "lnk_01",
    shortCode: "summersale",
    customAlias: "summersale",
    originalUrl: "https://shop.acmebrand.com/collections/summer-deals?utm_source=twitter&utm_medium=social&utm_campaign=summer_promo_26",
    title: "Acme Brand Summer 2026 Promo",
    createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1e3).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1e3).toISOString(),
    userId: "user_pro_01",
    clicks: 1428,
    tags: ["Marketing", "Summer2026", "E-Commerce"],
    folderId: "fld_promos",
    folderName: "Seasonal Discounts",
    expiresAt: null,
    maxClicks: 5e3,
    isPasswordProtected: false,
    redirectType: 301,
    status: "active",
    utmSource: "twitter",
    utmMedium: "social",
    utmCampaign: "summer_promo_26",
    safetyScore: "safe"
  },
  {
    id: "lnk_02",
    shortCode: "docs-v2",
    customAlias: "docs-v2",
    originalUrl: "https://docs.linksnip.io/getting-started/quickstart-api-guide",
    title: "LinkSnip API v2 Quickstart Documentation",
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1e3).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 3600 * 1e3).toISOString(),
    userId: "user_pro_01",
    clicks: 852,
    tags: ["DevRel", "API", "Docs"],
    folderId: "fld_docs",
    folderName: "Documentation & SDKs",
    expiresAt: null,
    maxClicks: null,
    isPasswordProtected: false,
    redirectType: 302,
    status: "active",
    safetyScore: "safe"
  },
  {
    id: "lnk_03",
    shortCode: "k9xL2p",
    originalUrl: "https://www.producthunt.com/posts/linksnip-url-shortener",
    title: "LinkSnip on Product Hunt Launch",
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1e3).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1e3).toISOString(),
    userId: "user_pro_01",
    clicks: 640,
    tags: ["Launch", "ProductHunt"],
    folderId: "fld_product",
    folderName: "Product Launches",
    expiresAt: null,
    maxClicks: null,
    isPasswordProtected: false,
    redirectType: 301,
    status: "active",
    safetyScore: "safe"
  },
  {
    id: "lnk_04",
    shortCode: "vip-briefing",
    customAlias: "vip-briefing",
    originalUrl: "https://notion.so/acme/q3-strategy-roadmap-confidential-7a6b5c",
    title: "Q3 Strategy Board Roadmap (Confidential)",
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1e3).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1e3).toISOString(),
    userId: "user_pro_01",
    clicks: 43,
    tags: ["Executive", "Internal"],
    folderId: void 0,
    expiresAt: new Date(Date.now() + 14 * 24 * 3600 * 1e3).toISOString(),
    maxClicks: 100,
    isPasswordProtected: true,
    password: "board2026pass",
    redirectType: 302,
    status: "active",
    safetyScore: "safe"
  },
  {
    id: "lnk_05",
    shortCode: "beta-signup",
    customAlias: "beta-signup",
    originalUrl: "https://typeform.com/to/linksnip-early-access-beta",
    title: "Closed Beta Tester Registration",
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1e3).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 3600 * 1e3).toISOString(),
    userId: "user_pro_01",
    clicks: 300,
    tags: ["Beta", "Feedback"],
    folderId: "fld_product",
    folderName: "Product Launches",
    expiresAt: new Date(Date.now() - 2 * 24 * 3600 * 1e3).toISOString(),
    maxClicks: 300,
    isPasswordProtected: false,
    redirectType: 302,
    status: "expired",
    safetyScore: "safe"
  }
];
var clickEvents = [];
function seedHistoricalClicks() {
  const referrersPool = ["Twitter / X", "LinkedIn", "Google Search", "Direct / Email", "Reddit", "Facebook", "Hacker News", "Product Hunt", "YouTube"];
  const devicesPool = ["Desktop", "Desktop", "Mobile", "Mobile", "Mobile", "Tablet"];
  const browsersPool = ["Chrome", "Chrome", "Safari", "Safari", "Firefox", "Edge"];
  const osPool = ["macOS", "Windows", "iOS", "Android", "Linux"];
  for (const link of links) {
    const totalToGenerate = link.clicks;
    const daysBack = link.id === "lnk_01" ? 12 : link.id === "lnk_02" ? 8 : 5;
    for (let i = 0; i < totalToGenerate; i++) {
      const randomDayOffset = Math.random() * daysBack;
      const ts = new Date(Date.now() - randomDayOffset * 24 * 3600 * 1e3 + Math.random() * 864e5).toISOString();
      const geo = SAMPLE_CITIES[Math.floor(Math.random() * SAMPLE_CITIES.length)];
      clickEvents.push({
        id: `clk_${Math.random().toString(36).substring(2, 10)}`,
        linkId: link.id,
        shortCode: link.shortCode,
        timestamp: ts,
        referrer: referrersPool[Math.floor(Math.random() * referrersPool.length)],
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        device: devicesPool[Math.floor(Math.random() * devicesPool.length)],
        browser: browsersPool[Math.floor(Math.random() * browsersPool.length)],
        os: osPool[Math.floor(Math.random() * osPool.length)],
        ip: `198.51.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      });
    }
  }
}
seedHistoricalClicks();
app.get("/api/health", (_req, res) => {
  res.json({ status: "healthy", service: "LinkSnip URL Shortener v1.0", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/auth/me", (_req, res) => {
  res.json({ user: currentUser });
});
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  currentUser = {
    id: currentUser?.id || `usr_${Date.now()}`,
    email,
    name: req.body.name || (currentUser?.name && currentUser.email === email ? currentUser.name : email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase())),
    apiKey: currentUser?.apiKey || `ls_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
    isVerified: true,
    plan: currentUser?.plan || "Pro",
    createdAt: currentUser?.createdAt || (/* @__PURE__ */ new Date()).toISOString()
  };
  res.json({ success: true, user: currentUser });
});
app.post("/api/auth/register", (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  currentUser = {
    id: `usr_${Date.now()}`,
    email,
    name: name || email.split("@")[0].replace(".", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    apiKey: `ls_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
    isVerified: true,
    plan: "Pro",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  res.json({ success: true, user: currentUser });
});
app.post("/api/auth/logout", (_req, res) => {
  currentUser = null;
  res.json({ success: true, message: "Logged out successfully" });
});
app.post("/api/auth/reset-password", (req, res) => {
  const { email } = req.body;
  res.json({ success: true, message: `Password reset instructions sent to ${email || currentUser?.email || "your email"}` });
});
app.post("/api/auth/verify-email", (_req, res) => {
  if (currentUser) {
    currentUser.isVerified = true;
  }
  res.json({ success: true, message: "Email successfully verified!" });
});
app.post("/api/auth/regenerate-api-key", (_req, res) => {
  if (!currentUser) return res.status(401).json({ error: "Not logged in" });
  currentUser.apiKey = `ls_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
  res.json({ success: true, apiKey: currentUser.apiKey });
});
app.get("/api/folders", (_req, res) => {
  const foldersWithCounts = folders.map((fld) => ({
    ...fld,
    linkCount: links.filter((l) => l.folderId === fld.id).length
  }));
  res.json({ folders: foldersWithCounts });
});
app.post("/api/folders", (req, res) => {
  const { name, color } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Folder name is required" });
  const newFolder = {
    id: `fld_${Date.now().toString(36)}`,
    name: name.trim(),
    color: color || "#6366f1",
    userId: currentUser ? currentUser.id : "guest_anonymous",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  folders.push(newFolder);
  res.status(201).json({ folder: { ...newFolder, linkCount: 0 } });
});
app.delete("/api/folders/:id", (req, res) => {
  const { id } = req.params;
  folders = folders.filter((f) => f.id !== id);
  links = links.map((l) => l.folderId === id ? { ...l, folderId: void 0, folderName: void 0 } : l);
  res.json({ success: true, message: "Folder removed" });
});
app.post("/api/security/scan", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  const result = scanUrlSafety(url);
  res.json(result);
});
app.post("/api/shorten", (req, res) => {
  let { originalUrl, customAlias, title, tags, folderId, expiresAt, maxClicks, password, redirectType, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = req.body;
  if (!originalUrl || !originalUrl.trim()) {
    return res.status(400).json({ error: "Original URL is required" });
  }
  originalUrl = originalUrl.trim();
  if (!/^https?:\/\//i.test(originalUrl)) {
    originalUrl = `https://${originalUrl}`;
  }
  try {
    new URL(originalUrl);
  } catch {
    return res.status(400).json({ error: "Invalid URL structure. Please include a valid domain." });
  }
  const safety = scanUrlSafety(originalUrl);
  if (safety.score === "flagged" && !req.body.allowRisk) {
    return res.status(400).json({
      error: `Security Alert: Link flagged by Safe Browsing scanner (${safety.reason || "High-risk security pattern"}).`,
      safetyScore: safety.score,
      safetyReason: safety.reason,
      canOverride: true
    });
  }
  let destinationWithUtm = originalUrl;
  try {
    const urlObj = new URL(originalUrl);
    if (utmSource) urlObj.searchParams.set("utm_source", utmSource);
    if (utmMedium) urlObj.searchParams.set("utm_medium", utmMedium);
    if (utmCampaign) urlObj.searchParams.set("utm_campaign", utmCampaign);
    if (utmTerm) urlObj.searchParams.set("utm_term", utmTerm);
    if (utmContent) urlObj.searchParams.set("utm_content", utmContent);
    destinationWithUtm = urlObj.toString();
  } catch {
  }
  let shortCode = "";
  if (customAlias && customAlias.trim()) {
    if (!currentUser && !req.headers.authorization) {
      return res.status(401).json({
        error: "Custom aliases are only available after signing up or logging in. Please create an account or sign in.",
        requiresAuth: true
      });
    }
    const cleanAlias = customAlias.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (cleanAlias.length < 3 || cleanAlias.length > 30) {
      return res.status(400).json({ error: "Custom alias must be between 3 and 30 characters (letters, numbers, hyphens, underscores)." });
    }
    const existing = links.find((l) => l.shortCode.toLowerCase() === cleanAlias || l.customAlias?.toLowerCase() === cleanAlias);
    if (existing) {
      return res.status(409).json({ error: `Alias "${cleanAlias}" is already in use. Please choose another.` });
    }
    shortCode = cleanAlias;
  } else {
    let attempts = 0;
    do {
      shortCode = generateShortCode(6);
      attempts++;
    } while (links.some((l) => l.shortCode === shortCode) && attempts < 10);
  }
  let folderName = void 0;
  if (folderId) {
    const f = folders.find((folder) => folder.id === folderId);
    if (f) folderName = f.name;
  }
  const newLink = {
    id: `lnk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    shortCode,
    customAlias: customAlias?.trim() ? customAlias.trim().toLowerCase() : void 0,
    originalUrl: destinationWithUtm,
    title: title?.trim() || `${new URL(destinationWithUtm).hostname} Link`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    userId: currentUser ? currentUser.id : "guest_anonymous",
    clicks: 0,
    tags: Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : [],
    folderId: folderId || void 0,
    folderName,
    expiresAt: expiresAt || null,
    maxClicks: maxClicks ? Number(maxClicks) : null,
    isPasswordProtected: Boolean(password && password.trim()),
    password: password?.trim() || void 0,
    redirectType: redirectType === 302 ? 302 : 301,
    status: "active",
    utmSource: utmSource || void 0,
    utmMedium: utmMedium || void 0,
    utmCampaign: utmCampaign || void 0,
    utmTerm: utmTerm || void 0,
    utmContent: utmContent || void 0,
    safetyScore: safety.score,
    safetyReason: safety.reason
  };
  links.unshift(newLink);
  res.status(201).json({ success: true, link: newLink });
});
app.post("/api/bulk", (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Provide an array of items for bulk shortening" });
  }
  const createdLinks = [];
  const errors = [];
  items.forEach((item, idx) => {
    let rawUrl = item.originalUrl || item.url || item.longUrl;
    if (!rawUrl || typeof rawUrl !== "string") {
      errors.push({ row: idx + 1, url: "", error: "Missing destination URL" });
      return;
    }
    rawUrl = rawUrl.trim();
    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = `https://${rawUrl}`;
    }
    try {
      new URL(rawUrl);
    } catch {
      errors.push({ row: idx + 1, url: rawUrl, error: "Invalid URL syntax" });
      return;
    }
    let code = item.customAlias?.trim().toLowerCase();
    if (code) {
      if (links.some((l) => l.shortCode.toLowerCase() === code)) {
        code = generateShortCode(6);
      }
    } else {
      code = generateShortCode(6);
    }
    const safety = scanUrlSafety(rawUrl);
    const link = {
      id: `lnk_bulk_${Date.now()}_${idx}`,
      shortCode: code,
      customAlias: item.customAlias?.trim() ? code : void 0,
      originalUrl: rawUrl,
      title: item.title?.trim() || `${new URL(rawUrl).hostname} Link`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      userId: currentUser ? currentUser.id : "guest_anonymous",
      clicks: 0,
      tags: item.tags ? Array.isArray(item.tags) ? item.tags : item.tags.split(",").map((s) => s.trim()) : ["BulkImport"],
      folderId: item.folderId || void 0,
      expiresAt: item.expiresAt || null,
      maxClicks: item.maxClicks ? Number(item.maxClicks) : null,
      isPasswordProtected: Boolean(item.password),
      password: item.password || void 0,
      redirectType: item.redirectType === 302 ? 302 : 301,
      status: "active",
      safetyScore: safety.score,
      safetyReason: safety.reason
    };
    links.unshift(link);
    createdLinks.push(link);
  });
  res.json({
    success: true,
    totalCreated: createdLinks.length,
    errors,
    links: createdLinks
  });
});
app.get("/api/links", (req, res) => {
  const { search, tag, folderId, status, sort } = req.query;
  let result = [...links];
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    result = result.filter(
      (l) => l.title.toLowerCase().includes(q) || l.shortCode.toLowerCase().includes(q) || l.originalUrl.toLowerCase().includes(q) || l.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (tag && typeof tag === "string" && tag !== "all") {
    result = result.filter((l) => l.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
  }
  if (folderId && typeof folderId === "string" && folderId !== "all") {
    if (folderId === "unfiled") {
      result = result.filter((l) => !l.folderId);
    } else {
      result = result.filter((l) => l.folderId === folderId);
    }
  }
  if (status && typeof status === "string" && status !== "all") {
    result = result.filter((l) => l.status === status);
  }
  if (sort === "clicks_desc") {
    result.sort((a, b) => b.clicks - a.clicks);
  } else if (sort === "clicks_asc") {
    result.sort((a, b) => a.clicks - b.clicks);
  } else if (sort === "title_asc") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  res.json({ links: result, total: result.length });
});
app.get("/api/links/:code", (req, res) => {
  const { code } = req.params;
  const link = links.find((l) => l.shortCode.toLowerCase() === code.toLowerCase() || l.id === code);
  if (!link) {
    return res.status(404).json({ error: "Link not found" });
  }
  res.json({ link });
});
app.patch("/api/links/:code", (req, res) => {
  const { code } = req.params;
  const linkIndex = links.findIndex((l) => l.shortCode.toLowerCase() === code.toLowerCase() || l.id === code);
  if (linkIndex === -1) {
    return res.status(404).json({ error: "Link not found" });
  }
  const existing = links[linkIndex];
  const { originalUrl, customAlias, title, tags, folderId, expiresAt, maxClicks, password, redirectType, status } = req.body;
  let newUrl = existing.originalUrl;
  if (originalUrl && originalUrl.trim()) {
    let clean = originalUrl.trim();
    if (!/^https?:\/\//i.test(clean)) clean = `https://${clean}`;
    try {
      new URL(clean);
      newUrl = clean;
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }
  }
  let newCode = existing.shortCode;
  if (customAlias && customAlias.trim()) {
    const cleanAlias = customAlias.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");
    if (cleanAlias !== existing.shortCode) {
      if (cleanAlias.length < 3 || cleanAlias.length > 30) {
        return res.status(400).json({ error: "Custom alias must be between 3 and 30 characters." });
      }
      const collision = links.find((l) => l.id !== existing.id && l.shortCode.toLowerCase() === cleanAlias);
      if (collision) {
        return res.status(409).json({ error: `Alias "${cleanAlias}" is already taken.` });
      }
      newCode = cleanAlias;
    }
  }
  let folderName = existing.folderName;
  if (folderId !== void 0) {
    if (folderId) {
      const f = folders.find((folder) => folder.id === folderId);
      folderName = f ? f.name : void 0;
    } else {
      folderName = void 0;
    }
  }
  const updated = {
    ...existing,
    shortCode: newCode,
    customAlias: customAlias !== void 0 ? customAlias?.trim() ? newCode : void 0 : existing.customAlias,
    originalUrl: newUrl,
    title: title !== void 0 ? title.trim() : existing.title,
    tags: tags !== void 0 ? Array.isArray(tags) ? tags : existing.tags : existing.tags,
    folderId: folderId !== void 0 ? folderId || void 0 : existing.folderId,
    folderName,
    expiresAt: expiresAt !== void 0 ? expiresAt : existing.expiresAt,
    maxClicks: maxClicks !== void 0 ? maxClicks ? Number(maxClicks) : null : existing.maxClicks,
    isPasswordProtected: password !== void 0 ? Boolean(password && password.trim()) : existing.isPasswordProtected,
    password: password !== void 0 ? password?.trim() || void 0 : existing.password,
    redirectType: redirectType !== void 0 ? redirectType === 302 ? 302 : 301 : existing.redirectType,
    status: status !== void 0 ? status : existing.status,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    safetyScore: newUrl !== existing.originalUrl ? scanUrlSafety(newUrl).score : existing.safetyScore
  };
  links[linkIndex] = updated;
  res.json({ success: true, link: updated });
});
app.delete("/api/links/:code", (req, res) => {
  const { code } = req.params;
  const link = links.find((l) => l.shortCode.toLowerCase() === code.toLowerCase() || l.id === code);
  if (!link) return res.status(404).json({ error: "Link not found" });
  links = links.filter((l) => l.id !== link.id);
  clickEvents = clickEvents.filter((c) => c.linkId !== link.id);
  res.json({ success: true, message: "Link successfully deleted" });
});
app.post("/api/links/bulk-delete", (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "IDs array required" });
  const idSet = new Set(ids);
  links = links.filter((l) => !idSet.has(l.id));
  clickEvents = clickEvents.filter((c) => !idSet.has(c.linkId));
  res.json({ success: true, count: ids.length });
});
app.post("/api/links/bulk-archive", (req, res) => {
  const { ids, status } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ error: "IDs array required" });
  const idSet = new Set(ids);
  links = links.map((l) => idSet.has(l.id) ? { ...l, status: status || "disabled" } : l);
  res.json({ success: true, count: ids.length });
});
app.get("/api/analytics/:code", (req, res) => {
  if (!currentUser && !req.headers.authorization) {
    return res.status(401).json({
      error: "Analytics are only accessible after sign up or log in. Please create an account or sign in to view analytics.",
      requiresAuth: true
    });
  }
  const { code } = req.params;
  const isAll = code === "all" || code === "global";
  let filteredClicks = [];
  let targetLink;
  if (isAll) {
    filteredClicks = [...clickEvents];
  } else {
    targetLink = links.find((l) => l.shortCode.toLowerCase() === code.toLowerCase() || l.id === code);
    if (!targetLink) return res.status(404).json({ error: "Link not found for analytics" });
    filteredClicks = clickEvents.filter((c) => c.linkId === targetLink.id);
  }
  const totalClicks = filteredClicks.length;
  const uniqueIps = new Set(filteredClicks.map((c) => c.ip)).size;
  const dateMap = /* @__PURE__ */ new Map();
  const now = /* @__PURE__ */ new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1e3);
    const key = d.toISOString().split("T")[0];
    dateMap.set(key, 0);
  }
  filteredClicks.forEach((c) => {
    const dStr = c.timestamp.split("T")[0];
    if (dateMap.has(dStr)) {
      dateMap.set(dStr, (dateMap.get(dStr) || 0) + 1);
    }
  });
  const clicksOverTime = Array.from(dateMap.entries()).map(([date, clicks]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    clicks
  }));
  const refMap = {};
  filteredClicks.forEach((c) => {
    refMap[c.referrer] = (refMap[c.referrer] || 0) + 1;
  });
  const referrers = Object.entries(refMap).map(([name, count]) => ({
    name,
    count,
    percentage: totalClicks > 0 ? Math.round(count / totalClicks * 100) : 0
  })).sort((a, b) => b.count - a.count);
  const countryMap = {};
  const cityMap = {};
  filteredClicks.forEach((c) => {
    if (!countryMap[c.country]) countryMap[c.country] = { count: 0, countryCode: c.countryCode };
    countryMap[c.country].count++;
    const cityKey = `${c.city}, ${c.country}`;
    if (!cityMap[cityKey]) cityMap[cityKey] = { count: 0, country: c.country };
    cityMap[cityKey].count++;
  });
  const locations = Object.entries(countryMap).map(([country, data]) => ({
    country,
    countryCode: data.countryCode,
    count: data.count,
    percentage: totalClicks > 0 ? Math.round(data.count / totalClicks * 100) : 0
  })).sort((a, b) => b.count - a.count);
  const cities = Object.entries(cityMap).map(([cityKey, data]) => ({
    city: cityKey.split(",")[0],
    country: data.country,
    count: data.count
  })).sort((a, b) => b.count - a.count).slice(0, 10);
  const devMap = {};
  filteredClicks.forEach((c) => {
    devMap[c.device] = (devMap[c.device] || 0) + 1;
  });
  const devices = Object.entries(devMap).map(([device, count]) => ({
    device,
    count,
    percentage: totalClicks > 0 ? Math.round(count / totalClicks * 100) : 0
  }));
  const browserMap = {};
  filteredClicks.forEach((c) => {
    browserMap[c.browser] = (browserMap[c.browser] || 0) + 1;
  });
  const browsers = Object.entries(browserMap).map(([browser, count]) => ({
    browser,
    count,
    percentage: totalClicks > 0 ? Math.round(count / totalClicks * 100) : 0
  }));
  const osMap = {};
  filteredClicks.forEach((c) => {
    osMap[c.os] = (osMap[c.os] || 0) + 1;
  });
  const osList = Object.entries(osMap).map(([os, count]) => ({
    os,
    count,
    percentage: totalClicks > 0 ? Math.round(count / totalClicks * 100) : 0
  }));
  const recentClicks = [...filteredClicks].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50);
  res.json({
    link: targetLink,
    summary: {
      totalClicks,
      uniqueVisitors: uniqueIps,
      activeLinksCount: links.filter((l) => l.status === "active").length,
      clicksOverTime,
      referrers,
      locations,
      cities,
      devices,
      browsers,
      osList,
      recentClicks
    }
  });
});
app.get("/api/analytics/export/:code", (req, res) => {
  if (!currentUser && !req.headers.authorization) {
    return res.status(401).json({
      error: "Analytics export is only accessible after sign up or log in.",
      requiresAuth: true
    });
  }
  const { code } = req.params;
  const isAll = code === "all";
  let targetEvents = isAll ? clickEvents : clickEvents.filter((c) => c.shortCode.toLowerCase() === code.toLowerCase());
  let csv = "Event ID,Short Code,Timestamp,Referrer,Country,Country Code,City,Device,Browser,OS,IP\n";
  targetEvents.forEach((e) => {
    csv += `"${e.id}","${e.shortCode}","${e.timestamp}","${e.referrer}","${e.country}","${e.countryCode}","${e.city}","${e.device}","${e.browser}","${e.os}","${e.ip}"
`;
  });
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="linksnip_analytics_${code}_${Date.now()}.csv"`);
  res.send(csv);
});
app.post("/api/click/simulate", (req, res) => {
  const { shortCode, referrer, country, device, browser } = req.body;
  const link = links.find((l) => l.shortCode.toLowerCase() === (shortCode || "").toLowerCase());
  if (!link) return res.status(404).json({ error: "Link not found for simulation" });
  const geo = country ? SAMPLE_CITIES.find((c) => c.country.toLowerCase() === country.toLowerCase()) || getRandomGeo() : getRandomGeo();
  const newEvent = {
    id: `clk_sim_${Date.now()}`,
    linkId: link.id,
    shortCode: link.shortCode,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    referrer: referrer || "Twitter / X",
    country: geo.country,
    countryCode: geo.countryCode,
    city: geo.city,
    device: device || "Desktop",
    browser: browser || "Chrome",
    os: "macOS",
    ip: `172.56.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
  };
  link.clicks++;
  clickEvents.push(newEvent);
  if (link.maxClicks && link.clicks >= link.maxClicks) {
    link.status = "expired";
  }
  res.json({ success: true, event: newEvent, linkClicks: link.clicks });
});
app.get("/api/docs/openapi.json", (_req, res) => {
  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "LinkSnip REST API",
      version: "1.0.0",
      description: "High-performance URL shortening, dynamic routing, safe browsing scanning, and real-time click stream analytics API.",
      contact: { name: "LinkSnip Developer Support", email: "developers@linksnip.io" }
    },
    servers: [{ url: "/api", description: "LinkSnip Core API Gateway" }],
    paths: {
      "/shorten": {
        post: {
          summary: "Create Short Link",
          description: "Generates a unique short URL with custom alias, UTM tags, password protection, and expiration parameters.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["originalUrl"],
                  properties: {
                    originalUrl: { type: "string", example: "https://mybrand.com/new-product" },
                    customAlias: { type: "string", example: "launch2026" },
                    title: { type: "string", example: "Product Launch Page" },
                    tags: { type: "array", items: { type: "string" }, example: ["Marketing", "Launch"] },
                    folderId: { type: "string", example: "fld_social" },
                    expiresAt: { type: "string", format: "date-time", example: "2026-12-31T23:59:59Z" },
                    maxClicks: { type: "integer", example: 5e3 },
                    password: { type: "string", example: "secret123" },
                    redirectType: { type: "integer", enum: [301, 302], default: 301 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Link created successfully" },
            400: { description: "Invalid URL or parameters" },
            409: { description: "Alias collision" }
          }
        }
      },
      "/links": {
        get: {
          summary: "List Links",
          description: "Retrieve paginated, filterable, and sortable list of shortened links.",
          parameters: [
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "tag", in: "query", schema: { type: "string" } },
            { name: "folderId", in: "query", schema: { type: "string" } },
            { name: "status", in: "query", schema: { type: "string", enum: ["active", "expired", "disabled"] } },
            { name: "sort", in: "query", schema: { type: "string", enum: ["newest", "clicks_desc", "title_asc"] } }
          ],
          responses: { 200: { description: "Links array returned" } }
        }
      },
      "/links/{code}": {
        get: {
          summary: "Get Link Details",
          parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Link record" }, 404: { description: "Link not found" } }
        },
        patch: {
          summary: "Update Short Link",
          description: "Modify destination URL dynamically, update alias, or change expiration parameters without altering original short link.",
          parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Link updated" } }
        },
        delete: {
          summary: "Delete Short Link",
          parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Link deleted" } }
        }
      },
      "/analytics/{code}": {
        get: {
          summary: "Get Link Analytics",
          description: "Returns click time-series, referrers, geographic breakdowns, and client device stats.",
          parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Analytics aggregate metrics" } }
        }
      },
      "/bulk": {
        post: {
          summary: "Bulk Link Shortening",
          description: "Batch create multiple short links in a single payload.",
          responses: { 200: { description: "Batch creation summary" } }
        }
      }
    }
  };
  res.json(openApiSpec);
});
app.get(["/r/:code", "/s/:code"], (req, res) => {
  const { code } = req.params;
  const providedPassword = req.query.pwd;
  const link = links.find((l) => l.shortCode.toLowerCase() === code.toLowerCase());
  if (!link) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Link Not Found - LinkSnip</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; color: #09090b; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
          .card { background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 40px; max-width: 480px; width: 100%; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05); text-align: center; }
          .badge { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
          h1 { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 10px; color: #09090b; }
          p { color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
          .btn { background: #09090b; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; border: none; cursor: pointer; }
          .btn:hover { background: #27272a; transform: translateY(-1px); }
          .slug-box { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; padding: 3px 8px; border-radius: 6px; font-size: 13px; color: #09090b; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">404 \u2022 Not Found</div>
          <h1>Link Not Found</h1>
          <p>The shortened link <span class="slug-box">/${code}</span> does not exist or may have been permanently removed.</p>
          <a href="/" class="btn">Create Your Link on LinkSnip &rarr;</a>
        </div>
      </body>
      </html>
    `);
  }
  const isDateExpired = link.expiresAt && new Date(link.expiresAt).getTime() < Date.now();
  const isClickExpired = link.maxClicks && link.clicks >= link.maxClicks;
  const isDisabled = link.status === "disabled";
  if (isDateExpired || isClickExpired || isDisabled) {
    if (link.status === "active") link.status = "expired";
    return res.status(410).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Link Expired - LinkSnip</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; color: #09090b; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
          .card { background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 40px; max-width: 480px; width: 100%; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05); text-align: center; }
          .badge { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
          h1 { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 10px; color: #09090b; }
          p { color: #52525b; font-size: 14px; line-height: 1.6; margin: 0 0 20px; }
          .details { background: #f8fafc; border: 1px solid #e4e4e7; border-radius: 12px; padding: 14px; margin-bottom: 24px; font-size: 13px; color: #52525b; text-align: left; line-height: 1.6; }
          .details strong { color: #09090b; }
          .btn { background: #09090b; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block; transition: all 0.15s; }
          .btn:hover { background: #27272a; transform: translateY(-1px); }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">Inactive Link</div>
          <h1>This Link Has Expired</h1>
          <p>The link creator set an expiration rule that has now been reached.</p>
          <div class="details">
            <div><strong>Short Link:</strong> /r/${link.shortCode}</div>
            <div><strong>Title:</strong> ${link.title}</div>
            <div><strong>Reason:</strong> ${isDateExpired ? "Scheduled expiration date reached" : isClickExpired ? `Click limit threshold (${link.maxClicks}) reached` : "Link disabled by owner"}</div>
          </div>
          <a href="/" class="btn">Return to LinkSnip</a>
        </div>
      </body>
      </html>
    `);
  }
  if (link.isPasswordProtected && link.password) {
    if (!providedPassword || providedPassword !== link.password) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Password Protected - LinkSnip</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f8fafc; color: #09090b; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
            .card { background: #ffffff; border: 1px solid #e4e4e7; border-radius: 16px; padding: 40px; max-width: 440px; width: 100%; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05); text-align: center; }
            .badge { background: #f1f5f9; color: #09090b; border: 1px solid #e4e4e7; font-size: 12px; font-weight: 700; padding: 5px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.05em; }
            h1 { font-family: 'Outfit', sans-serif; font-size: 24px; font-weight: 800; letter-spacing: -0.03em; margin: 0 0 8px; color: #09090b; }
            p { color: #52525b; font-size: 14px; line-height: 1.5; margin: 0 0 20px; }
            .form-input { width: 100%; padding: 12px 16px; border: 1px solid #e4e4e7; border-radius: 10px; font-size: 14px; margin-bottom: 16px; outline: none; transition: all 0.15s; font-family: inherit; }
            .form-input:focus { border-color: #09090b; box-shadow: 0 0 0 3px rgba(9, 9, 11, 0.08); }
            .btn { width: 100%; background: #09090b; color: #ffffff; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.15s; font-family: inherit; }
            .btn:hover { background: #27272a; transform: translateY(-1px); }
            .err { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 12px; font-weight: 600; padding: 8px 12px; border-radius: 8px; margin-bottom: 14px; display: ${providedPassword ? "block" : "none"}; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">\u{1F512} Protected Link</div>
            <h1>Password Required</h1>
            <p>Please enter the passcode to access <strong>${link.title}</strong>.</p>
            ${providedPassword ? '<div class="err">Incorrect password. Please try again.</div>' : ""}
            <form method="GET" action="/r/${link.shortCode}">
              <input type="password" name="pwd" class="form-input" placeholder="Enter access password..." autofocus required />
              <button type="submit" class="btn">Unlock & Continue &rarr;</button>
            </form>
          </div>
        </body>
        </html>
      `);
    }
  }
  const userAgent = req.headers["user-agent"] || "";
  const rawReferer = req.headers["referer"] || req.headers["referrer"] || "";
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const parsedUa = parseUserAgent(userAgent);
  const normalizedRef = normalizeReferrer(rawReferer);
  const geo = getRandomGeo();
  const clickEvent = {
    id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    linkId: link.id,
    shortCode: link.shortCode,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    referrer: normalizedRef,
    country: geo.country,
    countryCode: geo.countryCode,
    city: geo.city,
    device: parsedUa.device,
    browser: parsedUa.browser,
    os: parsedUa.os,
    ip: clientIp.split(",")[0].trim()
  };
  clickEvents.push(clickEvent);
  link.clicks++;
  res.redirect(link.redirectType || 301, link.originalUrl);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const candidatePaths = [
      path.join(process.cwd(), "dist"),
      path.join(__dirname, "../dist"),
      __dirname
    ];
    let distPath = candidatePaths.find((p) => fs.existsSync(path.join(p, "index.html"))) || candidatePaths[0];
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`<!DOCTYPE html><html><head><title>LinkSnip</title></head><body><div id="root"></div></body></html>`);
      }
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LinkSnip Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}
var server_default = app;
if (!process.env.VERCEL) {
  startServer();
}
export {
  server_default as default
};
