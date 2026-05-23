const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'public', 'uploads');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to write SVG file
function writeSVG(filename, content) {
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, content.trim(), 'utf8');
  console.log(`Generated: ${filename}`);
}

// 1. Hero Default: Romantic Bridal Couple under Cascading Neon Lights
writeSVG('hero_default.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#070708"/>
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#76ff03" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#76ff03" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="neon-stream" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#76ff03" stop-opacity="0.8"/>
      <stop offset="60%" stop-color="#39ff14" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>
  
  <circle cx="800" cy="450" r="500" fill="url(#glow)"/>
  
  <!-- Perspective wedding arch lines -->
  <path d="M 500,900 L 800,200 L 1100,900" fill="none" stroke="#76ff03" stroke-width="1.5" stroke-opacity="0.2" stroke-dasharray="10 5"/>
  <path d="M 480,900 L 800,180 L 1120,900" fill="none" stroke="#76ff03" stroke-width="3" stroke-opacity="0.35"/>
  
  <!-- Couple Silhouette holding hands -->
  <g transform="translate(730, 320)" fill="none" stroke="#76ff03">
    <!-- Groom -->
    <circle cx="45" cy="50" r="12" stroke-width="2" stroke-opacity="0.8"/>
    <path d="M 45,62 L 45,150 M 45,75 L 25,110 M 45,75 L 60,110 M 45,150 L 30,220 M 45,150 L 60,220" stroke-width="2.5" stroke-opacity="0.8"/>
    
    <!-- Bride with flowing dress -->
    <circle cx="105" cy="55" r="10" stroke-width="2" stroke-opacity="0.8"/>
    <path d="M 105,65 L 105,100 M 105,75 L 85,110 M 105,75 L 125,110" stroke-width="2.5" stroke-opacity="0.8"/>
    <path d="M 105,100 L 70,220 H 140 Z" fill="#76ff03" fill-opacity="0.1" stroke-width="2" stroke-opacity="0.8"/>
    
    <!-- Intersecting hand connection ray -->
    <path d="M 60,110 Q 72,112 85,110" stroke="#fff" stroke-width="2" stroke-opacity="0.9"/>
  </g>

  <!-- Organic neon leaf vine hanging down -->
  <path d="M 100,-20 Q 400,200 800,50 Q 1200,200 1500,-20" fill="none" stroke="#76ff03" stroke-width="1.5" stroke-opacity="0.25"/>
  
  <!-- HUD / Fine art wedding credentials -->
  <path d="M 1520,50 L 1550,50 L 1550,80 M 1550,850 L 1550,880 L 1520,880 M 80,880 L 50,880 L 50,850 M 50,80 L 50,50 L 80,50" fill="none" stroke="#76ff03" stroke-width="2" stroke-opacity="0.5"/>
  <text x="800" y="840" fill="#76ff03" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="28" letter-spacing="4" text-anchor="middle" opacity="0.8">Documenting Love in Monochrome &amp; Neon</text>
  <text x="800" y="870" fill="#fff" font-family="monospace" font-size="11" letter-spacing="6" text-anchor="middle" opacity="0.5">STUDIO GFX // EDITORIAL WEDDINGS</text>
</svg>
`);

// 2. Cyber Portrait: High-fashion Bride with Glowing Neon Veil
writeSVG('gal_cyber_portrait.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0a0c"/>
  <defs>
    <radialGradient id="face-glow" cx="50%" cy="35%" r="40%">
      <stop offset="0%" stop-color="#76ff03" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="400" cy="350" r="300" fill="url(#face-glow)"/>
  
  <!-- Bridal Silhouette & Glowing Crown -->
  <g transform="translate(150, 150)" fill="none" stroke="#76ff03">
    <!-- Veil lines -->
    <path d="M 150,150 C 80,250 50,450 40,750 M 350,150 C 420,250 450,450 460,750" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="10 5"/>
    <path d="M 250,120 C 130,220 90,440 80,750 M 250,120 C 370,220 410,440 420,750" stroke-width="1" stroke-opacity="0.2"/>
    
    <!-- Glowing Floral Crown -->
    <ellipse cx="250" cy="140" rx="90" ry="25" stroke-width="3" stroke-opacity="0.8"/>
    <circle cx="160" cy="140" r="8" fill="#76ff03" fill-opacity="0.3" stroke-width="1.5"/>
    <circle cx="205" cy="120" r="10" fill="#76ff03" fill-opacity="0.3" stroke-width="1.5"/>
    <circle cx="250" cy="115" r="8" fill="#76ff03" fill-opacity="0.3" stroke-width="1.5"/>
    <circle cx="295" cy="120" r="10" fill="#76ff03" fill-opacity="0.3" stroke-width="1.5"/>
    <circle cx="340" cy="140" r="8" fill="#76ff03" fill-opacity="0.3" stroke-width="1.5"/>
    
    <!-- Face outline -->
    <path d="M 190,160 Q 250,220 250,290 Q 250,430 200,480 M 310,160 Q 250,220 250,290" stroke-width="1.5" stroke-opacity="0.4"/>
    <path d="M 230,480 Q 250,510 270,480" stroke-width="2" stroke-opacity="0.6"/>
    
    <!-- Bridal dress neck line -->
    <path d="M 160,550 Q 250,620 340,550" stroke-width="2" stroke-opacity="0.8"/>
    <path d="M 180,570 Q 250,620 320,570" stroke-width="1" stroke-opacity="0.4"/>
  </g>
  
  <text x="50" y="950" fill="#76ff03" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="20" letter-spacing="1" opacity="0.7">[THE BRIDAL REVEAL]</text>
  <text x="750" y="950" fill="#76ff03" font-family="monospace" font-size="12" text-anchor="end" opacity="0.6">ISO 200</text>
</svg>
`);

