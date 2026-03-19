import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Car, User, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { message } from 'antd';

import { requestRegister } from '../config/UserRequest';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await requestRegister(formData);
            message.success('Subscribe successfully');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0d1520] to-[#0a1628] flex items-center justify-center px-4 py-10">
                <Header />
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 w-[500px] h-[500px] bg-[#0066FF]/5 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#E10600]/5 rounded-full blur-[120px]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full max-w-[400px]"
                >
                    {/* Logo */}
                    <Link to="/" className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-8 h-8 flex items-center justify-center bg-[#0066FF] rounded-lg">
                            <Car className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-bold text-sm tracking-[0.1em] uppercase">AUTOSHOW</span>
                    </Link>

                    {/* Card */}
                    <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                        <div className="text-center mb-5">
                            <h1 className="text-xl font-bold text-white mb-1">Create account</h1>
                            <p className="text-white/50 text-xs">Sign up to receive exclusive offers</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Name */}
                            <div>
                                <label className="block text-white/70 text-xs font-medium mb-1.5">Full name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Nhập họ and tên"
                                        className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-white/70 text-xs font-medium mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter your email"
                                        className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-white/70 text-xs font-medium mb-1.5">Phone number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                        className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-white/70 text-xs font-medium mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Create a password"
                                        className="w-full h-10 pl-10 pr-10 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF] transition-colors"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-white/70 text-xs font-medium mb-1.5">
                                    Confirm password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        placeholder="Re-enter password"
                                        className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-[#0066FF] focus:ring-[#0066FF]/50"
                                    required
                                />
                                <label htmlFor="terms" className="text-white/50 text-[11px] leading-relaxed">
                                    I agree to the{' '}
                                    <a href="#" className="text-[#0066FF] hover:underline">
                                        Terms of Use
                                    </a>{' '}
                                    và{' '}
                                    <a href="#" className="text-[#0066FF] hover:underline">
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>

                            {/* Submit */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 h-10 bg-[#0066FF] hover:bg-[#0052cc] rounded-lg text-white text-sm font-semibold transition-colors mt-4"
                            >
                                <span>Subscribe</span>
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-white/40 text-xs">hoặc</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Social Login */}
                        <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-2 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-xs font-medium transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Google</span>
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 h-9 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-xs font-medium transition-colors">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                <span>Facebook</span>
                            </button>
                        </div>

                        {/* Login Link */}
                        <p className="text-center text-white/50 text-xs mt-4">
                            Already have an account?{' '}
                            <Link to="/account/login" className="text-[#0066FF] font-medium hover:underline">
                                Log in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </>
    );
};

export default Register;

