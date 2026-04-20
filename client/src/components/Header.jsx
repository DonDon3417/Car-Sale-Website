import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    ChevronDown,
    LogIn,
    UserPlus,
    User,
    LogOut,
    Settings,
    Heart,
    Bot,
    Search,
    Newspaper,
    Phone as PhoneIcon,
    Loader2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useStore } from '../hooks/useStore';
import { requestGetAllCars } from '../config/CarRequest';
import { requestLogout } from '../config/UserRequest';
import { clearAuthSession } from '../config/authSession';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const { dataUser } = useStore();
    const isLoggedIn = !!dataUser?._id;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const res = await requestGetAllCars({ search: searchQuery, limit: 5 });
                setSearchResults(res.metadata?.cars || []);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            if (searchQuery.trim()) {
                fetchSearchResults();
                setShowResults(true);
            } else {
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleLogout = async () => {
        try {
            await requestLogout();
        } catch (error) {
            console.error('Logout failed:', error);
        }

        clearAuthSession();
        window.location.reload();
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/cars?search=${encodeURIComponent(searchQuery.trim())}`);
            setShowResults(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US').format(price) + ' VND';
    };

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-9999 customer-header transition-all duration-300 ${isScrolled ? 'backdrop-blur-xl' : 'backdrop-blur-md'}`}
        >
            <div className="max-w-300 mx-auto px-4">
                <div className="flex items-center justify-between h-14 gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center shrink-0">
                        <span className="text-(--app-text) font-bold text-sm tracking-[0.12em] uppercase">
                            <span className="customer-muted">CarMart</span>
                        </span>
                    </Link>

                    {/* Search Bar - Center */}
                    <div ref={searchRef} className="hidden lg:flex flex-1 max-w-md mx-4 relative">
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 customer-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => searchQuery.trim() && setShowResults(true)}
                                    placeholder="Search cars..."
                                    className="w-full pl-10 pr-4 py-2 bg-(--app-input-bg) border border-(--app-border) rounded-full text-(--app-text) text-xs placeholder:text-(--app-text-muted) focus:outline-none focus:border-[#0066FF]/50 transition-all duration-200"
                                />
                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 customer-muted animate-spin" />
                                )}
                            </div>
                        </form>

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {showResults && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-(--app-surface-strong) border border-(--app-border) rounded-xl shadow-xl overflow-hidden z-50"
                                >
                                    {searchResults.length > 0 ? (
                                        <div className="py-2">
                                            {searchResults.map((car) => (
                                                <Link
                                                    key={car._id}
                                                    to={`/cars/${car.slug}`}
                                                    onClick={() => setShowResults(false)}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-(--app-surface-soft) transition-colors group"
                                                >
                                                    <img
                                                        src={
                                                            car.images?.[0]
                                                                ? import.meta.env.VITE_API_URL + car.images[0]
                                                                : 'https://via.placeholder.com/60'
                                                        }
                                                        alt={car.name}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-(--app-text) text-sm font-medium truncate group-hover:text-[#0066FF] transition-colors">
                                                            {car.name}
                                                        </h4>
                                                        <p className="customer-muted text-xs">
                                                            {formatPrice(car.price)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                            <div className="border-t border-(--app-border) mt-1 pt-1">
                                                <button
                                                    onClick={(e) => handleSearch(e)}
                                                    className="w-full py-2 text-center text-[#0066FF] text-xs hover:underline"
                                                >
                                                    View all results
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center customer-muted text-sm">
                                            No matching cars found
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Side - Nav Links + CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-3">
                        {/* Nav Links */}
                        <Link
                            to="/tin-tuc"
                            className="customer-muted hover:text-(--app-text) text-xs font-medium transition-colors duration-200"
                        >
                            News
                        </Link>
                        <Link
                            to="/lien-he"
                            className="customer-muted hover:text-(--app-text) text-xs font-medium transition-colors duration-200"
                        >
                            Contact
                        </Link>

                        <div className="w-px h-4 bg-(--app-border)" />

                        {/* AI Chatbot */}
                        <Link to="/chatbot">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-[#0066FF]/20 to-[#00C2FF]/20 hover:from-[#0066FF]/30 hover:to-[#00C2FF]/30 border border-[#0066FF]/30 rounded-lg text-[#00C2FF] text-xs font-medium transition-all"
                            >
                                <Bot className="w-3.5 h-3.5" />
                                <span>AI Advisor</span>
                            </motion.button>
                        </Link>

                        {isLoggedIn ? (
                            /* User Menu - Logged In */
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 px-2 py-1.5 bg-(--app-surface-soft) hover:bg-(--app-surface-soft) border border-(--app-border) rounded-lg text-(--app-text) transition-all"
                                >
                                    {dataUser.avatar ? (
                                        <img
                                            src={`${import.meta.env.VITE_URL_IMAGE}/uploads/avatars/${dataUser.avatar}`}
                                            alt="Avatar"
                                            className="w-6 h-6 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 bg-[#0066FF] rounded-full flex items-center justify-center">
                                            <span className="text-white text-[10px] font-semibold">
                                                {dataUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-xs font-medium max-w-25 truncate">
                                        {dataUser.fullName || 'User'}
                                    </span>
                                    <ChevronDown
                                        className={`w-3 h-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                </motion.button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-(--app-surface-strong) border border-(--app-border) rounded-xl shadow-xl overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-(--app-border)">
                                                <p className="text-(--app-text) text-xs font-semibold truncate">
                                                    {dataUser.fullName}
                                                </p>
                                                <p className="text-(--app-text-muted) text-[10px] truncate">
                                                    {dataUser.email}
                                                </p>
                                            </div>
                                            <div className="py-1">
                                                <Link
                                                    to="/account/profile"
                                                    className="flex items-center gap-2 px-3 py-2 text-(--app-text-muted) hover:text-(--app-text) hover:bg-(--app-surface-soft) text-xs transition-colors"
                                                >
                                                    <User className="w-3.5 h-3.5" />
                                                    <span>My account</span>
                                                </Link>
                                                <Link
                                                    to="/account/favorites"
                                                    className="flex items-center gap-2 px-3 py-2 text-(--app-text-muted) hover:text-(--app-text) hover:bg-(--app-surface-soft) text-xs transition-colors"
                                                >
                                                    <Heart className="w-3.5 h-3.5" />
                                                    <span>Favorite cars</span>
                                                </Link>
                                                <Link
                                                    to="/account/settings"
                                                    className="flex items-center gap-2 px-3 py-2 text-(--app-text-muted) hover:text-(--app-text) hover:bg-(--app-surface-soft) text-xs transition-colors"
                                                >
                                                    <Settings className="w-3.5 h-3.5" />
                                                    <span>Settings</span>
                                                </Link>
                                            </div>
                                            <div className="border-t border-(--app-border) py-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs transition-colors"
                                                >
                                                    <LogOut className="w-3.5 h-3.5" />
                                                    <span>Sign out</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            /* Auth Buttons - Not Logged In */
                            <>
                                <Link to="/account/login">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-(--app-surface-soft) hover:bg-(--app-surface-soft) border border-(--app-border) rounded-lg text-(--app-text) text-xs font-medium transition-all"
                                    >
                                        <LogIn className="w-3.5 h-3.5" />
                                        <span>Log in</span>
                                    </motion.button>
                                </Link>
                                <Link to="/account/register">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-lg text-white text-xs font-semibold transition-colors"
                                    >
                                        <UserPlus className="w-3.5 h-3.5" />
                                        <span>Sign in</span>
                                    </motion.button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-1.5 text-(--app-text)"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden customer-header border-t border-(--app-border)"
                    >
                        <div className="max-w-300 mx-auto px-4 py-4">
                            {/* Mobile Search */}
                            <form onSubmit={handleSearch} className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--app-text-muted)" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search cars..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-(--app-input-bg) border border-(--app-border) rounded-full text-(--app-text) text-sm placeholder:text-(--app-text-muted) focus:outline-none focus:border-[#0066FF]/50 transition-all"
                                    />
                                </div>
                            </form>

                            <nav className="flex flex-col gap-2">
                                <Link
                                    to="/"
                                    className="py-2 text-(--app-text-muted) hover:text-(--app-text) text-sm font-medium transition-colors border-b border-(--app-border)"
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/tin-tuc"
                                    className="py-2 text-(--app-text-muted) hover:text-(--app-text) text-sm font-medium transition-colors border-b border-(--app-border)"
                                >
                                    News
                                </Link>
                                <Link
                                    to="/lien-he"
                                    className="py-2 text-(--app-text-muted) hover:text-(--app-text) text-sm font-medium transition-colors border-b border-(--app-border)"
                                >
                                    Contact
                                </Link>
                                <Link
                                    to="/chatbot"
                                    className="flex items-center gap-2 py-2 text-[#00C2FF] hover:text-white text-sm font-medium transition-colors border-b border-white/5"
                                >
                                    <Bot className="w-4 h-4" />
                                    AI Advisor
                                </Link>
                            </nav>

                            {/* Mobile Auth/User Section */}
                            {isLoggedIn ? (
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                        {dataUser.avatar ? (
                                            <img
                                                src={`${import.meta.env.VITE_URL_IMAGE}/uploads/avatars/${dataUser.avatar}`}
                                                alt="Avatar"
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-[#0066FF] rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-semibold">
                                                    {dataUser.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-white text-sm font-semibold">{dataUser.fullName}</p>
                                            <p className="text-white/50 text-xs">{dataUser.email}</p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/account/profile"
                                        className="flex items-center gap-2 py-2 text-white/70 hover:text-white text-sm transition-colors border-b border-white/5"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>My account</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm font-medium transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Sign out</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2 mt-4">
                                    <Link to="/account/login" className="flex-1">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium"
                                        >
                                            <LogIn className="w-4 h-4" />
                                            <span>Log in</span>
                                        </motion.button>
                                    </Link>
                                    <Link to="/account/register" className="flex-1">
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#0066FF] rounded-lg text-white text-sm font-semibold"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>Sign in</span>
                                        </motion.button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;
