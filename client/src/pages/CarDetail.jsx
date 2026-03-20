import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Heart,
    Share2,
    Phone,
    MessageCircle,
    Calendar,
    Zap,
    Fuel,
    Users,
    Gauge,
    Car,
    Palette,
    Settings,
    Shield,
    MapPin,
    Check,
    Loader2,
    X,
    Calculator,
    Percent,
    Banknote,
    Clock,
    TrendingUp,
    Info,
    CreditCard,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LoanChatWidget from '../components/LoanChatWidget';
import TestDriveModal from '../components/TestDriveModal';
import DepositModal from '../components/DepositModal';
import { requestGetCarBySlug } from '../config/CarRequest';
import { requestToggleFavoriteCar } from '../config/UserRequest';
import { useStore } from '../hooks/useStore';
import cookies from 'js-cookie';

const CarDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { dataUser, fetchAuth } = useStore();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedVersion, setSelectedVersion] = useState(-1); // -1 = no version selected, show base price
    const [showGallery, setShowGallery] = useState(false);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showTestDrive, setShowTestDrive] = useState(false);
    const [showDeposit, setShowDeposit] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

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

    // Loan calculator state
    const [loanSettings, setLoanSettings] = useState({
        downPaymentPercent: 30, // Down payment ratio (%)
        loanTerm: 60, // Loan term (months)
        interestRate: 8, // Interest rate (%/year)
    });

    useEffect(() => {
        fetchCar();
    }, [slug]);

    useEffect(() => {
        if (!car?._id) {
            setIsFavorite(false);
            return;
        }

        const favoriteCarIds = (dataUser?.favorites || [])
            .map((favorite) => (typeof favorite === 'string' ? favorite : favorite?._id))
            .filter(Boolean);

        setIsFavorite(favoriteCarIds.includes(car._id));
    }, [car, dataUser]);

    const fetchCar = async () => {
        try {
            setLoading(true);
            // Add cache-busting timestamp to ensure fresh data
            const res = await requestGetCarBySlug(slug);
            setCar(res.metadata);
            if (res.metadata?.colors?.length > 0) setSelectedColor(0);
            setSelectedVersion(-1);
        } catch (error) {
            console.error('Error loading car information:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US').format(price) + ' VND';
    };

    const formatPriceShort = (price) => {
        if (price >= 1000000000) {
            return (price / 1000000000).toFixed(2) + ' billion';
        }
        return (price / 1000000).toFixed(0) + ' million';
    };

    const nextImage = () => {
        if (car?.images?.length > 0) {
            setActiveImage((prev) => (prev + 1) % car.images.length);
        }
    };

    const prevImage = () => {
        if (car?.images?.length > 0) {
            setActiveImage((prev) => (prev - 1 + car.images.length) % car.images.length);
        }
    };

    const handleToggleFavorite = async () => {
        if (!car?._id || favoriteLoading) return;

        if (!cookies.get('logged')) {
            navigate('/account/login');
            return;
        }

        try {
            setFavoriteLoading(true);
            const res = await requestToggleFavoriteCar(car._id);
            setIsFavorite(Boolean(res?.metadata?.isFavorite));
            await fetchAuth();
        } catch (error) {
            console.error('Error updating favorite car:', error);
        } finally {
            setFavoriteLoading(false);
        }
    };

    // Calculate loan details - show base price by default, version price only when explicitly selected
    const currentPrice =
        selectedVersion >= 0 && car?.versions?.[selectedVersion]?.price
            ? car.versions[selectedVersion].price
            : car?.price || 0;

    const loanCalculation = useMemo(() => {
        const carPrice = currentPrice;
        const downPaymentPercent = loanSettings.downPaymentPercent;
        const loanTermMonths = loanSettings.loanTerm;
        const annualInterestRate = loanSettings.interestRate;

        // Down payment amount
        const downPayment = (carPrice * downPaymentPercent) / 100;
        // Loan amount
        const loanAmount = carPrice - downPayment;
        // Monthly interest rate
        const monthlyInterestRate = annualInterestRate / 100 / 12;

        // Calculate monthly installments (PMT formula)
        let monthlyPayment = 0;
        if (monthlyInterestRate > 0) {
            monthlyPayment =
                (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths)) /
                (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
        } else {
            monthlyPayment = loanAmount / loanTermMonths;
        }

        // Total amount payable
        const totalPayment = monthlyPayment * loanTermMonths + downPayment;
        // Total interest
        const totalInterest = totalPayment - carPrice;

        return {
            carPrice,
            downPayment,
            loanAmount,
            monthlyPayment: Math.round(monthlyPayment),
            totalPayment: Math.round(totalPayment),
            totalInterest: Math.round(totalInterest),
        };
    }, [currentPrice, loanSettings]);

    // Loan terms options
    const loanTermOptions = [12, 24, 36, 48, 60, 72, 84];
    const downPaymentOptions = [10, 20, 30, 40, 50, 60, 70];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#0066FF] animate-spin" />
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center">
                <h1 className="text-white text-2xl mb-4">Not found cars</h1>
                <Link to="/" className="text-[#0066FF] hover:underline">
                    Back to home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0a0a0f] via-[#0d1520] to-[#0a1628]">
            <Header />

            {/* Breadcrumb */}
            <div className="max-w-300 mx-auto px-4 py-4 pt-20">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/" className="text-white/50 hover:text-white transition-colors">
                        Home
                    </Link>
                    <span className="text-white/30">/</span>
                    <Link to="/cars" className="text-white/50 hover:text-white transition-colors">
                        Car
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="text-[#0066FF]">{car.name}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-300 mx-auto px-4 pb-20">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative aspect-16/10 bg-[#1a2332] rounded-2xl overflow-hidden group cursor-pointer"
                            onClick={() => setShowGallery(true)}
                        >
                            <img
                                src={
                                    car.images?.[activeImage]
                                        ? import.meta.env.VITE_API_URL + car.images[activeImage]
                                        : 'https://via.placeholder.com/800x500'
                                }
                                alt={car.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Navigation Arrows */}
                            {car.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            prevImage();
                                        }}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-[#0066FF] rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            nextImage();
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-[#0066FF] rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}

                            {/* Image Counter */}
                            <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 rounded-full text-white text-xs">
                                {activeImage + 1} / {car.images?.length || 1}
                            </div>

                            {/* Tags */}
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className="px-3 py-1 bg-[#0066FF] rounded-lg text-white text-xs font-semibold">
                                    {formatCategoryName(car.category?.name)}
                                </span>
                                {car.status === 'coming_soon' && (
                                    <span className="px-3 py-1 bg-yellow-500 rounded-lg text-white text-xs font-semibold">
                                        Coming soon
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        {/* Thumbnails */}
                        {car.images?.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {car.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                                            activeImage === idx
                                                ? 'border-[#0066FF]'
                                                : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={import.meta.env.VITE_API_URL + img}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Car Info */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[#0066FF] text-sm font-medium">{car.brand?.name}</span>
                                <span className="text-white/30">•</span>
                                <span className="text-white/50 text-sm">{car.year}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{car.name}</h1>

                            <div className="flex items-end gap-4">
                                <span className="text-3xl font-bold text-[#0066FF]">{formatPrice(currentPrice)}</span>
                                {car.discountPrice > 0 && car.discountPrice > currentPrice && (
                                    <span className="text-white/40 text-lg line-through">
                                        {formatPrice(car.discountPrice)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Specs */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { icon: Zap, label: 'Power', value: `${car.specifications?.horsepower || '-'} HP` },
                                { icon: Fuel, label: 'Fuel type', value: formatFuelType(car.fuelType) },
                                { icon: Settings, label: 'Transmission', value: formatTransmission(car.transmission) },
                                { icon: Users, label: 'Seats', value: `${car.seats} seats` },
                            ].map((spec, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-3 text-center">
                                    <spec.icon className="w-5 h-5 text-[#0066FF] mx-auto mb-1" />
                                    <p className="text-white/40 text-[10px] uppercase mb-0.5">{spec.label}</p>
                                    <p className="text-white text-sm font-medium">{spec.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Loan Calculator Preview */}
                        <div className="bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <Calculator className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">Installment estimate</h3>
                                        <p className="text-white/50 text-xs">
                                            Interest rate from {loanSettings.interestRate}%/year
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowLoanModal(true)}
                                    className="text-green-400 text-sm font-medium hover:underline flex items-center gap-1"
                                >
                                    Details
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 rounded-xl p-3">
                                    <p className="text-white/50 text-xs mb-1">Monthly installment</p>
                                    <p className="text-green-400 text-xl font-bold">
                                        {formatPriceShort(loanCalculation.monthlyPayment)}
                                    </p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3">
                                    <p className="text-white/50 text-xs mb-1">
                                        Down payment ({loanSettings.downPaymentPercent}%)
                                    </p>
                                    <p className="text-white text-xl font-bold">
                                        {formatPriceShort(loanCalculation.downPayment)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-white/40 text-xs">
                                <Info className="w-3 h-3" />
                                <span>Term {loanSettings.loanTerm} months • Click "Details" to customize</span>
                            </div>
                        </div>

                        {/* Colors */}
                        {car.colors?.length > 0 && (
                            <div>
                                <h3 className="text-white font-semibold mb-3">
                                    Colors: <span className="text-[#0066FF]">{car.colors[selectedColor]?.name}</span>
                                </h3>
                                <div className="flex gap-2">
                                    {car.colors.map((color, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedColor(idx)}
                                            className={`relative w-10 h-10 rounded-full transition-all ${
                                                selectedColor === idx
                                                    ? 'ring-2 ring-[#0066FF] ring-offset-2 ring-offset-[#0a0a0f]'
                                                    : ''
                                            }`}
                                            style={{ backgroundColor: color.code }}
                                            title={color.name}
                                        >
                                            {selectedColor === idx && (
                                                <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-lg" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Versions */}
                        {car.versions?.length > 0 && (
                            <div>
                                <h3 className="text-white font-semibold mb-3">Version</h3>
                                <div className="space-y-2">
                                    {car.versions.map((version, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedVersion(idx)}
                                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                                selectedVersion === idx
                                                    ? 'bg-[#0066FF]/10 border-[#0066FF]'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <span
                                                className={`font-medium ${selectedVersion === idx ? 'text-[#0066FF]' : 'text-white'}`}
                                            >
                                                {version.name}
                                            </span>
                                            <span className="text-white/70">{formatPrice(version.price)}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowDeposit(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-linear-to-r from-[#0066FF] to-[#0052cc] rounded-xl text-white font-semibold shadow-lg shadow-[#0066FF]/30"
                            >
                                <CreditCard className="w-5 h-5" />
                                <span>Car Deposits</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowTestDrive(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-colors"
                            >
                                <Calendar className="w-5 h-5" />
                                <span>Book a Test Drive</span>
                            </motion.button>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleToggleFavorite}
                                    disabled={favoriteLoading}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                                        isFavorite
                                            ? 'bg-red-500/15 text-red-400 hover:bg-red-500/20'
                                            : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                                    } ${favoriteLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {favoriteLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                    )}
                                    <span className="text-sm">{isFavorite ? 'Saved' : 'Favorite'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specifications & Description */}
                <div className="mt-12 grid lg:grid-cols-3 gap-8">
                    {/* Specifications */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-white">Technical specifications</h2>
                        <div className="bg-[#1a2332] rounded-2xl p-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { label: 'Engine', value: car.engine || '-' },
                                    { label: 'Power', value: `${car.specifications?.horsepower || '-'} HP` },
                                    { label: 'Torque', value: `${car.specifications?.torque || '-'} Nm` },
                                    { label: 'Transmission', value: formatTransmission(car.transmission) },
                                    { label: 'Fuel type', value: formatFuelType(car.fuelType) },
                                    { label: 'Consumption', value: car.mileage ? `${car.mileage} L/100km` : '-' },
                                    { label: 'Seats', value: `${car.seats} seats` },
                                    {
                                        label: 'Length',
                                        value: car.specifications?.length ? `${car.specifications.length} mm` : '-',
                                    },
                                    {
                                        label: 'Width',
                                        value: car.specifications?.width ? `${car.specifications.width} mm` : '-',
                                    },
                                    {
                                        label: 'Height',
                                        value: car.specifications?.height ? `${car.specifications.height} mm` : '-',
                                    },
                                    {
                                        label: 'Wheelbase',
                                        value: car.specifications?.wheelBase
                                            ? `${car.specifications.wheelBase} mm`
                                            : '-',
                                    },
                                    {
                                        label: 'Status',
                                        value: car.stock > 0 ? `In stock: ${car.stock} cars` : 'Out of stock',
                                    },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between py-3 border-b border-white/5 last:border-0"
                                    >
                                        <span className="text-white/50">{item.label}</span>
                                        <span className="text-white font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        {car.description && (
                            <>
                                <h2 className="text-2xl font-bold text-white mt-8">Description</h2>
                                <div className="bg-[#1a2332] rounded-2xl p-6">
                                    <p className="text-white/70 leading-relaxed whitespace-pre-line">
                                        {car.description}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Contact Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1a2332] rounded-2xl p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-white mb-4">Contact advisor</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                                    <div className="w-12 h-12 bg-[#0066FF]/20 rounded-full flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-[#0066FF]" />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-sm">Hotline</p>
                                        <p className="text-white font-semibold">1900 xxxx</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                                    <div className="w-12 h-12 bg-[#0066FF]/20 rounded-full flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-[#0066FF]" />
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-sm">Showroom</p>
                                        <p className="text-white font-semibold">Hanoi, Vietnam</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-[#0066FF]/10 border border-[#0066FF]/30 rounded-xl">
                                <div className="flex items-center gap-2 text-[#0066FF] mb-2">
                                    <Shield className="w-5 h-5" />
                                    <span className="font-semibold">Commitment</span>
                                </div>
                                <ul className="space-y-2 text-white/70 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span>Genuine warranty</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span>Installment Support 0%</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span>Free nationwide car delivery</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            {/* Fullscreen Gallery Modal */}
            <AnimatePresence>
                {showGallery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={() => setShowGallery(false)}
                    >
                        <button
                            onClick={() => setShowGallery(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <img
                            src={
                                car.images?.[activeImage] ? import.meta.env.VITE_API_URL + car.images[activeImage] : ''
                            }
                            alt=""
                            className="max-w-[90vw] max-h-[90vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {car.images?.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prevImage();
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-[#0066FF] rounded-full flex items-center justify-center text-white"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        nextImage();
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-[#0066FF] rounded-full flex items-center justify-center text-white"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loan Calculator Modal */}
            <AnimatePresence>
                {showLoanModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowLoanModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a2332] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-[#1a2332] border-b border-white/10 p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <Calculator className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Installment plan</h2>
                                        <p className="text-white/50 text-sm">{car.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowLoanModal(false)}
                                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 space-y-6">
                                {/* Car Price */}
                                <div className="bg-linear-to-r from-[#0066FF]/10 to-purple-500/10 rounded-xl p-4 border border-[#0066FF]/20">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/70">Car price</span>
                                        <span className="text-[#0066FF] text-2xl font-bold">
                                            {formatPrice(currentPrice)}
                                        </span>
                                    </div>
                                </div>

                                {/* Loan Settings */}
                                <div className="space-y-5">
                                    {/* Down Payment */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-white font-medium flex items-center gap-2">
                                                <Banknote className="w-4 h-4 text-[#0066FF]" />
                                                Down payment ratio
                                            </label>
                                            <span className="text-[#0066FF] font-bold">
                                                {loanSettings.downPaymentPercent}%
                                            </span>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {downPaymentOptions.map((percent) => (
                                                <button
                                                    key={percent}
                                                    onClick={() =>
                                                        setLoanSettings({
                                                            ...loanSettings,
                                                            downPaymentPercent: percent,
                                                        })
                                                    }
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        loanSettings.downPaymentPercent === percent
                                                            ? 'bg-[#0066FF] text-white'
                                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                                >
                                                    {percent}%
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-white/40 text-xs mt-2">
                                            = {formatPriceShort(loanCalculation.downPayment)}
                                        </p>
                                    </div>

                                    {/* Loan Term */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-white font-medium flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-[#0066FF]" />
                                                Term vay
                                            </label>
                                            <span className="text-[#0066FF] font-bold">
                                                {loanSettings.loanTerm} months ({loanSettings.loanTerm / 12} years)
                                            </span>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {loanTermOptions.map((months) => (
                                                <button
                                                    key={months}
                                                    onClick={() =>
                                                        setLoanSettings({ ...loanSettings, loanTerm: months })
                                                    }
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                                        loanSettings.loanTerm === months
                                                            ? 'bg-[#0066FF] text-white'
                                                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                                                    }`}
                                                >
                                                    {months} months
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Interest Rate */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-white font-medium flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-[#0066FF]" />
                                                Interest rate (%/year)
                                            </label>
                                            <span className="text-[#0066FF] font-bold">
                                                {loanSettings.interestRate}%
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="5"
                                            max="15"
                                            step="0.5"
                                            value={loanSettings.interestRate}
                                            onChange={(e) =>
                                                setLoanSettings({
                                                    ...loanSettings,
                                                    interestRate: parseFloat(e.target.value),
                                                })
                                            }
                                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#0066FF]"
                                        />
                                        <div className="flex justify-between text-white/40 text-xs mt-1">
                                            <span>5%</span>
                                            <span>15%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Results */}
                                <div className="bg-linear-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20 space-y-4">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                        Estimated result
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/20 rounded-xl p-4">
                                            <p className="text-white/50 text-sm mb-1">Monthly installment</p>
                                            <p className="text-green-400 text-2xl font-bold">
                                                {formatPriceShort(loanCalculation.monthlyPayment)}
                                            </p>
                                        </div>
                                        <div className="bg-black/20 rounded-xl p-4">
                                            <p className="text-white/50 text-sm mb-1">Loan amount</p>
                                            <p className="text-white text-2xl font-bold">
                                                {formatPriceShort(loanCalculation.loanAmount)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/20 rounded-xl p-4">
                                            <p className="text-white/50 text-sm mb-1">Total interest</p>
                                            <p className="text-orange-400 text-xl font-bold">
                                                {formatPriceShort(loanCalculation.totalInterest)}
                                            </p>
                                        </div>
                                        <div className="bg-black/20 rounded-xl p-4">
                                            <p className="text-white/50 text-sm mb-1">Total payment</p>
                                            <p className="text-white text-xl font-bold">
                                                {formatPriceShort(loanCalculation.totalPayment)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Schedule Preview */}
                                    <div className="mt-4 pt-4 border-t border-green-500/20">
                                        <p className="text-white/60 text-sm">
                                            <strong className="text-white">You will pay:</strong>
                                        </p>
                                        <ul className="mt-2 space-y-1 text-white/60 text-sm">
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-400" />
                                                Down payment:{' '}
                                                <strong className="text-white">
                                                    {formatPriceShort(loanCalculation.downPayment)}
                                                </strong>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-400" />
                                                {loanSettings.loanTerm} months x{' '}
                                                <strong className="text-white">
                                                    {formatPriceShort(loanCalculation.monthlyPayment)}
                                                </strong>
                                                /month
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                    <Info className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                                    <p className="text-yellow-200/80 text-xs">
                                        The figures above are for reference only. Actual interest rates and loan terms
                                        may vary depending on the bank and your profile. Please contact us for detailed
                                        advice.
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setShowLoanModal(false);
                                            setShowChat(true);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-linear-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-green-500/30"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span>Installment consultation chat</span>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowLoanModal(false)}
                                        className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-colors"
                                    >
                                        Close
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loan Chat Widget */}
            <LoanChatWidget
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                car={car}
                loanInfo={{
                    carPrice: currentPrice,
                    downPaymentPercent: loanSettings.downPaymentPercent,
                    loanTerm: loanSettings.loanTerm,
                    interestRate: loanSettings.interestRate,
                    monthlyPayment: loanCalculation.monthlyPayment,
                }}
            />

            {/* Test Drive Modal */}
            <TestDriveModal isOpen={showTestDrive} onClose={() => setShowTestDrive(false)} car={car} />

            {/* Deposit Modal */}
            <DepositModal
                isOpen={showDeposit}
                onClose={() => setShowDeposit(false)}
                car={car}
                selectedVersion={selectedVersion}
                selectedColor={selectedColor}
            />
        </div>
    );
};

export default CarDetail;
