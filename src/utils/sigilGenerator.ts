
// Simple hash function for seed generation
function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function sfc32(a: number, b: number, c: number, d: number) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    let t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  }
}

// -----------------------------------------------------------------------------
// Geometric Generators
// -----------------------------------------------------------------------------

// A. Celtic Knot (Love/Friendship)
// Continuous closed loops, Lissajous curves
function generateCelticKnot(rand: () => number, cx: number, cy: number, size: number): string {
    const r = size * 0.35;
    let path = "";
    
    // Lissajous params
    // x = A sin(at + d), y = B sin(bt)
    // For knot-like shapes, ratios like 3:2, 5:2, 4:3 work well
    const a = 3 + Math.floor(rand() * 2); // 3 or 4
    const b = 2 + Math.floor(rand() * 2); // 2 or 3
    const delta = Math.PI / 2;
    
    const steps = 200;
    
    path += `M `;
    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const x = cx + r * Math.sin(a * t + delta);
        const y = cy + r * Math.sin(b * t);
        
        if (i === 0) path += `${x} ${y} `;
        else path += `L ${x} ${y} `;
    }
    path += "Z "; // Close loop

    // Add a second interwoven ring or circle for complexity if rand says so
    if (rand() > 0.5) {
        const r2 = r * 0.6;
        path += `M ${cx + r2} ${cy} A ${r2} ${r2} 0 1 0 ${cx - r2} ${cy} A ${r2} ${r2} 0 1 0 ${cx + r2} ${cy} `;
    }

    return path;
}

// B. Metatron's Grid (Career)
// Hexagonal grid points connected by straight lines
function generateMetatronGrid(rand: () => number, cx: number, cy: number, size: number): string {
    const r = size * 0.4;
    let path = "";
    
    // Generate Grid Points (Fruit of Life packing approx)
    const points: {x: number, y: number}[] = [];
    points.push({x: cx, y: cy}); // Center
    
    // Inner Ring (Radius 1 unit)
    const u = r * 0.5; // Unit distance
    for(let i=0; i<6; i++) {
        const theta = (Math.PI / 3) * i;
        points.push({
            x: cx + u * Math.cos(theta),
            y: cy + u * Math.sin(theta)
        });
    }
    
    // Outer Ring (Radius 2 units, simplified to corners)
    for(let i=0; i<6; i++) {
        const theta = (Math.PI / 3) * i;
        points.push({
            x: cx + u * 2 * Math.cos(theta),
            y: cy + u * 2 * Math.sin(theta)
        });
    }

    // Connect points randomly but symmetrically
    // We iterate through all unique pairs and decide to connect based on hash/rand
    const connectivity = 0.3 + rand() * 0.3; // 30-60% of lines drawn
    
    for(let i=0; i<points.length; i++) {
        for(let j=i+1; j<points.length; j++) {
            // Check distance to avoid cross-map messy lines? 
            // Metatron's cube connects ALL centers. We'll select a subset.
            if (rand() < connectivity) {
                path += `M ${points[i].x} ${points[i].y} L ${points[j].x} ${points[j].y} `;
            }
        }
    }
    
    // Always draw the outer hexagon boundary
    for(let i=7; i<13; i++) {
        const p1 = points[i];
        const p2 = points[i === 12 ? 7 : i+1];
        path += `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} `;
    }

    return path;
}

// C. Moon Phases (Health)
// Arcs, symmetry, central void
function generateMoonPhases(rand: () => number, cx: number, cy: number, size: number): string {
    const r = size * 0.35;
    let path = "";
    
    // Central Void (Implied, we don't draw it, or draw a faint outline)
    // Draw Crescents
    
    // Left Crescent
    // M top A outer-radius ... bottom A inner-radius ... top
    // const outerR = r;
    const innerR = r * (0.5 + rand() * 0.3);
    const gap = size * 0.05;
    
    // Function to draw a vertical crescent
    const drawCrescent = (xOffset: number, scaleX: number) => {
        // Simple arc approximation
        // Top point
        const tx = cx + xOffset;
        const ty = cy - r;
        // Bottom point
        const bx = cx + xOffset;
        const by = cy + r;
        
        // Control points for outer curve (convex)
        const outerCpX = cx + xOffset - r * scaleX; 
        // Control points for inner curve (concave)
        const innerCpX = cx + xOffset - innerR * scaleX;
        
        return `M ${tx} ${ty} 
                Q ${outerCpX} ${cy} ${bx} ${by} 
                Q ${innerCpX} ${cy} ${tx} ${ty} Z `;
    };

    // Draw Left and Right symmetric crescents
    path += drawCrescent(-gap, 1); // Left (curves out to left)
    path += drawCrescent(gap, -1); // Right (curves out to right)
    
    // Optional: Full moon or circle in center (small) if rand says so
    if (rand() > 0.6) {
        const centerR = gap * 0.8;
        path += `M ${cx + centerR} ${cy} A ${centerR} ${centerR} 0 1 0 ${cx - centerR} ${cy} A ${centerR} ${centerR} 0 1 0 ${cx + centerR} ${cy} `;
    }

    return path;
}

