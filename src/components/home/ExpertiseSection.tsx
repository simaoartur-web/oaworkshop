import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ExpertiseSection = () => {
    const { t } = useTranslation();
    const areaText = t('expertiseSection.areas', { returnObjects: true }) as Array<{ id: string; title: string; desc: string }>;
    const areaImages = [
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1583339522870-0d9f28cef33f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    ];
    const expertiseAreas = areaText.map((area, index) => ({ ...area, img: areaImages[index] }));

    return (
        <section id="expertise" className="bg-black-900 text-white min-h-screen py-24">
            <div className="container-custom mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-6">{t('nav.expertise')}</h2>
                    <h3 className="text-4xl md:text-5xl font-light mb-8 max-w-2xl">
                        {t('expertiseSection.intro')}
                    </h3>
                </motion.div>
            </div>

            <div className="w-full">
                {expertiseAreas.map((area, index) => (
                    <motion.div
                        key={area.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="group relative min-h-[300px] h-[45vh] lg:h-[75vh] w-full overflow-hidden border-t border-white/10 last:border-b flex items-center"
                    >
                        <div className="absolute inset-0 w-full h-full z-0 slow-zoom">
                            <img
                                src={area.img}
                                alt={area.title}
                                className="w-full h-full object-cover filter grayscale-0 opacity-40 lg:opacity-30 lg:grayscale lg:group-hover:grayscale-0 lg:group-hover:opacity-60 transition-all duration-[2s] ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black-900/90 via-black-900/40 to-transparent group-hover:from-black-900/80 transition-all duration-1000" />
                        </div>

                        <div className="container-custom relative z-10 w-full flex flex-col justify-center h-full">
                            <div className="max-w-xl">
                                <h4 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter mb-6 transition-transform duration-700 group-hover:translate-x-4">
                                    {area.title}
                                </h4>

                                <div className="overflow-hidden">
                                    <p className="text-gray-300 font-light text-base md:text-xl lg:text-2xl leading-relaxed transform lg:translate-y-full lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-700 delay-100">
                                        {area.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default ExpertiseSection;
