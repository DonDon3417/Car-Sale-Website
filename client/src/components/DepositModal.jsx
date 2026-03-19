import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    CreditCard,
    Wallet,
    Check,
    AlertCircle,
    Loader2,
    Car,
    Palette,
    Settings,
    Phone,
    FileText,
    Shield,
    ChevronRight,
} from 'lucide-react';
import { requestCreateDeposit } from '../config/DepositRequest';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

// Payment method icons as SVG
const MomoIcon = () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8">
        <rect width="48" height="48" rx="12" fill="#A50064" />
        <path
            d="M24 10c-7.732 0-14 6.268-14 14s6.268 14 14 14 14-6.268 14-14-6.268-14-14-14zm0 4.5c1.933 0 3.5 1.567 3.5 3.5s-1.567 3.5-3.5 3.5-3.5-1.567-3.5-3.5 1.567-3.5 3.5-3.5zm0 20c-3.5 0-6.6-1.8-8.4-4.5.1-2.8 5.6-4.3 8.4-4.3s8.3 1.5 8.4 4.3c-1.8 2.7-4.9 4.5-8.4 4.5z"
            fill="white"
        />
    </svg>
);

const VnpayIcon = () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8">
        <rect width="48" height="48" rx="12" fill="#0066CC" />
        <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
        >
            VNPAY
        </text>
    </svg>
);

const PaypalIcon = () => (
    <svg viewBox="0 0 48 48" className="w-8 h-8">
        <rect width="48" height="48" rx="12" fill="#003087" />
        <path d="M22.5 12c4.5 0 7.5 2 7.5 6 0 4-3 7-7 7h-3l-1 6h-4l3-19h4.5z" fill="#009CDE" />
        <path d="M18.5 15c4 0 6.5 1.5 6.5 5 0 3.5-2.5 6-6 6h-2.5l-1 5h-3.5l2.5-16h4z" fill="white" />
    </svg>
);

