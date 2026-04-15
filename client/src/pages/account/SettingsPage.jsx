import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    Calendar,
    Clock,
    Car,
    MessageSquareText,
    ShieldAlert,
    CheckCircle2,
    CreditCard,
    ClipboardCheck,
    Check,
    Moon,
    Sun,
} from 'lucide-react';
import dayjs from 'dayjs';

import { requestGetMyTestDriveBookings } from '../../config/TestDriveRequest';
import { requestGetMyDeposits } from '../../config/DepositRequest';
import { requestGetNotificationReadState, requestUpdateNotificationReadState } from '../../config/UserRequest';
import { useStore } from '../../hooks/useStore';

const NOTIFICATION_FILTERS = ['All', 'Test drive', 'Deposit', 'Cancelled'];

const testDriveStatusConfig = {
    confirmed: {
        label: 'Confirmed',
        color: 'text-blue-300 bg-blue-500/10 border-blue-500/25',
        title: 'Your test-drive booking has been confirmed by admin.',
        icon: CheckCircle2,
    },
    completed: {
        label: 'Completed',
        color: 'text-green-300 bg-green-500/10 border-green-500/25',
        title: 'Your test-drive appointment has been marked as completed.',
        icon: ClipboardCheck,
    },
    cancelled: {
        label: 'Cancelled',
        color: 'text-red-300 bg-red-500/10 border-red-500/25',
        title: 'Your test-drive booking was cancelled by admin.',
        icon: ShieldAlert,
    },
};

const depositStatusConfig = {
    confirmed: {
        label: 'Confirmed',
        color: 'text-blue-300 bg-blue-500/10 border-blue-500/25',
        title: 'Your deposit request has been confirmed by admin.',
        icon: CheckCircle2,
    },
    completed: {
        label: 'Completed',
        color: 'text-green-300 bg-green-500/10 border-green-500/25',
        title: 'Your deposit process has been marked as completed.',
        icon: ClipboardCheck,
    },
    cancelled: {
        label: 'Cancelled',
        color: 'text-red-300 bg-red-500/10 border-red-500/25',
        title: 'Your deposit request was cancelled by admin.',
        icon: ShieldAlert,
    },
};

