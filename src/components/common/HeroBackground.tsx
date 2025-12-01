'use client';

import { useEffect, useRef } from 'react';

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let shapes: GeometricShape[] = [];
    
    // Configuration
    const shapeCount = 60;
    const connectionDistance = 160;
    const moveSpeed = 0.3;

    class GeometricShape {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      type: 'circle' | 'square' | 'triangle';
      angle: number;
      rotationSpeed: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * moveSpeed;
        this.vy = (Math.random() - 0.5) * moveSpeed;
        this.size = Math.random() * 4 + 2; // Slightly larger
        
        const types: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      }

      update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.rotationSpeed;

        if (this.x < -50) this.x = w + 50;
        if (this.x > w + 50) this.x = -50;
        if (this.y < -50) this.y = h + 50;
        if (this.y > h + 50) this.y = -50;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // Increased opacity
        ctx.beginPath();

        if (this.type === 'circle') {
          ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        } else if (this.type === 'square') {
          ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else if (this.type === 'triangle') {
          const r = this.size / 2;
          ctx.moveTo(0, -r);
          ctx.lineTo(r * Math.sin(Math.PI / 3), r * Math.cos(Math.PI / 3));
          ctx.lineTo(-r * Math.sin(Math.PI / 3), r * Math.cos(Math.PI / 3));
          ctx.closePath();
        }

        ctx.fill();
        ctx.restore();
      }
    }

    const init = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      shapes = [];
      for (let i = 0; i < shapeCount; i++) {
        shapes.push(new GeometricShape(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw shapes
      shapes.forEach(p => {
        p.update(canvas.width, canvas.height);
        p.draw(ctx);
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'; // Increased opacity
      ctx.lineWidth = 1;
      for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
          const dx = shapes[i].x - shapes[j].x;
          const dy = shapes[i].y - shapes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(shapes[i].x, shapes[i].y);
            ctx.lineTo(shapes[j].x, shapes[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      init();
    };

    // Parallax Effect
    const handleScroll = () => {
      if (container) {
        const scrolled = window.scrollY;
        container.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 animate-gradient-shift bg-[length:400%_400%]"></div>
      
      {/* Parallax Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-[120%] -top-[10%]">
         <canvas ref={canvasRef} className="w-full h-full opacity-100" /> {/* Canvas full opacity, controlled inside draw */}
         
         {/* Grid Pattern Overlay - Increased Visibility */}
         <div className="absolute inset-0 opacity-20 bg-[url('/grid-pattern.svg')] mix-blend-overlay bg-[length:60px_60px]"></div>
      </div>
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-radial-gradient-to-t from-black/40 to-transparent"></div>
    </div>
  );
}