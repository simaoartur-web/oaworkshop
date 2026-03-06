import { motion } from 'framer-motion';

const WorkshopSection = () => {
    const steps = [
        { num: "01", title: "Listen", desc: "Briefing, restrições, stakeholders, realidades do local." },
        { num: "02", title: "Design", desc: "Opções, do conceito ao detalhe, conformidade." },
        { num: "03", title: "Deliver", desc: "Desenhos, Mapas de quantidades, apoio à contratação." },
        { num: "04", title: "Support", desc: "Supervisão de obra, QA/QC, pensamento de O&M." },
    ];

    return (
        <section id="workshop" className="py-24 bg-white text-black-900">
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
                    {/* Method Text */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-6">Workshop</h2>
                        <h3 className="text-4xl md:text-5xl font-light leading-tight mb-8">
                            Abordagem Centrada no Cliente
                        </h3>
                        <p className="text-lg text-gray-500 font-light mb-12 leading-relaxed">
                            Entregamos soluções arquitetónicas que combinam clareza de design, rigor técnico e uma mentalidade de implementação do conceito ao suporte à construção. Arquitetura é sobre ouvir, projetar e realizar sonhos com precisão técnica.
                        </p>

                        <div className="space-y-8">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-6 items-start">
                                    <div className="text-sm font-medium text-gray-300 pt-1">{step.num}</div>
                                    <div>
                                        <h4 className="text-xl font-medium tracking-tight mb-2">{step.title}</h4>
                                        <p className="text-gray-500 font-light text-sm">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Visual Concept */}
                    <motion.div
                        className="reveal-effect bg-gray-100 min-h-[500px] lg:min-h-full"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.2 }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                            alt="Blueprint and planning"
                            className="w-full h-full object-cover filter grayscale opacity-80"
                        />
                    </motion.div>
                </div>

                {/* The Team / A Nossa Equipa */}
                <div className="mt-32 pt-24 border-t border-gray-200">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-4">A Nossa Equipa</h2>
                        <h3 className="text-3xl font-light">Os profissionais por trás da realização dos projetos.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <motion.div
                            className="group text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-6 relative">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Artur Simão"
                                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                            <h4 className="text-lg font-medium tracking-wide">Artur Simão</h4>
                            <p className="text-xs tracking-widest text-gray-500 uppercase mt-2">Sócio Fundador</p>
                        </motion.div>

                        <motion.div
                            className="group text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-6 relative">
                                <img
                                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Osvaldo"
                                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700"
                                />
                            </div>
                            <h4 className="text-lg font-medium tracking-wide">Osvaldo</h4>
                            <p className="text-xs tracking-widest text-gray-500 uppercase mt-2">Sócio Fundador</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WorkshopSection;
