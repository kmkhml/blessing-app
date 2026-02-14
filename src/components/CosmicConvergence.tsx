import { useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, CameraShake } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { TalismanCard } from './TalismanCard';
import { useRitualStore } from '../store/ritualStore';

// -----------------------------------------------------------------------------
// SCENE 1: RITUAL (Charging & Release)
// -----------------------------------------------------------------------------
function RitualScene() {
    const { phase, intensity } = useRitualStore();
    const meshRef = useRef<THREE.Mesh>(null);

    // Energy Core Animation
    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();
        
        let scale = 1;
        if (phase === 'charging') scale = 1 + intensity * 0.5;
        if (phase === 'release') scale = 3 + Math.sin(t * 20) * 0.2; // Shake

        meshRef.current.scale.setScalar(scale);
        meshRef.current.rotation.y += 0.02 + intensity * 0.1;
    });

    return (
        <>
            {/* Core Sphere */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial 
                    color="#ffffff" 
                    emissive="#a855f7"
                    emissiveIntensity={2 + intensity * 5}
                    toneMapped={false}
                />
            </mesh>
            
            {/* Halo */}
            <mesh scale={[1.5, 1.5, 1.5]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial 
                    color="#6366f1" 
                    transparent 
                    opacity={0.2} 
                    side={THREE.BackSide} 
                />
            </mesh>

            {/* Camera Effects */}
            <CameraShake 
                maxYaw={0.05 * intensity} 
                maxPitch={0.05 * intensity} 
                maxRoll={0.05 * intensity} 
                yawFrequency={2 * intensity} 
                pitchFrequency={2 * intensity} 
                rollFrequency={2 * intensity} 
                intensity={1}
            />

            {/* Post Processing - ONLY IN RITUAL */}
            <EffectComposer enableNormalPass={false}>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>

            {/* Environment */}
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#ffddaa" />
        </>
    );
}

// -----------------------------------------------------------------------------
// SCENE 2: RESULT (The Card)
// -----------------------------------------------------------------------------
function ResultScene({ data, recipient }: { data: any, recipient: string }) {
    const { viewport } = useThree();
    const isMobile = viewport.width < 5; // Rough heuristic for mobile viewport in 3D units

    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <group scale={isMobile ? 0.55 : 1}>
                    <TalismanCard data={data} recipient={recipient} />
                </group>
            </Float>
        </group>
    );
}

// -----------------------------------------------------------------------------
// CONTROLLER: CosmicConvergence
// -----------------------------------------------------------------------------
interface CosmicConvergenceProps {
  resultData?: any;
  recipient?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
  captureRef?: React.MutableRefObject<(() => Promise<string>) | null>;
  cameraZ?: number; // Added prop
}

export default function CosmicConvergence({ resultData, recipient, onCanvasReady, captureRef, cameraZ = 12 }: CosmicConvergenceProps) {
  const { phase } = useRitualStore();
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

  // Capture Logic
  useEffect(() => {
    if (captureRef) {
        captureRef.current = async () => {
            if (!glRef.current || !sceneRef.current || !cameraRef.current) return "";
            
            // Enhance Snapshot: Rotate card slightly to catch light
            const cardGroup = sceneRef.current.getObjectByName("TalismanCardGroup");
            const originalRotationY = cardGroup ? cardGroup.rotation.y : 0;
            
            if (cardGroup) {
                cardGroup.rotation.y = -Math.PI / 8; // Rotate 22.5 degrees to catch light
            }

            // Render high-res
            const originalPixelRatio = glRef.current.getPixelRatio();
            glRef.current.setPixelRatio(3); // Ultra High Res
            try {
                glRef.current.render(sceneRef.current, cameraRef.current);
            } catch (e) { console.error(e); }
            
            const dataUrl = glRef.current.domElement.toDataURL('image/png', 1.0);
            
            // Restore
            glRef.current.setPixelRatio(originalPixelRatio);
            if (cardGroup) {
                cardGroup.rotation.y = originalRotationY;
            }
            
            return dataUrl;
        };
    }
  }, [captureRef]);

  return (
    <div className="fixed inset-0 -z-10 bg-[#02020A] pointer-events-none">
      <Canvas 
        dpr={[1, 2]} // Limit pixel ratio to prevent shimmering on high-DPI screens
        // Disable pointer events on canvas to allow scrolling, enable ONLY for card interaction if needed
        // For now, we prioritize scrolling. The Float component provides enough motion.
        style={{ pointerEvents: 'none' }} 
        camera={{ position: [0, 0, cameraZ], fov: 50 }}
        gl={{ 
            preserveDrawingBuffer: true, 
            antialias: true, 
            alpha: true,
        }}
        onCreated={({ gl, scene, camera }) => {
          glRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          if (onCanvasReady) onCanvasReady(gl.domElement);
        }}
      >
        <color attach="background" args={['#02020A']} />
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

        {/* CONDITIONAL RENDERING: Strict separation */}
        <Suspense fallback={
            <mesh position={[0,0,0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshBasicMaterial color="yellow" wireframe />
            </mesh>
        }>
            {phase !== 'complete' ? (
                <RitualScene />
            ) : (
                resultData && recipient ? (
                    <ResultScene data={resultData} recipient={recipient} />
                ) : (
                     <mesh position={[0,0,0]}>
                        <boxGeometry args={[1,1,1]} />
                        <meshBasicMaterial color="red" wireframe />
                     </mesh>
                )
            )}
        </Suspense>

      </Canvas>
      
      {/* White Flash Overlay */}
      <div 
        className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-1000 ease-out"
        style={{ 
            zIndex: 100,
            opacity: phase === 'release' ? 1 : 0,
            display: phase === 'complete' ? 'none' : 'block'
        }}
      />
    </div>
  );
}