// 3. Nocturnal Streets: Newlyweds Walking Hand-in-Hand down Tokyo Streets in the Rain
writeSVG('gal_nocturnal_streets.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#050507"/>
  <defs>
    <linearGradient id="neon-glow" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#76ff03" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#76ff03" stop-opacity="0"/>
    </linearGradient>
  </defs>
  
  <!-- Perspective street guidelines -->
  <path d="M 400,250 L 0,1000 M 400,250 L 800,1000 M 400,250 L 400,1000" fill="none" stroke="#76ff03" stroke-width="1.5" stroke-opacity="0.2"/>
  <polygon points="0,750 800,750 800,1000 0,1000" fill="url(#neon-glow)"/>
  
  <!-- Newlyweds holding hands silhouette (walking away) -->
  <g transform="translate(345, 520)" fill="none" stroke="#76ff03">
    <!-- Groom (left) -->
    <circle cx="35" cy="50" r="10" stroke-width="2" stroke-opacity="0.8"/>
    <path d="M 35,60 L 35,140 M 35,70 L 15,105 M 35,70 L 50,95 M 35,140 L 20,210 M 35,140 L 48,210" stroke-width="2" stroke-opacity="0.8"/>
    
    <!-- Bride (right) -->
    <circle cx="85" cy="55" r="9" stroke-width="2" stroke-opacity="0.8"/>
    <path d="M 85,64 L 85,95 M 85,73 L 70,95 M 85,73 L 105,105 M 85,95 L 60,210 H 115 Z" fill="#76ff03" fill-opacity="0.1" stroke-width="2" stroke-opacity="0.8"/>
    
    <!-- Holding hands link -->
    <path d="M 50,95 Q 60,100 70,95" stroke="#fff" stroke-width="1.5" stroke-opacity="0.9"/>
  </g>
  
  <!-- City building neon lights and rain -->
  <rect x="20" y="100" width="100" height="400" fill="none" stroke="#76ff03" stroke-width="1.5" stroke-opacity="0.4"/>
  <text x="70" y="130" fill="#76ff03" font-family="monospace" font-size="10" text-anchor="middle" letter-spacing="2" opacity="0.6">LOVE</text>
  
  <!-- Rain lines -->
  <g stroke="#76ff03" stroke-width="1" stroke-opacity="0.3">
    <line x1="150" y1="50" x2="130" y2="130"/>
    <line x1="280" y1="100" x2="260" y2="180"/>
    <line x1="520" y1="150" x2="500" y2="230"/>
    <line x1="650" y1="80" x2="630" y2="160"/>
    <line x1="200" y1="400" x2="180" y2="480"/>
    <line x1="600" y1="420" x2="580" y2="500"/>
  </g>
  
  <text x="50" y="950" fill="#76ff03" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="20" letter-spacing="1" opacity="0.7">[TOKYO VOWS IN RAIN]</text>
  <text x="750" y="950" fill="#76ff03" font-family="monospace" font-size="12" text-anchor="end" opacity="0.6">35MM F1.4</text>
</svg>
`);

// 4. Architecture Neon: Brutalist Minimalist Wedding Chapel Arches
writeSVG('gal_architecture_neon.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#08080a"/>
  
  <!-- Concentric glowing chapel arches -->
  <g fill="none" stroke="#76ff03" stroke-linejoin="round">
    <path d="M 150,900 V 450 C 150,300 250,200 400,200 C 550,200 650,300 650,900" stroke-width="3" stroke-opacity="0.8"/>
    <path d="M 200,900 V 480 C 200,350 280,260 400,260 C 520,260 600,350 600,900" stroke-width="2.5" stroke-opacity="0.6"/>
    <path d="M 250,900 V 510 C 250,400 310,320 400,320 C 490,320 550,400 550,900" stroke-width="1.5" stroke-opacity="0.4"/>
  </g>
  
  <!-- Minimalist glowing cross at altar -->
  <g stroke="#76ff03" stroke-width="2.5" stroke-opacity="0.9" fill="none">
    <line x1="400" y1="420" x2="400" y2="580"/>
    <line x1="340" y1="470" x2="460" y2="470"/>
  </g>
  <circle cx="400" cy="470" r="30" fill="none" stroke="#76ff03" stroke-width="1" stroke-opacity="0.3"/>
  
  <text x="50" y="950" fill="#76ff03" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="20" letter-spacing="1" opacity="0.7">[THE BRUTALIST ALTAR]</text>
  <text x="750" y="950" fill="#76ff03" font-family="monospace" font-size="12" text-anchor="end" opacity="0.6">ARCH-09</text>
</svg>
`);

