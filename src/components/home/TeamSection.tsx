import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const teamMembers = [
    {
        id: 1,
        name: "OSVALDO LUÍS",
        role: "Architect and Planner, MSc in Regional and Urban Planning",
        image: "/images/team/osvaldo.png",
        bio: [
            "2018 – Degree in Architecture and Physical Planning, UEM",
            "2023 – MSc in Regional and Urban Planning, UEM",
            "2026– MSc in Design for Development (MDFD), PoliMi",
            "2018-2022 – Architect & Urban Planner, Vedor Lda",
            "2022-2023 – Architect & Planner, AVSI Foundation",
            "2023-2025 – Local Architect, ARS Progetti",
            "2024-2025 – Project Analyst, UN-Habitat",
            "2025 – Urban Planning Consultant, Systematica, Milan",
            "2025 – Architect, Alder Clavuot Nunzi, Switzerland",
            "Since 2020 – Member, Ordem dos Arquitectos"
        ]
    },
    {
        id: 2,
        name: "ARTUR TOMÁS",
        role: "Architect and Planner, MSc in Regional and Urban Planning",
        image: "/images/team/artur.png",
        bio: [
            "2018 – Degree in Architecture and Physical Planning, UEM",
            "2023 – MSc in Regional and Urban Planning, UEM",
            "2026– MSc in Design for Development (MDFD), PoliMi",
            "2018-2022 – Architect & Urban Planner, Vedor Lda",
            "2022-2023 – Architect & Planner, AVSI Foundation",
            "2023-2025 – Local Architect, ARS Progetti",
            "2024-2025 – Project Analyst, UN-Habitat",
            "2025 – Urban Planning Consultant, Systematica, Milan",
            "2025 – Architect, Alder Clavuot Nunzi, Switzerland",
            "Since 2020 – Member, Ordem dos Arquitectos"
        ]
    }
];

const secondaryTeam = [
    { name: "Isabel Santos", role: "Senior Urbanist", image: "/images/team/member1.png" },
    { name: "Ricardo Mendonça", role: "Lead Architect", image: "/images/team/member2.png" },
    { name: "Elena Rossi", role: "Sustainability Expert", image: "/images/team/member3.png" },
    { name: "Marco Silva", role: "Computational Designer", image: "/images/team/member2.png" }
];

const TeamSection = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showRest, setShowRest] = useState(false);

    return (
        <section className="bg-black-900 border-t border-white/5 relative overflow-hidden">
            {!isOpen ? (
                <div className="py-24 flex flex-col items-center justify-center">
                    <motion.button
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        onClick={() => setIsOpen(true)}
                        className="group flex flex-col items-center gap-4 cursor-pointer"
                    >
                        <div className="text-center">
                            <h2 className="text-xl font-light tracking-[0.4em] uppercase text-gray-400 group-hover:text-white transition-all">
                                Our Team
                            </h2>
                            <div className="w-12 h-px bg-white/20 mt-4 mx-auto group-hover:w-24 transition-all"></div>
                        </div>
                    </motion.button>
                </div>
            ) : (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="py-24 relative bg-black-900 overflow-hidden"
                >
                    <div className="container-custom">
                        <div className="text-center mb-24 relative">
                            <button
                                onClick={() => { setIsOpen(false); setShowRest(false); }}
                                className="absolute right-0 top-0 p-3 bg-white/5 hover:bg-white text-gray-500 hover:text-black transition-all rounded-full group"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <h2 className="text-2xl md:text-3xl font-light tracking-tight">
                                The <span className="font-semibold">Minds</span> <br />
                                <span className="text-[10px] tracking-[0.5em] text-gray-500 mt-2 block uppercase">Behind the projects</span>
                            </h2>
                        </div>

                        {/* Top Team Members */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                            {/* Osvaldo Bio */}
                            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-3 lg:text-right hidden lg:block">
                                <div className="space-y-3 text-[10px] text-gray-500 font-light">
                                    {teamMembers[0].bio.map((item, i) => (
                                        <p key={i}>{item}</p>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Center Portraits */}
                            <div className="lg:col-span-6 flex gap-1 justify-center relative">
                                <div className="relative w-1/2 aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 group">
                                    <img src={teamMembers[0].image} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[2s]" alt="" />
                                    <div className="absolute inset-x-0 bottom-4 text-center">
                                        <p className="text-[10px] font-bold text-terracota uppercase tracking-widest">{teamMembers[0].name}</p>
                                    </div>
                                </div>
                                <div className="relative w-1/2 aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 group">
                                    <img src={teamMembers[1].image} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[2s]" alt="" />
                                    <div className="absolute inset-x-0 bottom-4 text-center">
                                        <p className="text-[10px] font-bold text-terracota uppercase tracking-widest">{teamMembers[1].name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Artur Bio */}
                            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-3 text-left hidden lg:block">
                                <div className="space-y-3 text-[10px] text-gray-500 font-light">
                                    {teamMembers[1].bio.map((item, i) => (
                                        <p key={i}>{item}</p>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Roles footer for main members */}
                        <div className="mt-8 flex justify-center gap-16 text-center lg:hidden">
                            <div>
                                <p className="text-[9px] text-gray-500 font-light">{teamMembers[0].role}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-500 font-light">{teamMembers[1].role}</p>
                            </div>
                        </div>

                        {/* Show Rest Button */}
                        <div className="mt-32 text-center">
                            {!showRest ? (
                                <button
                                    onClick={() => setShowRest(true)}
                                    className="group flex flex-col items-center gap-6 mx-auto"
                                >
                                    <span className="text-[10px] tracking-[0.4em] text-gray-500 group-hover:text-white transition-all uppercase">Our Team</span>
                                    <div className="w-px h-16 bg-gradient-to-b from-gray-800 via-white to-gray-800 group-hover:h-24 transition-all"></div>
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className="pt-16 border-t border-white/5"
                                >
                                    <h3 className="text-xs tracking-[0.5em] text-gray-500 uppercase mb-16">The rest of the team</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                                        {secondaryTeam.map((member, i) => (
                                            <div key={i} className="space-y-4 group">
                                                <div className="aspect-square overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                                                    <img src={member.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" alt="" />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-[11px] font-semibold tracking-widest uppercase">{member.name}</h4>
                                                    <p className="text-[9px] text-gray-500 font-light mt-1 uppercase tracking-tighter">{member.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        onClick={() => setShowRest(false)}
                                        className="mt-24 text-[9px] tracking-widest uppercase border-b border-white/20 pb-1 hover:border-white transition-all"
                                    >
                                        Hide rest of team
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </section>
    );
};

export default TeamSection;
