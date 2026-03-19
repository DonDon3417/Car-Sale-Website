import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    Grid3X3,
    List,
    Zap,
    Fuel,
    Users,
    ArrowRight,
    Loader2,
    SlidersHorizontal,
    ArrowUpDown,
    Check,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestGetAllCars } from '../config/CarRequest';
import { requestGetAllBrands } from '../config/BrandRequest';
import { requestGetAllCategories } from '../config/CategoryRequest';

const CarSearch = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [cars, setCars] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [showFilters, setShowFilters] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const debounceRef = useRef(null);
    const isFirstRender = useRef(true);

    // Filter states
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        brand: searchParams.get('brand')?.split(',').filter(Boolean) || [],
        category: searchParams.get('category')?.split(',').filter(Boolean) || [],
        fuelType: searchParams.get('fuelType')?.split(',').filter(Boolean) || [],
        transmission: searchParams.get('transmission') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minYear: searchParams.get('minYear') || '',
        maxYear: searchParams.get('maxYear') || '',
        seats: searchParams.get('seats')?.split(',').map(Number).filter(Boolean) || [],
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
    });

    const fuelTypes = ['Gasoline', 'Diesel', 'Hybrid', 'Electric'];
    const transmissions = ['Automatic', 'Manual'];
    const seatOptions = [2, 4, 5, 7, 8];
    const priceRanges = [
        { label: 'Under 500 million VND', min: 0, max: 500000000 },
        { label: '500 million - 1 billion VND', min: 500000000, max: 1000000000 },
        { label: '1 billion - 2 billion', min: 1000000000, max: 2000000000 },
        { label: '2 billion - 5 billion', min: 2000000000, max: 5000000000 },
        { label: 'Above 5 billion', min: 5000000000, max: '' },
    ];
    const sortOptions = [
        { value: 'createdAt-desc', label: 'Newest' },
        { value: 'createdAt-asc', label: 'Oldest' },
        { value: 'price-asc', label: 'Price: low to high' },
        { value: 'price-desc', label: 'Price: high to low' },
        { value: 'year-desc', label: 'Latest model year' },
        { value: 'viewCount-desc', label: 'Most viewed' },
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    // Debounced fetch on filter change
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            fetchCars();
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchCars();
            updateURL();
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [filters]);

    const fetchInitialData = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([requestGetAllBrands(), requestGetAllCategories()]);
            setBrands(brandsRes.metadata || []);
            setCategories(categoriesRes.metadata || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchCars = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 12,
                ...filters,
                brand: filters.brand.join(',') || undefined,
                category: filters.category.join(',') || undefined,
                fuelType: filters.fuelType.join(',') || undefined,
                seats: filters.seats.join(',') || undefined,
            };

            // Remove empty values
            Object.keys(params).forEach((key) => {
                if (params[key] === '' || params[key] === undefined) delete params[key];
            });

            const res = await requestGetAllCars(params);
            setCars(res.metadata?.cars || []);
            setPagination({
                page: res.metadata?.pagination?.page || 1,
                totalPages: res.metadata?.pagination?.totalPages || 1,
                total: res.metadata?.pagination?.total || 0,
            });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateURL = () => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.brand.length) params.set('brand', filters.brand.join(','));
        if (filters.category.length) params.set('category', filters.category.join(','));
        if (filters.fuelType.length) params.set('fuelType', filters.fuelType.join(','));
        if (filters.transmission) params.set('transmission', filters.transmission);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.minYear) params.set('minYear', filters.minYear);
        if (filters.maxYear) params.set('maxYear', filters.maxYear);
        if (filters.seats.length) params.set('seats', filters.seats.join(','));
        if (filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
        if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);
        setSearchParams(params);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const toggleArrayFilter = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
        }));
    };

    const handlePriceRange = (min, max) => {
        setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
    };

    const handleSort = (value) => {
        const [sortBy, sortOrder] = value.split('-');
        setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            brand: [],
            category: [],
            fuelType: [],
            transmission: '',
            minPrice: '',
            maxPrice: '',
            minYear: '',
            maxYear: '',
            seats: [],
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    };

    const activeFilterCount = [
        filters.brand.length > 0,
        filters.category.length > 0,
        filters.fuelType.length > 0,
        filters.transmission !== '',
        filters.minPrice !== '' || filters.maxPrice !== '',
        filters.minYear !== '' || filters.maxYear !== '',
        filters.seats.length > 0,
    ].filter(Boolean).length;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US').format(price) + ' VND';
    };

    const normalizeTextKey = (value = '') =>
        value
            .toString()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .toLowerCase();

    const formatFuelType = (value) => {
        const key = normalizeTextKey(value);
        if (key === 'xang' || key === 'gasoline') return 'Gasoline';
        if (key === 'dau' || key === 'diesel') return 'Diesel';
        if (key === 'dien' || key === 'electric') return 'Electric';
        if (key === 'hybrid') return 'Hybrid';
        return value || '-';
    };

    const formatCategoryName = (value) => {
        if (!value) return 'Car';
        const parts = value
            .split('/')
            .map((part) => part.trim())
            .filter(Boolean);
        return parts[0] || value;
    };

    const FilterSection = ({ title, children, defaultOpen = true }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);
        return (
            <div className="border-b border-white/10 pb-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full py-2 text-white font-medium"
                >
                    <span>{title}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isOpen && <div className="pt-2 space-y-2">{children}</div>}
            </div>
        );
    };

    const CheckboxItem = ({ checked, onClick, label, count }) => (
        <div onClick={onClick} className="flex items-center gap-2 cursor-pointer group py-1">
            <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    checked ? 'bg-[#0066FF] border-[#0066FF]' : 'border-white/30 group-hover:border-white/50'
                }`}
            >
                {checked && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-white/70 group-hover:text-white text-sm flex-1">{label}</span>
            {count !== undefined && <span className="text-white/40 text-xs">({count})</span>}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#0d1520] to-[#0a1628]">
            <Header />

            <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-20">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Search cars by name, brand..."
                            className="w-full pl-12 pr-4 py-4 bg-[#1a2332] border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#0066FF] transition-colors"
                        />
                        {filters.search && (
                            <button
                                onClick={() => handleFilterChange('search', '')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#1a2332] border border-white/10 rounded-xl text-white hover:border-[#0066FF] transition-colors"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="w-5 h-5 bg-[#0066FF] rounded-full text-xs flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        <span className="text-white/50">
                            Found <span className="text-white font-semibold">{pagination.total}</span> cars
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Sort */}
                        <select
                            value={`${filters.sortBy}-${filters.sortOrder}`}
                            onChange={(e) => handleSort(e.target.value)}
                            className="px-4 py-2 bg-[#1a2332] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#0066FF]"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>

                        {/* View Mode */}
                        <div className="flex bg-[#1a2332] rounded-xl border border-white/10 overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-[#0066FF] text-white' : 'text-white/50 hover:text-white'}`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-[#0066FF] text-white' : 'text-white/50 hover:text-white'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar Filters */}
                    {showFilters && (
                        <aside className="w-[280px] flex-shrink-0">
                            <div className="bg-[#1a2332] rounded-2xl p-5 sticky top-24 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-semibold">Filters</h3>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-[#0066FF] text-sm hover:underline"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                {/* Brand Filter */}
                                <FilterSection title="Brand">
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {brands.map((brand) => (
                                            <CheckboxItem
                                                key={brand._id}
                                                checked={filters.brand.includes(brand._id)}
                                                onClick={() => toggleArrayFilter('brand', brand._id)}
                                                label={brand.name}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>

                                {/* Category Filter */}
                                <FilterSection title="Cars">
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {categories.map((cat) => (
                                            <CheckboxItem
                                                key={cat._id}
                                                checked={filters.category.includes(cat._id)}
                                                onClick={() => toggleArrayFilter('category', cat._id)}
                                                label={formatCategoryName(cat.name)}
                                            />
                                        ))}
                                    </div>
                                </FilterSection>

                                {/* Price Range */}
                                <FilterSection title="Price range">
                                    <div className="space-y-2">
                                        {priceRanges.map((range, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handlePriceRange(range.min, range.max)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    filters.minPrice == range.min && filters.maxPrice == range.max
                                                        ? 'bg-[#0066FF] text-white'
                                                        : 'text-white/70 hover:bg-white/5'
                                                }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </FilterSection>

                                {/* Fuel Type */}
                                <FilterSection title="Fuel type">
                                    <div className="flex flex-wrap gap-2">
                                        {fuelTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => toggleArrayFilter('fuelType', type)}
                                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                    filters.fuelType.includes(type)
                                                        ? 'bg-[#0066FF] text-white'
                                                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </FilterSection>

                                {/* Transmission */}
                                <FilterSection title="Transmission">
                                    <div className="flex gap-2">
                                        {transmissions.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() =>
                                                    handleFilterChange(
                                                        'transmission',
                                                        filters.transmission === type ? '' : type,
                                                    )
                                                }
                                                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    filters.transmission === type
                                                        ? 'bg-[#0066FF] text-white'
                                                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </FilterSection>

                                {/* Seats */}
                                <FilterSection title="Seats">
                                    <div className="flex flex-wrap gap-2">
                                        {seatOptions.map((seat) => (
                                            <button
                                                key={seat}
                                                onClick={() => toggleArrayFilter('seats', seat)}
                                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                    filters.seats.includes(seat)
                                                        ? 'bg-[#0066FF] text-white'
                                                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                                                }`}
                                            >
                                                {seat} seats
                                            </button>
                                        ))}
                                    </div>
                                </FilterSection>

                                {/* Year Range */}
                                <FilterSection title="Production year" defaultOpen={false}>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={filters.minYear}
                                            onChange={(e) => handleFilterChange('minYear', e.target.value)}
                                            placeholder="From year"
                                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0066FF]"
                                        />
                                        <input
                                            type="number"
                                            value={filters.maxYear}
                                            onChange={(e) => handleFilterChange('maxYear', e.target.value)}
                                            placeholder="To year"
                                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0066FF]"
                                        />
                                    </div>
                                </FilterSection>
                            </div>
                        </aside>
                    )}

                    {/* Cars Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                            </div>
                        ) : cars.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-white/50 text-lg mb-4">No matching cars found</p>
                                <button onClick={clearFilters} className="text-[#0066FF] hover:underline">
                                    Clear filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div
                                    className={`grid gap-5 ${
                                        viewMode === 'grid'
                                            ? showFilters
                                                ? 'md:grid-cols-2 lg:grid-cols-3'
                                                : 'md:grid-cols-2 lg:grid-cols-4'
                                            : 'grid-cols-1'
                                    }`}
                                >
                                    {cars.map((car) => (
                                        <div
                                            key={car._id}
                                            className={`group bg-[#1a2332] border border-white/5 rounded-2xl overflow-hidden hover:border-[#0066FF]/30 hover:shadow-xl hover:shadow-[#0066FF]/10 transition-all duration-300 hover:-translate-y-1 ${
                                                viewMode === 'list' ? 'flex' : ''
                                            }`}
                                        >
                                            {/* Image */}
                                            <div
                                                className={`relative overflow-hidden ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-[16/10]'}`}
                                            >
                                                <img
                                                    src={
                                                        car.images?.[0]
                                                            ? import.meta.env.VITE_API_URL + car.images[0]
                                                            : 'https://via.placeholder.com/400x250'
                                                    }
                                                    alt={car.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2332] via-transparent opacity-60" />
                                                <span className="absolute top-2 left-2 px-2 py-1 bg-[#0066FF] rounded-lg text-white text-[10px] font-semibold">
                                                    {formatCategoryName(car.category?.name)}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div
                                                className={`p-4 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[#0066FF] text-xs">
                                                            {car.brand?.name}
                                                        </span>
                                                        <span className="text-white/30">•</span>
                                                        <span className="text-white/50 text-xs">{car.year}</span>
                                                    </div>
                                                    <h3 className="text-white font-semibold group-hover:text-[#0066FF] transition-colors line-clamp-1">
                                                        {car.name}
                                                    </h3>

                                                    {/* Specs */}
                                                    <div className="flex items-center gap-3 mt-3 text-white/50 text-xs">
                                                        <span className="flex items-center gap-1">
                                                            <Fuel className="w-3 h-3" />
                                                            {formatFuelType(car.fuelType)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {car.seats} seats
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Zap className="w-3 h-3" />
                                                            {car.specifications?.horsepower || '-'} HP
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    <span className="text-[#0066FF] font-bold text-lg">
                                                        {formatPrice(car.price)}
                                                    </span>
                                                    <Link to={`/cars/${car.slug}`}>
                                                        <button className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-[#0066FF] rounded-lg text-white text-sm transition-colors">
                                                            <span>Details</span>
                                                            <ArrowRight className="w-3 h-3" />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-10">
                                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => fetchCars(page)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                                    pagination.page === page
                                                        ? 'bg-[#0066FF] text-white'
                                                        : 'bg-[#1a2332] text-white/50 hover:text-white hover:bg-white/10'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CarSearch;