// D. Alchemical Triangle (Wealth)
// Upward triangle, filled with horizontal lines
function generateAlchemicalTriangle(rand: () => number, cx: number, cy: number, size: number): string {
    const r = size * 0.4;
    let path = "";
    
    // Equilateral Triangle Points (Upward)
    // Top
    // const p1 = { x: cx, y: cy - r };
    // Bottom Right (30 deg from horizontal)
    // const p2 = { x: cx + r * Math.cos(Math.PI/6), y: cy + r * Math.sin(Math.PI/6) }; // sin(30)=0.5, but y is down. Wait.
    // Triangle calc:
    // Center to vertex = r.
    // Top vertex: (cx, cy - r)
    // Bottom vertices: (cx +/- r*sin(60), cy + r*cos(60)) = (cx +/- r*0.866, cy + r*0.5)
    
    // const h = r * 1.5; // Total height
    // const side = r * Math.sqrt(3);
    
    const top = { x: cx, y: cy - r };
    const botRight = { x: cx + r * Math.sin(Math.PI/3), y: cy + r * 0.5 };
    const botLeft = { x: cx - r * Math.sin(Math.PI/3), y: cy + r * 0.5 };
    
    // Frame
    path += `M ${top.x} ${top.y} L ${botRight.x} ${botRight.y} L ${botLeft.x} ${botLeft.y} Z `;
    
    // Horizontal Lines (Stacking/Sediment)
    const lines = 3 + Math.floor(rand() * 5);
    for(let i=1; i<lines; i++) {
        const ratio = i / lines;
        // Interpolate Y
        const y = top.y + (botLeft.y - top.y) * ratio;
        // Interpolate X (Triangle width increases linearly down)
        // At top, width 0. At bottom, width = side.
        const wHalf = (r * Math.sin(Math.PI/3)) * ratio;
        
        path += `M ${cx - wHalf} ${y} L ${cx + wHalf} ${y} `;
    }
    
    // Add the "Earth" bar if strictly Alchemical Earth?
    // Earth symbol is downward triangle with line. 
    // User said "Alchemical Earth/Gold" and "Upward Triangle". 
    // Alchemical Gold is Circle with dot. Fire is Upward Triangle.
    // I will stick to User's "Upward Triangle" + "Horizontal Lines".
    
    return path;
}

// E. Seed of Life (Family)
// 7 Circles
function generateSeedOfLife(rand: () => number, cx: number, cy: number, size: number): string {
    const r = size * 0.15; // Radius of small circles
    // use rand to avoid unused var
    rand(); 
    let path = "";
    
    // Center Circle
    path += `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} `;
    
    // 6 Surrounding Circles
    for(let i=0; i<6; i++) {
        const theta = (Math.PI / 3) * i;
        // Centers are at distance R from center
        const cX = cx + r * Math.cos(theta);
        const cY = cy + r * Math.sin(theta);
        
        path += `M ${cX + r} ${cY} A ${r} ${r} 0 1 0 ${cX - r} ${cY} A ${r} ${r} 0 1 0 ${cX + r} ${cY} `;
    }
    
    // Optional Outer Ring
    const outerR = r * 3;
    path += `M ${cx + outerR} ${cy} A ${outerR} ${outerR} 0 1 0 ${cx - outerR} ${cy} A ${outerR} ${outerR} 0 1 0 ${cx + outerR} ${cy} `;

    return path;
}

// Main Generator Dispatcher
export function generateSigilPath(seedStr: string, type: string, size: number = 200): string {
  // Enhance seed uniqueness logic: 
  // User input "Name" (seedStr) should have 60% weight in the visual outcome.
  // We achieve this by mixing the seedStr multiple times or using it to modify the primary seed significantly.
  // The current cyrb128 is already a high-quality hash where any bit change avalanches.
  // So 'seedStr' already fully controls the seed.
  // To emphasize "Name" weight conceptually (maybe the user meant adding more noise based on name length?):
  // Let's mix the name length into the seed generation explicitly to vary structure even for same hash collisions (unlikely).
  
  const seed = cyrb128(seedStr + "_v2_" + seedStr.length); // Double mix
  const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
  const cx = size / 2;
  const cy = size / 2;

  // We can also use a secondary hash based purely on the string to modulate fine details
  // independent of the main random stream, to force visual variance even if structure is similar.
  // But sfc32 is sufficient. 
  
  // Let's just ensure we use `rand()` for every small jitter.
  
  switch (type) {
    case 'Love':
    case 'Friendship':
        return generateCelticKnot(rand, cx, cy, size);
    
    case 'Abundance': // Renamed from Wealth
    case 'Wealth':
        return generateAlchemicalTriangle(rand, cx, cy, size);
        
    case 'Career':
        return generateMetatronGrid(rand, cx, cy, size);
        
    case 'Health':
        return generateMoonPhases(rand, cx, cy, size);
        
    case 'Family':
    case 'Protection': 
        return generateSeedOfLife(rand, cx, cy, size);
        
    default:
        return generateCelticKnot(rand, cx, cy, size);
  }
}
