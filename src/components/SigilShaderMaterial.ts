
import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

export const SigilShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color(0.0, 0.0, 0.0),
    uColor2: new THREE.Color(0.0, 0.0, 0.0),
    uAlphaMap: null,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform sampler2D uAlphaMap;
    varying vec2 vUv;

    // Simple noise function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      // Sample the sigil shape
      float alpha = texture2D(uAlphaMap, vUv).r;
      if (alpha < 0.1) discard;

      // Pulse effect
      float pulse = sin(uTime * 2.0) * 0.5 + 0.5; // 0 to 1
      
      // Flowing energy along UV (approximate)
      float flow = sin(vUv.x * 10.0 + uTime * 3.0) * 0.5 + 0.5;
      
      // Edge jitter (simulated by noise on alpha)
      // We assume the texture has some gradient at edges. 
      // If it's binary black/white, this won't work well without SDF.
      // But we can add noise to color intensity.
      float noise = random(vUv * 100.0 + uTime);
      
      // Mix colors
      vec3 color = mix(uColor1, uColor2, flow);
      
      // Add brightness boost for "energy" look
      color += vec3(0.2) * pulse;
      
      // Add "sparkle" noise
      if (random(vUv * 50.0 + uTime * 5.0) > 0.95) {
          color += vec3(0.5);
      }

      gl_FragColor = vec4(color, alpha);
    }
  `
);

extend({ SigilShaderMaterial });

// Add type definition for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      sigilShaderMaterial: any;
    }
  }
}
