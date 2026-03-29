import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';

const StatItem = ({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [hasTriggered, setHasTriggered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const startAnimation = useCallback(() => {
        if (hasTriggered) return;
        setHasTriggered(true);

        const totalDuration = 2000; // ms
        const scrambleDuration = 1200; // random phase
        const settleDuration = totalDuration - scrambleDuration;
        const startTime = performance.now() + delay * 1000;

        const tick = (now: number) => {
            const elapsed = now - startTime;
            if (elapsed < 0) {
                requestAnimationFrame(tick);
                return;
            }

            if (elapsed < scrambleDuration) {
                // Random scramble phase — show random numbers that gradually approach the target
                const progress = elapsed / scrambleDuration;
                const range = value * (1 - progress * 0.6); // narrowing range
                const center = value * progress;
                const randomVal = Math.round(center + (Math.random() - 0.5) * range * 2);
                setDisplayValue(Math.max(0, Math.min(value * 2, randomVal)));
                requestAnimationFrame(tick);
            } else if (elapsed < totalDuration) {
                // Settle phase — ease into the final value
                const settleProgress = (elapsed - scrambleDuration) / settleDuration;
                const eased = 1 - Math.pow(1 - settleProgress, 3); // easeOutCubic
                const current = Math.round(displayValue + (value - displayValue) * eased);
                setDisplayValue(current);
                requestAnimationFrame(tick);
            } else {
                setDisplayValue(value);
            }
        };

        requestAnimationFrame(tick);
    }, [hasTriggered, value, delay]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTriggered) {
                    startAnimation();
                }
            },
            { threshold: 0.5 }
        );

        const el = ref.current;
        if (el) observer.observe(el);
        return () => { if (el) observer.unobserve(el); };
    }, [hasTriggered, startAnimation]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center gap-4"
        >
            <div className="flex items-center text-white">
                <span className="text-2xl md:text-4xl font-light tracking-tighter leading-none tabular-nums">
                    {displayValue}
                </span>
                <span className="text-3xl md:text-5xl font-light text-terracota ml-1">+</span>
            </div>
            <div className="flex flex-col items-center">
                {label.split('\n').map((line, i) => (
                    <span 
                        key={i} 
                        className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] text-terracota font-medium leading-relaxed"
                    >
                        {line}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};

const StatsSection = () => {
    const stats = [
        { value: 50, label: "Projects\nCompleted" },
        { value: 20, label: "Years of Combined\nExperience" },
        { value: 10, label: "Countries Worked\nIn" }
    ];

    return (
        <section className="w-full py-6 md:py-8 bg-transparent overflow-hidden">
            <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 w-full">
                    {stats.map((stat, idx) => (
                        <StatItem 
                            key={stat.label} 
                            value={stat.value} 
                            label={stat.label} 
                            delay={idx * 0.2} 
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
