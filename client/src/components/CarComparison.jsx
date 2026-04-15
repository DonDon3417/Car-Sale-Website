import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    Check,
    Zap,
    Gauge,
    Ruler,
    Fuel,
    Shield,
    Users,
    Sparkles,
    X,
    Car,
    DollarSign,
    Heart,
    Leaf,
    Target,
    TrendingUp,
    MessageSquare,
    Loader2,
    ArrowRightLeft,
    RefreshCw,
} from 'lucide-react';
import { request } from '../config/request';
import { useStore } from '../hooks/useStore';
import carMercedes from '../assets/car-mercedes.png';
import carBmw from '../assets/car-bmw.png';
import carAudi from '../assets/car-audi.png';

// Default cars for fallback
const defaultCars = [
    {
        _id: '1',
        name: 'Mercedes-AMG GT',
        images: [carMercedes],
        price: 2500000000,
        power: '585 HP',
        engine: '4.0L V8 Biturbo',
        size: '4,544 x 1,939 mm',
        fuelConsumption: '12.4L/100km',
        seats: 2,
        safety: ['ABS', 'ESP', 'Airbag 6'],
    },
    {
        _id: '2',
        name: 'BMW M4 Competition',
        images: [carBmw],
        price: 3200000000,
        power: '510 HP',
        engine: '3.0L I6 Twin-Turbo',
        size: '4,794 x 1,887 mm',
        fuelConsumption: '10.2L/100km',
        seats: 4,
        safety: ['ABS', 'DSC', 'Airbag 8', 'Lane Assist'],
    },
    {
        _id: '3',
        name: 'Audi RS e-tron GT',
        images: [carAudi],
        price: 5900000000,
        power: '646 HP',
        engine: 'Dual Motor Electric',
        size: '4,989 x 1,964 mm',
        fuelConsumption: '20.2 kWh/100km',
        seats: 4,
        safety: ['ABS', 'ESC', 'Airbag 10', 'Adaptive Cruise'],
    },
];

