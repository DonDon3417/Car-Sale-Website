import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Calendar, CreditCard, Clock, Package, Eye, X, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';

import { requestGetMyDeposits } from '../../config/DepositRequest';

const statusConfig = {
    pending: { label: 'Pending confirmation', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' },
    confirmed: { label: 'Confirmed', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/15 text-red-400 border-red-500/20' },
    completed: { label: 'Completed', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
};

const paymentStatusConfig = {
    pending: { label: 'Unpaid', color: 'text-yellow-400' },
    completed: { label: 'Paid', color: 'text-green-400' },
    failed: { label: 'Failed', color: 'text-red-400' },
    refunded: { label: 'Refunded', color: 'text-orange-400' },
};

const MyDepositsPage = () => {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeposit, setSelectedDeposit] = useState(null);

    useEffect(() => {
        fetchDeposits();
    }, []);

    const fetchDeposits = async () => {
        try {
            const res = await requestGetMyDeposits();
            setDeposits(res.metadata || []);
        } catch (err) {
            console.error('Fetch deposits error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US').format(price) + ' VND';
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div>
                    <h1 className="text-xl font-bold text-white">My Deposits</h1>
                    <p className="text-white/40 text-sm mt-1">Track your car deposit orders</p>
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#111827]/80 border border-white/6 rounded-2xl p-5 animate-pulse">
                        <div className="flex gap-4">
                            <div className="w-24 h-18 bg-white/6 rounded-xl" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-white/6 rounded w-1/3" />
                                <div className="h-3 bg-white/6 rounded w-1/2" />
                                <div className="h-3 bg-white/6 rounded w-1/4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">My Deposits</h1>
                    <p className="text-white/40 text-sm mt-1">
                        {deposits.length > 0
                            ? `You have ${deposits.length} deposits`
                            : 'Track your car deposit orders'}
                    </p>
                </div>
            </div>

            {/* Empty State */}
            {deposits.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111827]/80 backdrop-blur-sm border border-white/6 rounded-2xl p-12 text-center"
                >
                    <div className="w-16 h-16 bg-white/4 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/50 text-sm">You do not have any deposits yet</p>
                    <p className="text-white/30 text-xs mt-1">Search and reserve your favorite car</p>
                </motion.div>
            )}

            {/* Deposit List */}
            <div className="space-y-3">
                {deposits.map((deposit, index) => {
                    const status = statusConfig[deposit.status] || statusConfig.pending;
                    const car = deposit.car;

                    return (
                        <motion.div
                            key={deposit._id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-[#111827]/80 backdrop-blur-sm border border-white/6 rounded-2xl p-5 hover:border-white/10 transition-all duration-200 group"
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Car Image */}
                                {car?.images?.[0] && (
                                    <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-white/4">
                                        <img
                                            src={`${import.meta.env.VITE_URL_IMAGE}${car.images[0]}`}
                                            alt={car.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-white text-sm font-semibold truncate">
                                                {car?.name || 'Unknown car'}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                                {deposit.carVersion && (
                                                    <span className="text-white/40 text-xs flex items-center gap-1">
                                                        <Car className="w-3 h-3" />
                                                        {deposit.carVersion}
                                                    </span>
                                                )}
                                                {deposit.carColor && (
                                                    <span className="text-white/40 text-xs">
                                                        Color: {deposit.carColor}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border shrink-0 ${status.color}`}
                                        >
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
                                        <span className="text-[#0066FF] text-sm font-semibold flex items-center gap-1">
                                            <CreditCard className="w-3.5 h-3.5" />
                                            {formatPrice(deposit.depositAmount)}
                                        </span>
                                        <span className="text-white/30 text-xs flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {dayjs(deposit.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </span>
                                        <span className="text-white/30 text-xs flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Expires: {dayjs(deposit.expiresAt).format('DD/MM/YYYY')}
                                        </span>
                                    </div>
                                </div>

                                {/* View Detail */}
                                <button
                                    onClick={() => setSelectedDeposit(deposit)}
                                    className="self-center p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/6 transition-all opacity-0 group-hover:opacity-100"
                                    title="View details"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedDeposit && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedDeposit(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#111827] border border-white/8 rounded-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-white/6">
                                <h3 className="text-white text-base font-semibold">Deposit order details</h3>
                                <button
                                    onClick={() => setSelectedDeposit(null)}
                                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/6 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                                {/* Car Info */}
                                <div className="flex gap-4 p-3 bg-white/2 rounded-xl">
                                    {selectedDeposit.car?.images?.[0] && (
                                        <img
                                            src={`${import.meta.env.VITE_URL_IMAGE}${selectedDeposit.car.images[0]}`}
                                            alt=""
                                            className="w-20 h-14 rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="text-white text-sm font-semibold">
                                            {selectedDeposit.car?.name || 'N/A'}
                                        </p>
                                        <p className="text-white/40 text-xs mt-0.5">
                                            {[selectedDeposit.carVersion, selectedDeposit.carColor]
                                                .filter(Boolean)
                                                .join(' • ')}
                                        </p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        {
                                            label: 'Car price',
                                            value: formatPrice(selectedDeposit.carPrice),
                                        },
                                        {
                                            label: 'Deposit amount',
                                            value: formatPrice(selectedDeposit.depositAmount),
                                            highlight: true,
                                        },
                                        {
                                            label: 'Method',
                                            value: selectedDeposit.paymentMethod,
                                        },
                                        {
                                            label: 'Payment',
                                            value: paymentStatusConfig[selectedDeposit.paymentStatus]?.label || 'N/A',
                                            className: paymentStatusConfig[selectedDeposit.paymentStatus]?.color,
                                        },
                                        {
                                            label: 'Status',
                                            value: statusConfig[selectedDeposit.status]?.label || 'N/A',
                                        },
                                        {
                                            label: 'Contact phone',
                                            value: selectedDeposit.customerPhone || 'N/A',
                                        },
                                        {
                                            label: 'Created date',
                                            value: dayjs(selectedDeposit.createdAt).format('DD/MM/YYYY HH:mm'),
                                        },
                                        {
                                            label: 'Deposit deadline',
                                            value: dayjs(selectedDeposit.expiresAt).format('DD/MM/YYYY'),
                                        },
                                    ].map((item, i) => (
                                        <div key={i} className="p-3 bg-white/2 rounded-xl">
                                            <p className="text-white/40 text-[11px] mb-1">{item.label}</p>
                                            <p
                                                className={`text-sm font-medium ${
                                                    item.highlight ? 'text-[#0066FF]' : item.className || 'text-white'
                                                }`}
                                            >
                                                {item.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Note */}
                                {selectedDeposit.note && (
                                    <div className="p-3 bg-white/2 rounded-xl">
                                        <p className="text-white/40 text-[11px] mb-1">Note</p>
                                        <p className="text-white/70 text-sm">{selectedDeposit.note}</p>
                                    </div>
                                )}

                                {/* Transaction ID */}
                                {selectedDeposit.transactionId && (
                                    <div className="p-3 bg-white/2 rounded-xl">
                                        <p className="text-white/40 text-[11px] mb-1">Transaction ID</p>
                                        <p className="text-white/70 text-sm font-mono">
                                            {selectedDeposit.transactionId}
                                        </p>
                                    </div>
                                )}

                                {/* Cancel Reason */}
                                {selectedDeposit.cancelReason && (
                                    <div className="p-3 bg-red-500/6 border border-red-500/10 rounded-xl">
                                        <p className="text-red-400/60 text-[11px] mb-1">Cancellation reason</p>
                                        <p className="text-red-400 text-sm">{selectedDeposit.cancelReason}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyDepositsPage;
