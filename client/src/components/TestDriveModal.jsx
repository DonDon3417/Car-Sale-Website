import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    Clock,
    User,
    Phone,
    Mail,
    FileText,
    Car,
    Loader2,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { request } from '../config/request';
import CryptoJS from 'crypto-js';

const TestDriveModal = ({ isOpen, onClose, car }) => {
    const [step, setStep] = useState(1); // 1: Choose date/time, 2: Fill in details, 3: Confirm
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        note: '',
    });

    // Get user info
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await request.get('/api/users/me');
                const encryptedData = res.data?.metadata;
                if (encryptedData) {
                    const bytes = CryptoJS.AES.decrypt(encryptedData, import.meta.env.VITE_SECRET_CRYPTO);
                    const originalText = bytes.toString(CryptoJS.enc.Utf8);
                    const userData = JSON.parse(originalText);
                    setUser(userData);
                    setFormData((prev) => ({
                        ...prev,
                        fullName: userData.fullName || '',
                        phone: userData.phone || '',
                        email: userData.email || '',
                    }));
                }
            } catch (error) {
                console.error('Not logged in');
            }
        };
        if (isOpen) fetchUser();
    }, [isOpen]);

    // Fetch available slots when date changes
    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots(selectedDate);
        }
    }, [selectedDate]);

    const fetchAvailableSlots = async (date) => {
        setIsLoading(true);
        setError('');
        try {
            const formattedDate = formatDateForApi(date);
            const res = await request.get(
                `/api/test-drive/available-slots?date=${formattedDate}&carId=${encodeURIComponent(car?._id || '')}`,
            );
            setAvailableSlots(res.data?.metadata || []);
        } catch (error) {
            setError(error.response?.data?.message || 'Unable to load time slots');
            setAvailableSlots([]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateForApi = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay(); // 0 = Sunday

        const days = [];

        // Empty cells for days before first day
        for (let i = 0; i < startingDay; i++) {
            days.push(null);
        }

        // Days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    // Check if date is valid (not weekend, not past)
    const isValidDate = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayOfWeek = date.getDay();
        return date >= today && dayOfWeek !== 0 && dayOfWeek !== 6;
    };

    // Handle date selection
    const handleDateSelect = (date) => {
        if (isValidDate(date)) {
            setSelectedDate(date);
            setSelectedSlot(null);
        }
    };

    // Handle form submit
    const handleSubmit = async () => {
        if (!selectedDate || !selectedSlot || !formData.fullName || !formData.phone) {
            setError('Please fill in all information');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await request.post('/api/test-drive/booking', {
                carId: car._id,
                date: formatDateForApi(selectedDate),
                timeSlot: selectedSlot,
                fullName: formData.fullName,
                phone: formData.phone,
                email: formData.email,
                note: formData.note,
            });

            setSuccess(true);
            setStep(3);
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred, please try again');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format date display
    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
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

    // Month navigation
    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const resetModal = () => {
        setStep(1);
        setSelectedDate(null);
        setSelectedSlot(null);
        setSuccess(false);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="customer-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-linear-to-r from-[#0066FF] to-[#00D4FF] p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Car className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Book a Test Drive</h2>
                                <p className="text-white/75 text-sm">{car?.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                resetModal();
                                onClose();
                            }}
                            className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/20 rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                        {/* Step indicators */}
                        {!success && (
                            <div className="flex items-center justify-center gap-4 mb-6">
                                {[1, 2].map((s) => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                                step >= s
                                                    ? 'bg-[#0066FF] text-white'
                                                    : 'bg-(--app-input-bg) text-(--app-text-muted)'
                                            }`}
                                        >
                                            {s}
                                        </div>
                                        <span
                                            className={`text-sm ${step >= s ? 'text-(--app-text)' : 'text-(--app-text-muted)'}`}
                                        >
                                            {s === 1 ? 'Choose time' : 'Details'}
                                        </span>
                                        {s < 2 && (
                                            <div
                                                className={`w-8 h-0.5 ${step > s ? 'bg-[#0066FF]' : 'bg-(--app-border)'}`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Step 1: Select Date & Time */}
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Calendar */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={prevMonth}
                                            className="p-2 text-(--app-text-muted) hover:text-(--app-text) hover:bg-(--app-surface-soft) rounded-lg transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <h3 className="text-(--app-text) font-semibold">
                                            Month {currentMonth.getMonth() + 1}/{currentMonth.getFullYear()}
                                        </h3>
                                        <button
                                            onClick={nextMonth}
                                            className="p-2 text-(--app-text-muted) hover:text-(--app-text) hover:bg-(--app-surface-soft) rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Day names */}
                                    <div className="grid grid-cols-7 gap-2 mb-2">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                            <div key={day} className="text-center text-(--app-text-muted) text-sm py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar grid */}
                                    <div className="grid grid-cols-7 gap-2">
                                        {generateCalendarDays().map((date, idx) => {
                                            if (!date) {
                                                return <div key={idx} className="h-10" />;
                                            }

                                            const isToday = date.toDateString() === new Date().toDateString();
                                            const isSelected = selectedDate?.toDateString() === date.toDateString();
                                            const isValid = isValidDate(date);
                                            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleDateSelect(date)}
                                                    disabled={!isValid}
                                                    className={`h-10 rounded-lg text-sm font-medium transition-all ${
                                                        isSelected
                                                            ? 'bg-[#0066FF] text-white'
                                                            : isValid
                                                              ? 'bg-(--app-surface-soft) text-(--app-text) hover:bg-(--app-input-bg)'
                                                              : isWeekend
                                                                ? 'bg-red-500/10 text-red-400/50 cursor-not-allowed'
                                                                : 'bg-(--app-surface-soft) text-(--app-text-muted) cursor-not-allowed'
                                                    } ${isToday && !isSelected ? 'ring-2 ring-[#0066FF]' : ''}`}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <p className="text-(--app-text-muted) text-xs mt-3 text-center">
                                        * Weekend bookings are not available
                                    </p>
                                </div>

                                {/* Time slots */}
                                {selectedDate && (
                                    <div>
                                        <h4 className="text-(--app-text) font-medium mb-3 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-[#0066FF]" />
                                            Choose time slot - {formatDate(selectedDate)}
                                        </h4>

                                        {isLoading ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="w-6 h-6 text-[#0066FF] animate-spin" />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                                {availableSlots.map((slot) => (
                                                    <button
                                                        key={slot.time}
                                                        onClick={() => slot.available && setSelectedSlot(slot.time)}
                                                        disabled={!slot.available}
                                                        className={`py-3 rounded-xl text-sm font-medium transition-all ${
                                                            selectedSlot === slot.time
                                                                ? 'bg-[#0066FF] text-white'
                                                                : slot.available
                                                                  ? 'bg-(--app-surface-soft) text-(--app-text) hover:bg-(--app-input-bg)'
                                                                  : 'bg-(--app-surface-soft) text-(--app-text-muted) cursor-not-allowed line-through'
                                                        }`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Next button */}
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!selectedDate || !selectedSlot}
                                    className="w-full py-3 bg-[#0066FF] hover:bg-[#0052cc] disabled:bg-(--app-input-bg) disabled:text-(--app-text-muted) disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 2: Fill information */}
                        {step === 2 && !success && (
                            <div className="space-y-4">
                                {/* Selected info */}
                                <div className="p-4 bg-[#0066FF]/10 border border-[#0066FF]/20 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-[#0066FF]" />
                                        <div>
                                            <p className="text-(--app-text) font-medium">{formatDate(selectedDate)}</p>
                                            <p className="text-[#0066FF] text-sm font-semibold">{selectedSlot}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-(--app-text-muted) text-sm mb-2">
                                            <User className="w-4 h-4 inline mr-2" />
                                            Full name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            placeholder="Enter full name"
                                            className="w-full px-4 py-3 bg-(--app-input-bg) border border-(--app-border) rounded-xl text-(--app-text) placeholder:text-(--app-text-muted) focus:outline-none focus:border-[#0066FF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-(--app-text-muted) text-sm mb-2">
                                            <Phone className="w-4 h-4 inline mr-2" />
                                            Phone number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                            className="w-full px-4 py-3 bg-(--app-input-bg) border border-(--app-border) rounded-xl text-(--app-text) placeholder:text-(--app-text-muted) focus:outline-none focus:border-[#0066FF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-(--app-text-muted) text-sm mb-2">
                                            <Mail className="w-4 h-4 inline mr-2" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="Enter email"
                                            className="w-full px-4 py-3 bg-(--app-input-bg) border border-(--app-border) rounded-xl text-(--app-text) placeholder:text-(--app-text-muted) focus:outline-none focus:border-[#0066FF]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-(--app-text-muted) text-sm mb-2">
                                            <FileText className="w-4 h-4 inline mr-2" />
                                            Note
                                        </label>
                                        <textarea
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            placeholder="Enter note (optional)"
                                            rows={3}
                                            className="w-full px-4 py-3 bg-(--app-input-bg) border border-(--app-border) rounded-xl text-(--app-text) placeholder:text-(--app-text-muted) focus:outline-none focus:border-[#0066FF] resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 bg-(--app-surface-soft) hover:bg-(--app-input-bg) text-(--app-text) font-semibold rounded-xl transition-colors border border-(--app-border)"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !formData.fullName || !formData.phone}
                                        className="flex-1 py-3 bg-[#0066FF] hover:bg-[#0052cc] disabled:bg-(--app-input-bg) disabled:text-(--app-text-muted) disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Confirm booking'
                                        )}
                                    </button>
                                </div>

                                {!user && (
                                    <p className="text-center text-(--app-text-muted) text-sm">
                                        You need to{' '}
                                        <a href="/account/login" className="text-[#0066FF] underline">
                                            log in
                                        </a>{' '}
                                        to book a test drive
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Step 3: Success */}
                        {success && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-(--app-text) mb-2">Booking successful!</h3>
                                <p className="text-(--app-text-muted) mb-6">
                                    We will contact you to confirm your appointment.
                                </p>

                                <div className="bg-(--app-surface-soft) border border-(--app-border) rounded-xl p-4 text-left mb-6">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-(--app-text-muted)">Car</p>
                                            <p className="text-(--app-text) font-medium">{car?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-(--app-text-muted)">Days</p>
                                            <p className="text-(--app-text) font-medium">{formatDate(selectedDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-(--app-text-muted)">Hours</p>
                                            <p className="text-(--app-text) font-medium">{selectedSlot}</p>
                                        </div>
                                        <div>
                                            <p className="text-(--app-text-muted)">Contact</p>
                                            <p className="text-(--app-text) font-medium">{formData.phone}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        resetModal();
                                        onClose();
                                    }}
                                    className="px-8 py-3 bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TestDriveModal;
