import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-black-900 text-white pt-24 pb-12">
            <div className="container-custom">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">

                    <div className="col-span-1 md:col-span-2">
                        <img src="/logo.jpg" alt="O+A" className="w-16 h-16 object-contain mb-6" />
                        <p className="text-gray-400 font-light text-xl max-w-sm leading-relaxed mb-8">
                            Arquitetura e Planeamento para um Mundo em Mudança.
                        </p>
                        <p className="text-gray-500 text-sm">Baseado em Milão e Maputo, Moçambique.</p>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Links Rápidos</h4>
                        <ul className="space-y-4 font-light text-gray-300">
                            <li><Link to="/#workshop" className="hover:text-white transition-colors">Workshop</Link></li>
                            <li><Link to="/#expertise" className="hover:text-white transition-colors">Expertise</Link></li>
                            <li><Link to="/projects" className="hover:text-white transition-colors">Projectos</Link></li>
                            <li><Link to="/#contact" className="hover:text-white transition-colors">Contactos</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Contactos</h4>
                        <ul className="space-y-4 font-light text-gray-300">
                            <li><a href="mailto:oa@oa-workshop.com" className="hover:text-white transition-colors">oa@oa-workshop.com</a></li>
                            <li><a href="tel:+258000000000" className="hover:text-white transition-colors">+258 000 000 000</a></li>
                            <li className="pt-4">Milan, Italy</li>
                            <li>Maputo, Mozambique</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <div>© {new Date().getFullYear()} O+A Architects and Planners. Todos os direitos reservados.</div>
                    <div className="flex gap-6">
                        <Link to="/admin" className="hover:text-white transition-colors">Área Reservada</Link>
                        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
