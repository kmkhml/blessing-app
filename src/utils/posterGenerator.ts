
import QRCode from 'qrcode';
import type { BlessingData } from './blessingGenerator';

interface PosterConfig {
  cardImage: string; // Data URL of the 3D capture
  data: BlessingData;
  recipient: string;
  username?: string;
}

export async function generatePoster({ cardImage, data, username = "Seeker" }: PosterConfig): Promise<string> {
  const width = 1080;
  const height = 1920;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) throw new Error("Could not get canvas context");

  // 1. Background: Dark Nebula (Deep Purple/Black Gradient)
  const grad = ctx.createRadialGradient(width/2, height/3, 100, width/2, height/2, height);
  grad.addColorStop(0, '#1a103c'); // Lighter purple center
  grad.addColorStop(0.4, '#0f0520'); // Deep purple
  grad.addColorStop(1, '#000000'); // Black edges
  
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  
  // Add some "Stars" (Noise)
  for(let i=0; i<300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 1.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
  }

  // 2. Main Subject (3D Card) - Scaled appropriately
  const img = new Image();
  img.crossOrigin = "anonymous"; 
  img.src = cardImage;
  
  await new Promise((resolve, reject) => { 
      img.onload = resolve; 
      img.onerror = reject;
  });
  
  // Calculate layout to prevent overlap
  // We allocate the top 65% for the card visual, and bottom 35% for text info
  const cardSectionHeight = height * 0.65;
  const textSectionStartY = cardSectionHeight + 50; // Safety gap
  
  // Fit image within cardSectionHeight
  const padding = 80;
  const availWidth = width - padding * 2;
  const availHeight = cardSectionHeight - 150; // Top margin
  
  // Maintain aspect ratio
  const imgRatio = img.width / img.height;
  const containerRatio = availWidth / availHeight;
  
  let drawW, drawH;
  if (imgRatio > containerRatio) {
      drawW = availWidth;
      drawH = availWidth / imgRatio;
  } else {
      drawH = availHeight;
      drawW = availHeight * imgRatio;
  }
  
  const drawX = (width - drawW) / 2;
  const drawY = 100 + (availHeight - drawH) / 2; // Vertically center in top section
  
  // Add a glow behind the card
  ctx.shadowColor = data.gradient[0];
  ctx.shadowBlur = 150;
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.shadowBlur = 0; 

  // 3. Info Layer (Bottom Flow Layout)
  // Title (Golden Serif)
  ctx.font = 'bold 72px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Gold Gradient Text
  const textGrad = ctx.createLinearGradient(0, textSectionStartY, 0, textSectionStartY + 80);
  textGrad.addColorStop(0, '#fcd34d');
  textGrad.addColorStop(0.5, '#fffbeb');
  textGrad.addColorStop(1, '#d4af37');
  ctx.fillStyle = textGrad;
  
  ctx.fillText(data.title.toUpperCase(), width/2, textSectionStartY);
  
  // Divider
  const dividerY = textSectionStartY + 100;
  ctx.strokeStyle = '#ffffff';
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(width/2 - 100, dividerY);
  ctx.lineTo(width/2 + 100, dividerY);
  ctx.stroke();
  ctx.globalAlpha = 1.0;
  
  // Incantation (Italic)
  ctx.font = 'italic 42px "Cinzel", serif';
  ctx.fillStyle = '#e2e8f0';
  const maxWidth = width - 200;
  // Ensure incantation starts well below divider
  wrapText(ctx, `"${data.incantation}"`, width/2, dividerY + 60, maxWidth, 60);
  
  // Footer Signature
  ctx.font = '32px "Cinzel", serif';
  ctx.fillStyle = '#94a3b8';
  const signature = `Forged by ${username} | The Celestial Forge`;
  
  // Dynamic scaling for long names
  const sigMetrics = ctx.measureText(signature);
  if (sigMetrics.width > width - 100) {
      const newSize = Math.floor(32 * ((width - 100) / sigMetrics.width));
      ctx.font = `${newSize}px "Cinzel", serif`;
  }
  
  ctx.fillText(signature, width/2, height - 280);

  // 4. Brand Layer (QR Code)
  // Generate QR
  const qrUrl = "https://trae.ai"; // Replace with actual URL
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      margin: 1,
      color: {
          dark: '#000000',
          light: '#ffffff'
      },
      width: 256 // Ensure high resolution for QR
  });
  
  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  await new Promise((resolve) => { qrImg.onload = resolve; });
  
  const qrSize = 180;
  const qrX = width - qrSize - 60;
  const qrY = height - qrSize - 60;
  
  // QR Background (White rounded rect with gold border)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  
  ctx.beginPath();
  // Using roundRect if supported, else rect
  if (ctx.roundRect) {
      ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 10);
  } else {
      ctx.rect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
  }
  ctx.fill();
  ctx.stroke();
  
  // Draw QR with crisp scaling
  ctx.imageSmoothingEnabled = false; // Keep QR sharp
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  ctx.imageSmoothingEnabled = true; // Restore for text
  
  // Call to action
  ctx.textAlign = 'right';
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText("Scan to forge your own destiny", qrX - 20, qrY + qrSize/2);

  return canvas.toDataURL('image/jpeg', 0.95); // Use JPEG 95% for better photo quality but smaller size? Or PNG for crispness. 
  // User asked for "image quality", PNG is best for text/sharpness. JPEG is better for gradients.
  // Given the dark gradient and text, PNG is safer to avoid banding, but file size might be large.
  // Let's stick to PNG 1.0 or high quality JPEG. 
  // Let's use JPEG 0.95 to ensure it's widely compatible and high res.
}

// Helper for text wrapping
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
}
