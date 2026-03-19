import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    Send,
    Loader2,
    User,
    Clock,
    Check,
    CheckCheck,
    Car,
    Calculator,
    Phone,
    Mail,
    Search,
    Filter,
    ChevronRight,
    Circle,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { request } from '../../config/request';
import CryptoJS from 'crypto-js';

const statusConfig = {
    pending: {
        label: 'Pending intake',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400',
        icon: AlertCircle,
    },
    active: {
        label: 'Processing',
        color: 'bg-blue-500',
        textColor: 'text-blue-400',
        icon: Circle,
    },
    resolved: {
        label: 'Resolved',
        color: 'bg-green-500',
        textColor: 'text-green-400',
        icon: CheckCircle2,
    },
    closed: {
        label: 'Closed',
        color: 'bg-gray-500',
        textColor: 'text-gray-400',
        icon: XCircle,
    },
};

const buildAssetUrl = (assetPath, folder = '') => {
    if (!assetPath) return '';
    if (/^https?:\/\//i.test(assetPath)) return assetPath;

    const baseUrl = (import.meta.env.VITE_URL_IMAGE || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

    if (!baseUrl) return assetPath;
    if (assetPath.startsWith('/')) return `${baseUrl}${assetPath}`;
    if (folder) return `${baseUrl}/${folder}/${assetPath}`;

    return `${baseUrl}/${assetPath}`;
};

const ChatManager = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [admin, setAdmin] = useState(null);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const selectedConversationRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Get admin user
    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                const res = await request.get('/api/users/me');
                // Decrypt user data
                const encryptedData = res.data?.metadata;
                if (encryptedData) {
                    const bytes = CryptoJS.AES.decrypt(encryptedData, import.meta.env.VITE_SECRET_CRYPTO);
                    const originalText = bytes.toString(CryptoJS.enc.Utf8);
                    const userData = JSON.parse(originalText);
                    setAdmin(userData);
                }
            } catch (error) {
                console.error('Error fetching admin:', error);
            }
        };
        fetchAdmin();
    }, []);

    // Fetch conversations
    const fetchConversations = async () => {
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.set('status', filterStatus);

            const res = await request.get(`/api/chat/admin/conversations?${params.toString()}`);
            setConversations(res.data?.metadata || []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, [filterStatus]);

    // Initialize socket connection
    useEffect(() => {
        if (!admin) return;

        socketRef.current = io(import.meta.env.VITE_API_URL, {
            withCredentials: true,
        });

        socketRef.current.on('connect', () => {
            console.log('Admin socket connected');
        });

        // Listen for new customer messages (only refresh list, do not append to messages)
        socketRef.current.on('new_customer_message', (data) => {
            fetchConversations();
            // Do not append message here because new_message handler already handles it
        });

        socketRef.current.on('new_message', (data) => {
            console.log('Received new_message:', data.conversation?._id);
            if (selectedConversationRef.current?._id === data.conversation?._id) {
                setMessages((prev) => {
                    // Avoid duplicate messages
                    if (prev.find((m) => m._id === data.message._id)) {
                        return prev;
                    }
                    return [...prev, data.message];
                });
            }
        });

        socketRef.current.on('user_typing', (data) => {
            if (data.userId !== admin?._id) {
                setIsTyping(true);
            }
        });

        socketRef.current.on('user_stop_typing', () => {
            setIsTyping(false);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [admin]);

    // Select conversation
    const handleSelectConversation = async (conv) => {
        setSelectedConversation(conv);
        selectedConversationRef.current = conv; // Sync ref
        setMessages(conv.messages || []);

        // Join socket room
        if (socketRef.current) {
            // Leave previous room
            if (selectedConversationRef.current?._id && selectedConversationRef.current._id !== conv._id) {
                socketRef.current.emit('leave_conversation', selectedConversationRef.current._id);
            }
            socketRef.current.emit('join_conversation', conv._id);
        }

        // Mark as read
        try {
            const res = await request.get(`/api/chat/conversation/${conv._id}`);
            setMessages(res.data?.metadata?.messages || []);
            fetchConversations(); // Refresh unread counts
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    // Send message
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !selectedConversation || isSending) return;

        const content = inputMessage.trim();
        setInputMessage('');
        setIsSending(true);

        try {
            socketRef.current?.emit('send_message', {
                conversationId: selectedConversation._id,
                content,
                messageType: 'text',
            });

            socketRef.current?.emit('typing_stop', selectedConversation._id);
        } catch (error) {
            console.error('Error sending message:', error);
            setInputMessage(content);
        } finally {
            setIsSending(false);
        }
    };

    // Assign conversation to self
    const handleAssign = async () => {
        if (!selectedConversation) return;

        try {
            await request.patch(`/api/chat/admin/conversation/${selectedConversation._id}/assign`);
            fetchConversations();

            // Update selected conversation
            setSelectedConversation((prev) => ({
                ...prev,
                admin,
                status: 'active',
            }));

            socketRef.current?.emit('admin_assign', selectedConversation._id);
        } catch (error) {
            console.error('Error assigning conversation:', error);
        }
    };

    // Resolve conversation
    const handleResolve = async () => {
        if (!selectedConversation) return;

        try {
            await request.patch(`/api/chat/admin/conversation/${selectedConversation._id}/resolve`);
            fetchConversations();
            setSelectedConversation((prev) => ({ ...prev, status: 'resolved' }));
        } catch (error) {
            console.error('Error resolving conversation:', error);
        }
    };

    // Handle typing
    const handleInputChange = (e) => {
        setInputMessage(e.target.value);

        if (selectedConversation && socketRef.current) {
            socketRef.current.emit('typing_start', selectedConversation._id);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('typing_stop', selectedConversation._id);
            }, 1000);
        }
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Format time
    const formatTime = (date) => {
        const now = new Date();
        const msgDate = new Date(date);
        const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return msgDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else {
            return msgDate.toLocaleDateString('en-US');
        }
    };

    // Format price
    const formatPrice = (price) => {
        if (price >= 1000000000) {
            return (price / 1000000000).toFixed(2) + ' billion';
        }
        return (price / 1000000).toFixed(0) + ' million';
    };

    // Filter conversations
    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery) return true;
        const customerName = conv.customer?.fullName?.toLowerCase() || '';
        const title = conv.title?.toLowerCase() || '';
        return customerName.includes(searchQuery.toLowerCase()) || title.includes(searchQuery.toLowerCase());
    });

    const getCustomerAvatarUrl = (avatar) => buildAssetUrl(avatar, 'uploads/avatars');

    return (
        <div className="flex h-[calc(100vh-120px)] bg-[#0F172A] rounded-2xl overflow-hidden border border-white/10">
            {/* Sidebar - Conversations List */}
            <div className="w-[350px] border-r border-white/10 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">Consultation messages</h2>

                    {/* Search */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#0066FF]"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        <button
                            onClick={() => setFilterStatus('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                !filterStatus
                                    ? 'bg-[#0066FF] text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                        >
                            All
                        </button>
                        {Object.entries(statusConfig).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => setFilterStatus(key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                    filterStatus === key
                                        ? 'bg-[#0066FF] text-white'
                                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                            >
                                {config.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-6 h-6 text-[#0066FF] animate-spin" />
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-12 text-white/50">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No conversations</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const StatusIcon = statusConfig[conv.status]?.icon || Circle;
                            const isSelected = selectedConversation?._id === conv._id;

                            return (
                                <button
                                    key={conv._id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`w-full p-4 text-left border-b border-white/5 transition-colors ${
                                        isSelected ? 'bg-[#0066FF]/20' : 'hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                                                {conv.customer?.avatar ? (
                                                    <img
                                                        src={getCustomerAvatarUrl(conv.customer.avatar)}
                                                        alt=""
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-5 h-5 text-white/50" />
                                                )}
                                            </div>
                                            {conv.unreadCountAdmin > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                                                    {conv.unreadCountAdmin}
                                                </span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-white font-medium truncate">
                                                    {conv.customer?.fullName || 'Customers'}
                                                </span>
                                                <span className="text-white/40 text-xs">
                                                    {formatTime(conv.lastMessage?.createdAt || conv.updatedAt)}
                                                </span>
                                            </div>

                                            <p className="text-white/50 text-sm truncate mb-1.5">
                                                {conv.lastMessage?.content || conv.title}
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusConfig[conv.status]?.textColor} bg-white/5`}
                                                >
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusConfig[conv.status]?.label}
                                                </span>
                                                {conv.type === 'loan_consultation' && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-green-400 bg-green-500/10">
                                                        <Calculator className="w-3 h-3" />
                                                        Installment
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {!selectedConversation ? (
                    <div className="flex-1 flex items-center justify-center text-white/50">
                        <div className="text-center">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">Select a conversation to start</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                    {selectedConversation.customer?.avatar ? (
                                        <img
                                            src={getCustomerAvatarUrl(selectedConversation.customer.avatar)}
                                            alt=""
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-5 h-5 text-white/50" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">
                                        {selectedConversation.customer?.fullName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs">
                                        {selectedConversation.customer?.phone && (
                                            <span className="text-white/50 flex items-center gap-1">
                                                <Phone className="w-3 h-3" />
                                                {selectedConversation.customer.phone}
                                            </span>
                                        )}
                                        {selectedConversation.customer?.email && (
                                            <span className="text-white/50 flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {selectedConversation.customer.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedConversation.status === 'pending' && (
                                    <button
                                        onClick={handleAssign}
                                        className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052cc] rounded-lg text-white text-sm font-medium transition-colors"
                                    >
                                        Take over
                                    </button>
                                )}
                                {selectedConversation.status === 'active' && (
                                    <button
                                        onClick={handleResolve}
                                        className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium transition-colors"
                                    >
                                        Mark as completed
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Related Car Info */}
                        {selectedConversation.relatedCar && (
                            <div className="p-3 bg-[#0a0f18] border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={
                                            selectedConversation.relatedCar.images?.[0]
                                                ? import.meta.env.VITE_API_URL +
                                                  selectedConversation.relatedCar.images[0]
                                                : ''
                                        }
                                        alt=""
                                        className="w-14 h-10 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                            {selectedConversation.relatedCar.name}
                                        </p>
                                        <p className="text-[#0066FF] text-xs font-semibold">
                                            {formatPrice(selectedConversation.relatedCar.price)} VND
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => {
                                const isOwn = msg.sender === admin?._id || msg.sender?._id === admin?._id;

                                return (
                                    <div
                                        key={msg._id || idx}
                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-2xl p-3 ${
                                                isOwn
                                                    ? 'bg-[#0066FF] text-white rounded-br-md'
                                                    : 'bg-white/10 text-white rounded-bl-md'
                                            }`}
                                        >
                                            {/* Loan info message */}
                                            {msg.messageType === 'loan_info' && msg.loanInfo && (
                                                <div className="mb-2 p-2 bg-black/20 rounded-lg">
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <Car className="w-4 h-4" />
                                                        <span className="font-medium text-sm">
                                                            {msg.loanInfo.carName}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div>
                                                            <span className="opacity-70">Car price:</span>
                                                            <p className="font-semibold">
                                                                {formatPrice(msg.loanInfo.carPrice)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="opacity-70">Down payment:</span>
                                                            <p className="font-semibold">
                                                                {msg.loanInfo.downPaymentPercent}%
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="opacity-70">Term:</span>
                                                            <p className="font-semibold">
                                                                {msg.loanInfo.loanTerm} months
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="opacity-70">Installment/month:</span>
                                                            <p className="font-semibold text-green-300">
                                                                {formatPrice(msg.loanInfo.monthlyPayment)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[10px] opacity-60">
                                                    {formatTime(msg.createdAt)}
                                                </span>
                                                {isOwn &&
                                                    (msg.isRead ? (
                                                        <CheckCheck className="w-3 h-3 text-green-300" />
                                                    ) : (
                                                        <Check className="w-3 h-3 opacity-60" />
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex items-center gap-2 text-white/50 text-sm">
                                    <div className="flex gap-1">
                                        <span
                                            className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                                            style={{ animationDelay: '0ms' }}
                                        />
                                        <span
                                            className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                                            style={{ animationDelay: '150ms' }}
                                        />
                                        <span
                                            className="w-2 h-2 bg-white/50 rounded-full animate-bounce"
                                            style={{ animationDelay: '300ms' }}
                                        />
                                    </div>
                                    <span>Typing...</span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        {selectedConversation.status !== 'closed' && (
                            <div className="p-4 bg-[#0a0f18] border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={handleInputChange}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter a message..."
                                        className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#0066FF]"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isSending}
                                        className="w-12 h-12 bg-[#0066FF] hover:bg-[#0052cc] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
                                    >
                                        {isSending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatManager;

