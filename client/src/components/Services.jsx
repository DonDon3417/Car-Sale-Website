import { motion } from 'framer-motion';
import { CreditCard, Shield, Car, Wrench } from 'lucide-react';

const Services = () => {
    const services = [
        {
            icon: CreditCard,
            title: 'Installment Support',
            description: '0% interest for the first 12 months. Fast approval within 24 hours.',
        },
        {
            icon: Shield,
            title: 'Genuine warranty',
            description: '5-year or 150,000 km warranty with a professional team.',
        },
        { icon: Car, title: 'Home Test Drive', description: 'Book a free test drive. Our specialist comes to your location.' },
        { icon: Wrench, title: 'Periodic maintenance', description: 'Automatic reminders. 20% off genuine parts.' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <section className="py-10 lg:py-14 bg-[#0a0d14]">
            <div className="max-w-[1000px] mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-6 h-[1px] bg-[#0066FF]" />
                        <span className="text-[#0066FF] text-[10px] font-semibold tracking-[0.15em] uppercase">
                            Services
                        </span>
                        <div className="w-6 h-[1px] bg-[#0066FF]" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Showroom services</h2>
                    <p className="text-white/50 text-xs">Experience premium international-standard service</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
                >
                    {services.map((service, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            className="group p-4 bg-[#111827] border border-white/5 rounded-xl transition-all duration-300 hover:border-[#0066FF]/30 hover:shadow-lg hover:shadow-[#0066FF]/5"
                        >
                            <div className="w-9 h-9 flex items-center justify-center bg-[#0066FF]/10 rounded-lg mb-3 transition-colors duration-300 group-hover:bg-[#0066FF]">
                                <service.icon className="w-4 h-4 text-[#0066FF] group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-[#0066FF] transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-white/50 text-[11px] leading-relaxed">{service.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Services;

