import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#E85D75" flood-opacity="0.15"/>
    </filter>
  </defs>
  
  <!-- Outer Circular Canvas / Background -->
  <circle cx="256" cy="256" r="248" fill="#FFF0F3" filter="url(#shadow)"/>
  <circle cx="256" cy="256" r="242" fill="#FFFFFF"/>
  
  <!-- Outer Double Pink Ring -->
  <circle cx="256" cy="256" r="232" fill="none" stroke="#F4ACB7" stroke-width="4"/>
  <circle cx="256" cy="256" r="224" fill="none" stroke="#E85D75" stroke-width="2" stroke-dasharray="8 4"/>
  
  <!-- Top Center: Cupcake with Cherry -->
  <g transform="translate(256, 110) scale(1.15)">
    <!-- Plate -->
    <ellipse cx="0" cy="32" rx="36" ry="8" fill="#F4ACB7" opacity="0.5"/>
    <ellipse cx="0" cy="30" rx="32" ry="6" fill="#FFFFFF" stroke="#F4ACB7" stroke-width="1.5"/>
    <!-- Liner -->
    <path d="M-22,12 L22,12 L16,30 L-16,30 Z" fill="#FFCAD4" stroke="#E85D75" stroke-width="2"/>
    <!-- Wrapper folds -->
    <line x1="-12" y1="12" x2="-8" y2="30" stroke="#E85D75" stroke-width="1" opacity="0.6"/>
    <line x1="0" y1="12" x2="0" y2="30" stroke="#E85D75" stroke-width="1" opacity="0.6"/>
    <line x1="12" y1="12" x2="8" y2="30" stroke="#E85D75" stroke-width="1" opacity="0.6"/>
    <!-- Frosting Swirls -->
    <path d="M-24,12 C-26,2 -16,-8 -6,-10 C0,-18 12,-18 16,-8 C24,-6 26,4 22,12 Z" fill="#FFE5EC" stroke="#E85D75" stroke-width="2"/>
    <path d="M-18,6 C-20,0 -12,-6 -4,-7 C0,-14 10,-14 13,-6 C20,-4 21,2 18,6 Z" fill="#FFF0F3"/>
    <!-- Cherry -->
    <circle cx="0" cy="-16" r="9" fill="#D90429"/>
    <circle cx="-3" cy="-19" r="2.5" fill="#FFFFFF" opacity="0.8"/>
    <path d="M0,-25 C4,-32 10,-30 14,-26" fill="none" stroke="#3D231D" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- Wire Whisk Icon (Right Side) -->
  <g transform="translate(385, 235) rotate(25) scale(1.1)">
    <!-- Handle -->
    <rect x="-5" y="40" width="10" height="35" rx="5" fill="#F4ACB7" stroke="#E85D75" stroke-width="2"/>
    <circle cx="0" cy="70" r="2" fill="#E85D75"/>
    <!-- Loop wires -->
    <path d="M0,40 C-18,15 -18,-25 0,-35 C18,-25 18,15 0,40 Z" fill="none" stroke="#3D231D" stroke-width="2.5"/>
    <path d="M0,40 C-10,18 -10,-20 0,-35 C10,-20 10,18 0,40 Z" fill="none" stroke="#3D231D" stroke-width="2"/>
    <path d="M0,40 C-4,20 -4,-15 0,-35 C4,-15 4,20 0,40 Z" fill="none" stroke="#3D231D" stroke-width="1.5"/>
  </g>

  <!-- Left Side Cute Hearts -->
  <g transform="translate(130, 210) scale(0.9)">
    <path d="M0,10 C-10,0 -20,12 0,26 C20,12 10,0 0,10 Z" fill="#E85D75"/>
  </g>
  <g transform="translate(110, 280) scale(0.6)">
    <path d="M0,10 C-10,0 -20,12 0,26 C20,12 10,0 0,10 Z" fill="#F4ACB7"/>
  </g>

  <!-- Main Center Typography -->
  <!-- 'O Doce' -->
  <text x="256" y="210" text-anchor="middle" font-family="Georgia, serif" font-size="46" font-weight="700" fill="#3D231D" letter-spacing="1">O Doce</text>
  
  <!-- 'Mundo' -->
  <text x="256" y="285" text-anchor="middle" font-family="'Dancing Script', cursive, serif" font-size="82" font-weight="700" fill="#E85D75">Mundo</text>
  
  <!-- 'da Lavínia' -->
  <text x="256" y="348" text-anchor="middle" font-family="Georgia, serif" font-size="48" font-weight="700" fill="#3D231D" letter-spacing="1">da Lavínia</text>

  <!-- Bottom Pink Banner / Ribbon -->
  <g transform="translate(256, 405)">
    <!-- Ribbon background -->
    <path d="M-180,-15 L180,-15 C190,-15 195,0 190,15 L175,15 C170,15 165,22 160,25 L-160,25 C-165,22 -170,15 -175,15 L-190,15 C-195,0 -190,-15 -180,-15 Z" fill="#FFE5EC" stroke="#F4ACB7" stroke-width="2"/>
    <!-- Banner Hearts -->
    <path d="M-150,5 C-155,-2 -162,5 -150,14 C-138,5 -145,-2 -150,5 Z" fill="#E85D75"/>
    <path d="M150,5 C145,-2 138,5 150,14 C162,5 155,-2 150,5 Z" fill="#E85D75"/>
    <!-- Ribbon Text -->
    <text x="0" y="10" text-anchor="middle" font-family="sans-serif" font-size="17" font-weight="600" fill="#3D231D" font-style="italic">Feito com amor para adoçar seus momentos</text>
  </g>
</svg>`;

const publicDir = path.join(process.cwd(), 'public');

async function buildFavicons() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
  console.log('✅ Generated public/favicon.svg');

  // 2. Generate 16x16 PNG
  await sharp(Buffer.from(svgContent))
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('✅ Generated public/favicon-16x16.png');

  // 3. Generate 32x32 PNG
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('✅ Generated public/favicon-32x32.png');

  // 4. Generate favicon.ico (32x32 PNG file saved as .ico for legacy browsers)
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✅ Generated public/favicon.ico');

  // 5. Generate apple-touch-icon.png (180x180)
  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Generated public/apple-touch-icon.png');

  // 6. Generate android-chrome-192x192.png
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'android-chrome-192x192.png'));
  console.log('✅ Generated public/android-chrome-192x192.png');

  // 7. Generate android-chrome-512x512.png
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'android-chrome-512x512.png'));
  console.log('✅ Generated public/android-chrome-512x512.png');

  // 8. Create site.webmanifest
  const manifest = {
    name: 'O Doce Mundo da Lavínia',
    short_name: 'Doce Mundo',
    icons: [
      {
        src: '/android-chrome-192x192.png?v=1',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/android-chrome-512x512.png?v=1',
        sizes: '512x512',
        type: 'image/png'
      }
    ],
    theme_color: '#FFF5F7',
    background_color: '#FFF5F7',
    display: 'standalone'
  };

  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));
  console.log('✅ Generated public/site.webmanifest');
}

buildFavicons().catch((err) => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