// 5. Abstract Light Play: Intersecting glowing wedding bands
writeSVG('gal_abstract_light.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#050505"/>
  <defs>
    <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#76ff03" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  
  <circle cx="400" cy="500" r="300" fill="url(#ring-glow)"/>
  
  <!-- Two intersecting glowing neon wedding rings -->
  <g fill="none" stroke="#76ff03" stroke-linejoin="round">
    <!-- Ring 1 (tilted left) -->
    <ellipse cx="350" cy="500" rx="140" ry="240" stroke-width="6" stroke-opacity="0.8" transform="rotate(-30, 350, 500)"/>
    <ellipse cx="350" cy="500" rx="125" ry="225" stroke="#fff" stroke-width="1.5" stroke-opacity="0.9" transform="rotate(-30, 350, 500)"/>
    
    <!-- Ring 2 (tilted right) -->
    <ellipse cx="450" cy="500" rx="140" ry="240" stroke-width="6" stroke-opacity="0.5" transform="rotate(30, 450, 500)"/>
    <ellipse cx="450" cy="500" rx="125" ry="225" stroke="#fff" stroke-width="1.5" stroke-opacity="0.7" transform="rotate(30, 450, 500)"/>
  </g>
  
  <!-- Abstract spark trails -->
  <path d="M 100,200 Q 250,500 400,200 Q 550,500 700,200" fill="none" stroke="#76ff03" stroke-width="1" stroke-opacity="0.25"/>
  <path d="M 100,800 Q 250,500 400,800 Q 550,500 700,800" fill="none" stroke="#76ff03" stroke-width="1" stroke-opacity="0.25"/>
  
  <text x="50" y="950" fill="#76ff03" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="20" letter-spacing="1" opacity="0.7">[THE NEON BANDS]</text>
  <text x="750" y="950" fill="#76ff03" font-family="monospace" font-size="12" text-anchor="end" opacity="0.6">FINE-ART</text>
</svg>
`);

// 6. Bio-Luminescence Nature: Nocturnal outdoor wedding ceremony altar in glowing woods
writeSVG('gal_nature_glow.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#070807"/>
  <defs>
    <radialGradient id="altar-glow" cx="50%" cy="70%" r="45%">
      <stop offset="0%" stop-color="#76ff03" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  
  <circle cx="400" cy="700" r="300" fill="url(#altar-glow)"/>
  
  <!-- Forest trees arching over -->
  <g fill="none" stroke="#76ff03" stroke-width="2" stroke-opacity="0.3">
    <path d="M 0,1000 Q 150,500 300,300 Q 400,200 400,0"/>
    <path d="M 800,1000 Q 650,500 500,300 Q 400,200 400,0"/>
  </g>
  
  <!-- Glowing Hexagonal Wedding Altar -->
  <polygon points="400,500 480,550 480,650 400,700 320,650 320,550" fill="none" stroke="#76ff03" stroke-width="4" stroke-opacity="0.8"/>
  <polygon points="400,500 480,550 480,650 400,700 320,650 320,550" fill="#76ff03" fill-opacity="0.08"/>
  
  <!-- Bioluminescent dots hanging like fairy lights -->
  <g fill="#76ff03">
    <circle cx="320" cy="300" r="4" opacity="0.6"/>
    <circle cx="360" cy="270" r="5" opacity="0.8"/>
    <circle cx="400" cy="250" r="3" opacity="0.5"/>
    <circle cx="440" cy="270" r="5" opacity="0.8"/>
    <circle cx="480" cy="300" r="4" opacity="0.6"/>
    
    <!-- Firefly dots around altar -->
    <circle cx="280" cy="580" r="5" opacity="0.9"/>
    <circle cx="520" cy="580" r="4" opacity="0.8"/>
    <circle cx="400" cy="760" r="6" opacity="0.9"/>
  </g>
  
  <text x="50" y="950" fill="#76ff03" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="20" letter-spacing="1" opacity="0.7">[THE LUMINESCENT COVEN]</text>
  <text x="750" y="950" fill="#76ff03" font-family="monospace" font-size="12" text-anchor="end" opacity="0.6">ISO 800</text>
</svg>
`);

