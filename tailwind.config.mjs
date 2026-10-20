/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        studio: {
          light: '#F0F0F0',
          navy: '#213555',
          steel: '#4F709C',
          gold: '#E5D283',
          darkBg: '#0F172A',
          darkSurface: '#1E293B',
          darkBorder: '#334155'
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        'pill': '0 4px 20px -2px rgba(33, 53, 85, 0.12), 0 2px 6px -1px rgba(33, 53, 85, 0.08)',
        'pill-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'device': '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(33, 53, 85, 0.08)',
        'device-dark': '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)'
      }
    },
  },
  plugins: [],
};
