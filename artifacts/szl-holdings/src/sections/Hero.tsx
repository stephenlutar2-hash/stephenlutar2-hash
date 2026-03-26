import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";

function AnimatedBackground({ reducedMotion }: { reducedMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      pulse: number;
      pulseSpeed: number;
    }> = [];

    function resize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }

    function initParticles() {
      particles.length = 0;
      const isMobile = width < 768;
      const count = isMobile
        ? Math.min(30, Math.floor((width * height) / 30000))
        : Math.min(60, Math.floor((width * height) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.05,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      for (const p of particles) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) / 200 * 0.02;
          p.vx += dx * force * 0.01;
          p.vy += dy * force * 0.01;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const pulseOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(201, 168, 76, ${pulseOpacity})`;
        ctx!.fill();
      }

      const maxDist = width < 768 ? 120 : 180;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(201, 168, 76, ${0.06 * (1 - dist / maxDist)})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();

    const handleResize = () => {
      resize();
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  );
}

function StaggeredText({ text, className, delay = 0, reducedMotion }: { text: string; className?: string; delay?: number; reducedMotion: boolean }) {
  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.03,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ display: "inline-block", transformOrigin: "bottom" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : 150]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, reducedMotion ? 1 : 0]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleScrollDown = () => {
    const el = document.querySelector("#vision");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-gradient-to-b from-background via-background to-surface" />
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gold/[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gold/[0.03] blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold/[0.02] blur-[160px]" />
      </motion.div>
      <AnimatedBackground reducedMotion={reducedMotion} />

      <motion.div style={{ y: contentY, opacity }} className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/20 bg-gold/[0.05] mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-xs tracking-[0.25em] uppercase text-gold-light font-medium">
              Innovation & Venture Platform
            </span>
          </div>
        </motion.div>

        {mounted && (
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium leading-[0.95] tracking-tight mb-10">
            <StaggeredText text="Building the" className="text-foreground block" delay={0.2} reducedMotion={reducedMotion} />
            <StaggeredText text="Future of Technology" className="text-gradient-gold italic block mt-2" delay={0.6} reducedMotion={reducedMotion} />
          </h1>
        )}

        <motion.p
          initial={reducedMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: reducedMotion ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-14 font-light"
        >
          SZL Holdings is a premium holdings and innovation umbrella — engineering
          transformative platforms across security, artificial intelligence,
          maritime intelligence, and creative technology.
        </motion.p>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: reducedMotion ? 0 : 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#ecosystem"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#ecosystem")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="group px-8 py-3.5 bg-gradient-to-r from-gold to-gold-dark text-background font-semibold text-sm tracking-wide rounded-lg hover:shadow-lg hover:shadow-gold/25 transition-all duration-300 inline-flex items-center gap-2"
          >
            Explore the Ecosystem
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-3.5 border border-foreground/15 text-foreground font-medium text-sm tracking-wide rounded-lg hover:bg-foreground/5 hover:border-foreground/25 transition-all duration-300"
          >
            Get in Touch
          </a>
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reducedMotion ? 0 : 2, duration: 1 }}
          className="mt-20 flex items-center justify-center gap-8 sm:gap-12 text-muted/60"
        >
          {["Security", "AI & Analytics", "Maritime", "Creative Tech"].map((label, i) => (
            <motion.span
              key={label}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reducedMotion ? 0 : 2.2 + i * 0.15, duration: 0.8 }}
              className="text-[11px] sm:text-xs tracking-[0.15em] uppercase font-medium"
            >
              {label}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      <motion.button
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reducedMotion ? 0 : 2.5, duration: 1 }}
        onClick={handleScrollDown}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted hover:text-foreground transition-colors"
        aria-label="Scroll down"
      >
        <motion.div
          animate={reducedMotion ? {} : { y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown size={20} />
        </motion.div>
      </motion.button>
    </section>
  );
}
