import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Youtube, Instagram, MessageCircle, ArrowRight } from 'lucide-react';

const Footer = () => {
    const [email, setEmail] = useState('');
    const quickLinks = [
        { name: 'Home', href: '/' },
        { name: 'Cars', href: '/dong-xe' },
        { name: 'Pricing & Offers', href: '/gia-khuyen-mai' },
        { name: 'Installment', href: '/tra-gop' },
        { name: 'News', href: '/tin-tuc' },
        { name: 'Contact', href: '/lien-he' },
    ];
    const contactInfo = [
        { icon: Phone, text: '1900 1234', href: 'tel:19001234' },
        { icon: Mail, text: 'info@autoshowroom.vn', href: 'mailto:info@autoshowroom.vn' },
        { icon: MapPin, text: '123 Nguyễn Văn Linh, Q.7, TP.HCM', href: '#' },
    ];
    const socials = [
        { icon: Facebook, href: '#', label: 'Facebook' },
        { icon: Youtube, href: '#', label: 'Youtube' },
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: MessageCircle, href: '#', label: 'Zalo' },
    ];

    return (
        <footer className="bg-[#070a0f] border-t border-white/5">
            <div className="max-w-[1000px] mx-auto px-4 py-8 lg:py-10">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    <div>
                        <a href="/" className="inline-block mb-3">
                            <span className="text-white font-bold text-sm tracking-[0.12em] uppercase">
                                AUTO<span className="text-[#0066FF]">SHOW</span>
                            </span>
                        </a>
                        <p className="text-white/50 text-[11px] leading-relaxed mb-4">
                            Premium car showroom with a curated collection from top brands.
                        </p>
                        <div className="flex items-center gap-1.5">
                            {socials.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    whileHover={{ scale: 1.1 }}
                                    className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-[#0066FF] rounded-lg text-white/60 hover:text-white transition-all"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-3.5 h-3.5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">
                            Quick links
                        </h4>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-white/50 hover:text-[#0066FF] text-[11px] transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-2">
                            {contactInfo.map((item, idx) => (
                                <li key={idx}>
                                    <a
                                        href={item.href}
                                        className="flex items-start gap-2 text-white/50 hover:text-white text-[11px] transition-colors"
                                    >
                                        <item.icon className="w-3.5 h-3.5 mt-0.5 text-[#0066FF]" />
                                        <span>{item.text}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <p className="text-white/40 text-[10px] mb-0.5">Hours làm việc</p>
                            <p className="text-white/70 text-[11px]">08:00 - 20:00 (T2 - CN)</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">
                            Request Consultation
                        </h4>
                        <p className="text-white/50 text-[11px] mb-3">Get updates on new cars and special offers</p>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                setEmail('');
                            }}
                            className="space-y-2"
                        >
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full h-8 px-3 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-[#0066FF] transition-colors"
                                required
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                type="submit"
                                className="w-full flex items-center justify-center gap-1.5 h-8 bg-[#0066FF] hover:bg-[#0052cc] rounded-lg text-white text-xs font-medium transition-colors"
                            >
                                <span>Subscribe</span>
                                <ArrowRight className="w-3 h-3" />
                            </motion.button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5">
                <div className="max-w-[1000px] mx-auto px-4 py-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <p className="text-white/40 text-[10px]">
                            © 2026 AutoShow. Designed by <span className="text-white/60">Premium Studio</span>
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="text-white/40 hover:text-white/70 text-[10px] transition-colors">
                                Privacy Policy
                            </a>
                            <span className="text-white/20">|</span>
                            <a href="#" className="text-white/40 hover:text-white/70 text-[10px] transition-colors">
                                Terms of Use
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
