import { useMemo, useRef, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { generateSigilPath } from '../utils/sigilGenerator';
import type { BlessingData } from '../utils/blessingGenerator';

// -----------------------------------------------------------------------------
// Simplified Talisman Card - No Custom Shaders to prevent "White Sphere" errors
// -----------------------------------------------------------------------------

interface TalismanCardProps {
  data: BlessingData;
  recipient: string;
}

// Generate Sigil Texture (Sacred Geometry - Ultra High Res)
function createSigilTexture(sigilPath: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; // Double Res for Sharpness
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.clearRect(0, 0, 2048, 2048);
    
    // Config
    const cx = 1024;
    const cy = 1024;
    
    // Laser Beam Gradient
    const gradient = ctx.createRadialGradient(cx, cy, 100, cx, cy, 900);
    gradient.addColorStop(0, '#ffffff'); // Core White
    gradient.addColorStop(0.3, '#ffd700'); // Gold
    gradient.addColorStop(1, 'rgba(255, 140, 0, 0.1)'); // Fading Edge
    
    ctx.strokeStyle = gradient; 
    ctx.shadowColor = '#ffeb3b'; 
    ctx.shadowBlur = 30; // Scaled up blur
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Helper for Spirograph-like curves
    const drawSpirograph = (R: number, r: number, rho: number) => {
        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 2 * 10; t += 0.05) {
            const x = cx + (R - r) * Math.cos(t) + rho * Math.cos(((R - r) / r) * t);
            const y = cy + (R - r) * Math.sin(t) - rho * Math.sin(((R - r) / r) * t);
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    };

    // 1. Delicate Outer Rings (Stronger Frame)
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 4; // Scaled for 2048 (was 2)
    ctx.beginPath();
    ctx.arc(cx, cy, 800, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(cx, cy, 780, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Complex Mandala / Spirograph Layer (Subtle Background)
    ctx.globalAlpha = 0.4; 
    ctx.lineWidth = 1; // Ultra thin hairline
    drawSpirograph(760, 160, 300); 

    // 3. Geometric Core (Hexagram - The Power Source)
    ctx.globalAlpha = 1.0; 
    ctx.lineWidth = 5;
    const drawPolygon = (radius: number, sides: number, rotationOffset: number = 0) => {
        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = (i * 2 * Math.PI / sides) - (Math.PI / 2) + rotationOffset;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    };

    drawPolygon(500, 3, 0); 
    drawPolygon(500, 3, Math.PI); 

    // 4. Inner Energy Rays (Subtle emission)
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    for (let i = 0; i < 24; i++) { 
        const angle = (i * Math.PI * 2) / 24;
        const innerR = 560;
        const outerR = 720;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.stroke();
    }

    // 5. The Original Sigil Path (Central Soul)
    ctx.globalAlpha = 1.0;
    const path = new Path2D(sigilPath);
    ctx.save();
    ctx.translate(cx - 100 * 2.4, cy - 100 * 2.4); // Scaled translate
    ctx.scale(2.4, 2.4); // Scaled up
    ctx.lineWidth = 6; 
    ctx.shadowBlur = 50; 
    ctx.stroke(path);
    ctx.restore();

    // 6. The Core Hotspot (Laser Origin)
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 80;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(canvas);
}

export function TalismanCard({ data, recipient }: TalismanCardProps) {
  const meshRef = useRef<THREE.Group>(null);
  const sigilRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const isMobile = viewport.width < 5; // Responsive Check in 3D
  
  // Resources
  const sigilPath = useMemo(() => generateSigilPath(data.title + recipient, data.type), [data.title, recipient, data.type]);
  const sigilTexture = useMemo(() => createSigilTexture(sigilPath), [sigilPath]);
  
  // Colors
  const accentColor = useMemo(() => new THREE.Color(data.gradient?.[1] || "#d4af37"), [data]);

  // Mouse Parallax & Sigil Rotation
  useFrame(({ pointer, clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, pointer.y * 0.1, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, pointer.x * 0.1, 0.1);
    }
    // Breathing Opacity & Float
    if (sigilRef.current) {
        sigilRef.current.rotation.z = clock.getElapsedTime() * 0.05; 
        
        const material = sigilRef.current.material as THREE.MeshBasicMaterial;
        if (material) {
            // Pulse between 0.7 and 1.0
            material.opacity = 0.85 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
        }
        
        // Micro-float
        sigilRef.current.position.y = 0.5 + Math.sin(clock.getElapsedTime()) * 0.02;
    }
  });

  return (
    <group ref={meshRef} name="TalismanCardGroup" scale={isMobile ? 0.65 : 1}>
      {/* 1. Environment & Lighting (Local to Card) */}
      <Suspense fallback={null}>
        <Environment preset="city" blur={1} background={false} />
      </Suspense>
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} intensity={2} color="white" />
      <pointLight position={[0, 0, 3]} intensity={1} color={accentColor} />

      {/* 2. The Card Base (Obsidian Slab) */}
      <mesh>
        <boxGeometry args={[4.2, 6.4, 0.1]} />
        <meshPhysicalMaterial 
            color="#1a1a1a"
            roughness={0.2} // Increased to reduce shimmering
            metalness={0.8}
            clearcoat={1.0}
            clearcoatRoughness={0.1}
            envMapIntensity={1.5}
        />
      </mesh>

      {/* 3. Gold Border */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[4.3, 6.5, 0.02]} />
        <meshStandardMaterial color={accentColor} metalness={1} roughness={0.1} />
      </mesh>
      {/* Cutout for the black center */}
      <mesh position={[0, 0, 0.07]}>
         <planeGeometry args={[4.0, 6.2]} />
         <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 4. The Sigil (Mapped on a plane) */}
      <mesh ref={sigilRef} position={[0, 0.5, 0.15]}>
        <planeGeometry args={[3.0, 3.0]} />
        <meshBasicMaterial 
            color="#ffd700" 
            alphaMap={sigilTexture} 
            transparent={true} 
            opacity={0.8} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false} 
            side={THREE.DoubleSide} 
        />
      </mesh>

      {/* 5. Typography - EMERGENCY FALLBACK: NO EXTERNAL FONTS */}
      <group position={[0, -1.5, 0.2]}>
         <Suspense fallback={null}>
            {/* Title */}
            <Text
                fontSize={0.25} 
                maxWidth={3.8}
                textAlign="center"
                letterSpacing={0.1}
                color="#f4eec7"
                anchorX="center"
                anchorY="middle"
                position={[0, 0.3, 0]}
            >
                {data.title.toUpperCase()}
                <meshBasicMaterial color="#f4eec7" toneMapped={false} />
            </Text>

            {/* Incantation */}
            <Text
                fontSize={0.12} 
                maxWidth={3.2}
                textAlign="center"
                lineHeight={1.4}
                letterSpacing={0.05}
                color="#e2e8f0"
                anchorX="center"
                anchorY="top"
                position={[0, -0.4, 0]}
            >
                {data.incantation}
                <meshBasicMaterial color="#e2e8f0" toneMapped={false} opacity={0.8} transparent />
            </Text>
         </Suspense>
      </group>

      {/* 6. Particles */}
      <Sparkles count={50} scale={5} size={4} speed={0.4} opacity={0.5} color={accentColor} />
    </group>
  );
}
