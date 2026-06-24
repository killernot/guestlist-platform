/* ============================================================
   STATS SECTION COMPONENT
   Only shows real metrics. Hides section entirely when no data.
   ============================================================ */

import { useEffect, useRef, useState } from "react";

interface StatItem {
  label: string;
  target: number;
  suffix: string;
  prefix: string;
}

interface StatsSectionProps {
  totalEvents: number;
  totalReservations: number;
}

function AnimatedCounter({
  target,
  suffix,
  prefix,
  isVisible,
}: {
  target: number;
  suffix: string;
  prefix: string;
  isVisible: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [target, isVisible]);

  return (
    <span className="font-[var(--font-display)] text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl md:text-5xl">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection({ totalEvents, totalReservations }: StatsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const stats: StatItem[] = [];
  if (totalEvents > 0) {
    stats.push({ label: "Events", target: totalEvents, suffix: "", prefix: "" });
  }
  if (totalReservations > 0) {
    stats.push({ label: "Reservations", target: totalReservations, suffix: "", prefix: "" });
  }

  const hasStats = stats.length > 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!hasStats) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-20 sm:py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,122,36,0.06)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <h2 className="mb-4 text-center font-[var(--font-display)] text-2xl font-bold text-[var(--color-text-primary)] sm:text-3xl md:text-4xl">
          Growing Every Night
        </h2>
        <p className="mx-auto mb-12 max-w-2xl text-center font-[var(--font-body)] text-base text-[var(--color-text-secondary)] sm:text-lg">
          Real people. Real nights. No filler.
        </p>

        <div className={`grid grid-cols-1 gap-6 ${stats.length === 1 ? "sm:grid-cols-1 max-w-md mx-auto" : "sm:grid-cols-2"}`}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border-default)] bg-[var(--color-bg-surface)]/60 p-8 text-center backdrop-blur-xl transition-all duration-300 hover:border-[var(--color-neon-orange)]/20 hover:bg-[var(--color-bg-surface)]/80"
            >
              {/* Card glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(232,122,36,0.04)_0%,transparent_70%)]" />
              </div>

              <div className="relative z-10">
                <AnimatedCounter
                  target={stat.target}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  isVisible={isVisible}
                />
                <p className="mt-2 font-[var(--font-body)] text-sm font-medium text-[var(--color-text-secondary)] sm:text-base">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
