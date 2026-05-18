import { motion } from 'framer-motion';

type OverlayVariant = 'under-construction' | 'coming-soon';

interface SectionOverlayStatusProps {
    title: string;
    subtitle: string;
    variant?: OverlayVariant;
    animated?: boolean;
    blurIntensity?: 'soft' | 'medium' | 'strong';
    fullSection?: boolean;
    badge?: string;
}

const blurClasses = {
    soft: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md',
    strong: 'backdrop-blur-xl',
};

const badgeLabel = {
    'under-construction': 'In Progress',
    'coming-soon': 'Launching Soon',
};

const SectionOverlayStatus = ({
    title,
    subtitle,
    variant = 'under-construction',
    animated = true,
    blurIntensity = 'medium',
    fullSection = true,
    badge,
}: SectionOverlayStatusProps) => {
    const glow = variant === 'coming-soon' ? 'rgba(212,175,55,0.18)' : 'rgba(196,85,50,0.22)';

    return (
        <motion.div
            className={`${fullSection ? 'absolute inset-0' : 'absolute inset-x-0 top-0 bottom-0'} z-50 flex items-center justify-center px-6 py-12 pointer-events-auto`}
            initial={animated ? { opacity: 0 } : false}
            animate={animated ? { opacity: 1 } : undefined}
            transition={{ duration: 0.55, ease: [0.19, 1, 0.22, 1] }}
            aria-label={`${title}: ${subtitle}`}
        >
            <div className={`absolute inset-0 bg-[#050505]/68 ${blurClasses[blurIntensity]}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(115deg,rgba(255,255,255,0.05),transparent_42%,rgba(166,93,74,0.08))]" />
            <motion.div
                className="absolute inset-x-8 top-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={animated ? { opacity: [0.25, 0.65, 0.25] } : undefined}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
                className="relative w-full max-w-xl overflow-hidden rounded-[10px] border border-white/15 bg-black/45 px-7 py-9 text-center shadow-[0_30px_100px_rgba(0,0,0,0.55)] md:px-12 md:py-11"
                style={{ boxShadow: `0 30px 110px rgba(0,0,0,0.58), 0 0 70px ${glow}` }}
                initial={animated ? { opacity: 0, y: 18, scale: 0.98 } : false}
                animate={animated ? { opacity: 1, y: 0, scale: 1 } : undefined}
                transition={{ duration: 0.75, delay: 0.12, ease: [0.19, 1, 0.22, 1] }}
            >
                <motion.div
                    className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.08),transparent)]"
                    animate={animated ? { x: ['-120%', '120%'] } : undefined}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative z-10 flex flex-col items-center gap-5">
                    <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.38em] text-terracota">
                        {badge ?? badgeLabel[variant]}
                    </span>
                    <motion.h3
                        className="text-3xl font-light tracking-tight text-white md:text-5xl"
                        animate={animated ? { opacity: [0.88, 1, 0.88] } : undefined}
                        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        {title}
                    </motion.h3>
                    <p className="max-w-md text-sm font-light leading-relaxed tracking-wide text-white/58 md:text-base">
                        {subtitle}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SectionOverlayStatus;
