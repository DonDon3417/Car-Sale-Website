import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Gift, Percent } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const Promotions = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 15, hours: 8, minutes: 45, seconds: 30 });
    const { themeMode } = useStore();
    const isLightTheme = themeMode === 'light';

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                let { days, hours, minutes, seconds } = prev;
                if (seconds > 0) seconds--;
                else {
                    seconds = 59;
                    if (minutes > 0) minutes--;
                    else {
                        minutes = 59;
                        if (hours > 0) hours--;
                        else {
                            hours = 23;
                            if (days > 0) days--;
                        }
                    }
                }
                return { days, hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const TimeBlock = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div
                className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center backdrop-blur-sm border rounded-lg shadow-(--app-shadow-soft) ${
                    isLightTheme ? 'bg-white/75 border-(--app-border)' : 'bg-(--app-surface-soft) border-(--app-border)'
                }`}
            >
                <span className="text-(--app-text) font-bold text-lg sm:text-xl tabular-nums">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-(--app-text-muted) text-[9px] uppercase tracking-wider mt-1">{label}</span>
        </div>
    );

    return (
        <section className="py-8 lg:py-10">
            <div className="max-w-250 mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-2xl"
                >
                    <div
                        className={`absolute inset-0 ${
                            isLightTheme
                                ? 'bg-linear-to-r from-white via-[#f0f6ff] to-[#dbeafe]'
                                : 'bg-linear-to-r from-[#0b1220] via-[#0d1a30] to-[#0a1629]'
                        }`}
                    />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#0066FF]/12 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-[#E10600]/8 rounded-full blur-[60px]" />

                    <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                            <div className="lg:max-w-md">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-6 h-6 flex items-center justify-center bg-[#E10600] rounded-lg">
                                        <Percent className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-[#E10600] text-[10px] font-semibold tracking-[0.12em] uppercase">
                                        Special Offer
                                    </span>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold text-(--app-text) mb-2">
                                    Special Offer <span className="text-[#0066FF]">this month</span>
                                </h2>

                                <p className="text-(--app-text-muted) text-xs mb-4 max-w-sm">
                                    Get up to 100 million VND off when buying a car. Includes a 2-year insurance package
                                    and genuine accessories.
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {['100 million VND off', '2-year insurance', 'Free accessories'].map((benefit) => (
                                        <div
                                            key={benefit}
                                            className={`flex items-center gap-1 px-2 py-1 border rounded-full ${
                                                isLightTheme
                                                    ? 'bg-white/70 border-(--app-border)'
                                                    : 'bg-(--app-surface-soft) border-(--app-border)'
                                            }`}
                                        >
                                            <Gift className="w-2.5 h-2.5 text-[#0066FF]" />
                                            <span className="text-(--app-text) text-[10px] font-medium">{benefit}</span>
                                        </div>
                                    ))}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group relative"
                                >
                                    <div className="absolute -inset-1 bg-[#E10600] rounded-lg opacity-0 blur-md group-hover:opacity-40 transition-opacity duration-300" />
                                    <div className="relative flex items-center gap-1.5 px-4 py-2 bg-[#E10600] hover:bg-[#c70500] rounded-lg text-white text-xs font-semibold shadow-lg shadow-[#E10600]/25 transition-all">
                                        <span>Get Offer Now</span>
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </motion.button>
                            </div>

                            <div className="lg:text-right">
                                <div className="flex items-center gap-1.5 mb-2 lg:justify-end">
                                    <Clock className="w-3 h-3 text-(--app-text-muted)" />
                                    <span className="text-(--app-text-muted) text-[10px] uppercase tracking-wider">
                                        Ends in
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <TimeBlock value={timeLeft.days} label="Days" />
                                    <span className="text-(--app-text-muted) text-lg font-light">:</span>
                                    <TimeBlock value={timeLeft.hours} label="Hours" />
                                    <span className="text-(--app-text-muted) text-lg font-light">:</span>
                                    <TimeBlock value={timeLeft.minutes} label="Minutes" />
                                    <span className="text-(--app-text-muted) text-lg font-light">:</span>
                                    <TimeBlock value={timeLeft.seconds} label="Seconds" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Promotions;
