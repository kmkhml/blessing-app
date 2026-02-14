
import React, { useEffect, useRef } from 'react';

const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Stars
    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    const numStars = 150;
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random()
      });
    }

    // Grid System
    let offset = 0;
    const gridSpeed = 0.5;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Background Gradient (Cyber Dark)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#050510'); 
      gradient.addColorStop(1, '#1a0b2e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw Stars
      ctx.fillStyle = '#ffffff';
      stars.forEach(star => {
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });

      // Draw Retro Grid (Perspective)
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = '#a855f7'; // Purple neon
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const horizonY = height * 0.4;
      const gridSize = 40;
      
      // Vertical lines (perspective)
      for (let x = 0; x <= width; x += gridSize * 2) {
        ctx.moveTo(x, height);
        ctx.lineTo(width / 2 + (x - width / 2) * 0.1, horizonY);
      }

      // Horizontal lines (moving down)
      offset = (offset + gridSpeed) % gridSize;
      for (let y = horizonY; y < height; y += gridSize * (1 + (y-horizonY)/height)) { // Variable spacing for perspective illusion
        const currentY = y + offset * ((y - horizonY) / (height - horizonY));
        if (currentY > height) continue;
        
        ctx.moveTo(0, currentY);
        ctx.lineTo(width, currentY);
      }
      
      ctx.stroke();
      
      // Scanline overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 1);
      }

      ctx.globalAlpha = 1.0;
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default CosmicBackground;