const SettingsPage = () => {
    const { dataUser, themeMode, setThemeMode } = useStore();
    const isLightTheme = themeMode === 'light';
    const [bookings, setBookings] = useState([]);
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [readMap, setReadMap] = useState({});

    const storageKey = useMemo(() => {
        const userId = dataUser?._id || 'guest';
        return `account_notifications_read_${userId}`;
    }, [dataUser?._id]);

    useEffect(() => {
        const loadReadState = async () => {
            try {
                const res = await requestGetNotificationReadState();
                const serverMap = res?.metadata;
                if (serverMap && typeof serverMap === 'object' && !Array.isArray(serverMap)) {
                    setReadMap(serverMap);
                    localStorage.setItem(storageKey, JSON.stringify(serverMap));
                    return;
                }
            } catch (error) {
                console.error('Load read state from server failed, fallback to local:', error);
            }

            try {
                const raw = localStorage.getItem(storageKey);
                const parsed = raw ? JSON.parse(raw) : {};
                setReadMap(parsed && typeof parsed === 'object' ? parsed : {});
            } catch (error) {
                console.error('Load notification read state from local failed:', error);
                setReadMap({});
            }
        };

        loadReadState();
    }, [storageKey]);

    const saveReadMap = async (nextState) => {
        setReadMap(nextState);
        try {
            localStorage.setItem(storageKey, JSON.stringify(nextState));
        } catch (error) {
            console.error('Save notification read state failed:', error);
        }

        try {
            await requestUpdateNotificationReadState(nextState);
        } catch (error) {
            console.error('Sync read state to server failed:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        if (readMap[notificationId]) return;
        await saveReadMap({ ...readMap, [notificationId]: true });
    };

    const markAllAsRead = async (items) => {
        if (!items.length) return;
        const nextState = { ...readMap };
        items.forEach((item) => {
            nextState[item.id] = true;
        });
        await saveReadMap(nextState);
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const [bookingRes, depositRes] = await Promise.all([
                    requestGetMyTestDriveBookings(),
                    requestGetMyDeposits(),
                ]);

                setBookings(Array.isArray(bookingRes?.metadata) ? bookingRes.metadata : []);
                setDeposits(Array.isArray(depositRes?.metadata) ? depositRes.metadata : []);
            } catch (error) {
                console.error('Fetch account notifications failed:', error);
                setBookings([]);
                setDeposits([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const adminNotifications = useMemo(() => {
        const testDriveNotifications = bookings
            .filter((booking) => booking?.status && booking.status !== 'pending')
            .map((booking) => {
                const statusInfo = testDriveStatusConfig[booking.status];
                return {
                    id: `testdrive-${booking._id}`,
                    type: 'Test drive',
                    carName: booking?.car?.name || 'Unknown vehicle',
                    date: booking.date,
                    time: booking.timeSlot,
                    statusLabel: statusInfo?.label || 'Updated',
                    statusColor: statusInfo?.color || 'text-slate-200 bg-slate-500/10 border-slate-500/25',
                    title: statusInfo?.title || 'Your test-drive booking was updated by admin.',
                    message: booking.adminNote || '',
                    reason: booking.cancelReason || '',
                    createdAt: booking.updatedAt || booking.createdAt,
                    icon: statusInfo?.icon || Bell,
                };
            });

        const depositNotifications = deposits
            .filter((deposit) => deposit?.status && deposit.status !== 'pending')
            .map((deposit) => {
                const statusInfo = depositStatusConfig[deposit.status];
                const isPaid = deposit.paymentStatus === 'completed';

                return {
                    id: `deposit-${deposit._id}`,
                    type: 'Deposit',
                    carName: deposit?.car?.name || 'Unknown vehicle',
                    date: deposit.createdAt,
                    time: null,
                    statusLabel: statusInfo?.label || 'Updated',
                    statusColor: statusInfo?.color || 'text-slate-200 bg-slate-500/10 border-slate-500/25',
                    title: statusInfo?.title || 'Your deposit was updated by admin.',
                    message: isPaid
                        ? 'Your deposit payment has been received successfully.'
                        : 'Your deposit request status was updated.',
                    reason: deposit.cancelReason || '',
                    createdAt: deposit.updatedAt || deposit.createdAt,
                    icon: isPaid ? CreditCard : statusInfo?.icon || Bell,
                };
            });

        return [...testDriveNotifications, ...depositNotifications].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
    }, [bookings, deposits]);

    const stats = useMemo(() => {
        const testDriveCount = adminNotifications.filter((item) => item.type === 'Test drive').length;
        const depositCount = adminNotifications.filter((item) => item.type === 'Deposit').length;
        const unreadCount = adminNotifications.filter((item) => !readMap[item.id]).length;

        return {
            total: adminNotifications.length,
            testDrive: testDriveCount,
            deposit: depositCount,
            unread: unreadCount,
        };
    }, [adminNotifications, readMap]);

    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'All') return adminNotifications;
        if (activeFilter === 'Cancelled') return adminNotifications.filter((item) => item.statusLabel === 'Cancelled');
        return adminNotifications.filter((item) => item.type === activeFilter);
    }, [activeFilter, adminNotifications]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-bold text-(--app-text)">Settings</h1>
                <p className="text-(--app-text-muted) text-sm mt-1">Admin notifications and account preferences</p>
            </div>

            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 }}
                className="customer-surface rounded-2xl p-6"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-(--app-text) text-sm font-semibold">Appearance</h2>
                        <p className="text-(--app-text-muted) text-xs mt-1">Switch between light and dark theme.</p>
                    </div>

                    <div className="flex items-center gap-2 p-1 rounded-xl bg-(--app-surface-soft) border border-(--app-border) w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setThemeMode('light')}
                            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                themeMode === 'light'
                                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                    : 'text-(--app-text-muted) hover:text-(--app-text)'
                            }`}
                        >
                            <Sun className="w-4 h-4" />
                            Light
                        </button>
                        <button
                            type="button"
                            onClick={() => setThemeMode('dark')}
                            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                themeMode === 'dark'
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-(--app-text-muted) hover:text-(--app-text)'
                            }`}
                        >
                            <Moon className="w-4 h-4" />
                            Dark
                        </button>
                    </div>
                </div>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="customer-surface backdrop-blur-sm rounded-2xl p-6 transition-colors duration-300"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#0066FF]/15 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-[#6fa3ff]" />
                        </div>
                        <div>
                            <h2 className="text-(--app-text) text-sm font-semibold">Admin notifications</h2>
                            <p className="text-(--app-text-muted) text-xs">Test drive and deposit updates</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs">
                        <span
                            className={`px-2.5 py-1 rounded-lg border font-medium ${
                                isLightTheme
                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                    : 'bg-(--app-surface-soft) text-(--app-text)/80 border-(--app-border)'
                            }`}
                        >
                            Total: {stats.total}
                        </span>
                        <span
                            className={`px-2.5 py-1 rounded-lg border font-medium ${
                                isLightTheme
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-blue-500/10 text-blue-300 border-blue-500/25'
                            }`}
                        >
                            Test drive: {stats.testDrive}
                        </span>
                        <span
                            className={`px-2.5 py-1 rounded-lg border font-medium ${
                                isLightTheme
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-green-500/10 text-green-300 border-green-500/25'
                            }`}
                        >
                            Deposit: {stats.deposit}
                        </span>
                        <span
                            className={`px-2.5 py-1 rounded-lg border font-medium ${
                                isLightTheme
                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                    : 'bg-orange-500/10 text-orange-300 border-orange-500/25'
                            }`}
                        >
                            Unread: {stats.unread}
                        </span>
                    </div>
                </div>

                {!loading && adminNotifications.length > 0 ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            {NOTIFICATION_FILTERS.map((filterName) => (
                                <button
                                    key={filterName}
                                    type="button"
                                    onClick={() => setActiveFilter(filterName)}
                                    className={`px-3 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                                        activeFilter === filterName
                                            ? isLightTheme
                                                ? 'bg-blue-100 text-blue-700 border-blue-300 font-semibold'
                                                : 'bg-[#0066FF]/15 text-[#87b4ff] border-[#0066FF]/30'
                                            : isLightTheme
                                              ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                              : 'bg-(--app-surface-soft) text-(--app-text)/75 border-(--app-border) hover:bg-(--app-surface-soft)'
                                    }`}
                                >
                                    {filterName}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => markAllAsRead(filteredNotifications)}
                            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium ${
                                isLightTheme
                                    ? 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                                    : 'border-(--app-border) text-(--app-text)/80 bg-(--app-surface-soft) hover:bg-(--app-surface-soft)'
                            }`}
                        >
                            <Check className="w-3.5 h-3.5" />
                            Mark all as read
                        </button>
                    </div>
                ) : null}

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 rounded-xl bg-(--app-surface-soft) animate-pulse" />
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-(--app-border) text-center">
                        <MessageSquareText className="w-6 h-6 text-(--app-text-muted) mx-auto mb-2" />
                        <p className="text-(--app-text-muted) text-sm">
                            {adminNotifications.length === 0
                                ? 'No admin notifications yet.'
                                : 'No notifications matched this filter.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {filteredNotifications.map((item) => {
                            const ItemIcon = item.icon;
                            const isUnread = !readMap[item.id];

                            return (
                                <article
                                    key={item.id}
                                    className={`p-4 rounded-xl border transition-colors ${
                                        isUnread
                                            ? isLightTheme
                                                ? 'bg-linear-to-r from-blue-50 to-white border-blue-300'
                                                : 'bg-linear-to-r from-[#0f2a50]/45 to-white/2 border-[#3b82f6]/25'
                                            : isLightTheme
                                              ? 'bg-white border-slate-200'
                                              : 'bg-linear-to-r from-(--app-surface-soft) to-(--app-surface-soft) border-(--app-border)'
                                    }`}
                                    style={{ boxShadow: 'var(--app-shadow-soft)' }}
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2.5">
                                            <div className="flex items-start gap-2.5 min-w-0">
                                                <div
                                                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                                                        isLightTheme
                                                            ? 'bg-blue-100 border-blue-200'
                                                            : 'bg-[#0066FF]/12 border-[#0066FF]/20'
                                                    }`}
                                                >
                                                    <ItemIcon
                                                        className={`w-4 h-4 ${
                                                            isLightTheme ? 'text-blue-700' : 'text-[#84b2ff]'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span
                                                            className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                                                                isLightTheme
                                                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                                                    : 'bg-(--app-surface-soft) text-(--app-text)/75 border-(--app-border)'
                                                            }`}
                                                        >
                                                            {item.type}
                                                        </span>
                                                        <span
                                                            className={`text-[11px] px-2 py-0.5 rounded-md border ${item.statusColor}`}
                                                        >
                                                            {item.statusLabel}
                                                        </span>
                                                    </div>
                                                    <p className="text-(--app-text) text-sm font-medium leading-relaxed">
                                                        {item.title}
                                                    </p>
                                                </div>
                                            </div>

                                            <p
                                                className={`text-[11px] whitespace-nowrap font-medium ${
                                                    isLightTheme ? 'text-slate-500' : 'text-(--app-text-muted)'
                                                }`}
                                            >
                                                {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="inline-flex items-center gap-1.5 text-[11px]">
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        isUnread
                                                            ? isLightTheme
                                                                ? 'bg-amber-500'
                                                                : 'bg-orange-300'
                                                            : isLightTheme
                                                              ? 'bg-slate-300'
                                                              : 'bg-(--app-border)'
                                                    }`}
                                                />
                                                <span
                                                    className={
                                                        isUnread
                                                            ? isLightTheme
                                                                ? 'text-amber-700 font-medium'
                                                                : 'text-orange-200'
                                                            : isLightTheme
                                                              ? 'text-slate-500'
                                                              : 'text-(--app-text-muted)'
                                                    }
                                                >
                                                    {isUnread ? 'Unread notification' : 'Read'}
                                                </span>
                                            </div>

                                            {isUnread ? (
                                                <button
                                                    type="button"
                                                    onClick={() => markAsRead(item.id)}
                                                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer font-medium ${
                                                        isLightTheme
                                                            ? 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                                                            : 'border-(--app-border) text-(--app-text)/75 hover:bg-(--app-surface-soft)'
                                                    }`}
                                                >
                                                    Mark as read
                                                </button>
                                            ) : null}
                                        </div>

                                        <div
                                            className={`flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs ${
                                                isLightTheme ? 'text-slate-600' : 'text-(--app-text-muted)'
                                            }`}
                                        >
                                            <span className="inline-flex items-center gap-1">
                                                <Car className="w-3.5 h-3.5" />
                                                {item.carName}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {dayjs(item.date).format('DD/MM/YYYY')}
                                            </span>
                                            {item.time ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {item.time}
                                                </span>
                                            ) : null}
                                        </div>

                                        {item.message ? (
                                            <div
                                                className={`p-3 rounded-lg border ${
                                                    isLightTheme
                                                        ? 'bg-slate-50 border-slate-200'
                                                        : 'bg-(--app-surface-soft) border-(--app-border)'
                                                }`}
                                            >
                                                <p
                                                    className={`text-sm ${
                                                        isLightTheme ? 'text-slate-700' : 'text-(--app-text)/80'
                                                    }`}
                                                >
                                                    {item.message}
                                                </p>
                                            </div>
                                        ) : null}

                                        {item.reason ? (
                                            <div
                                                className={`p-3 rounded-lg border ${
                                                    isLightTheme
                                                        ? 'bg-red-50 border-red-200'
                                                        : 'bg-red-500/8 border-red-500/20'
                                                }`}
                                            >
                                                <p
                                                    className={`text-[11px] mb-1 inline-flex items-center gap-1 font-medium ${
                                                        isLightTheme ? 'text-red-700' : 'text-red-400'
                                                    }`}
                                                >
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                    Admin reason
                                                </p>
                                                <p
                                                    className={`text-sm ${
                                                        isLightTheme ? 'text-red-700' : 'text-red-500/90'
                                                    }`}
                                                >
                                                    {item.reason}
                                                </p>
                                            </div>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </motion.section>
        </div>
    );
};

export default SettingsPage;
