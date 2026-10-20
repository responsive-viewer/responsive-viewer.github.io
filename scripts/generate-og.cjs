const sharp = require('sharp');
const path = require('path');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="50%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#213555" />
    </linearGradient>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#4F709C" opacity="0.25" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect width="1200" height="630" fill="url(#grid)" />

  <!-- Outer Glow Border -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#4F709C" stroke-width="2" opacity="0.3" />

  <!-- Logo Pill -->
  <g transform="translate(80, 75)">
    <rect width="76" height="76" rx="22" fill="#213555" stroke="#4F709C" stroke-width="2" />
    <!-- Laptop Icon -->
    <rect x="16" y="22" width="44" height="28" rx="4" fill="none" stroke="#FFFFFF" stroke-width="3" />
    <path d="M10 52 H66" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
    <!-- Phone Accent -->
    <rect x="42" y="32" width="20" height="32" rx="4" fill="#213555" stroke="#E5D283" stroke-width="2.5" />
    <circle cx="52" cy="36" r="1.5" fill="#E5D283" />
  </g>

  <!-- Brand Title -->
  <text x="180" y="122" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="46" fill="#FFFFFF" letter-spacing="-0.03em">Responsive<tspan fill="#E5D283">Viewer</tspan></text>
  <text x="180" y="152" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="600" font-size="16" fill="#94A3B8" letter-spacing="0.08em">MULTI-DEVICE RESPONSIVENESS STUDIO</text>

  <!-- Main Value Proposition Title -->
  <text x="80" y="255" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="800" font-size="52" fill="#FFFFFF" letter-spacing="-0.03em">Test Any Website Across</text>
  <text x="80" y="322" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="800" font-size="52" fill="#E5D283" letter-spacing="-0.03em">Every Screen Size Automatically</text>

  <!-- Subtitle -->
  <text x="80" y="380" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="400" font-size="22" fill="#CBD5E1">
    Automated device tours, instant scale-to-fit, hardware bezels &amp; 100% client-side privacy.
  </text>

  <!-- Feature Pills -->
  <g transform="translate(80, 435)">
    <!-- Pill 1 -->
    <rect x="0" y="0" width="210" height="46" rx="23" fill="#213555" stroke="#4F709C" stroke-width="1.5" />
    <text x="105" y="28" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="700" font-size="15" fill="#E5D283" text-anchor="middle">⚡ Auto-Play Cycle</text>

    <!-- Pill 2 -->
    <rect x="225" y="0" width="210" height="46" rx="23" fill="#213555" stroke="#4F709C" stroke-width="1.5" />
    <text x="330" y="28" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="700" font-size="15" fill="#FFFFFF" text-anchor="middle">🔒 100% Client-Side</text>

    <!-- Pill 3 -->
    <rect x="450" y="0" width="220" height="46" rx="23" fill="#213555" stroke="#4F709C" stroke-width="1.5" />
    <text x="560" y="28" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="700" font-size="15" fill="#FFFFFF" text-anchor="middle">💻 Localhost &amp; Staging</text>

    <!-- Pill 4 -->
    <rect x="685" y="0" width="180" height="46" rx="23" fill="#213555" stroke="#4F709C" stroke-width="1.5" />
    <text x="775" y="28" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="700" font-size="15" fill="#FFFFFF" text-anchor="middle">📱 15+ Devices</text>
  </g>

  <!-- Bottom Bar: URL & Badge -->
  <g transform="translate(80, 545)">
    <text x="0" y="0" font-family="Courier, monospace" font-weight="700" font-size="20" fill="#94A3B8">https://responsive-viewer.github.io</text>
    <rect x="890" y="-24" width="150" height="34" rx="17" fill="#E5D283" />
    <text x="965" y="-2" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="800" font-size="13" fill="#213555" text-anchor="middle">FREE &amp; NO ADS</text>
  </g>
</svg>
`;

const outputPath = path.resolve(__dirname, '../public/og-image.png');

sharp(Buffer.from(svg))
  .png({ quality: 95 })
  .toFile(outputPath)
  .then(info => {
    console.log('Successfully generated public/og-image.png:', info);
  })
  .catch(err => {
    console.error('Error generating image:', err);
    process.exit(1);
  });
