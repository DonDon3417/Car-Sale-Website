import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Search, Car, Fuel, DollarSign, LayoutGrid, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { request } from '../config/request';

const SearchCard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [stats, setStats] = useState({ totalCars: 0, totalBrands: 0 });

    const [filters, setFilters] = useState({
        brand: '',
        priceRange: '',
        category: '',
        fuelType: '',
    });

    // Dynamic data from API
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    // Static options
    const priceRanges = [
        { label: 'All prices', value: '' },
        { label: 'Under 500 million VND', value: '0-500000000' },
        { label: '500 million - 1 billion VND', value: '500000000-1000000000' },
        { label: '1 - 2 billion VND', value: '1000000000-2000000000' },
        { label: '2 - 3 billion VND', value: '2000000000-3000000000' },
        { label: 'Over 3 billion VND', value: '3000000000-999999999999' },
    ];

    const fuelTypes = [
        { label: 'All fuel types', value: '' },
        { label: 'Gasoline', value: 'Gasoline' },
        { label: 'Diesel', value: 'Diesel' },
        { label: 'Hybrid', value: 'Hybrid' },
        { label: 'Electric', value: 'Electric' },
    ];

    // Fetch brands and categories on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [brandsRes, categoriesRes, carsRes] = await Promise.all([
                    request.get('/api/brand'),
                    request.get('/api/category'),
                    request.get('/api/car?limit=1'), // Just to get total count
                ]);

                // Get brands from API
                const brandsData = brandsRes.data?.metadata || brandsRes.data || [];
                setBrands(Array.isArray(brandsData) ? brandsData : []);

                // Get categories from API
                const categoriesData = categoriesRes.data?.metadata || categoriesRes.data || [];
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);

                // Get stats
                const pagination = carsRes.data?.metadata?.pagination;
                setStats({
                    totalCars: pagination?.total || 0,
                    totalBrands: Array.isArray(brandsData) ? brandsData.length : 0,
                });
            } catch (error) {
                console.error('Error fetching search data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle search
    const handleSearch = () => {
        setIsSearching(true);

        // Build query params
        const params = new URLSearchParams();

        if (filters.brand) {
            params.set('brand', filters.brand);
        }

        if (filters.category) {
            params.set('category', filters.category);
        }

        if (filters.fuelType) {
            params.set('fuelType', filters.fuelType);
        }

        if (filters.priceRange) {
            const [minPrice, maxPrice] = filters.priceRange.split('-');
            if (minPrice) params.set('minPrice', minPrice);
            if (maxPrice) params.set('maxPrice', maxPrice);
        }

        // Navigate to cars page with filters
        const queryString = params.toString();
        navigate(`/cars${queryString ? `?${queryString}` : ''}`);

        setIsSearching(false);
    };

    const SelectField = ({ icon: Icon, label, options, value, onChange, isLoading }) => (
        <div className="relative flex-1 min-w-[140px]">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40">
                <Icon className="w-3.5 h-3.5" />
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={isLoading}
                className="w-full h-9 pl-8 pr-7 bg-[#1a1f2e] border border-white/10 rounded-lg text-white text-xs appearance-none cursor-pointer transition-all duration-300 hover:border-[#0066FF]/50 hover:bg-[#1e2438] focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="" className="bg-[#1a1f2e]">
                    {isLoading ? 'Loading...' : label}
                </option>
                {options.map((opt) => (
                    <option
                        key={opt.value || opt._id || opt}
                        value={opt.value || opt._id || opt}
                        className="bg-[#1a1f2e]"
                    >
                        {opt.label || opt.name || opt}
                    </option>
                ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="relative z-30 max-w-[1000px] mx-auto px-4 -mt-10"
        >
            <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0F172A] border border-white/5 rounded-xl p-4 shadow-xl shadow-black/30"
            >
                {/* Header */}
                <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-0.5 h-3 bg-[#0066FF] rounded-full" />
                    <span className="text-white/60 text-[10px] font-medium tracking-wide uppercase">
                        Find Your Perfect Car
                    </span>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2">
                    <SelectField
                        icon={Car}
                        label="Select brand"
                        options={brands}
                        value={filters.brand}
                        onChange={(val) => setFilters({ ...filters, brand: val })}
                        isLoading={loading}
                    />

                    <SelectField
                        icon={DollarSign}
                        label="Price range"
                        options={priceRanges}
                        value={filters.priceRange}
                        onChange={(val) => setFilters({ ...filters, priceRange: val })}
                    />

                    <SelectField
                        icon={LayoutGrid}
                        label="Car type"
                        options={categories}
                        value={filters.category}
                        onChange={(val) => setFilters({ ...filters, category: val })}
                        isLoading={loading}
                    />

                    <SelectField
                        icon={Fuel}
                        label="Fuel type"
                        options={fuelTypes}
                        value={filters.fuelType}
                        onChange={(val) => setFilters({ ...filters, fuelType: val })}
                    />

                    {/* Search Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="relative group flex-shrink-0 w-full lg:w-auto"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0066FF] to-[#0052cc] rounded-lg opacity-0 blur-md group-hover:opacity-50 transition-opacity duration-300" />
                        <div className="relative flex items-center justify-center gap-1.5 h-9 px-4 bg-gradient-to-r from-[#0066FF] to-[#0052cc] hover:from-[#0052cc] hover:to-[#003d99] rounded-lg text-white text-xs font-semibold shadow-lg shadow-[#0066FF]/20 transition-all duration-300 disabled:opacity-70">
                            {isSearching ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Search className="w-3.5 h-3.5" />
                            )}
                            <span>{isSearching ? 'Searching...' : 'Search cars'}</span>
                        </div>
                    </motion.button>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#0066FF] font-bold text-sm">{loading ? '...' : stats.totalCars}</span>
                        <span className="text-white/40 text-[10px]">cars available</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#0066FF] font-bold text-sm">{loading ? '...' : stats.totalBrands}</span>
                        <span className="text-white/40 text-[10px]">brands</span>
                    </div>
                    <div className="w-px h-3 bg-white/10" />
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#0066FF] font-bold text-sm">24/7</span>
                        <span className="text-white/40 text-[10px]">support</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default SearchCard;
