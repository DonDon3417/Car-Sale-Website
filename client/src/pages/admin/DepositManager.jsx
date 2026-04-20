import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Clock,
    User,
    Phone,
    Mail,
    Car,
    Search,
    Loader2,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Check,
    X,
    FileText,
    RefreshCw,
    Wallet,
    DollarSign,
    Calendar,
    Banknote,
    Download,
} from 'lucide-react';
import {
    requestGetAllDeposits,
    requestUpdateDepositStatus,
    requestGetDepositStats,
    requestExportDepositsCsv,
} from '../../config/DepositRequest';

// Payment method icons
const MomoIcon = () => (
    <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
        M
    </div>
);

const VnpayIcon = () => (
    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
        VN
    </div>
);

const PaypalIcon = () => (
    <div className="w-6 h-6 bg-[#003087] rounded-full flex items-center justify-center text-white text-[8px] font-bold">
        PP
    </div>
);

const paymentMethodIcons = {
    MOMO: MomoIcon,
    VNPAY: VnpayIcon,
    PAYPAL: PaypalIcon,
};

const statusConfig = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        icon: AlertCircle,
    },
    confirmed: {
        label: 'Confirmed',
        color: 'bg-blue-500',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        icon: CheckCircle,
    },
    completed: {
        label: 'Completed',
        color: 'bg-green-500',
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/10',
        icon: CheckCircle,
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-red-500',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        icon: XCircle,
    },
};

const paymentStatusConfig = {
    pending: {
        label: 'Unpaid',
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
    },
    completed: {
        label: 'Paid',
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/10',
    },
    failed: {
        label: 'Failed',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
    },
    refunded: {
        label: 'Refunded',
        textColor: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
    },
};

