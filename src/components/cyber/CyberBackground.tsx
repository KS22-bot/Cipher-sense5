import { useEffect, useRef } from "react";

/** Animated particle + grid backdrop. Purely decorative. */
export function CyberBackground({ dense = false }: { dense?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let particles: P[] = [];

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(dense ? 90 : 55, Math.round((width * height) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.4,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(120, 240, 255, 0.55)";
        ctx.fill();
      }
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]!;
          const b = particles[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(90, 230, 200, ${(1 - d / 130) * 0.18})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [dense]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-background" />
      <div className="cyber-grid animate-grid-pan absolute inset-0 opacity-70" />
      <div className="animate-float-slow absolute -left-32 top-[-10%] h-[38rem] w-[38rem] rounded-full bg-cyber-cyan/10 blur-[120px]" />
      <div className="animate-pulse-glow absolute right-[-10%] top-1/3 h-[32rem] w-[32rem] rounded-full bg-cyber-violet/10 blur-[120px]" />
      <div className="animate-float-slow absolute bottom-[-15%] left-1/3 h-[30rem] w-[30rem] rounded-full bg-cyber-emerald/10 blur-[120px]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--background)_100%)]" />
    </div>
  );
}