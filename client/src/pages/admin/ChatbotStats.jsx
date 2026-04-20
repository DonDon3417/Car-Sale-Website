import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, TrendingUp, Flame, Thermometer, Snowflake, BarChart3, Activity, Search } from 'lucide-react';
import { Modal } from 'antd';
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
import { getChatbotAdminSessionById, getChatbotAdminSessions, getChatbotStats } from '../../config/ChatbotRequest';

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
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [historyLevel, setHistoryLevel] = useState('');
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');
    const [history, setHistory] = useState([]);
    const [historyPagination, setHistoryPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [selectedSession, setSelectedSession] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchChatHistory();
    }, [historyPagination.page]);

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

    const fetchChatHistory = async (
        nextPage = historyPagination.page,
        nextSearch = historySearch,
        nextLevel = historyLevel,
        nextStartDate = historyStartDate,
        nextEndDate = historyEndDate,
    ) => {
        try {
            setHistoryLoading(true);
            const res = await getChatbotAdminSessions({
                page: nextPage,
                limit: historyPagination.limit,
                search: nextSearch || undefined,
                level: nextLevel || undefined,
                startDate: nextStartDate || undefined,
                endDate: nextEndDate || undefined,
            });

            const metadata = res.data?.metadata;
            setHistory(metadata?.sessions || []);
            setHistoryPagination((prev) => ({
                ...prev,
                ...(metadata?.pagination || {}),
            }));
        } catch (err) {
            console.error('Error fetching chatbot history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const openSessionDetail = async (sessionId) => {
        try {
            setDetailLoading(true);
            setIsDetailOpen(true);
            const res = await getChatbotAdminSessionById(sessionId);
            setSelectedSession(res.data?.metadata || null);
        } catch (err) {
            console.error('Error loading chatbot session detail:', err);
            setSelectedSession(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSearchHistory = () => {
        setHistoryPagination((prev) => ({ ...prev, page: 1 }));
        fetchChatHistory(1, historySearch, historyLevel, historyStartDate, historyEndDate);
    };

    const clearHistoryFilters = () => {
        setHistorySearch('');
        setHistoryLevel('');
        setHistoryStartDate('');
        setHistoryEndDate('');
        setHistoryPagination((prev) => ({ ...prev, page: 1 }));
        fetchChatHistory(1, '', '', '', '');
    };

    const levelClass = (level) => {
        if (level === 'Hot') return 'bg-red-500/20 text-red-300 border border-red-500/30';
        if (level === 'Warm') return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center text-white/50 py-20">Unable to load statistics data</div>;
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
                    AI Chatbot Statistics
                </h1>
                <p className="text-white/40 text-sm mt-1 ml-13">
                    Analyze customer interest levels through the consultation chatbot
                </p>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                    icon={MessageCircle}
                    label="Total conversations"
                    value={stats.totalSessions}
                    color="bg-[#0066FF]"
                    delay={0}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Average interest"
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
                        Hot / Warm / Cold ratio
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
                            No data available
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
                        Number of chats by day
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
                                    name="Number of chats"
                                    fill="#0066FF"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-60 text-white/30 text-sm">
                            No data available
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
                        Interest score trend
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
                            No data available
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Chat History */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#1E293B]/80 backdrop-blur-sm rounded-2xl p-5 border border-white/5"
            >
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <h3 className="text-white font-semibold text-base flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[#0066FF]" />
                        Customer chat history
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <select
                            value={historyLevel}
                            onChange={(e) => setHistoryLevel(e.target.value)}
                            className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="">All levels</option>
                            <option value="Hot">Hot</option>
                            <option value="Warm">Warm</option>
                            <option value="Cold">Cold</option>
                        </select>

                        <input
                            type="date"
                            value={historyStartDate}
                            max={historyEndDate || undefined}
                            onChange={(e) => setHistoryStartDate(e.target.value)}
                            className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        />

                        <input
                            type="date"
                            value={historyEndDate}
                            min={historyStartDate || undefined}
                            onChange={(e) => setHistoryEndDate(e.target.value)}
                            className="bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                        />

                        <div className="relative">
                            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchHistory()}
                                placeholder="Search customer..."
                                className="bg-[#0F172A] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30"
                            />
                        </div>
                        <button
                            onClick={handleSearchHistory}
                            className="px-3 py-2 bg-[#0066FF] hover:bg-[#0052cc] text-white text-sm rounded-lg transition-colors"
                        >
                            Apply
                        </button>
                        <button
                            onClick={clearHistoryFilters}
                            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {historyLoading ? (
                    <div className="text-white/50 text-sm py-8 text-center">Loading chat history...</div>
                ) : history.length === 0 ? (
                    <div className="text-white/40 text-sm py-8 text-center">No chat history found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-225">
                            <thead>
                                <tr className="text-left text-white/50 text-xs border-b border-white/10">
                                    <th className="py-3 pr-4">Customer</th>
                                    <th className="py-3 pr-4">Last message</th>
                                    <th className="py-3 pr-4">Messages</th>
                                    <th className="py-3 pr-4">Score</th>
                                    <th className="py-3 pr-4">Level</th>
                                    <th className="py-3 pr-4">Updated</th>
                                    <th className="py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr key={item._id} className="border-b border-white/6">
                                        <td className="py-3 pr-4">
                                            <div className="text-white text-sm font-medium">
                                                {item.user?.fullName || 'N/A'}
                                            </div>
                                            <div className="text-white/40 text-xs">{item.user?.email || ''}</div>
                                        </td>
                                        <td className="py-3 pr-4 text-white/70 text-sm max-w-90 truncate">
                                            {item.lastMessage || 'No message'}
                                        </td>
                                        <td className="py-3 pr-4 text-white/70 text-sm">{item.messageCount || 0}</td>
                                        <td className="py-3 pr-4 text-white/70 text-sm">{item.interestScore || 0}</td>
                                        <td className="py-3 pr-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${levelClass(item.level)}`}
                                            >
                                                {item.level || 'Cold'}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-4 text-white/50 text-xs">
                                            {new Date(item.updatedAt).toLocaleString('en-US')}
                                        </td>
                                        <td className="py-3">
                                            <button
                                                onClick={() => openSessionDetail(item._id)}
                                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors"
                                            >
                                                View detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex items-center justify-between mt-4 text-xs text-white/50">
                    <span>Total: {historyPagination.total || 0}</span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={(historyPagination.page || 1) <= 1}
                            onClick={() => setHistoryPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                            className="px-2.5 py-1.5 rounded bg-white/10 disabled:opacity-40"
                        >
                            Prev
                        </button>
                        <span>
                            Page {historyPagination.page || 1}/{historyPagination.totalPages || 1}
                        </span>
                        <button
                            disabled={(historyPagination.page || 1) >= (historyPagination.totalPages || 1)}
                            onClick={() => setHistoryPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                            className="px-2.5 py-1.5 rounded bg-white/10 disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </motion.div>

            <Modal
                title="Customer chat history detail"
                open={isDetailOpen}
                onCancel={() => {
                    setIsDetailOpen(false);
                    setSelectedSession(null);
                }}
                footer={null}
                width={860}
            >
                {detailLoading ? (
                    <div className="py-8 text-center text-white/50">Loading...</div>
                ) : !selectedSession ? (
                    <div className="py-8 text-center text-white/50">No details available</div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-[#0F172A] rounded-lg p-3 border border-white/10">
                            <div className="text-sm text-white font-medium">
                                {selectedSession.user?.fullName || 'N/A'}
                            </div>
                            <div className="text-xs text-white/50">{selectedSession.user?.email || ''}</div>
                            <div className="text-xs text-white/50">Phone: {selectedSession.user?.phone || 'N/A'}</div>
                        </div>

                        <div className="max-h-105 overflow-y-auto space-y-3 pr-1">
                            {(selectedSession.messages || []).map((msg, idx) => (
                                <div
                                    key={`${msg.timestamp || idx}-${idx}`}
                                    className={`p-3 rounded-lg border ${
                                        msg.role === 'user'
                                            ? 'bg-blue-500/10 border-blue-500/20'
                                            : 'bg-emerald-500/10 border-emerald-500/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-white/80">
                                            {msg.role === 'user' ? 'Customer' : 'AI Bot'}
                                        </span>
                                        <span className="text-xs text-white/40">
                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleString('en-US') : ''}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/90 whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ChatbotStats;