// 7. Industrial Geometry: Minimalist chic botanical geometric frame arch
writeSVG('gal_industrial_geometry.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0a0b"/>
  
  <!-- Triple layered geometric wedding arch -->
  <g fill="none" stroke="#76ff03" stroke-linejoin="round">
    <!-- Outer Hex -->
    <polygon points="400,200 650,380 650,750 400,930 150,750 150,380" stroke-width="3" stroke-opacity="0.8"/>
    <!-- Middle Hex -->
    <polygon points="400,230 620,395 620,735 400,900 180,735 180,395" stroke-width="1.5" stroke-opacity="0.5" stroke-dasharray="10 5"/>
    <!-- Inner Hex -->
    <polygon points="400,260 590,410 590,720 400,870 210,720 210,410" stroke-width="1" stroke-opacity="0.3"/>
  </g>
  
  <!-- Minimalist neon flower cluster representations on corners -->
  <g fill="none" stroke="#76ff03" stroke-width="2">
    <circle cx="150" cy="380" r="15" stroke-opacity="0.7"/>
    <circle cx="150" cy="380" r="8" fill="#76ff03" fill-opacity="0.3"/>
    
    <circle cx="650" cy="750" r="20" stroke-opacity="0.7"/>
    <circle cx="650" cy="750" r="10" fill="#76ff03" fill-opacity="0.3"/>
  </g>
  
  <text x="50" y="950" fill="#76ff03" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="20" letter-spacing="1" opacity="0.7">[THE CHIC ARCHWAY]</text>
  <text x="750" y="950" fill="#76ff03" font-family="monospace" font-size="12" text-anchor="end" opacity="0.6">GEOMETRICAL</text>
</svg>
`);

// 8. Port 1 Cover: Luxury high-fashion urban wedding cover
writeSVG('port1_cover.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#0a0a0c"/>
  <defs>
    <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#76ff03" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#39ff14" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  
  <rect width="100%" height="100%" fill="url(#neon-grad)"/>
  
  <!-- Minimalist bride & groom holding hands in city outline -->
  <g transform="translate(80, 120)" fill="none" stroke="#76ff03" stroke-width="2.5" stroke-opacity="0.6">
    <!-- Groom -->
    <circle cx="100" cy="80" r="15"/>
    <path d="M 100,95 V 250 M 100,120 L 70,180 M 100,120 L 130,180"/>
    
    <!-- Bride -->
    <circle cx="180" cy="90" r="12"/>
    <path d="M 180,102 V 150 M 180,120 L 150,180 M 180,120 L 210,180 M 180,150 L 140,320 H 220 Z" fill="#76ff03" fill-opacity="0.1"/>
    
    <!-- Joined hands -->
    <path d="M 130,180 Q 140,182 150,180" stroke="#fff"/>
  </g>
  
  <!-- Cinematic Cityscape Grid overlay -->
  <path d="M 0,450 H 1200 M 0,300 H 1200" stroke="#76ff03" stroke-width="0.5" stroke-opacity="0.15"/>
  <path d="M 500,0 L 200,600 M 500,0 L 1000,600" stroke="#76ff03" stroke-width="1.5" stroke-opacity="0.2"/>
  
  <text x="700" y="280" fill="#76ff03" font-family="'Cormorant Garamond', serif" font-style="italic" font-weight="bold" font-size="52" letter-spacing="2">The Neon Vows</text>
  <text x="700" y="340" fill="#fff" font-family="monospace" font-size="14" letter-spacing="4" opacity="0.6">TOKYO CITY LIGHTS // EDITORIAL WEDDING</text>
</svg>
`);