// AI Analysis Modal Component
const AIAnalysisModal = ({ isOpen, onClose, car1, car2 }) => {
    const { themeMode } = useStore();
    const isLightTheme = themeMode === 'light';
    const [selectedRequirements, setSelectedRequirements] = useState([]);
    const [customRequirement, setCustomRequirement] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const requirements = [
        {
            id: 'family',
            label: 'Family-friendly',
            icon: Heart,
            description: 'Evaluate cabin space and family safety',
        },
        {
            id: 'fuel_efficiency',
            label: 'Fuel-efficient',
            icon: Leaf,
            description: 'Compare fuel consumption',
        },
        {
            id: 'investment',
            label: 'Long-term value',
            icon: TrendingUp,
            description: 'Analyze resale value and maintenance costs',
        },
        {
            id: 'performance',
            label: 'High performance',
            icon: Zap,
            description: 'Compare power, speed, and driving performance',
        },
        {
            id: 'budget',
            label: 'Budget fit',
            icon: DollarSign,
            description: 'Analyze value for money',
        },
        {
            id: 'daily_use',
            label: 'Daily use',
            icon: Car,
            description: 'Evaluate convenience for daily commuting',
        },
    ];

    const toggleRequirement = (id) => {
        setSelectedRequirements((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
    };

    const handleAnalyze = async () => {
        if (selectedRequirements.length === 0 && !customRequirement.trim()) {
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const response = await request.post('/api/car/ai-analyze', {
                car1Id: car1._id,
                car2Id: car2._id,
                requirements: selectedRequirements,
                customRequirement: customRequirement.trim(),
            });

            // Extract analysis from response
            const data = response.data?.metadata;
            if (data?.success && data?.analysis) {
                setAnalysisResult(data.analysis);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error analyzing cars:', error);
            // Fallback to basic message on error
            setAnalysisResult({
                summary: 'An analysis error occurred. Please try again later.',
                recommendation: null,
                recommendationReason: '',
                details: [],
                prosAndCons: { car1: { pros: [], cons: [] }, car2: { pros: [], cons: [] } },
                finalVerdict: 'Unable to complete analysis.',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setSelectedRequirements([]);
        setCustomRequirement('');
        setAnalysisResult(null);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="w-full max-w-2xl max-h-[90vh] overflow-hidden customer-surface rounded-2xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div
                        className={`relative p-4 border-b border-(--app-border) ${
                            isLightTheme
                                ? 'bg-linear-to-r from-[#0066FF]/8 to-[#8b5cf6]/10'
                                : 'bg-linear-to-r from-[#0066FF]/10 to-[#8b5cf6]/12'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-linear-to-br from-[#0066FF] to-purple-500">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-(--app-text)">AI Comparison Analysis</h3>
                                <p className="text-xs text-(--app-text-muted)">
                                    Smart comparison between {car1?.name} and {car2?.name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg text-(--app-text-muted) hover:text-(--app-text) hover:bg-(--app-surface-soft) transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {!analysisResult ? (
                            <>
                                {/* Selected Cars Preview */}
                                <div className="flex items-center justify-center gap-4 mb-6 p-3 bg-(--app-surface-soft) border border-(--app-border) rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${car1?.images?.[0]}` || carMercedes}
                                            alt={car1?.name}
                                            className="w-16 h-10 object-cover rounded-lg"
                                        />
                                        <span className="text-sm text-(--app-text) font-medium">{car1?.name}</span>
                                    </div>
                                    <ArrowRightLeft className="w-5 h-5 text-[#0066FF]" />
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${car2?.images?.[0]}` || carBmw}
                                            alt={car2?.name}
                                            className="w-16 h-10 object-cover rounded-lg"
                                        />
                                        <span className="text-sm text-(--app-text) font-medium">{car2?.name}</span>
                                    </div>
                                </div>

                                {/* Requirements Selection */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-(--app-text) mb-3">
                                        Choose analysis criteria:
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {requirements.map((req) => {
                                            const isSelected = selectedRequirements.includes(req.id);
                                            return (
                                                <button
                                                    key={req.id}
                                                    onClick={() => toggleRequirement(req.id)}
                                                    className={`p-3 rounded-xl border transition-all duration-300 text-left group ${
                                                        isSelected
                                                            ? 'bg-[#0066FF]/20 border-[#0066FF] shadow-lg shadow-[#0066FF]/20'
                                                            : 'bg-(--app-surface-soft) border-(--app-border) hover:border-[#0066FF]/35'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div
                                                            className={`p-1.5 rounded-lg ${
                                                                isSelected
                                                                    ? 'bg-[#0066FF]'
                                                                    : 'bg-(--app-input-bg) group-hover:bg-(--app-surface-strong)'
                                                            }`}
                                                        >
                                                            <req.icon
                                                                className={`w-3.5 h-3.5 ${
                                                                    isSelected
                                                                        ? 'text-white'
                                                                        : 'text-(--app-text-muted)'
                                                                }`}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span
                                                                className={`text-xs font-medium block ${
                                                                    isSelected ? 'text-[#0066FF]' : 'text-(--app-text)'
                                                                }`}
                                                            >
                                                                {req.label}
                                                            </span>
                                                            <span className="text-[10px] text-(--app-text-muted) line-clamp-1">
                                                                {req.description}
                                                            </span>
                                                        </div>
                                                        {isSelected && (
                                                            <Check className="w-4 h-4 text-[#0066FF] shrink-0" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Requirement */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-semibold text-(--app-text) mb-2 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-[#0066FF]" />
                                        Custom requirement (optional):
                                    </h4>
                                    <textarea
                                        value={customRequirement}
                                        onChange={(e) => setCustomRequirement(e.target.value)}
                                        placeholder="Enter your specific requirement, e.g. 'I travel 500km weekly for business, which car is a better fit?'"
                                        className="w-full h-20 px-3 py-2 bg-(--app-input-bg) border border-(--app-border) rounded-xl text-sm text-(--app-text) placeholder:text-(--app-text-muted) resize-none focus:outline-none focus:border-[#0066FF] transition-colors"
                                    />
                                </div>
                            </>
                        ) : (
                            /* Analysis Result */
                            <div className="space-y-4">
                                {/* Summary */}
                                <div className="p-4 bg-linear-to-r from-[#0066FF]/10 to-purple-500/10 rounded-xl border border-[#0066FF]/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-4 h-4 text-[#0066FF]" />
                                        <span className="text-sm font-semibold text-(--app-text)">Summary</span>
                                    </div>
                                    <p className="text-sm text-(--app-text-muted) leading-relaxed">
                                        {analysisResult.summary}
                                    </p>
                                </div>

                                {/* Recommendation */}
                                {analysisResult.recommendation && (
                                    <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Check className="w-5 h-5 text-green-400" />
                                            <span className="text-sm font-semibold text-(--app-text)">
                                                AI recommendation:
                                            </span>
                                            <span className="text-sm text-green-400 font-bold">
                                                {analysisResult.recommendation}
                                            </span>
                                        </div>
                                        {analysisResult.recommendationReason && (
                                            <p className="text-xs text-(--app-text-muted) ml-7">
                                                {analysisResult.recommendationReason}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Detailed Analysis with Scores */}
                                {analysisResult.details?.length > 0 && (
                                    <div className="space-y-2">
                                        <h5 className="text-sm font-semibold text-(--app-text) mb-2">
                                            Detailed analysis:
                                        </h5>
                                        {analysisResult.details.map((detail, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-(--app-surface-soft) rounded-xl border border-(--app-border)"
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold text-(--app-text)">
                                                        {detail.category}
                                                    </span>
                                                    {detail.car1Score && detail.car2Score && (
                                                        <div className="flex gap-2 text-[10px]">
                                                            <span className="text-[#0066FF]">
                                                                {car1?.name}: {detail.car1Score}/10
                                                            </span>
                                                            <span className="text-purple-400">
                                                                {car2?.name}: {detail.car2Score}/10
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Score Bars */}
                                                {detail.car1Score && detail.car2Score && (
                                                    <div className="flex gap-2 mb-2">
                                                        <div className="flex-1 h-1.5 bg-(--app-input-bg) rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-[#0066FF] rounded-full transition-all"
                                                                style={{ width: `${detail.car1Score * 10}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex-1 h-1.5 bg-(--app-input-bg) rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-purple-500 rounded-full transition-all"
                                                                style={{ width: `${detail.car2Score * 10}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <p className="text-[11px] text-(--app-text-muted) leading-relaxed">
                                                    {detail.analysis}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pros and Cons */}
                                {analysisResult.prosAndCons && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {/* Car 1 */}
                                        <div className="p-3 bg-(--app-surface-soft) rounded-xl border border-(--app-border)">
                                            <h6 className="text-xs font-semibold text-[#0066FF] mb-2">{car1?.name}</h6>
                                            {analysisResult.prosAndCons.car1?.pros?.length > 0 && (
                                                <div className="mb-2">
                                                    <span className="text-[10px] text-green-400 font-medium">
                                                        Pros:
                                                    </span>
                                                    <ul className="ml-2 mt-1 space-y-0.5">
                                                        {analysisResult.prosAndCons.car1.pros.map((pro, i) => (
                                                            <li key={i} className="text-[10px] text-(--app-text-muted)">
                                                                • {pro}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {analysisResult.prosAndCons.car1?.cons?.length > 0 && (
                                                <div>
                                                    <span className="text-[10px] text-red-400 font-medium">Cons:</span>
                                                    <ul className="ml-2 mt-1 space-y-0.5">
                                                        {analysisResult.prosAndCons.car1.cons.map((con, i) => (
                                                            <li key={i} className="text-[10px] text-(--app-text-muted)">
                                                                • {con}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        {/* Car 2 */}
                                        <div className="p-3 bg-(--app-surface-soft) rounded-xl border border-(--app-border)">
                                            <h6 className="text-xs font-semibold text-purple-400 mb-2">{car2?.name}</h6>
                                            {analysisResult.prosAndCons.car2?.pros?.length > 0 && (
                                                <div className="mb-2">
                                                    <span className="text-[10px] text-green-400 font-medium">
                                                        Pros:
                                                    </span>
                                                    <ul className="ml-2 mt-1 space-y-0.5">
                                                        {analysisResult.prosAndCons.car2.pros.map((pro, i) => (
                                                            <li key={i} className="text-[10px] text-(--app-text-muted)">
                                                                • {pro}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {analysisResult.prosAndCons.car2?.cons?.length > 0 && (
                                                <div>
                                                    <span className="text-[10px] text-red-400 font-medium">Cons:</span>
                                                    <ul className="ml-2 mt-1 space-y-0.5">
                                                        {analysisResult.prosAndCons.car2.cons.map((con, i) => (
                                                            <li key={i} className="text-[10px] text-(--app-text-muted)">
                                                                • {con}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Final Verdict */}
                                {analysisResult.finalVerdict && (
                                    <div className="p-4 bg-linear-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="w-4 h-4 text-yellow-400" />
                                            <span className="text-sm font-semibold text-(--app-text)">Advice</span>
                                        </div>
                                        <p className="text-xs text-(--app-text-muted) leading-relaxed">
                                            {analysisResult.finalVerdict}
                                        </p>
                                    </div>
                                )}

                                {/* Reset Button */}
                                <button
                                    onClick={resetAnalysis}
                                    className="w-full py-2 px-4 rounded-xl bg-(--app-surface-soft) border border-(--app-border) text-(--app-text-muted) text-sm hover:bg-(--app-input-bg) hover:text-(--app-text) transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Analyze again with different criteria
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {!analysisResult && (
                        <div className="p-4 border-t border-(--app-border) bg-(--app-surface-soft)">
                            <button
                                onClick={handleAnalyze}
                                disabled={
                                    isAnalyzing || (selectedRequirements.length === 0 && !customRequirement.trim())
                                }
                                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                                    isAnalyzing || (selectedRequirements.length === 0 && !customRequirement.trim())
                                        ? 'bg-(--app-input-bg) text-(--app-text-muted) cursor-not-allowed'
                                        : 'bg-linear-to-r from-[#0066FF] to-purple-500 text-white hover:shadow-lg hover:shadow-[#0066FF]/30 hover:scale-[1.02]'
                                }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Analyze with AI
                                    </>
                                )}
                            </button>
                            <p className="text-center text-[10px] text-(--app-text-muted) mt-2">
                                AI will analyze based on technical specifications and your selected criteria
                            </p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const CarComparison = () => {
    const [allCars, setAllCars] = useState(defaultCars);
    const [selectedCars, setSelectedCars] = useState([defaultCars[0], defaultCars[1]]);
    const [loading, setLoading] = useState(true);
    const [comparing, setComparing] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);
    const [showAIModal, setShowAIModal] = useState(false);

    // Fetch cars from API
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const pageSize = 100;
                const firstResponse = await request.get('/api/car', {
                    params: { page: 1, limit: pageSize },
                });

                const firstPageCars = firstResponse.data?.metadata?.cars || [];
                const totalPages = Number(firstResponse.data?.metadata?.pagination?.totalPages || 1);

                let allFetchedCars = [...firstPageCars];

                if (totalPages > 1) {
                    const remainingRequests = [];
                    for (let page = 2; page <= totalPages; page += 1) {
                        remainingRequests.push(
                            request.get('/api/car', {
                                params: { page, limit: pageSize },
                            }),
                        );
                    }

                    const remainingResponses = await Promise.all(remainingRequests);
                    const remainingCars = remainingResponses.flatMap((res) => res.data?.metadata?.cars || []);
                    allFetchedCars = [...allFetchedCars, ...remainingCars];
                }

                if (allFetchedCars.length >= 2) {
                    const cars = allFetchedCars.map((car) => ({
                        ...car,
                        images: car.images || [carMercedes],
                        power: car.power || 'N/A',
                        engine: car.engine || 'N/A',
                        size: car.size || 'N/A',
                        fuelConsumption: car.fuelConsumption || 'N/A',
                        seats: car.seats || 5,
                        safety: car.safety || [],
                    }));
                    setAllCars(cars);
                    setSelectedCars([cars[0], cars[1]]);
                }
            } catch (error) {
                console.error('Error fetching cars:', error);
                // Keep default cars on error
            } finally {
                setLoading(false);
            }
        };
        fetchCars();
    }, []);

    // Compare cars when selection changes
    useEffect(() => {
        const compareCars = async () => {
            if (!selectedCars[0] || !selectedCars[1]) return;

            setComparing(true);
            try {
                // TODO: Call actual comparison API
                // const response = await request.post('/api/car/compare', {
                //     car1Id: selectedCars[0]._id,
                //     car2Id: selectedCars[1]._id,
                // });
                // setComparisonData(response.data);

                // For now, use local comparison
                await new Promise((resolve) => setTimeout(resolve, 500));
                setComparisonData({
                    summary: 'Comparison complete',
                    cars: selectedCars,
                });
            } catch (error) {
                console.error('Error comparing cars:', error);
            } finally {
                setComparing(false);
            }
        };
        compareCars();
    }, [selectedCars]);

    // Format price to Vietnamese format
    const formatPrice = (price) => {
        if (typeof price === 'string') return price;
        if (price >= 1000000000) {
            return `${(price / 1000000000).toFixed(1)} billion`;
        }
        return `${(price / 1000000).toFixed(0)} million`;
    };

    // Get size from specifications
    const getSize = (car) => {
        if (car.specifications) {
            const { length, width, height } = car.specifications;
            if (length && width && height) {
                return `${length} x ${width} x ${height}`;
            }
            if (length && width) {
                return `${length} x ${width}`;
            }
        }
        return 'N/A';
    };

    // Get horsepower from specifications
    const getHorsepower = (car) => {
        return car.specifications?.horsepower || 'N/A';
    };

    // Get torque from specifications
    const getTorque = (car) => {
        return car.specifications?.torque || 'N/A';
    };

    const specs = [
        { key: 'price', label: 'Selling price', icon: Zap, format: formatPrice },
        { key: 'year', label: 'Production year', icon: Car },
        { key: 'fuelType', label: 'Fuel type', icon: Fuel },
        { key: 'transmission', label: 'Transmission', icon: Gauge },
        { key: 'seats', label: 'Seats', icon: Users },
        { key: 'engine', label: 'Engine', icon: Fuel },
        {
            key: 'mileage',
            label: 'Consumption (L/100km)',
            icon: Fuel,
            format: (val) => (val ? `${val} L/100km` : 'N/A'),
        },
        { key: 'horsepower', label: 'Power', icon: Zap, getValue: getHorsepower },
        { key: 'torque', label: 'Torque', icon: Gauge, getValue: getTorque },
        { key: 'size', label: 'Dimensions (LxWxH)', icon: Ruler, getValue: getSize },
    ];

    const SelectDropdown = ({ value, onChange, excludeId }) => (
        <div className="relative">
            <select
                value={value?._id}
                onChange={(e) => onChange(allCars.find((c) => c._id === e.target.value))}
                className="w-full h-8 px-2 pr-6 bg-(--app-input-bg) border border-(--app-border) rounded-lg text-(--app-text) text-xs appearance-none cursor-pointer transition-all duration-300 hover:border-[#0066FF]/50 focus:outline-none focus:border-[#0066FF]"
            >
                {allCars
                    .filter((c) => c._id !== excludeId)
                    .map((car) => (
                        <option key={car._id} value={car._id} className="bg-(--app-surface-strong)">
                            {car.name}
                        </option>
                    ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-(--app-text-muted) pointer-events-none" />
        </div>
    );

    return (
        <section className="py-10 lg:py-14">
            <div className="max-w-250 mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-6"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-6 h-px bg-[#0066FF]" />
                        <span className="text-[#0066FF] text-[10px] font-semibold tracking-[0.15em] uppercase">
                            Compare
                        </span>
                        <div className="w-6 h-px bg-[#0066FF]" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-(--app-text) mb-1">Compare cars</h2>
                    <p className="text-(--app-text-muted) text-xs">Compare specifications to choose the right car</p>
                </motion.div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-(--app-surface-strong) border border-(--app-border) rounded-xl overflow-hidden relative shadow-(--app-shadow-card)"
                >
                    {/* Loading Overlay */}
                    {(loading || comparing) && (
                        <div className="absolute inset-0 bg-(--app-surface-strong)/85 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 text-[#0066FF] animate-spin" />
                                <span className="text-(--app-text-muted) text-sm">
                                    {loading ? 'Loading...' : 'Comparing...'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Header Row */}
                    <div className="grid grid-cols-3 border-b border-(--app-border)">
                        <div className="p-3 bg-(--app-surface-soft)">
                            <span className="text-(--app-text-muted) text-[10px] font-medium uppercase tracking-wider">
                                Specifications
                            </span>
                        </div>
                        {selectedCars.map((car, idx) => (
                            <div key={car._id} className={`p-3 ${idx === 0 ? 'border-x border-(--app-border)' : ''}`}>
                                <div className="aspect-16/10 mb-2 rounded-lg overflow-hidden bg-(--app-surface-soft)">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}${car.images?.[0]}` || carMercedes}
                                        alt={car.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <SelectDropdown
                                    value={car}
                                    onChange={(newCar) => {
                                        const newSelected = [...selectedCars];
                                        newSelected[idx] = newCar;
                                        setSelectedCars(newSelected);
                                    }}
                                    excludeId={selectedCars[1 - idx]?._id}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Spec Rows */}
                    {specs.map((spec, idx) => (
                        <div
                            key={spec.key}
                            className={`grid grid-cols-3 ${idx !== specs.length - 1 ? 'border-b border-(--app-border)' : ''}`}
                        >
                            <div className="p-2.5 flex items-center gap-1.5 bg-(--app-surface-soft)">
                                <spec.icon className="w-3 h-3 text-[#0066FF]" />
                                <span className="text-(--app-text-muted) text-xs">{spec.label}</span>
                            </div>
                            {selectedCars.map((car, carIdx) => {
                                // Get raw value - support getValue function for nested fields
                                const rawValue = spec.getValue ? spec.getValue(car) : car[spec.key];
                                const otherRawValue = spec.getValue
                                    ? spec.getValue(selectedCars[1 - carIdx])
                                    : selectedCars[1 - carIdx]?.[spec.key];

                                // Format display value
                                const displayValue = spec.format ? spec.format(rawValue) : rawValue || 'N/A';

                                // Determine if this value is "better"
                                const isBetter = (() => {
                                    if (!rawValue || !otherRawValue) return false;
                                    switch (spec.key) {
                                        case 'price':
                                        case 'mileage': // Lower is better
                                            return parseFloat(rawValue) < parseFloat(otherRawValue);
                                        case 'seats':
                                        case 'year':
                                        case 'horsepower': // Higher is better
                                            return parseInt(rawValue) > parseInt(otherRawValue);
                                        default:
                                            return false;
                                    }
                                })();

                                return (
                                    <div
                                        key={`${car._id}-${spec.key}`}
                                        className={`p-2.5 flex items-center ${carIdx === 0 ? 'border-x border-(--app-border)' : ''} ${isBetter ? 'bg-[#0066FF]/5' : ''}`}
                                    >
                                        <span
                                            className={`text-xs ${isBetter ? 'text-[#0066FF] font-semibold' : 'text-(--app-text)'}`}
                                        >
                                            {spec.key === 'seats' ? `${displayValue} seats` : displayValue}
                                        </span>
                                        {isBetter && <Check className="w-3 h-3 text-[#0066FF] ml-1.5" />}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Colors Row */}
                    <div className="grid grid-cols-3 border-t border-(--app-border)">
                        <div className="p-2.5 flex items-center gap-1.5 bg-(--app-surface-soft)">
                            <Shield className="w-3 h-3 text-[#0066FF]" />
                            <span className="text-(--app-text-muted) text-xs">Colors</span>
                        </div>
                        {selectedCars.map((car, carIdx) => (
                            <div
                                key={`${car._id}-colors`}
                                className={`p-2.5 ${carIdx === 0 ? 'border-x border-(--app-border)' : ''}`}
                            >
                                <div className="flex flex-wrap gap-1.5">
                                    {(car.colors || []).map((color, colorIdx) => (
                                        <div
                                            key={`${color.name}-${colorIdx}`}
                                            className="flex items-center gap-1 px-1.5 py-0.5 bg-(--app-surface-soft) rounded"
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full border border-(--app-border)"
                                                style={{ backgroundColor: color.code || '#888' }}
                                            />
                                            <span className="text-(--app-text-muted) text-[9px]">{color.name}</span>
                                        </div>
                                    ))}
                                    {(!car.colors || car.colors.length === 0) && (
                                        <span className="text-(--app-text-muted) text-[9px]">No information</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Versions Row */}
                    <div className="grid grid-cols-3 border-t border-(--app-border)">
                        <div className="p-2.5 flex items-center gap-1.5 bg-(--app-surface-soft)">
                            <Car className="w-3 h-3 text-[#0066FF]" />
                            <span className="text-(--app-text-muted) text-xs">Version</span>
                        </div>
                        {selectedCars.map((car, carIdx) => (
                            <div
                                key={`${car._id}-versions`}
                                className={`p-2.5 ${carIdx === 0 ? 'border-x border-(--app-border)' : ''}`}
                            >
                                <div className="flex flex-wrap gap-1">
                                    {(car.versions || []).map((version, versionIdx) => (
                                        <span
                                            key={`${version.name}-${versionIdx}`}
                                            className="px-1.5 py-0.5 bg-[#0066FF]/10 border border-[#0066FF]/30 rounded text-[#0066FF] text-[9px]"
                                        >
                                            {version.name}
                                            {version.price && ` - ${formatPrice(version.price)}`}
                                        </span>
                                    ))}
                                    {(!car.versions || car.versions.length === 0) && (
                                        <span className="text-(--app-text-muted) text-[9px]">No information</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Analysis Button */}
                    <div className="p-4 border-t border-(--app-border) bg-linear-to-r from-(--app-surface-soft) to-(--app-surface-strong)">
                        <button
                            onClick={() => setShowAIModal(true)}
                            className="w-full py-3 px-4 rounded-xl bg-linear-to-r from-[#0066FF] to-purple-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-[#0066FF]/30 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                            <Sparkles className="w-4 h-4" />
                            Compare with AI
                        </button>
                        <p className="text-center text-[10px] text-(--app-text-muted) mt-2">
                            AI will analyze and recommend cars that match your needs
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* AI Analysis Modal */}
            <AIAnalysisModal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                car1={selectedCars[0]}
                car2={selectedCars[1]}
            />
        </section>
    );
};

export default CarComparison;
