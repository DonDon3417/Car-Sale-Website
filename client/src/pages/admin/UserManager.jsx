import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Phone,
    Mail,
    Search,
    Loader2,
    CheckCircle,
    XCircle,
    Trash2,
    Unlock,
    Lock,
    RefreshCw,
    Shield,
    Calendar,
} from 'lucide-react';
import { request } from '../../config/request';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch users
    const fetchUsers = async (page = 1, search = '') => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('limit', 10);
            if (search) params.set('search', search);

            const res = await request.get(`/api/users/admin/users?${params.toString()}`);
            if (res.data?.metadata) {
                setUsers(res.data.metadata.users);
                setPagination({
                    page: res.data.metadata.currentPage,
                    limit: 10,
                    total: res.data.metadata.total,
                    totalPages: res.data.metadata.totalPages,
                });
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchUsers(1, searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle change page
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchUsers(newPage, searchQuery);
        }
    };

    // Toggle block user
    const handleToggleBlock = async (user) => {
        if (user.isAdmin) return;

        const action = user.isBlocked ? 'unblock' : 'block';
        if (!window.confirm(`Are you sure you want to ${action} account ${user.fullName}?`)) return;

        setIsProcessing(true);
        try {
            await request.patch(`/api/users/admin/users/${user._id}/block`);
            fetchUsers(pagination.page, searchQuery);
        } catch (error) {
            console.error('Error toggling block:', error);
            alert(error.response?.data?.message || 'An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    // Delete user
    const handleDelete = async (user) => {
        if (user.isAdmin) return;

        if (
            !window.confirm(
                `WARNING: Are you sure you want to permanently delete account ${user.fullName}? This action cannot be undone!`,
            )
        )
            return;

        setIsProcessing(true);
        try {
            await request.delete(`/api/users/admin/users/${user._id}`);
            fetchUsers(pagination.page, searchQuery);
            alert('Account deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-US');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-white/60 mt-1">Manage customer and system user accounts</p>
                </div>
                <button
                    onClick={() => fetchUsers(pagination.page, searchQuery)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

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
                                placeholder="Search by name, email, phone number..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#0066FF]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users table */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-white/50">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">
                                        User information
                                    </th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Contact</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">
                                        Role & status
                                    </th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">
                                        Join date
                                    </th>
                                    <th className="text-right py-4 px-4 text-white/60 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0">
                                                    {user.avatar ? (
                                                        <img
                                                            src={
                                                                user.avatar.startsWith('http')
                                                                    ? user.avatar
                                                                    : `${import.meta.env.VITE_API_URL}/uploads/avatars/${user.avatar}`
                                                            }
                                                            alt={user.fullName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-[#0066FF]/20 text-[#0066FF]">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{user.fullName}</p>
                                                    <p className="text-white/40 text-xs">ID: {user._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-white/70 text-sm">
                                                    <Mail className="w-3 h-3" />
                                                    {user.email}
                                                </div>
                                                {user.phone && (
                                                    <div className="flex items-center gap-2 text-white/70 text-sm">
                                                        <Phone className="w-3 h-3" />
                                                        {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.isAdmin
                                                            ? 'bg-purple-500/10 text-purple-400'
                                                            : 'bg-blue-500/10 text-blue-400'
                                                    }`}
                                                >
                                                    <Shield className="w-3 h-3" />
                                                    {user.isAdmin ? 'Admin' : 'Customers'}
                                                </span>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.isBlocked
                                                            ? 'bg-red-500/10 text-red-400'
                                                            : 'bg-green-500/10 text-green-400'
                                                    }`}
                                                >
                                                    {user.isBlocked ? (
                                                        <>
                                                            <Lock className="w-3 h-3" />
                                                            Blocked
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-3 h-3" />
                                                            Active
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2 text-white/70 text-sm">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {!user.isAdmin && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleBlock(user)}
                                                        disabled={isProcessing}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            user.isBlocked
                                                                ? 'text-green-400 hover:bg-green-500/20'
                                                                : 'text-yellow-400 hover:bg-yellow-500/20'
                                                        }`}
                                                        title={user.isBlocked ? 'Unblock account' : 'Block account'}
                                                    >
                                                        {user.isBlocked ? (
                                                            <Unlock className="w-4 h-4" />
                                                        ) : (
                                                            <Lock className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        disabled={isProcessing}
                                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Delete account"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {users.length > 0 && pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-between">
                        <p className="text-white/50 text-sm">
                            Showing {users.length} of {pagination.total} users
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
                            >
                                Previous
                            </button>
                            {[...Array(pagination.totalPages)].map((_, index) => {
                                const page = index + 1;
                                // Keep pagination compact while still showing nearby pages.
                                if (
                                    page === 1 ||
                                    page === pagination.totalPages ||
                                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                                ) {
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                                pagination.page === page
                                                    ? 'bg-[#0066FF] text-white'
                                                    : 'bg-white/5 hover:bg-white/10 text-white'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                }
                                if (page === pagination.page - 2 || page === pagination.page + 2) {
                                    return (
                                        <span key={page} className="text-white/50">
                                            ...
                                        </span>
                                    );
                                }
                                return null;
                            })}
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManager;