const DepositModal = ({ isOpen, onClose, car, selectedVersion, selectedColor }) => {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [note, setNote] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [depositResult, setDepositResult] = useState(null);

    // Calculate prices
    const carPrice = car?.versions?.[selectedVersion]?.price || car?.price || 0;
    const depositAmount = Math.round(carPrice * 0.1);
    const versionName = car?.versions?.[selectedVersion]?.name || '';
    const colorName = car?.colors?.[selectedColor]?.name || '';

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US').format(price) + ' VND';
    };

    const formatPriceShort = (price) => {
        if (price >= 1000000000) {
            return (price / 1000000000).toFixed(2) + ' billion';
        }
        return (price / 1000000).toFixed(0) + ' million';
    };

    const paymentMethods = [
        {
            id: 'MOMO',
            name: 'MoMo',
            description: 'Pay via MoMo wallet',
            icon: MomoIcon,
            color: 'from-pink-500 to-pink-600',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500',
        },
        {
            id: 'VNPAY',
            name: 'VNPay',
            description: 'Pay via VNPay',
            icon: VnpayIcon,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500',
        },
        {
            id: 'PAYPAL',
            name: 'PayPal',
            description: 'International payment',
            icon: PaypalIcon,
            color: 'from-[#003087] to-[#009CDE]',
            bgColor: 'bg-blue-600/10',
            borderColor: 'border-blue-600',
        },
    ];

    const handleSubmit = async () => {
        if (!paymentMethod) {
            setError('Please select a payment method');
            return;
        }

        if (!phone) {
            setError('Please enter phone number');
            return;
        }

        if (!note) {
            setError('Please enter a note');
            return;
        }
        const res = await requestCreateDeposit({
            carId: car._id,
            carVersion: versionName,
            carColor: colorName,
            carPrice,
            paymentMethod,
            note,
            customerPhone: phone,
        });

        if (paymentMethod === 'VNPAY') {
            window.location.href = res.metadata;
        } else if (paymentMethod === 'MOMO') {
            window.location.href = res.metadata.payUrl;
        }

        setLoading(true);
        setError('');

        try {
            const res = await requestCreateDeposit({
                carId: car._id,
                carVersion: versionName,
                carColor: colorName,
                carPrice,
                paymentMethod,
                note,
                customerPhone: phone,
            });

            setSuccess(true);
            message.success('Payment successful');
            setDepositResult(res.metadata);
        } catch (err) {
            message.error(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPaymentMethod(null);
        setNote('');
        setPhone('');
        setError('');
        setSuccess(false);
        setDepositResult(null);
        onClose();
    };

    if (!car) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gradient-to-b from-[#1a2332] to-[#0f1520] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-[#0066FF] to-[#0052cc] p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Car Deposits</h2>
                                    <p className="text-white/70 text-sm">Secure your favorite car ownership</p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Success State */}
                        {success ? (
                            <div className="p-6 text-center">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-10 h-10 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Deposit successful!</h3>
                                <p className="text-white/60 mb-6">
                                    Your deposit order has been created. Please complete payment to confirm.
                                </p>

                                <div className="bg-white/5 rounded-xl p-4 text-left mb-6">
                                    <div className="flex justify-between py-2 border-b border-white/10">
                                        <span className="text-white/50">Order ID</span>
                                        <span className="text-white font-medium">
                                            {depositResult?._id?.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/10">
                                        <span className="text-white/50">Amount</span>
                                        <span className="text-green-400 font-bold">{formatPrice(depositAmount)}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-white/50">Method</span>
                                        <span className="text-white font-medium">{paymentMethod}</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-left mb-6">
                                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-yellow-200/80 text-sm">
                                        Your deposit order will be held for 7 days. Please complete payment and contact
                                        us for confirmation.
                                    </p>
                                </div>

                                <button
                                    onClick={handleClose}
                                    className="w-full py-4 bg-gradient-to-r from-[#0066FF] to-[#0052cc] rounded-xl text-white font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <div className="p-5 space-y-5">
                                {/* Car Info */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex gap-4">
                                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                                            <img
                                                src={
                                                    car.images?.[0]
                                                        ? import.meta.env.VITE_API_URL + car.images[0]
                                                        : 'https://via.placeholder.com/96x64'
                                                }
                                                alt={car.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold truncate">{car.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
                                                {versionName && (
                                                    <span className="flex items-center gap-1">
                                                        <Settings className="w-3 h-3" />
                                                        {versionName}
                                                    </span>
                                                )}
                                                {colorName && (
                                                    <span className="flex items-center gap-1">
                                                        <Palette className="w-3 h-3" />
                                                        {colorName}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[#0066FF] font-semibold mt-1">{formatPrice(carPrice)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Deposit Amount */}
                                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-5 h-5 text-green-400" />
                                            <span className="text-white/70">Deposit amount (10%)</span>
                                        </div>
                                        <span className="text-green-400 text-2xl font-bold">
                                            {formatPriceShort(depositAmount)}
                                        </span>
                                    </div>
                                    <p className="text-white/40 text-xs mt-2">= {formatPrice(depositAmount)}</p>
                                </div>

                                {/* Payment Methods */}
                                <div>
                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-[#0066FF]" />
                                        Select payment method
                                    </h4>
                                    <div className="space-y-2">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                                                    paymentMethod === method.id
                                                        ? `${method.bgColor} ${method.borderColor}`
                                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <method.icon />
                                                <div className="flex-1 text-left">
                                                    <p
                                                        className={`font-semibold ${paymentMethod === method.id ? 'text-white' : 'text-white/80'}`}
                                                    >
                                                        {method.name}
                                                    </p>
                                                    <p className="text-white/50 text-sm">{method.description}</p>
                                                </div>
                                                {paymentMethod === method.id && (
                                                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    </div>
                                                )}
                                                <ChevronRight
                                                    className={`w-5 h-5 ${paymentMethod === method.id ? 'text-white' : 'text-white/30'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Phone Input */}
                                <div>
                                    <label className="text-white font-medium mb-2 flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-[#0066FF]" />
                                        Contact phone number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Enter phone number"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0066FF] transition-colors"
                                    />
                                </div>

                                {/* Note Input */}
                                <div>
                                    <label className="text-white font-medium mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-[#0066FF]" />
                                        Note (optional)
                                    </label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Enter note or special request..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0066FF] transition-colors resize-none"
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Policy */}
                                <div className="flex items-start gap-2 p-3 bg-[#0066FF]/10 rounded-xl border border-[#0066FF]/20">
                                    <Shield className="w-5 h-5 text-[#0066FF] flex-shrink-0 mt-0.5" />
                                    <div className="text-white/60 text-xs">
                                        <p className="font-medium text-white/80 mb-1">Deposit policy:</p>
                                        <ul className="space-y-0.5">
                                            <li>• Deposit 10% of the car value to reserve your spot</li>
                                            <li>• Reservation hold: 7 days</li>
                                            <li>• 100% refund if cancelled within 24 hours</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !paymentMethod}
                                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                                        loading || !paymentMethod
                                            ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-[#0066FF] to-[#0052cc] text-white shadow-lg shadow-[#0066FF]/30 hover:shadow-[#0066FF]/50'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Confirm deposit - {formatPriceShort(depositAmount)}
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DepositModal;
