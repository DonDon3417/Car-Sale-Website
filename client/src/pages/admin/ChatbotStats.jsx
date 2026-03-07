import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, TrendingUp, Flame, Thermometer, Snowflake, BarChart3, Activity } from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { getChatbotStats } from '../../config/ChatbotRequest';

const COLORS_PIE = {
    Hot: '#ef4444',
    Warm: '#f59e0b',
    Cold: '#3b82f6',
};

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#1E293B]/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300"
    >
        <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
        </div>
        <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1E293B] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                <p className="text-white/60 text-xs mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-white text-sm font-semibold">
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const ChatbotStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await getChatbotStats();
            setStats(res.data.metadata);
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center text-white/50 py-20">Không thể tải dữ liệu thống kê</div>;
    }

    // Prepare pie chart data
    const pieData = [
        { name: 'Hot', value: stats.levels.Hot || 0 },
        { name: 'Warm', value: stats.levels.Warm || 0 },
        { name: 'Cold', value: stats.levels.Cold || 0 },
    ].filter((d) => d.value > 0);

    // Format daily dates
    const dailyCharts = (stats.dailyChats || []).map((d) => ({
        ...d,
        date: d.date.split('-').slice(1).join('/'),
    }));

    const scoreTrend = (stats.scoreTrend || []).map((d) => ({
        ...d,
        date: d.date.split('-').slice(1).join('/'),
    }));

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#0066FF]/20 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-[#0066FF]" />
                    </div>
                    Thống Kê Chatbot AI
                </h1>
                <p className="text-white/40 text-sm mt-1 ml-13">
                    Phân tích mức độ quan tâm của khách hàng qua chatbot tư vấn
                </p>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    icon={MessageCircle}
                    label="Tổng cuộc hội thoại"
                    value={stats.totalSessions}
                    color="bg-[#0066FF]"
                    delay={0}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Trung bình Interest"
                    value={stats.avgInterestScore}
                    color="bg-emerald-500"
                    delay={0.05}
                />
                <StatCard
                    icon={Flame}
                    label="Hot (71-100)"
                    value={stats.levels.Hot || 0}
                    color="bg-red-500"
                    delay={0.1}
                />
                <StatCard
                    icon={Thermometer}
                    label="Warm (41-70)"
                    value={stats.levels.Warm || 0}
                    color="bg-amber-500"
                    delay={0.15}
                />
                <StatCard
                    icon={Snowflake}
                    label="Cold (0-40)"
                    value={stats.levels.Cold || 0}
                    color="bg-blue-500"
                    delay={0.2}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-[#1E293B]/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5"
                >
                    <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-[#0066FF]" />
                        Tỷ lệ Hot / Warm / Cold
                    </h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry) => (
                                        <Cell key={entry.name} fill={COLORS_PIE[entry.name]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={(value) => <span className="text-white/70 text-xs">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-60 text-white/30 text-sm">
                            Chưa có dữ liệu
                        </div>
                    )}
                </motion.div>

                {/* Bar Chart - daily chats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#1E293B]/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5"
                >
                    <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-400" />
                        Số cuộc chat theo ngày
                    </h3>
                    {dailyCharts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={dailyCharts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar
                                    dataKey="count"
                                    name="Số cuộc chat"
                                    fill="#0066FF"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-60 text-white/30 text-sm">
                            Chưa có dữ liệu
                        </div>
                    )}
                </motion.div>

                {/* Line Chart - score trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-[#1E293B]/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5"
                >
                    <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        Xu hướng Interest Score
                    </h3>
                    {scoreTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <LineChart data={scoreTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="avgScore"
                                    name="Avg Score"
                                    stroke="#f59e0b"
                                    strokeWidth={2.5}
                                    dot={{ fill: '#f59e0b', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-60 text-white/30 text-sm">
                            Chưa có dữ liệu
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ChatbotStats;
