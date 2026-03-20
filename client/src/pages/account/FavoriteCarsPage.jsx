import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Heart, Loader2, Trash2, ArrowRight } from 'lucide-react';
import cookies from 'js-cookie';

import { requestGetFavoriteCars, requestToggleFavoriteCar } from '../../config/UserRequest';

const FavoriteCarsPage = () => {
    const navigate = useNavigate();
    const [favoriteCars, setFavoriteCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState('');

    useEffect(() => {
        const token = cookies.get('logged');
        if (!token) {
            setLoading(false);
            return;
        }
        fetchFavoriteCars();
    }, []);

    const fetchFavoriteCars = async () => {
        try {
            setLoading(true);
            const res = await requestGetFavoriteCars();
            setFavoriteCars(res?.metadata || []);
        } catch (error) {
            console.error('Error loading favorite cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (carId) => {
        try {
            setProcessingId(carId);
            await requestToggleFavoriteCar(carId);
            setFavoriteCars((prev) => prev.filter((car) => car._id !== carId));
        } catch (error) {
            console.error('Error removing favorite car:', error);
        } finally {
            setProcessingId('');
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('en-US').format(price || 0) + ' VND';

    if (!cookies.get('logged')) {
        return (
            <div className="bg-[#111827]/80 backdrop-blur-sm border border-white/6 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 bg-white/6 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-7 h-7 text-white/40" />
                </div>
                <h2 className="text-white text-lg font-semibold mb-2">Please sign in to view your favorites</h2>
                <p className="text-white/50 text-sm mb-5">Save your favorite cars and access them anytime.</p>
                <button
                    onClick={() => navigate('/account/login')}
                    className="px-5 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl text-sm font-medium transition-colors"
                >
                    Go to login
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <div>
                    <h1 className="text-xl font-bold text-white">Favorite Cars</h1>
                    <p className="text-white/40 text-sm mt-1">Manage your saved cars</p>
                </div>
                <div className="bg-[#111827]/80 border border-white/6 rounded-2xl p-12 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Favorite Cars</h1>
                    <p className="text-white/40 text-sm mt-1">
                        {favoriteCars.length > 0
                            ? `You have saved ${favoriteCars.length} favorite cars`
                            : 'No cars saved yet'}
                    </p>
                </div>
            </div>

            {favoriteCars.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111827]/80 backdrop-blur-sm border border-white/6 rounded-2xl p-10 text-center"
                >
                    <div className="w-16 h-16 bg-white/4 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Car className="w-8 h-8 text-white/25" />
                    </div>
                    <h2 className="text-white text-lg font-semibold mb-2">No favorite cars yet</h2>
                    <p className="text-white/45 text-sm mb-5">Browse cars and tap Favorite to save them here.</p>
                    <Link
                        to="/cars"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl text-sm font-medium transition-colors"
                    >
                        <span>Explore cars</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {favoriteCars.map((car, index) => {
                        const image = car?.images?.[0]
                            ? `${import.meta.env.VITE_URL_IMAGE}${car.images[0]}`
                            : 'https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop';

                        return (
                            <motion.div
                                key={car._id}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.04 }}
                                className="bg-[#111827]/80 backdrop-blur-sm border border-white/6 rounded-2xl overflow-hidden"
                            >
                                <div className="h-44 overflow-hidden bg-white/4">
                                    <img src={image} alt={car.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="min-w-0">
                                            <h3 className="text-white text-base font-semibold truncate">{car.name}</h3>
                                            <p className="text-white/45 text-xs mt-1">
                                                {car.brand?.name || 'Unknown brand'}
                                                {car.category?.name ? ` • ${car.category.name}` : ''}
                                            </p>
                                        </div>
                                        <span className="text-[#0066FF] text-sm font-semibold whitespace-nowrap">
                                            {formatPrice(car.price)}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/cars/${car.slug}`}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white/6 hover:bg-white/10 text-white text-sm rounded-xl transition-colors"
                                        >
                                            <span>View details</span>
                                        </Link>
                                        <button
                                            onClick={() => handleRemoveFavorite(car._id)}
                                            disabled={processingId === car._id}
                                            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-50 rounded-xl transition-colors"
                                        >
                                            {processingId === car._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FavoriteCarsPage;
