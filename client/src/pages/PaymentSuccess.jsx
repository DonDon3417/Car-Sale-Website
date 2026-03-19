import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    CheckCircle,
    Car,
    Calendar,
    CreditCard,
    Phone,
    FileText,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Palette,
    Settings,
    User,
    Mail,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestGetDepositById } from '../config/DepositRequest';

const PaymentSuccess = () => {
    const { id } = useParams();
    const [deposit, setDeposit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDeposit = async () => {
            try {
                const res = await requestGetDepositById(id);
                setDeposit(res.metadata);
            } catch (err) {
                setError(err.response?.data?.message || 'Cannot load deposit information');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDeposit();
        }
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US').format(price) + ' VND';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
            completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return colors[status] || colors.pending;
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Pending confirmation',
            confirmed: 'Confirmed',
            completed: 'Completed',
            cancelled: 'Cancelled',
        };
        return texts[status] || status;
    };

    const getPaymentStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500/20 text-yellow-400',
            completed: 'bg-green-500/20 text-green-400',
            failed: 'bg-red-500/20 text-red-400',
            refunded: 'bg-purple-500/20 text-purple-400',
        };
        return colors[status] || colors.pending;
    };

    const getPaymentStatusText = (status) => {
        const texts = {
            pending: 'Awaiting payment',
            completed: 'Paid',
            failed: 'Payment failed',
            refunded: 'Refunded',
        };
        return texts[status] || status;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1520] to-[#0a1628]">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-[#0066FF] animate-spin mx-auto mb-4" />
                        <p className="text-white/60">Loading information...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1520] to-[#0a1628]">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">An error occurred</h2>
                        <p className="text-white/60 mb-6">{error}</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl text-white font-medium transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to home
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1520] to-[#0a1628]">
            <Header />

            <main className="max-w-4xl mx-auto px-4 py-20">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-14 h-14 text-green-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Deposit successful!</h1>
                    <p className="text-white/60 text-lg">
                        Thank you for your deposit. We will contact you as soon as possible.
                    </p>
                </motion.div>

                {/* Deposit Details Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-b from-[#1a2332] to-[#0f1520] rounded-2xl border border-white/10 overflow-hidden mb-6"
                >
                    {/* Order ID Header */}
                    <div className="bg-gradient-to-r from-[#0066FF] to-[#0052cc] p-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-white/70 text-sm">Deposit ID</p>
                                <p className="text-white text-xl font-bold">#{deposit?._id?.slice(-8).toUpperCase()}</p>
                            </div>
                            <div className="flex gap-2">
                                <span
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(deposit?.status)}`}
                                >
                                    {getStatusText(deposit?.status)}
                                </span>
                                <span
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusColor(deposit?.paymentStatus)}`}
                                >
                                    {getPaymentStatusText(deposit?.paymentStatus)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Car Info */}
                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Car className="w-5 h-5 text-[#0066FF]" />
                                Car information
                            </h3>
                            <div className="flex gap-5">
                                <div className="w-32 h-24 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                                    {deposit?.car?.images?.[0] ? (
                                        <img
                                            src={import.meta.env.VITE_API_URL + deposit.car.images[0]}
                                            alt={deposit?.car?.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Car className="w-10 h-10 text-white/30" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white text-lg font-bold mb-2">{deposit?.car?.name}</h4>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        {deposit?.car?.brand?.name && (
                                            <p className="text-white/60">
                                                Brand: <span className="text-white">{deposit.car.brand.name}</span>
                                            </p>
                                        )}
                                        {deposit?.carVersion && (
                                            <p className="text-white/60 flex items-center gap-1">
                                                <Settings className="w-3 h-3" />
                                                Version: <span className="text-white ml-1">{deposit.carVersion}</span>
                                            </p>
                                        )}
                                        {deposit?.carColor && (
                                            <p className="text-white/60 flex items-center gap-1">
                                                <Palette className="w-3 h-3" />
                                                Colors: <span className="text-white ml-1">{deposit.carColor}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#0066FF]" />
                                Customer information
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-white/40" />
                                    <div>
                                        <p className="text-white/50">Full name</p>
                                        <p className="text-white font-medium">{deposit?.user?.fullName || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-white/40" />
                                    <div>
                                        <p className="text-white/50">Email</p>
                                        <p className="text-white font-medium">{deposit?.user?.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-white/40" />
                                    <div>
                                        <p className="text-white/50">Contact phone number</p>
                                        <p className="text-white font-medium">{deposit?.customerPhone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-[#0066FF]" />
                                Payment information
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b border-white/10">
                                    <span className="text-white/50">Car price</span>
                                    <span className="text-white font-medium">{formatPrice(deposit?.carPrice)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/10">
                                    <span className="text-white/50">Deposit amount (10%)</span>
                                    <span className="text-green-400 font-bold text-lg">
                                        {formatPrice(deposit?.depositAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-white/10">
                                    <span className="text-white/50">Payment method</span>
                                    <span className="text-white font-medium">{deposit?.paymentMethod}</span>
                                </div>
                                {deposit?.transactionId && (
                                    <div className="flex justify-between py-2 border-b border-white/10">
                                        <span className="text-white/50">Transaction ID</span>
                                        <span className="text-white font-mono">{deposit.transactionId}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Note */}
                        {deposit?.note && (
                            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#0066FF]" />
                                    Note
                                </h3>
                                <p className="text-white/70">{deposit.note}</p>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#0066FF]" />
                                Timeline
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-white/50">Order created at</p>
                                    <p className="text-white font-medium">{formatDate(deposit?.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-white/50">Deposit deadline</p>
                                    <p className="text-white font-medium">{formatDate(deposit?.expiresAt)}</p>
                                </div>
                                {deposit?.confirmedAt && (
                                    <div>
                                        <p className="text-white/50">Confirmed at</p>
                                        <p className="text-white font-medium">{formatDate(deposit.confirmedAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-white font-medium transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to home
                    </Link>
                    <Link
                        to="/cars"
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0066FF] to-[#0052cc] rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:shadow-[#0066FF]/30"
                    >
                        <Car className="w-5 h-5" />
                        Browse more cars
                    </Link>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default PaymentSuccess;
