import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { requestGetAllCars } from '../config/CarRequest';
import { useStore } from '../hooks/useStore';

const Banner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const { themeMode } = useStore();
    const isLightTheme = themeMode === 'light';

    const formatTransmission = (value) => {
        if (!value) return 'Automatic';
        const normalized = value.toLowerCase();
        if (normalized.includes('tự động') || normalized.includes('tu dong')) return 'Automatic';
        if (normalized.includes('số sàn') || normalized.includes('so san')) return 'Manual';
        return value;
    };

    const normalizeTextKey = (value = '') =>
        value
            .toString()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .toLowerCase();

    const formatFuelType = (value) => {
        const key = normalizeTextKey(value);
        if (key === 'xang' || key === 'gasoline') return 'Gasoline';
        if (key === 'dau' || key === 'diesel') return 'Diesel';
        if (key === 'dien' || key === 'electric') return 'Electric';
        if (key === 'hybrid') return 'Hybrid';
        return value || 'Gasoline';
    };

    const formatCategoryName = (value) => {
        if (!value) return 'Car';
        const parts = value
            .split('/')
            .map((part) => part.trim())
            .filter(Boolean);
        return parts[0] || value;
    };

    const formatDescription = (description, carName) => {
        if (!description) return 'Breakthrough design - leading technology';
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
            description,
        );
        const cleaned = hasVietnamese
            ? `${carName || 'This vehicle'} features modern styling, strong performance, and advanced safety technology.`
            : description;
        return cleaned.length > 100 ? `${cleaned.substring(0, 100)}...` : cleaned;
    };

    useEffect(() => {
        const fetchCars = async () => {
            try {
                // Fetch top 5 newest or most expensive cars
                const res = await requestGetAllCars({
                    limit: 5,
                    sortBy: 'price',
                    sortOrder: 'desc',
                });

                if (res.metadata.cars && res.metadata.cars.length > 0) {
                    const mappedSlides = res.metadata.cars.map((car) => ({
                        id: car._id,
                        slug: car.slug,
                        image:
                            car.images && car.images.length > 0
                                ? `${import.meta.env.VITE_URL_IMAGE}${car.images[0]}`
                                : '',
                        subtitle: `${car.brand?.name || 'Car'} ${formatCategoryName(car.category?.name) || 'new'}`,
                        title: car.name,
                        highlight: 'Premium',
                        description: formatDescription(car.description, car.name),
                        features: [
                            car.specifications?.horsepower ? `${car.specifications.horsepower} HP` : 'Powerful',
                            formatTransmission(car.transmission),
                            formatFuelType(car.fuelType),
                        ],
                        price: car.price,
                    }));
                    setSlides(mappedSlides);
                }
            } catch (error) {
                console.error('Error fetching banner cars:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, []);

    useEffect(() => {
        if (slides.length > 0) {
            const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 6000);
            return () => clearInterval(timer);
        }
    }, [slides]);

    if (loading) {
        return (
            <div className="h-[75vh] min-h-125 flex items-center justify-center bg-(--app-surface-strong)">
                <Loader2 className="w-10 h-10 text-[#0066FF] animate-spin" />
            </div>
        );
    }

    if (slides.length === 0) return null;

    const slide = slides[currentSlide];

    return (
        <section className="relative h-[75vh] min-h-125 max-h-175 overflow-hidden bg-(--app-surface-strong)">
            <AnimatePresence mode="wait">
                <motion.div
                    key={slide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {slide.image && <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-linear-to-r from-black/72 via-black/44 to-black/15" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#020817]/55 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 h-full max-w-275 mx-auto px-4 flex items-center">
                <motion.div
                    key={slide.id} // Re-animate text on slide change
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="max-w-lg p-5 sm:p-6"
                >
                    <span className="inline-block px-3 py-1 bg-[#0066FF]/20 border border-[#0066FF]/30 rounded-full text-[#0066FF] text-[10px] font-semibold tracking-wider uppercase mb-3">
                        {slide.subtitle}
                    </span>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 drop-shadow-[0_6px_20px_rgba(0,0,0,0.45)]">
                        {slide.title}
                        <br />
                        <span className="text-[#0066FF]">{slide.highlight}</span>
                    </h1>

                    <p className="text-white/78 text-sm mb-5 drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                        {slide.description}
                    </p>

                    <div className="flex items-center gap-3 mb-6">
                        <Link to={`/cars/${slide.slug}`}>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="group relative"
                            >
                                <div className="absolute -inset-0.5 bg-[#0066FF] rounded-lg opacity-0 blur-md group-hover:opacity-50 transition-opacity" />
                                <div className="relative flex items-center gap-1.5 px-4 py-2 bg-[#0066FF] hover:bg-[#0052cc] rounded-lg text-white text-xs font-semibold shadow-lg shadow-[#0066FF]/25 transition-all">
                                    <span>View details</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </motion.button>
                        </Link>
                        <Link to="/lien-he">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="flex items-center gap-1.5 px-4 py-2 border border-white/25 rounded-lg text-white text-xs font-medium transition-all bg-black/28 hover:bg-black/38 shadow-(--app-shadow-soft)"
                            >
                                <span>Get a quote</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </motion.button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {slide.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-[#0066FF] rounded-full" />
                                <span className="text-white/78 text-[10px] font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1 rounded-full transition-all duration-300 ${
                            idx === currentSlide
                                ? 'w-6 bg-[#0066FF]'
                                : isLightTheme
                                  ? 'w-2 bg-slate-400/60 hover:bg-slate-500/70'
                                  : 'w-2 bg-(--app-text-muted)/45 hover:bg-(--app-text-muted)/70'
                        }`}
                    />
                ))}
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute bottom-6 right-6 z-20"
            >
                <div
                    className={`flex flex-col items-center gap-1.5 ${
                        isLightTheme ? 'text-slate-600/80' : 'text-(--app-text-muted)'
                    }`}
                >
                    <span className="text-[9px] uppercase tracking-wider">Scroll</span>
                    <ChevronDown className="w-4 h-4" />
                </div>
            </motion.div>
        </section>
    );
};

export default Banner;
