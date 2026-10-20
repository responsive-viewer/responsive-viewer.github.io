export interface DevicePreset {
  id: string;
  name: string;
  category: 'mobile' | 'tablet' | 'desktop' | 'custom';
  width: number;
  height: number;
  pixelRatio?: number;
  deviceType: 'ios' | 'android' | 'tablet' | 'desktop';
  hasIsland?: boolean;
  hasNotch?: boolean;
  hasHolePunch?: boolean;
  isCustom?: boolean;
}

export const DEFAULT_DEVICES: DevicePreset[] = [
  // Mobile Presets
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    category: 'mobile',
    width: 402,
    height: 874,
    pixelRatio: 3,
    deviceType: 'ios',
    hasIsland: true
  },
  {
    id: 'iphone-14-pro-max',
    name: 'iPhone 14 Pro Max',
    category: 'mobile',
    width: 430,
    height: 932,
    pixelRatio: 3,
    deviceType: 'ios',
    hasIsland: true
  },
  {
    id: 'iphone-12-pro',
    name: 'iPhone 12 Pro',
    category: 'mobile',
    width: 390,
    height: 844,
    pixelRatio: 3,
    deviceType: 'ios',
    hasNotch: true
  },
  {
    id: 'iphone-xr',
    name: 'iPhone XR',
    category: 'mobile',
    width: 414,
    height: 896,
    pixelRatio: 2,
    deviceType: 'ios',
    hasNotch: true
  },
  {
    id: 'iphone-se',
    name: 'iPhone SE',
    category: 'mobile',
    width: 375,
    height: 667,
    pixelRatio: 2,
    deviceType: 'ios'
  },
  {
    id: 'pixel-7',
    name: 'Google Pixel 7',
    category: 'mobile',
    width: 412,
    height: 915,
    pixelRatio: 2.625,
    deviceType: 'android',
    hasHolePunch: true
  },
  {
    id: 'galaxy-s20-ultra',
    name: 'Samsung Galaxy S20 Ultra',
    category: 'mobile',
    width: 412,
    height: 915,
    pixelRatio: 3.5,
    deviceType: 'android',
    hasHolePunch: true
  },
  {
    id: 'galaxy-a51-71',
    name: 'Samsung Galaxy A51 / 71',
    category: 'mobile',
    width: 412,
    height: 914,
    pixelRatio: 2.6,
    deviceType: 'android',
    hasHolePunch: true
  },
  {
    id: 'galaxy-s8-plus',
    name: 'Samsung Galaxy S8+',
    category: 'mobile',
    width: 360,
    height: 740,
    pixelRatio: 4,
    deviceType: 'android'
  },

  // Tablet Presets
  {
    id: 'ipad-mini',
    name: 'iPad Mini',
    category: 'tablet',
    width: 768,
    height: 1024,
    pixelRatio: 2,
    deviceType: 'tablet'
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    category: 'tablet',
    width: 820,
    height: 1180,
    pixelRatio: 2,
    deviceType: 'tablet'
  },
  {
    id: 'ipad-pro-12-9',
    name: 'iPad Pro 12.9"',
    category: 'tablet',
    width: 1024,
    height: 1366,
    pixelRatio: 2,
    deviceType: 'tablet'
  },

  // Desktop Presets
  {
    id: 'laptop-small',
    name: 'Laptop (13" Small)',
    category: 'desktop',
    width: 1280,
    height: 800,
    pixelRatio: 1,
    deviceType: 'desktop'
  },
  {
    id: 'laptop-medium',
    name: 'MacBook / Laptop (1440p)',
    category: 'desktop',
    width: 1440,
    height: 900,
    pixelRatio: 2,
    deviceType: 'desktop'
  },
  {
    id: 'desktop-fhd',
    name: 'Desktop Full HD (1080p)',
    category: 'desktop',
    width: 1920,
    height: 1080,
    pixelRatio: 1,
    deviceType: 'desktop'
  }
];

export const DEMO_URLS = [
  { label: 'Example Domain', url: 'https://example.com' },
  { label: 'Wikipedia', url: 'https://en.m.wikipedia.org' },
  { label: 'W3C HTML Spec', url: 'https://www.w3.org' },
  { label: 'Localhost:3000', url: 'http://localhost:3000' }
];
