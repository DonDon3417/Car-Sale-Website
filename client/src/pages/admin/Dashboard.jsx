import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Car,
    Users,
    ClipboardList,
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    Activity,
    PieChart as PieChartIcon,
    BarChart as BarChartIcon,
    Tag,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from 'recharts';
import { useStore } from '../../hooks/useStore';
import {
    requestGetDashboardStats,
    requestGetChartData,
    requestGetRecentActivity,
    requestGetAdvancedStats,
} from '../../config/DashboardRequest';

const Dashboard = () => {
    const { dataUser } = useStore();
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [recentActivity, setRecentActivity] = useState({ deposits: [], users: [] });
    const [advancedStats, setAdvancedStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartRes, activityRes, advancedRes] = await Promise.all([
                    requestGetDashboardStats(),
                    requestGetChartData(),
                    requestGetRecentActivity(),
                    requestGetAdvancedStats(),
                ]);
                setStats(statsRes.metadata);
                setChartData(chartRes.metadata);
                setRecentActivity(activityRes.metadata);
                setAdvancedStats(advancedRes.metadata);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatPrice = (price) => {
        if (price >= 1000000000) {
            return (price / 1000000000).toFixed(1) + ' billion';
        }
        return (price / 1000000).toFixed(0) + ' tr';
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US');

    const COLORS = ['#0066FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total doanh thu',
            value: formatPrice(stats?.totalRevenue || 0),
            change: `${stats?.revenueGrowth}%`,
            isPositive: parseFloat(stats?.revenueGrowth) >= 0,
            icon: DollarSign,
            color: '#10B981',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-500',
        },
        {
            title: 'Customers',
            value: stats?.totalUsers || 0,
            change: `${stats?.usersGrowth}%`,
            isPositive: parseFloat(stats?.usersGrowth) >= 0,
            icon: Users,
            color: '#3B82F6',
            bg: 'bg-blue-500/10',
            text: 'text-blue-500',
        },
        {
            title: 'Deposit orders',
            value: stats?.totalDeposits || 0,
            change: `${stats?.depositsGrowth}%`,
            isPositive: parseFloat(stats?.depositsGrowth) >= 0,
            icon: ClipboardList,
            color: '#F59E0B',
            bg: 'bg-amber-500/10',
            text: 'text-amber-500',
        },
        {
            title: 'Total cars',
            value: stats?.totalCars || 0,
            change: null,
            isPositive: true,
            icon: Car,
            color: '#EC4899',
            bg: 'bg-pink-500/10',
            text: 'text-pink-500',
        },
    ];

    const depositStatusData = advancedStats?.depositsByStatus?.map((item) => ({
        name:
            item._id === 'pending'
                ? 'Awaiting review'
                : item._id === 'confirmed'
                  ? 'Confirmed'
                  : item._id === 'completed'
                    ? 'Completed'
                    : item._id === 'cancelled'
                      ? 'Cancelled'
                      : item._id,
        value: item.count,
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-2xl font-bold text-white mb-1">Hello, {dataUser?.fullName || 'Admin'}! 👋</h1>
                <p className="text-white/50 text-sm">Detailed business activity report.</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        className="bg-[#1E293B] border border-white/5 rounded-2xl p-5 hover:shadow-lg hover:shadow-black/20 transition-all group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.text}`} />
                            </div>
                            {stat.change && (
                                <div
                                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                                        stat.isPositive
                                            ? 'bg-green-500/10 text-green-400'
                                            : 'bg-red-500/10 text-red-400'
                                    }`}
                                >
                                    {stat.isPositive ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    {stat.change}
                                </div>
                            )}
                        </div>
                        <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">{stat.title}</p>
                        <h3 className="text-white text-2xl font-bold">{stat.value}</h3>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-2 bg-[#1E293B] border border-white/5 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-white font-bold text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#0066FF]" />
                                Revenue chart
                            </h2>
                            <p className="text-white/40 text-xs mt-1">Deposit revenue for the last 6 months</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                                    tickFormatter={(val) => `${val / 1000000}M`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value) => [`${value.toLocaleString()} VND`, 'Doanh thu']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0066FF"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="bg-[#1E293B] border border-white/5 rounded-2xl overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-white/5">
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-500" />
                            Recent activity
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px] p-4 space-y-4 custom-scrollbar">
                        {recentActivity.deposits.length === 0 && recentActivity.users.length === 0 ? (
                            <div className="text-center text-white/30 py-8">No recent activity</div>
                        ) : (
                            <>
                                {recentActivity.deposits.map((deposit) => (
                                    <div
                                        key={deposit._id}
                                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center shrink-0">
                                            <ClipboardList className="w-5 h-5 text-[#0066FF]" />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm">
                                                <span className="font-semibold text-[#0066FF]">
                                                    {deposit.user?.fullName}
                                                </span>{' '}
                                                placed a deposit for <span className="text-white/70">{deposit.car?.name}</span>
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-white/40">
                                                    {formatDate(deposit.createdAt)}
                                                </span>
                                                <span className="text-xs font-medium text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                                                    +{formatPrice(deposit.depositAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recentActivity.users.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                                            <Users className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-white text-sm">
                                                <span className="font-semibold text-purple-400">{user.fullName}</span>{' '}
                                                registered a new account
                                            </p>
                                            <span className="text-xs text-white/40 mt-1 block">
                                                {formatDate(user.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Charts Row 2 - Advanced Stats */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Deposit Status Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-[#1E293B] border border-white/5 rounded-2xl p-6"
                >
                    <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
                        <PieChartIcon className="w-5 h-5 text-orange-500" />
                        Order status
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={depositStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {depositStatusData?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Cars by Brand Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-[#1E293B] border border-white/5 rounded-2xl p-6"
                >
                    <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
                        <BarChartIcon className="w-5 h-5 text-blue-500" />
                        Cars by brand
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={advancedStats?.carsByBrand}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="_id"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" name="Number of cars" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Cars by Category Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-[#1E293B] border border-white/5 rounded-2xl p-6"
                >
                    <h2 className="text-white font-bold text-lg flex items-center gap-2 mb-6">
                        <Tag className="w-5 h-5 text-pink-500" />
                        Cars by category
                    </h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={advancedStats?.carsByCategory} layout="vertical">
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(255,255,255,0.05)"
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    dataKey="_id"
                                    type="category"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }}
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="count" name="Number of cars" fill="#EC4899" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;

