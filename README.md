# LinkSnip — Modern High-Performance URL Shortener & Analytics Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-linksnip--eight.vercel.app-09090b?style=for-the-badge&logo=vercel)](https://linksnip-eight.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://linksnip-eight.vercel.app)

LinkSnip is a full-stack, enterprise-grade URL shortener and real-time link management platform. Built with a monochromatic design theme (`#09090b`, `#ffffff`, `#f8fafc`, `#e4e4e7`) and Outfit / Inter typography, LinkSnip delivers sub-100ms redirections, interactive analytics, custom slugs, and safe browsing scans.

🌐 **Live Application**: [https://linksnip-eight.vercel.app](https://linksnip-eight.vercel.app)

---

## ⚡ Features

### 1. Instant Shortening & Custom Branded Slugs
- **Base62 Collision-Resistant Generation**: Auto-generates clean 6-character short codes (e.g., `/r/k9xL2p`).
- **Custom Back-Half Slugs**: Registered members can claim brand-tailored aliases (e.g., `/r/my-brand`).
- **Configurable 301 / 302 Redirections**: Choose permanent or temporary redirects based on SEO and campaign requirements.
- **UTM Parameter Builder**: Add Campaign Source, Medium, and Campaign name directly to URLs.

### 2. Deep Real-Time Clickstream & Telemetry
- **Interactive Time-Series Charts**: Track click velocity across 7, 14, and 30-day windows.
- **Geographic & Referrer Breakdown**: Visualize traffic distribution by country, city, and referral channel (Twitter, LinkedIn, Reddit, Google).
- **Client Environment Demographics**: Detailed breakdown of devices (Mobile, Desktop, Tablet), Operating Systems, and Browsers.
- **Live Ingestion Simulator**: Built-in simulator to trigger test clicks with custom countries, referrers, and devices in real-time.
- **CSV Data Export**: One-click download of raw clickstream logs with timestamp, IP mask, and client headers.

### 3. Enterprise Link Governance & Security
- **Safe Browsing Threat Scanner**: Pre-flight inspection scans destination URLs for malware, phishing, and unsafe domains with optional bypass override.
- **Password Protection**: Secure confidential documents and executive roadmaps with custom passwords and branded access gate.
- **Expiration & Max Click Thresholds**: Auto-expire links after a specific calendar date or upon reaching a click limit (returning a custom 410 Expired page).
- **Rate Limiting**: Built-in sliding-window limiter on all API endpoints with standard `X-RateLimit-*` headers.

### 4. Branded QR Code Suite
- Real-time QR code generation with custom color presets and error correction (L, M, Q, H).
- One-click export in both **high-resolution PNG** and **vector SVG** formats.

### 5. Developer REST API
- Programmatic link creation, analytics querying, and batch deletion.
- Bearer API token authentication with live interactive cURL code snippets.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts
- **Backend**: Node.js, Express, esbuild
- **Deployment**: Vercel Serverless Functions (`api/index.js`) + Static Edge Delivery (`dist/`)
- **Design System**: Monochromatic palette (`#09090b` Charcoal / `#ffffff` / `#f8fafc` Zinc Slate)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/RitikaMohanty/LinkSnip-URL-Shortener.git
cd LinkSnip-URL-Shortener
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Locally in Development Mode
```bash
npm run dev
```
The full-stack application will start on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
This builds both the Vite frontend bundle (`dist/`) and the serverless backend bundle (`api/index.js` & `dist/server.cjs`).

### 5. Run Production Server Locally
```bash
npm run start
```

---

## 🔒 Authentication & Access Rules

- **Guests / Anonymous Users**:
  - Can immediately shorten URLs with auto-generated slugs.
  - Can test Safe Browsing and read API documentation.
- **Registered / Authenticated Users**:
  - Unlock Custom Aliases (branded back-halves).
  - Unlock Real-Time Click Analytics & CSV Telemetry Export.
  - Access Password Protection, Expiration Controls, and API tokens.
  - *Demo instant login is available on the login modal to test full features.*

---

## 📄 License
MIT License © 2026 Ritika Mohanty