// 9. Port 2 Cover: Modern architectural chapel wedding cover
writeSVG('port2_cover.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" width="100%" height="100%">
  <rect width="100%" height="100%" fill="#090a09"/>
  <defs>
    <radialGradient id="arch-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#76ff03" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  
  <circle cx="600" cy="300" r="400" fill="url(#arch-glow)"/>
  
  <!-- Brutalist chapel geometry -->
  <g fill="none" stroke="#76ff03" stroke-width="3" stroke-opacity="0.8">
    <path d="M 200,500 L 600,100 L 1000,500" stroke-linejoin="round"/>
    <path d="M 250,500 L 600,160 L 950,500" stroke-opacity="0.5"/>
    <line x1="600" y1="100" x2="600" y2="500" stroke-opacity="0.4" stroke-width="1"/>
  </g>
  
  <!-- Minimalist couple standing inside -->
  <g transform="translate(560, 360)" fill="none" stroke="#76ff03" stroke-width="1.5" stroke-opacity="0.8">
    <!-- Groom -->
    <circle cx="20" cy="30" r="6"/>
    <path d="M 20,36 V 90 M 20,45 L 8,70 M 20,45 L 30,68"/>
    
    <!-- Bride -->
    <circle cx="60" cy="33" r="5"/>
    <path d="M 60,38 V 60 M 60,45 L 48,70 M 60,45 L 72,70 M 60,60 L 40,110 H 80 Z" fill="#76ff03" fill-opacity="0.1"/>
  </g>
  
  <text x="600" y="540" fill="#76ff03" font-family="'Cormorant Garamond', serif" font-style="italic" font-weight="bold" font-size="36" letter-spacing="8" text-anchor="middle">BRUTALIST ROMANCE</text>
  <text x="600" y="575" fill="#fff" font-family="monospace" font-size="11" letter-spacing="4" text-anchor="middle" opacity="0.5">CONCRETE SANCTUARY VOWS</text>
</svg>
`);

console.log("Mock wedding assets created successfully!");
