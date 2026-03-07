import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Gift, Percent } from 'lucide-react';

const Promotions = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 15, hours: 8, minutes: 45, seconds: 30 });

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
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg">
                <span className="text-white font-bold text-lg sm:text-xl tabular-nums">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-white/50 text-[9px] uppercase tracking-wider mt-1">{label}</span>
        </div>
    );

    return (
        <section className="py-8 lg:py-10">
            <div className="max-w-[1000px] mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0d14] via-[#0d1a2d] to-[#0066FF]/30" />
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#0066FF]/10 rounded-full blur-[80px]" />
                    <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-[#E10600]/10 rounded-full blur-[60px]" />

                    <div className="relative z-10 px-5 py-6 sm:px-8 sm:py-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                            <div className="lg:max-w-md">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <div className="w-6 h-6 flex items-center justify-center bg-[#E10600] rounded-lg">
                                        <Percent className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-[#E10600] text-[10px] font-semibold tracking-[0.12em] uppercase">
                                        Ưu đãi đặc biệt
                                    </span>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                    Ưu đãi đặc biệt <span className="text-[#0066FF]">tháng này</span>
                                </h2>

                                <p className="text-white/60 text-xs mb-4 max-w-sm">
                                    Giảm đến 100 triệu khi mua xe. Tặng kèm gói bảo hiểm 2 năm và phụ kiện chính hãng.
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {['Giảm 100 triệu', 'Bảo hiểm 2 năm', 'Phụ kiện miễn phí'].map((benefit) => (
                                        <div
                                            key={benefit}
                                            className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full"
                                        >
                                            <Gift className="w-2.5 h-2.5 text-[#0066FF]" />
                                            <span className="text-white/80 text-[10px] font-medium">{benefit}</span>
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
                                        <span>Nhận ưu đãi ngay</span>
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </motion.button>
                            </div>

                            <div className="lg:text-right">
                                <div className="flex items-center gap-1.5 mb-2 lg:justify-end">
                                    <Clock className="w-3 h-3 text-white/50" />
                                    <span className="text-white/50 text-[10px] uppercase tracking-wider">
                                        Kết thúc sau
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <TimeBlock value={timeLeft.days} label="Ngày" />
                                    <span className="text-white/30 text-lg font-light">:</span>
                                    <TimeBlock value={timeLeft.hours} label="Giờ" />
                                    <span className="text-white/30 text-lg font-light">:</span>
                                    <TimeBlock value={timeLeft.minutes} label="Phút" />
                                    <span className="text-white/30 text-lg font-light">:</span>
                                    <TimeBlock value={timeLeft.seconds} label="Giây" />
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
