import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, User, MessageSquare } from 'lucide-react';
import { requestCreateContact } from '../config/ContactRequest';
import { message } from 'antd';
import Header from '../components/Header';

const ContactPage = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestCreateContact(formData);
            message.success('Gửi tin nhắn thành công! Chúng tôi sẽ liên hệ sớm.');
            setFormData({ fullName: '', email: '', phone: '', message: '' });
        } catch (error) {
            console.error(error);
            message.error('Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white pt-24 pb-12 px-4 relative overflow-hidden">
            <Header />
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0066FF]/10 rounded-full blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <span className="text-[#0066FF] text-sm font-semibold tracking-wider uppercase mb-2 block">
                        Liên hệ với chúng tôi
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-4">
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn
                    </h1>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Hãy để lại tin nhắn hoặc liên hệ trực tiếp qua số hotline. Đội ngũ tư vấn sẽ phản hồi trong thời
                        gian sớm nhất.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6">
                            <h3 className="text-2xl font-bold text-white mb-6">Thông tin liên hệ</h3>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-xl bg-[#0066FF]/20 flex items-center justify-center text-[#0066FF] group-hover:bg-[#0066FF] group-hover:text-white transition-all duration-300">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Địa chỉ</h4>
                                    <p className="text-white/60">123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Hotline</h4>
                                    <p className="text-white/60">0123 456 789 (Hỗ trợ 24/7)</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Email</h4>
                                    <p className="text-white/60">support@carautovn.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Map or Image Placeholder */}
                        <div className="h-64 rounded-2xl overflow-hidden border border-white/10 relative group">
                            <img
                                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2673&auto=format&fit=crop"
                                alt="Office"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-medium">Xem bản đồ</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <form
                            onSubmit={handleSubmit}
                            className="bg-[#1E293B] border border-white/10 rounded-2xl p-8 space-y-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066FF]/20 rounded-bl-[100px] -z-0 pointer-events-none" />

                            <h3 className="text-2xl font-bold text-white mb-2">Gửi tin nhắn</h3>
                            <p className="text-white/50 text-sm mb-6">
                                Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại ngay.
                            </p>

                            <div className="space-y-4 relative z-10">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Họ và tên</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Nhập họ tên của bạn"
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#0066FF] transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="example@gmail.com"
                                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#0066FF] transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/70 mb-2">
                                            Số điện thoại
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                placeholder="0912..."
                                                className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#0066FF] transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Lời nhắn</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-white/30" />
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="4"
                                            placeholder="Bạn cần tư vấn về..."
                                            className="w-full bg-[#0F172A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#0066FF] transition-colors resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Gửi ngay</span>
                                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
