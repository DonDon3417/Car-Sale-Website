import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Plus, Trash2, Bot, User, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import {
    createChatbotSession,
    getChatbotSessions,
    getChatbotSession,
    sendChatbotMessage,
    deleteChatbotSession,
} from '../config/ChatbotRequest';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TypingIndicator = () => (
    <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00C2FF] flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-[20px] rounded-tl-md px-5 py-3.5 shadow-lg">
            <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-[#0066FF]"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
        </div>
    </div>
);

const LevelBadge = ({ level, score }) => {
    const config = {
        Hot: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: '🔥' },
        Warm: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', icon: '🌡️' },
        Cold: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: '❄️' },
    };
    const c = config[level] || config.Cold;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} border ${c.border}`}
        >
            <span>{c.icon}</span>
            {level} • {score}%
        </span>
    );
};

const ChatbotPage = () => {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const [interestScore, setInterestScore] = useState(0);
    const [level, setLevel] = useState('Cold');
    const [showSidebar, setShowSidebar] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typing]);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await getChatbotSessions();
            setSessions(res.data.metadata || []);
        } catch (err) {
            console.error('Error fetching sessions:', err);
        }
    };

    const handleNewSession = async () => {
        try {
            const res = await createChatbotSession();
            const newSession = res.data.metadata;
            setSessions((prev) => [
                {
                    _id: newSession._id,
                    lastMessage: 'Cuộc hội thoại mới',
                    messageCount: 0,
                    interestScore: 0,
                    level: 'Cold',
                    createdAt: newSession.createdAt,
                },
                ...prev,
            ]);
            setActiveSession(newSession._id);
            setMessages([]);
            setInterestScore(0);
            setLevel('Cold');
        } catch (err) {
            console.error('Error creating session:', err);
        }
    };

    const handleSelectSession = async (sessionId) => {
        try {
            setActiveSession(sessionId);
            const res = await getChatbotSession(sessionId);
            const session = res.data.metadata;
            setMessages(session.messages || []);
            setInterestScore(session.interestScore || 0);
            setLevel(session.level || 'Cold');
            setShowSidebar(false);
        } catch (err) {
            console.error('Error loading session:', err);
        }
    };

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation();
        if (!confirm('Xoá cuộc hội thoại này?')) return;
        try {
            await deleteChatbotSession(sessionId);
            setSessions((prev) => prev.filter((s) => s._id !== sessionId));
            if (activeSession === sessionId) {
                setActiveSession(null);
                setMessages([]);
            }
        } catch (err) {
            console.error('Error deleting session:', err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || typing) return;

        // Tạo session mới nếu chưa có
        let sessionId = activeSession;
        if (!sessionId) {
            try {
                const res = await createChatbotSession();
                sessionId = res.data.metadata._id;
                setActiveSession(sessionId);
                setSessions((prev) => [
                    {
                        _id: sessionId,
                        lastMessage: input,
                        messageCount: 0,
                        interestScore: 0,
                        level: 'Cold',
                        createdAt: new Date(),
                    },
                    ...prev,
                ]);
            } catch (err) {
                console.error('Error creating session:', err);
                return;
            }
        }

        const userMsg = { role: 'user', content: input.trim(), timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setTyping(true);

        try {
            const res = await sendChatbotMessage(sessionId, userMsg.content);
            const data = res.data.metadata;

            setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
            setInterestScore(data.interestScore);
            setLevel(data.level);

            // Cập nhật session trong list
            setSessions((prev) =>
                prev.map((s) =>
                    s._id === sessionId
                        ? {
                              ...s,
                              lastMessage: data.reply.substring(0, 80) + '...',
                              messageCount: messages.length + 2,
                              interestScore: data.interestScore,
                              level: data.level,
                          }
                        : s,
                ),
            );
        } catch (err) {
            console.error('Error sending message:', err);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại! 🙏',
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1520] to-[#0a1628]">
            <Header />

            <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Trợ Lý AI Tư Vấn Mua Xe</h1>
                    <p className="text-white/50 text-base">
                        Hãy chia sẻ nhu cầu, chúng tôi sẽ tìm chiếc xe hoàn hảo cho bạn
                    </p>
                </motion.div>

                {/* Chat Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0F172A]/80 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl"
                    style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
                >
                    <div className="flex h-full">
                        {/* Sidebar - Sessions List */}
                        <div
                            className={`${
                                showSidebar ? 'flex' : 'hidden md:flex'
                            } flex-col w-full md:w-80 border-r border-white/5 bg-[#0B1120]/60`}
                        >
                            {/* Sidebar Header */}
                            <div className="p-4 border-b border-white/5">
                                <button
                                    onClick={handleNewSession}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#0066FF]/25 transition-all duration-300 active:scale-[0.98]"
                                >
                                    <Plus className="w-5 h-5" />
                                    Cuộc hội thoại mới
                                </button>
                            </div>

                            {/* Sessions List */}
                            <div className="flex-1 overflow-y-auto">
                                <AnimatePresence>
                                    {sessions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-white/30 px-4">
                                            <MessageCircle className="w-10 h-10 mb-3" />
                                            <p className="text-sm text-center">Chưa có cuộc hội thoại nào</p>
                                        </div>
                                    ) : (
                                        sessions.map((session) => (
                                            <motion.div
                                                key={session._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                onClick={() => handleSelectSession(session._id)}
                                                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200 border-b border-white/[0.03] group
                                                    ${
                                                        activeSession === session._id
                                                            ? 'bg-[#0066FF]/10 border-l-2 border-l-[#0066FF]'
                                                            : 'hover:bg-white/[0.03]'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-white/80 text-sm font-medium truncate">
                                                            {formatDate(session.createdAt)}
                                                        </span>
                                                        <LevelBadge
                                                            level={session.level}
                                                            score={session.interestScore}
                                                        />
                                                    </div>
                                                    <p className="text-white/40 text-xs truncate">
                                                        {session.lastMessage}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteSession(e, session._id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                                </button>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={`${showSidebar ? 'hidden md:flex' : 'flex'} flex-col flex-1`}>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-[#0B1120]/40">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowSidebar(true)}
                                        className="md:hidden p-2 hover:bg-white/5 rounded-lg"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-white/60" />
                                    </button>
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00C2FF] flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-sm">AutoBot AI</h3>
                                        <p className="text-green-400 text-xs flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                            Đang hoạt động
                                        </p>
                                    </div>
                                </div>
                                {activeSession && <LevelBadge level={level} score={interestScore} />}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                                {messages.length === 0 && !typing && (
                                    <div className="flex flex-col items-center justify-center h-full text-white/30">
                                        <div className="w-20 h-20 rounded-full bg-[#0066FF]/10 flex items-center justify-center mb-4">
                                            <Bot className="w-10 h-10 text-[#0066FF]/60" />
                                        </div>
                                        <h3 className="text-white/60 text-lg font-medium mb-2">Xin chào! 👋</h3>
                                        <p className="text-sm text-center max-w-sm leading-relaxed">
                                            Tôi là trợ lý AI tư vấn xe. Hãy cho tôi biết bạn đang tìm kiếm chiếc xe như
                                            thế nào nhé!
                                        </p>
                                        {/* Quick suggestions */}
                                        <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-md">
                                            {[
                                                'Tôi muốn tìm xe gia đình',
                                                'Xe dưới 800 triệu',
                                                'Xe SUV 7 chỗ',
                                                'So sánh xe cho tôi',
                                            ].map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    onClick={() => {
                                                        setInput(suggestion);
                                                        inputRef.current?.focus();
                                                    }}
                                                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-[#0066FF]/20 border border-white/10 hover:border-[#0066FF]/30 text-white/60 hover:text-white text-xs transition-all duration-200"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            className={`flex items-end gap-2.5 mb-4 ${
                                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00C2FF] flex items-center justify-center flex-shrink-0">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                            )}

                                            <div
                                                className={`max-w-[75%] px-4 py-3 shadow-lg ${
                                                    msg.role === 'user'
                                                        ? 'bg-[#1a237e] text-white rounded-[20px] rounded-br-md'
                                                        : 'bg-white/[0.08] backdrop-blur-sm text-white/90 rounded-[20px] rounded-tl-md border border-white/5'
                                                }`}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                    {msg.content}
                                                </p>
                                                <span
                                                    className={`text-[10px] mt-1.5 block ${
                                                        msg.role === 'user'
                                                            ? 'text-white/40 text-right'
                                                            : 'text-white/30'
                                                    }`}
                                                >
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>

                                            {msg.role === 'user' && (
                                                <div className="w-8 h-8 rounded-full bg-[#1a237e] flex items-center justify-center flex-shrink-0">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {typing && <TypingIndicator />}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="px-5 py-4 border-t border-white/5 bg-[#0B1120]/40">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="Nhập tin nhắn..."
                                            disabled={typing}
                                            className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-[999px] text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#0066FF]/50 focus:bg-white/[0.08] transition-all duration-200 pr-14 disabled:opacity-50"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!input.trim() || typing}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0066FF] hover:bg-[#0052CC] text-white flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                                        >
                                            {typing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ChatbotPage;
