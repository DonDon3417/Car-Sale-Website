import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Loader2,
    User,
    Clock,
    Check,
    CheckCheck,
    Minimize2,
    Maximize2,
    Car,
    Calculator,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { request } from '../config/request';
import CryptoJS from 'crypto-js';

const LoanChatWidget = ({ isOpen, onClose, car = null, loanInfo = null, onOpenChange }) => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [conversation, setConversation] = useState(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [user, setUser] = useState(null);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Get current user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await request.get('/api/users/me');
                // Decrypt user data
                const encryptedData = res.data?.metadata;
                if (encryptedData) {
                    const bytes = CryptoJS.AES.decrypt(encryptedData, import.meta.env.VITE_SECRET_CRYPTO);
                    const originalText = bytes.toString(CryptoJS.enc.Utf8);
                    const userData = JSON.parse(originalText);
                    setUser(userData);
                }
            } catch (error) {
                console.error('Not logged in');
            }
        };
        fetchUser();
    }, []);

    // Initialize socket connection
    useEffect(() => {
        if (!isOpen || !user) return;

        // Connect to socket
        socketRef.current = io(import.meta.env.VITE_API_URL, {
            withCredentials: true,
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socketRef.current.on('new_message', (data) => {
            setMessages((prev) => [...prev, data.message]);
        });

        socketRef.current.on('user_typing', (data) => {
            if (data.userId !== user?._id) {
                setIsTyping(true);
            }
        });

        socketRef.current.on('user_stop_typing', () => {
            setIsTyping(false);
        });

        socketRef.current.on('admin_assigned', (data) => {
            // Refresh conversation
            fetchConversation();
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [isOpen, user]);

    // Create or get conversation
    const fetchConversation = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const res = await request.post('/api/chat/conversation', {
                type: 'loan_consultation',
                relatedCarId: car?._id || null,
                title: car ? `Installment consultation: ${car.name}` : 'Installment consultation',
            });

            const conv = res.data?.metadata;
            setConversation(conv);
            setMessages(conv?.messages || []);

            // Join socket room
            if (socketRef.current && conv?._id) {
                socketRef.current.emit('join_conversation', conv._id);
            }

            // Auto-send loan info if provided
            if (loanInfo && conv?.messages?.length === 0) {
                await sendLoanInfoMessage(conv._id);
            }
        } catch (error) {
            console.error('Error fetching conversation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && user) {
            fetchConversation();
        }
    }, [isOpen, user]);

    // Send loan info as first message
    const sendLoanInfoMessage = async (convId) => {
        if (!loanInfo || !car) return;

        try {
            socketRef.current?.emit('send_message', {
                conversationId: convId,
                content: `I want installment consultation for ${car.name}`,
                messageType: 'loan_info',
                loanInfo: {
                    carId: car._id,
                    carName: car.name,
                    carPrice: loanInfo.carPrice,
                    downPaymentPercent: loanInfo.downPaymentPercent,
                    loanTerm: loanInfo.loanTerm,
                    interestRate: loanInfo.interestRate,
                    monthlyPayment: loanInfo.monthlyPayment,
                },
            });
        } catch (error) {
            console.error('Error sending loan info:', error);
        }
    };

    // Send message
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !conversation || isSending) return;

        const content = inputMessage.trim();
        setInputMessage('');
        setIsSending(true);

        try {
            socketRef.current?.emit('send_message', {
                conversationId: conversation._id,
                content,
                messageType: 'text',
            });

            // Stop typing indicator
            socketRef.current?.emit('typing_stop', conversation._id);
        } catch (error) {
            console.error('Error sending message:', error);
            setInputMessage(content); // Restore message if failed
        } finally {
            setIsSending(false);
        }
    };

    // Handle typing
    const handleInputChange = (e) => {
        setInputMessage(e.target.value);

        if (conversation && socketRef.current) {
            socketRef.current.emit('typing_start', conversation._id);

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set new timeout to stop typing
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit('typing_stop', conversation._id);
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
        return new Date(date).toLocaleTimeString('en-US', {
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

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    height: isMinimized ? 'auto' : '500px',
                }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="fixed bottom-4 right-4 w-[380px] bg-[#1a2332] rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col border border-white/10"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Installment consultation</h3>
                            <div className="flex items-center gap-1.5">
                                <span
                                    className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-gray-400'}`}
                                />
                                <span className="text-white/80 text-xs">
                                    {conversation?.admin ? conversation.admin.fullName : 'Connecting...'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Minimized state */}
                {isMinimized ? null : (
                    <>
                        {/* Car Info (if available) */}
                        {car && (
                            <div className="p-3 bg-[#0a0f18] border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={car.images?.[0] ? import.meta.env.VITE_API_URL + car.images[0] : ''}
                                        alt={car.name}
                                        className="w-14 h-10 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{car.name}</p>
                                        <p className="text-[#0066FF] text-xs font-semibold">
                                            {formatPrice(car.price)} VND
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-6 h-6 text-[#0066FF] animate-spin" />
                                </div>
                            ) : !user ? (
                                <div className="text-center py-8">
                                    <User className="w-12 h-12 text-white/30 mx-auto mb-3" />
                                    <p className="text-white/60 text-sm">Please log in to chat with an advisor</p>
                                    <a
                                        href="/account/login"
                                        className="inline-block mt-3 px-4 py-2 bg-[#0066FF] text-white text-sm font-medium rounded-lg hover:bg-[#0052cc] transition-colors"
                                    >
                                        Log in
                                    </a>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
                                    <p className="text-white/60 text-sm">Send a message to start consultation</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isOwn = msg.sender === user?._id || msg.sender?._id === user?._id;

                                    return (
                                        <div
                                            key={msg._id || idx}
                                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl p-3 ${
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
                                })
                            )}

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
                        {user && (
                            <div className="p-3 bg-[#0a0f18] border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputMessage}
                                        onChange={handleInputChange}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter a message..."
                                        className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#0066FF]"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isSending}
                                        className="w-10 h-10 bg-[#0066FF] hover:bg-[#0052cc] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
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
            </motion.div>
        </AnimatePresence>
    );
};

export default LoanChatWidget;


