import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react';
import { message } from 'antd';
import {
    requestGetAllBrands,
    requestCreateBrand,
    requestUpdateBrand,
    requestDeleteBrand,
} from '../../config/BrandRequest';

const BrandManager = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const res = await requestGetAllBrands();
            setBrands(res.metadata || []);
        } catch (error) {
            message.error('Cannot load brand list');
        } finally {
            setLoading(false);
        }
    };

    const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleOpenModal = (brand = null) => {
        if (brand) {
            setSelectedBrand(brand);
            setFormData({ name: brand.name });
        } else {
            setSelectedBrand(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBrand(null);
        setFormData({ name: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            message.warning('Please enter brand name');
            return;
        }

        try {
            setSubmitting(true);
            if (selectedBrand) {
                await requestUpdateBrand(selectedBrand._id, formData);
                message.success('Update brands successfully');
            } else {
                await requestCreateBrand(formData);
                message.success('Add brands successfully');
            }
            handleCloseModal();
            fetchBrands();
        } catch (error) {
            message.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setSubmitting(true);
            await requestDeleteBrand(selectedBrand._id);
            message.success('Delete brands successfully');
            setIsDeleteModalOpen(false);
            setSelectedBrand(null);
            fetchBrands();
        } catch (error) {
            message.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteModal = (brand) => {
        setSelectedBrand(brand);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Brand Management</h1>
                    <p className="text-white/50 text-sm mt-1">Manage the list of brands in the system</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl text-white text-sm font-semibold transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add brands</span>
                </motion.button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search brands..."
                    className="w-full h-10 pl-10 pr-4 bg-[#1E293B] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF]/50 transition-all"
                />
            </div>

            {/* Brands Table */}
            <div className="bg-[#1E293B] border border-white/5 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                    </div>
                ) : filteredBrands.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/50">No brands found</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-white/40 text-xs font-medium px-5 py-4">STT</th>
                                <th className="text-left text-white/40 text-xs font-medium px-5 py-4">Brand name</th>
                                <th className="text-left text-white/40 text-xs font-medium px-5 py-4">Created date</th>
                                <th className="text-right text-white/40 text-xs font-medium px-5 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBrands.map((brand, idx) => (
                                <motion.tr
                                    key={brand._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-5 py-4 text-white/50 text-sm">{idx + 1}</td>
                                    <td className="px-5 py-4">
                                        <span className="text-white text-sm font-medium">{brand.name}</span>
                                    </td>
                                    <td className="px-5 py-4 text-white/50 text-sm">
                                        {new Date(brand.createdAt).toLocaleDateString('en-US')}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(brand)}
                                                className="p-2 text-white/50 hover:text-[#0066FF] hover:bg-[#0066FF]/10 rounded-lg transition-all"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(brand)}
                                                className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                                <h2 className="text-white font-semibold">
                                    {selectedBrand ? 'Edit brand' : 'Add new brand'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-white/50 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-white/70 text-xs font-medium mb-1.5">
                                        Brand name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="VD: Mercedes-Benz, BMW, Audi..."
                                        className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF]/50 transition-all"
                                        autoFocus
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] disabled:opacity-50 rounded-xl text-white text-sm font-semibold transition-all"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        <span>{selectedBrand ? 'Update' : 'Create'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsDeleteModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-[#1E293B] border border-white/10 rounded-2xl shadow-2xl p-6 text-center"
                        >
                            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-2">Delete brands?</h3>
                            <p className="text-white/50 text-sm mb-6">
                                Are you sure you want to delete{' '}
                                <span className="text-white font-medium">{selectedBrand?.name}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl text-white text-sm font-semibold transition-all"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>Delete</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BrandManager;
