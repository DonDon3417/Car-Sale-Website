import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const CarDetail = () => {
    const { slug } = useParams();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedVersion, setSelectedVersion] = useState(0);
    const [showGallery, setShowGallery] = useState(false);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showTestDrive, setShowTestDrive] = useState(false);
    const [showDeposit, setShowDeposit] = useState(false);

    // Loan calculator state
    const [loanSettings, setLoanSettings] = useState({
        downPaymentPercent: 30, // Tỷ lệ trả trước (%)
        loanTerm: 60, // Kỳ hạn vay (tháng)
        interestRate: 8, // Lãi suất (%/năm)
    });

    useEffect(() => {
        fetchCar();
    }, [slug]);

    const fetchCar = async () => {
        try {
            setLoading(true);
            const res = await requestGetCarBySlug(slug);
            setCar(res.metadata);
            if (res.metadata?.colors?.length > 0) setSelectedColor(0);
            if (res.metadata?.versions?.length > 0) setSelectedVersion(0);
        } catch (error) {
            console.error('Lỗi tải thông tin xe:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';
    };

    const formatPriceShort = (price) => {
        if (price >= 1000000000) {
            return (price / 1000000000).toFixed(2) + ' tỷ';
        }
        return (price / 1000000).toFixed(0) + ' triệu';
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

    // Calculate loan details
    const currentPrice = car?.versions?.[selectedVersion]?.price || car?.price || 0;

    const loanCalculation = useMemo(() => {
        const carPrice = currentPrice;
        const downPaymentPercent = loanSettings.downPaymentPercent;
        const loanTermMonths = loanSettings.loanTerm;
        const annualInterestRate = loanSettings.interestRate;

        // Số tiền trả trước
        const downPayment = (carPrice * downPaymentPercent) / 100;
        // Số tiền vay
        const loanAmount = carPrice - downPayment;
        // Lãi suất tháng
        const monthlyInterestRate = annualInterestRate / 100 / 12;

        // Tính trả góp hàng tháng (công thức PMT)
        let monthlyPayment = 0;
        if (monthlyInterestRate > 0) {
            monthlyPayment =
                (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths)) /
                (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
        } else {
            monthlyPayment = loanAmount / loanTermMonths;
        }

        // Tổng tiền phải trả
        const totalPayment = monthlyPayment * loanTermMonths + downPayment;
        // Tổng tiền lãi
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
                <h1 className="text-white text-2xl mb-4">Không tìm thấy xe</h1>
                <Link to="/" className="text-[#0066FF] hover:underline">
                    Quay về trang chủ
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1520] to-[#0a1628]">
            <Header />

            {/* Breadcrumb */}
            <div className="max-w-[1200px] mx-auto px-4 py-4 pt-20">
                <div className="flex items-center gap-2 text-sm">
                    <Link to="/" className="text-white/50 hover:text-white transition-colors">
                        Trang chủ
                    </Link>
                    <span className="text-white/30">/</span>
                    <Link to="/cars" className="text-white/50 hover:text-white transition-colors">
                        Xe
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="text-[#0066FF]">{car.name}</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1200px] mx-auto px-4 pb-20">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="relative aspect-[16/10] bg-[#1a2332] rounded-2xl overflow-hidden group cursor-pointer"
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
                                    {car.category?.name}
                                </span>
                                {car.status === 'coming_soon' && (
                                    <span className="px-3 py-1 bg-yellow-500 rounded-lg text-white text-xs font-semibold">
                                        Sắp ra mắt
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
                                        className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
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
                                {car.discountPrice > 0 && car.discountPrice < currentPrice && (
                                    <span className="text-white/40 text-lg line-through">
                                        {formatPrice(car.discountPrice)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Quick Specs */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { icon: Zap, label: 'Công suất', value: `${car.specifications?.horsepower || '-'} HP` },
                                { icon: Fuel, label: 'Nhiên liệu', value: car.fuelType },
                                { icon: Settings, label: 'Hộp số', value: car.transmission },
                                { icon: Users, label: 'Số chỗ', value: `${car.seats} chỗ` },
                            ].map((spec, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-3 text-center">
                                    <spec.icon className="w-5 h-5 text-[#0066FF] mx-auto mb-1" />
                                    <p className="text-white/40 text-[10px] uppercase mb-0.5">{spec.label}</p>
                                    <p className="text-white text-sm font-medium">{spec.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Loan Calculator Preview */}
                        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <Calculator className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">Ước tính trả góp</h3>
                                        <p className="text-white/50 text-xs">
                                            Lãi suất từ {loanSettings.interestRate}%/năm
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowLoanModal(true)}
                                    className="text-green-400 text-sm font-medium hover:underline flex items-center gap-1"
                                >
                                    Chi tiết
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 rounded-xl p-3">
                                    <p className="text-white/50 text-xs mb-1">Trả góp hàng tháng</p>
                                    <p className="text-green-400 text-xl font-bold">
                                        {formatPriceShort(loanCalculation.monthlyPayment)}
                                    </p>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3">
                                    <p className="text-white/50 text-xs mb-1">
                                        Trả trước ({loanSettings.downPaymentPercent}%)
                                    </p>
                                    <p className="text-white text-xl font-bold">
                                        {formatPriceShort(loanCalculation.downPayment)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-2 text-white/40 text-xs">
                                <Info className="w-3 h-3" />
                                <span>Kỳ hạn {loanSettings.loanTerm} tháng • Click "Chi tiết" để tùy chỉnh</span>
                            </div>
                        </div>

                        {/* Colors */}
                        {car.colors?.length > 0 && (
                            <div>
                                <h3 className="text-white font-semibold mb-3">
                                    Màu sắc: <span className="text-[#0066FF]">{car.colors[selectedColor]?.name}</span>
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
                                <h3 className="text-white font-semibold mb-3">Phiên bản</h3>
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
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#0066FF] to-[#0052cc] rounded-xl text-white font-semibold shadow-lg shadow-[#0066FF]/30"
                            >
                                <CreditCard className="w-5 h-5" />
                                <span>Đặt cọc giữ xe</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowTestDrive(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-colors"
                            >
                                <Calendar className="w-5 h-5" />
                                <span>Đặt lịch lái thử</span>
                            </motion.button>
                            <div className="flex gap-3">
                                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors">
                                    <Heart className="w-5 h-5" />
                                    <span className="text-sm">Yêu thích</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Specifications & Description */}
                <div className="mt-12 grid lg:grid-cols-3 gap-8">
                    {/* Specifications */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-white">Thông số kỹ thuật</h2>
                        <div className="bg-[#1a2332] rounded-2xl p-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { label: 'Động cơ', value: car.engine || '-' },
                                    { label: 'Công suất', value: `${car.specifications?.horsepower || '-'} HP` },
                                    { label: 'Mô-men xoắn', value: `${car.specifications?.torque || '-'} Nm` },
                                    { label: 'Hộp số', value: car.transmission },
                                    { label: 'Nhiên liệu', value: car.fuelType },
                                    { label: 'Tiêu hao', value: car.mileage ? `${car.mileage} L/100km` : '-' },
                                    { label: 'Số chỗ ngồi', value: `${car.seats} chỗ` },
                                    {
                                        label: 'Chiều dài',
                                        value: car.specifications?.length ? `${car.specifications.length} mm` : '-',
                                    },
                                    {
                                        label: 'Chiều rộng',
                                        value: car.specifications?.width ? `${car.specifications.width} mm` : '-',
                                    },
                                    {
                                        label: 'Chiều cao',
                                        value: car.specifications?.height ? `${car.specifications.height} mm` : '-',
                                    },
                                    {
                                        label: 'Chiều dài cơ sở',
                                        value: car.specifications?.wheelBase
                                            ? `${car.specifications.wheelBase} mm`
                                            : '-',
                                    },
                                    { label: 'Tình trạng', value: car.stock > 0 ? `Còn ${car.stock} xe` : 'Hết hàng' },
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
                                <h2 className="text-2xl font-bold text-white mt-8">Mô tả</h2>
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
                            <h3 className="text-xl font-bold text-white mb-4">Liên hệ tư vấn</h3>
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
                                        <p className="text-white font-semibold">Hà Nội, Việt Nam</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-[#0066FF]/10 border border-[#0066FF]/30 rounded-xl">
                                <div className="flex items-center gap-2 text-[#0066FF] mb-2">
                                    <Shield className="w-5 h-5" />
                                    <span className="font-semibold">Cam kết</span>
                                </div>
                                <ul className="space-y-2 text-white/70 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span>Bảo hành chính hãng</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span>Hỗ trợ trả góp 0%</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span>Miễn phí giao xe toàn quốc</span>
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
                                        <h2 className="text-xl font-bold text-white">Dự toán trả góp</h2>
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
                                <div className="bg-gradient-to-r from-[#0066FF]/10 to-purple-500/10 rounded-xl p-4 border border-[#0066FF]/20">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/70">Giá xe</span>
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
                                                Tỷ lệ trả trước
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
                                                Kỳ hạn vay
                                            </label>
                                            <span className="text-[#0066FF] font-bold">
                                                {loanSettings.loanTerm} tháng ({loanSettings.loanTerm / 12} năm)
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
                                                    {months} tháng
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Interest Rate */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-white font-medium flex items-center gap-2">
                                                <Percent className="w-4 h-4 text-[#0066FF]" />
                                                Lãi suất (%/năm)
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
                                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-5 border border-green-500/20 space-y-4">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                        Kết quả ước tính
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/20 rounded-xl p-4">
                                            <p className="text-white/50 text-sm mb-1">Trả góp hàng tháng</p>
                                            <p className="text-green-400 text-2xl font-bold">
                                                {formatPriceShort(loanCalculation.monthlyPayment)}
                                            </p>
                                        </div>
                                        <div className="bg-black/20 rounded-xl p-4">
                                            <p className="text-white/50 text-sm mb-1">Số tiền vay</p>
                                            <p className="text-white text-2xl font-bold">
                                                {formatPriceShort(loanCalculation.loanAmount)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-black/20 rounded-xl p-4">
                                            <p className="text-white/50 text-sm mb-1">Tổng tiền lãi</p>
                                            <p className="text-orange-400 text-xl font-bold">
                                                {formatPriceShort(loanCalculation.totalInterest)}
                                            </p>
                                        </div>
                                        <div className="bg-black/20 rounded-xl p-4">
                                            <p className="text-white/50 text-sm mb-1">Tổng thanh toán</p>
                                            <p className="text-white text-xl font-bold">
                                                {formatPriceShort(loanCalculation.totalPayment)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payment Schedule Preview */}
                                    <div className="mt-4 pt-4 border-t border-green-500/20">
                                        <p className="text-white/60 text-sm">
                                            <strong className="text-white">Bạn sẽ thanh toán:</strong>
                                        </p>
                                        <ul className="mt-2 space-y-1 text-white/60 text-sm">
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-400" />
                                                Trả trước:{' '}
                                                <strong className="text-white">
                                                    {formatPriceShort(loanCalculation.downPayment)}
                                                </strong>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-400" />
                                                {loanSettings.loanTerm} kỳ x{' '}
                                                <strong className="text-white">
                                                    {formatPriceShort(loanCalculation.monthlyPayment)}
                                                </strong>
                                                /tháng
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                    <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-yellow-200/80 text-xs">
                                        Số liệu trên chỉ mang tính chất tham khảo. Lãi suất và điều kiện vay thực tế có
                                        thể khác biệt tùy thuộc vào ngân hàng và hồ sơ của bạn. Vui lòng liên hệ để được
                                        tư vấn chi tiết.
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
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-semibold shadow-lg shadow-green-500/30"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        <span>Chat tư vấn trả góp</span>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowLoanModal(false)}
                                        className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-colors"
                                    >
                                        Đóng
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
