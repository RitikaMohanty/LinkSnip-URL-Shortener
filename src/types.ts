export interface LinkItem {
  id: string;
  shortCode: string;
  originalUrl: string;
  title: string;
  customAlias?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  clicks: number;
  tags: string[];
  folderId?: string;
  folderName?: string;
  expiresAt?: string | null;
  maxClicks?: number | null;
  isPasswordProtected: boolean;
  password?: string;
  redirectType: 301 | 302;
  status: 'active' | 'expired' | 'disabled';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  safetyScore: 'safe' | 'suspicious' | 'flagged';
  safetyReason?: string;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  shortCode: string;
  timestamp: string;
  referrer: string;
  country: string;
  countryCode: string;
  city: string;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  browser: 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Opera' | 'Other';
  os: 'Windows' | 'macOS' | 'iOS' | 'Android' | 'Linux';
  ip: string;
}

export interface FolderItem {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  apiKey: string;
  isVerified: boolean;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  createdAt: string;
}

export interface AnalyticsSummary {
  totalClicks: number;
  uniqueVisitors: number;
  activeLinksCount: number;
  clicksOverTime: { date: string; clicks: number }[];
  referrers: { name: string; count: number; percentage: number }[];
  locations: { country: string; countryCode: string; count: number; percentage: number }[];
  cities: { city: string; country: string; count: number }[];
  devices: { device: string; count: number; percentage: number }[];
  browsers: { browser: string; count: number; percentage: number }[];
  osList: { os: string; count: number; percentage: number }[];
  recentClicks: ClickEvent[];
}

export interface CreateLinkInput {
  originalUrl: string;
  customAlias?: string;
  title?: string;
  tags?: string[];
  folderId?: string;
  expiresAt?: string | null;
  maxClicks?: number | null;
  password?: string;
  redirectType?: 301 | 302;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}
