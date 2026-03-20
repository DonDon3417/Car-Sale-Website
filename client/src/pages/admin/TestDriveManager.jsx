import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar,
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
    Filter,
    RefreshCw,
} from 'lucide-react';
import { request } from '../../config/request';

const statusConfig = {
    pending: {
        label: 'Pending confirmation',
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

const TestDriveManager = () => {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch bookings
    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.set('status', filterStatus);
            if (filterDate) params.set('date', filterDate);

            const res = await request.get(`/api/test-drive/admin/bookings?${params.toString()}`);
            setBookings(res.data?.metadata || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const res = await request.get('/api/test-drive/admin/stats');
            setStats(res.data?.metadata);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchStats();
    }, [filterStatus, filterDate]);

    // Confirm booking
    const handleConfirm = async (bookingId) => {
        setIsProcessing(true);
        try {
            await request.patch(`/api/test-drive/admin/bookings/${bookingId}/confirm`, {});
            fetchBookings();
            fetchStats();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error confirming booking:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Complete booking
    const handleComplete = async (bookingId) => {
        setIsProcessing(true);
        try {
            await request.patch(`/api/test-drive/admin/bookings/${bookingId}/complete`, {});
            fetchBookings();
            fetchStats();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error completing booking:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Cancel booking
    const handleCancel = async (bookingId) => {
        const reason = window.prompt('Enter reason for rejecting/canceling the appointment (will be emailed to the customer):');
        if (reason === null) return; // User clicked Cancel
        if (!reason.trim()) {
            alert('Please enter a reason!');
            return;
        }

        setIsProcessing(true);
        try {
            await request.patch(`/api/test-drive/admin/bookings/${bookingId}/cancel`, {
                reason: reason.trim(),
            });
            fetchBookings();
            fetchStats();
            setIsModalOpen(false);
            alert('Cancelled and sent an email notification to the customer.');
        } catch (error) {
            console.error('Error cancelling booking:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });
    };

    // Format price
    const formatPrice = (price) => {
        if (price >= 1000000000) {
            return (price / 1000000000).toFixed(2) + ' billion';
        }
        return (price / 1000000).toFixed(0) + ' million';
    };

    // Filter bookings by search
    const filteredBookings = bookings.filter((booking) => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
            booking.fullName?.toLowerCase().includes(search) ||
            booking.phone?.includes(search) ||
            booking.car?.name?.toLowerCase().includes(search)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Test Drive Management</h1>
                    <p className="text-white/60 mt-1">Manage car test-drive requests</p>
                </div>
                <button
                    onClick={() => {
                        fetchBookings();
                        fetchStats();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#0066FF]/20 rounded-xl flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-[#0066FF]" />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Total appointments</p>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Pending confirmation</p>
                                <p className="text-2xl font-bold text-white">{stats.pending}</p>
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
                                <p className="text-2xl font-bold text-white">{stats.confirmed}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-white/60 text-sm">Today</p>
                                <p className="text-2xl font-bold text-white">{stats.todayBookings}</p>
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
                                placeholder="Search by name, phone, car..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#0066FF]"
                            />
                        </div>
                    </div>

                    {/* Status filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#0066FF]"
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending confirmation</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Date filter */}
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#0066FF]"
                    />
                </div>
            </div>

            {/* Bookings table */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-20 text-white/50">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No appointments</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">
                                        Customers
                                    </th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Car</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">
                                        Date & time
                                    </th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">
                                        Status
                                    </th>
                                    <th className="text-right py-4 px-4 text-white/60 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking) => {
                                    const status = statusConfig[booking.status];
                                    const StatusIcon = status?.icon || AlertCircle;

                                    return (
                                        <tr
                                            key={booking._id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-white font-medium">{booking.fullName}</p>
                                                    <p className="text-white/50 text-sm flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {booking.phone}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    {booking.car?.images?.[0] && (
                                                        <img
                                                            src={import.meta.env.VITE_API_URL + booking.car.images[0]}
                                                            alt=""
                                                            className="w-14 h-10 rounded-lg object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="text-white text-sm font-medium">
                                                            {booking.car?.name}
                                                        </p>
                                                        <p className="text-[#0066FF] text-xs">
                                                            {formatPrice(booking.car?.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-white text-sm">{formatDate(booking.date)}</p>
                                                    <p className="text-[#0066FF] font-semibold">{booking.timeSlot}</p>
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
                                                            setSelectedBooking(booking);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                        title="View details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleConfirm(booking._id)}
                                                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                                            title="Confirm"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleComplete(booking._id)}
                                                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                            title="Completed"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {!['completed', 'cancelled'].includes(booking.status) && (
                                                        <button
                                                            onClick={() => handleCancel(booking._id)}
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
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedBooking && (
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
                        <div className="p-6 border-b border-white/10">
                            <h3 className="text-xl font-bold text-white">Appointment details</h3>
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
                                        <p className="text-white">{selectedBooking.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50">Phone number</p>
                                        <p className="text-white">{selectedBooking.phone}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-white/50">Email</p>
                                        <p className="text-white">{selectedBooking.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Booking info */}
                            <div className="bg-white/5 rounded-xl p-4 space-y-3">
                                <h4 className="text-white font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#0066FF]" />
                                    Appointment information
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-white/50">Days</p>
                                        <p className="text-white">{formatDate(selectedBooking.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50">Hours</p>
                                        <p className="text-[#0066FF] font-semibold">{selectedBooking.timeSlot}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-white/50">Car</p>
                                        <p className="text-white">{selectedBooking.car?.name}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Note */}
                            {selectedBooking.note && (
                                <div className="bg-white/5 rounded-xl p-4">
                                    <h4 className="text-white font-medium flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-[#0066FF]" />
                                        Note
                                    </h4>
                                    <p className="text-white/70 text-sm">{selectedBooking.note}</p>
                                </div>
                            )}

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="text-white/50 text-sm">Status</span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        statusConfig[selectedBooking.status]?.textColor
                                    } ${statusConfig[selectedBooking.status]?.bgColor}`}
                                >
                                    {statusConfig[selectedBooking.status]?.label}
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

                            {selectedBooking.status === 'pending' && (
                                <button
                                    onClick={() => handleConfirm(selectedBooking._id)}
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

                            {selectedBooking.status === 'confirmed' && (
                                <button
                                    onClick={() => handleComplete(selectedBooking._id)}
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

export default TestDriveManager;

