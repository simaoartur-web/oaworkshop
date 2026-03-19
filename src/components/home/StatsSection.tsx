import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

const StatItem = ({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, value, {
            duration: 2,
            delay: delay + 0.5,
            ease: [0.22, 1, 0.36, 1],
        });
        return controls.stop;
    }, [count, value, delay]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center gap-4"
        >
            <div className="flex items-baseline text-white">
                <motion.span className="text-5xl md:text-6xl font-light tracking-tighter leading-none">
                    {rounded}
                </motion.span>
                <span className="text-2xl md:text-3xl font-light ml-1">+</span>
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
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 max-w-5xl mx-auto">
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