const DepositManager = () => {
    const [deposits, setDeposits] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExportingCsv, setIsExportingCsv] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Fetch deposits
    const fetchDeposits = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
            };
            if (filterStatus) params.status = filterStatus;
            if (filterPaymentMethod) params.paymentMethod = filterPaymentMethod;

            const res = await requestGetAllDeposits(params);
            setDeposits(res.metadata?.deposits || []);
            setPagination((prev) => ({
                ...prev,
                ...res.metadata?.pagination,
            }));
        } catch (error) {
            console.error('Error fetching deposits:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const res = await requestGetDepositStats();
            setStats(res.metadata);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchDeposits();
        fetchStats();
    }, [filterStatus, filterPaymentMethod, pagination.page]);

    // Update status
    const handleUpdateStatus = async (depositId, status, paymentStatus) => {
        setIsProcessing(true);
        try {
            await requestUpdateDepositStatus(depositId, { status, paymentStatus });
            fetchDeposits();
            fetchStats();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating deposit:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStatusFilterChange = (event) => {
        setFilterStatus(event.target.value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePaymentMethodFilterChange = (event) => {
        setFilterPaymentMethod(event.target.value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handleExportCsv = async () => {
        setIsExportingCsv(true);
        try {
            const response = await requestExportDepositsCsv({
                status: filterStatus,
                paymentMethod: filterPaymentMethod,
            });

            const disposition = response.headers?.['content-disposition'] || '';
            const matched = disposition.match(/filename="?([^\"]+)"?/i);
            const filename = matched?.[1] || 'deposits.csv';

            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting deposits CSV:', error);
        } finally {
            setIsExportingCsv(false);
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Format price
    const formatPrice = (price) => {
        if (price >= 1000000000) {
            return (price / 1000000000).toFixed(2) + ' billion';
        }
        return (price / 1000000).toFixed(0) + ' million';
    };

    const formatPriceFull = (price) => {
        return new Intl.NumberFormat('en-US').format(price) + ' VND';
    };

    // Filter deposits by search
    const filteredDeposits = deposits.filter((deposit) => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
            deposit.user?.fullName?.toLowerCase().includes(search) ||
            deposit.user?.phone?.includes(search) ||
            deposit.car?.name?.toLowerCase().includes(search) ||
            deposit._id?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Deposit Management</h1>
                    <p className="text-white/60 mt-1">Manage car deposit reservations</p>
                </div>
                <button
                    onClick={() => {
                        fetchDeposits();
                        fetchStats();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
                <button
                    onClick={handleExportCsv}
                    disabled={isExportingCsv}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-xl transition-colors disabled:opacity-60"
                >
                    {isExportingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export CSV
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#0066FF]/20 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-[#0066FF]" />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Total orders</p>
                                <p className="text-2xl font-bold text-white">{stats.totalDeposits}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Pending</p>
                                <p className="text-2xl font-bold text-white">{stats.pendingDeposits}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Confirmed</p>
                                <p className="text-2xl font-bold text-white">{stats.confirmedDeposits}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-white">{stats.completedDeposits}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Total revenue</p>
                                <p className="text-xl font-bold text-emerald-400">{formatPrice(stats.totalRevenue)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
                <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, phone, car, order ID..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#0066FF]"
                            />
                        </div>
                    </div>

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={handleStatusFilterChange}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#0066FF]"
                    >
                        <option value="all" className="text-black bg-white">
                            All statuses
                        </option>
                        <option value="pending" className="text-black bg-white">
                            Pending
                        </option>
                        <option value="confirmed" className="text-black bg-white">
                            Confirmed
                        </option>
                        <option value="completed" className="text-black bg-white">
                            Completed
                        </option>
                        <option value="cancelled" className="text-black bg-white">
                            Cancelled
                        </option>
                    </select>

                    {/* Payment method filter */}
                    <select
                        value={filterPaymentMethod}
                        onChange={handlePaymentMethodFilterChange}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#0066FF]"
                    >
                        <option value="all" className="text-black bg-white">
                            All payment methods
                        </option>
                        <option value="MOMO" className="text-black bg-white">
                            MoMo
                        </option>
                        <option value="VNPAY" className="text-black bg-white">
                            VNPay
                        </option>
                        <option value="PAYPAL" className="text-black bg-white">
                            PayPal
                        </option>
                    </select>
                </div>
            </div>

            {/* Deposits table */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                    </div>
                ) : filteredDeposits.length === 0 ? (
                    <div className="text-center py-20 text-white/50">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No deposits found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Order ID</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Customers</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Car</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">
                                        Deposit amount
                                    </th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Payment</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Status</th>
                                    <th className="text-right py-4 px-4 text-white/60 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDeposits.map((deposit) => {
                                    const status = statusConfig[deposit.status];
                                    const paymentStatus = paymentStatusConfig[deposit.paymentStatus];
                                    const StatusIcon = status?.icon || AlertCircle;
                                    const PaymentIcon = paymentMethodIcons[deposit.paymentMethod] || MomoIcon;

                                    return (
                                        <tr
                                            key={deposit._id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-white font-mono text-sm">
                                                        #{deposit._id?.slice(-8).toUpperCase()}
                                                    </p>
                                                    <p className="text-white/40 text-xs">
                                                        {formatDate(deposit.createdAt)}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-white font-medium">{deposit.user?.fullName}</p>
                                                    <p className="text-white/50 text-sm flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {deposit.customerPhone || deposit.user?.phone}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    {deposit.car?.images?.[0] && (
                                                        <img
                                                            src={import.meta.env.VITE_API_URL + deposit.car.images[0]}
                                                            alt=""
                                                            className="w-14 h-10 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="text-white text-sm font-medium">
                                                            {deposit.car?.name}
                                                        </p>
                                                        <p className="text-white/50 text-xs">
                                                            {deposit.carVersion && `${deposit.carVersion}`}
                                                            {deposit.carColor && ` • ${deposit.carColor}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-green-400 font-bold">
                                                        {formatPrice(deposit.depositAmount)}
                                                    </p>
                                                    <p className="text-white/40 text-xs">
                                                        10% of {formatPrice(deposit.carPrice)}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <PaymentIcon />
                                                    <div>
                                                        <p className="text-white text-sm">{deposit.paymentMethod}</p>
                                                        <span className={`text-xs ${paymentStatus?.textColor}`}>
                                                            {paymentStatus?.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status?.textColor} ${status?.bgColor}`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {status?.label}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDeposit(deposit);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {deposit.status === 'pending' && (
                                                        <button
                                                            onClick={() =>
                                                                handleUpdateStatus(
                                                                    deposit._id,
                                                                    'confirmed',
                                                                    'completed',
                                                                )
                                                            }
                                                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                                            title="Confirm"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {deposit.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(deposit._id, 'completed')}
                                                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                            title="Completed"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {!['completed', 'cancelled'].includes(deposit.status) && (
                                                        <button
                                                            onClick={() =>
                                                                handleUpdateStatus(deposit._id, 'cancelled', 'refunded')
                                                            }
                                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                        <p className="text-white/50 text-sm">
                            Showing {deposits.length} / {pagination.total} orders
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1.5 text-white text-sm">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedDeposit && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1a2332] rounded-2xl w-full max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Deposit details</h3>
                            <span className="text-white/50 font-mono text-sm">
                                #{selectedDeposit._id?.slice(-8).toUpperCase()}
                            </span>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Customer info */}
                            <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#0066FF]" />
                                    Customer information
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-white/50">Full name</p>
                                        <p className="text-white">{selectedDeposit.user?.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50">Phone number</p>
                                        <p className="text-white">
                                            {selectedDeposit.customerPhone || selectedDeposit.user?.phone}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-white/50">Email</p>
                                        <p className="text-white">{selectedDeposit.user?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Car info */}
                            <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    <Car className="w-4 h-4 text-[#0066FF]" />
                                    Car information
                                </h4>
                                <div className="flex items-center gap-3">
                                    {selectedDeposit.car?.images?.[0] && (
                                        <img
                                            src={import.meta.env.VITE_API_URL + selectedDeposit.car.images[0]}
                                            alt=""
                                            className="w-20 h-14 rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="text-white font-medium">{selectedDeposit.car?.name}</p>
                                        <p className="text-white/50 text-sm">
                                            {selectedDeposit.carVersion && `${selectedDeposit.carVersion}`}
                                            {selectedDeposit.carColor && ` • ${selectedDeposit.carColor}`}
                                        </p>
                                        <p className="text-[#0066FF] font-semibold">
                                            {formatPriceFull(selectedDeposit.carPrice)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Deposit info */}
                            <div className="bg-linear-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
                                <h4 className="text-white font-medium flex items-center gap-2 mb-3">
                                    <Wallet className="w-4 h-4 text-green-400" />
                                    Deposit information
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-white/50">Deposit amount (10%)</p>
                                        <p className="text-green-400 text-xl font-bold">
                                            {formatPriceFull(selectedDeposit.depositAmount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/50">Method</p>
                                        <p className="text-white flex items-center gap-2">
                                            {selectedDeposit.paymentMethod}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/50">Reservation hold period</p>
                                        <p className="text-white">{formatDate(selectedDeposit.expiresAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50">Payment</p>
                                        <span
                                            className={`text-sm ${paymentStatusConfig[selectedDeposit.paymentStatus]?.textColor}`}
                                        >
                                            {paymentStatusConfig[selectedDeposit.paymentStatus]?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            {selectedDeposit.note && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <h4 className="text-white font-medium flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-[#0066FF]" />
                                        Note
                                    </h4>
                                    <p className="text-white/70 text-sm">{selectedDeposit.note}</p>
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-white/50 text-sm">Status</span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        statusConfig[selectedDeposit.status]?.textColor
                                    } ${statusConfig[selectedDeposit.status]?.bgColor}`}
                                >
                                    {statusConfig[selectedDeposit.status]?.label}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                            >
                                Close
                            </button>

                            {selectedDeposit.status === 'pending' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedDeposit._id, 'confirmed', 'completed')}
                                    disabled={isProcessing}
                                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Confirm
                                        </>
                                    )}
                                </button>
                            )}

                            {selectedDeposit.status === 'confirmed' && (
                                <button
                                    onClick={() => handleUpdateStatus(selectedDeposit._id, 'completed')}
                                    disabled={isProcessing}
                                    className="flex-1 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Completed
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DepositManager;
