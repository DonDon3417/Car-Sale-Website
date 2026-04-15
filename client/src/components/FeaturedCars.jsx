import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Gauge, Users, Fuel, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { requestGetAllCars } from '../config/CarRequest';
import { useStore } from '../hooks/useStore';

const FeaturedCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const { themeMode } = useStore();
    const isLightTheme = themeMode === 'light';

    const formatTransmission = (value) => {
        if (!value) return '-';
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
        return value || '-';
    };

    const formatCategoryName = (value) => {
        if (!value) return 'Car';
        const parts = value
            .split('/')
            .map((part) => part.trim())
            .filter(Boolean);
        return parts[0] || value;
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const res = await requestGetAllCars({ limit: 6, status: 'available' });
            setCars(res.metadata?.cars || []);
        } catch (error) {
            console.error('Error loading cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US').format(price) + ' VND';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    return (
        <section className="py-16 lg:py-24">
            <div className="max-w-300 mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="w-8 h-0.5 bg-linear-to-r from-transparent to-[#0066FF]" />
                        <span className="text-[#0066FF] text-xs font-semibold tracking-[0.2em] uppercase">Explore</span>
                        <div className="w-8 h-0.5 bg-linear-to-l from-transparent to-[#0066FF]" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-(--app-text) mb-3">Featured Cars</h2>
                    <p className="text-(--app-text-muted) text-sm max-w-lg mx-auto">
                        Explore a premium car collection with breakthrough design and advanced technology
                    </p>
                </motion.div>

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Cars Grid */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-50px' }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {cars.map((car) => (
                                <motion.div
                                    key={car._id}
                                    variants={cardVariants}
                                    whileHover={{ y: -8 }}
                                    className={`group relative border rounded-2xl overflow-hidden transition-all duration-500 hover:border-[#0066FF]/30 ${
                                        isLightTheme
                                            ? 'bg-linear-to-b from-white to-[#f8fbff] border-slate-200 shadow-[0_16px_36px_rgba(15,23,42,0.12)] hover:shadow-[0_22px_46px_rgba(15,23,42,0.16)]'
                                            : 'bg-linear-to-b from-(--app-surface-strong) to-(--app-surface-soft) border-(--app-border) shadow-(--app-shadow-soft)'
                                    }`}
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-16/10 overflow-hidden">
                                        <img
                                            src={
                                                car.images?.[0]
                                                    ? import.meta.env.VITE_API_URL + car.images[0]
                                                    : 'https://via.placeholder.com/400x250?text=No+Image'
                                            }
                                            alt={car.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/62 via-transparent to-transparent" />

                                        {/* Tags */}
                                        <div className="absolute top-3 left-3 flex gap-2">
                                            <span className="px-2.5 py-1 bg-[#0066FF] backdrop-blur-sm rounded-lg text-white text-[10px] font-semibold uppercase tracking-wider shadow-lg">
                                                {formatCategoryName(car.category?.name)}
                                            </span>
                                            {car.discountPrice > 0 && (
                                                <span className="px-2.5 py-1 bg-red-500 backdrop-blur-sm rounded-lg text-white text-[10px] font-semibold uppercase tracking-wider shadow-lg">
                                                    Discount
                                                </span>
                                            )}
                                        </div>

                                        {/* Brand Badge */}
                                        <div className="absolute top-3 right-3">
                                            <span
                                                className={`px-2.5 py-1 backdrop-blur-md rounded-lg text-[10px] font-medium border ${
                                                    isLightTheme
                                                        ? 'bg-white/85 text-(--app-text) border-(--app-border)'
                                                        : 'bg-(--app-surface-soft)/90 text-(--app-text) border-(--app-border)'
                                                }`}
                                            >
                                                {car.brand?.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        {/* Name & Price */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-(--app-text) font-bold text-lg group-hover:text-[#0066FF] transition-colors duration-300 line-clamp-1">
                                                    {car.name}
                                                </h3>
                                                <p className="text-(--app-text-muted) text-xs mt-0.5">
                                                    {car.year} • {formatTransmission(car.transmission)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[#0066FF] font-bold text-lg">
                                                    {formatPrice(car.price)}
                                                </span>
                                                {car.discountPrice > 0 && (
                                                    <p className="text-(--app-text-muted) text-xs line-through">
                                                        {formatPrice(car.discountPrice)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Specs */}
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div
                                                className={`flex items-center gap-1.5 p-2 border rounded-xl ${
                                                    isLightTheme
                                                        ? 'bg-white border-slate-200 shadow-[0_6px_16px_rgba(15,23,42,0.08)]'
                                                        : 'bg-(--app-surface-soft) border-(--app-border) shadow-none'
                                                }`}
                                            >
                                                <div className="w-7 h-7 bg-[#0066FF]/12 rounded-lg flex items-center justify-center">
                                                    <Zap className="w-3.5 h-3.5 text-[#0066FF]" />
                                                </div>
                                                <div>
                                                    <p className="text-(--app-text-muted) text-[9px] uppercase">
                                                        Power
                                                    </p>
                                                    <p className="text-(--app-text) text-xs font-medium">
                                                        {car.specifications?.horsepower || '-'} HP
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={`flex items-center gap-1.5 p-2 border rounded-xl ${
                                                    isLightTheme
                                                        ? 'bg-white border-slate-200 shadow-[0_6px_16px_rgba(15,23,42,0.08)]'
                                                        : 'bg-(--app-surface-soft) border-(--app-border) shadow-none'
                                                }`}
                                            >
                                                <div className="w-7 h-7 bg-[#0066FF]/12 rounded-lg flex items-center justify-center">
                                                    <Fuel className="w-3.5 h-3.5 text-[#0066FF]" />
                                                </div>
                                                <div>
                                                    <p className="text-(--app-text-muted) text-[9px] uppercase">
                                                        Fuel type
                                                    </p>
                                                    <p className="text-(--app-text) text-xs font-medium">
                                                        {formatFuelType(car.fuelType)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={`flex items-center gap-1.5 p-2 border rounded-xl ${
                                                    isLightTheme
                                                        ? 'bg-white border-slate-200 shadow-[0_6px_16px_rgba(15,23,42,0.08)]'
                                                        : 'bg-(--app-surface-soft) border-(--app-border) shadow-none'
                                                }`}
                                            >
                                                <div className="w-7 h-7 bg-[#0066FF]/12 rounded-lg flex items-center justify-center">
                                                    <Users className="w-3.5 h-3.5 text-[#0066FF]" />
                                                </div>
                                                <div>
                                                    <p className="text-(--app-text-muted) text-[9px] uppercase">
                                                        Seats
                                                    </p>
                                                    <p className="text-(--app-text) text-xs font-medium">
                                                        {car.seats} seats
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Colors Preview */}
                                        {car.colors?.length > 0 && (
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="text-(--app-text-muted) text-xs">Colors:</span>
                                                <div className="flex gap-1">
                                                    {car.colors.slice(0, 5).map((color, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="w-4 h-4 rounded-full border border-(--app-border)"
                                                            style={{ backgroundColor: color.code }}
                                                            title={color.name}
                                                        />
                                                    ))}
                                                    {car.colors.length > 5 && (
                                                        <span className="text-(--app-text-muted) text-xs">
                                                            +{car.colors.length - 5}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* CTA Button */}
                                        <Link to={`/cars/${car.slug}`}>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-r from-[#0066FF] to-[#0052cc] hover:from-[#0052cc] hover:to-[#003d99] rounded-xl text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-[#0066FF]/20"
                                            >
                                                <span>View details</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </motion.button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* View All Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="text-center mt-12"
                        >
                            <Link to="/cars">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-(--app-surface-strong) border-2 border-(--app-border) hover:border-[#0066FF] hover:bg-[#0066FF]/8 rounded-xl text-(--app-text) text-sm font-semibold transition-all duration-300 shadow-(--app-shadow-soft)"
                                >
                                    <span>View all {cars.length > 0 ? `(${cars.length}+ cars)` : 'xe'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </motion.button>
                            </Link>
                        </motion.div>
                    </>
                )}
            </div>
        </section>
    );
};

export default FeaturedCars;
