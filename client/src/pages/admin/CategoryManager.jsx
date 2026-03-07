import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Search, Loader2 } from 'lucide-react';
import { message } from 'antd';
import {
    requestGetAllCategories,
    requestCreateCategory,
    requestUpdateCategory,
    requestDeleteCategory,
} from '../../config/CategoryRequest';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await requestGetAllCategories();
            setCategories(res.metadata || []);
        } catch (error) {
            message.error('Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleOpenModal = (category = null) => {
        if (category) {
            setSelectedCategory(category);
            setFormData({ name: category.name });
        } else {
            setSelectedCategory(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setFormData({ name: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            message.warning('Vui lòng nhập tên danh mục');
            return;
        }

        try {
            setSubmitting(true);
            if (selectedCategory) {
                await requestUpdateCategory(selectedCategory._id, formData);
                message.success('Cập nhật danh mục thành công');
            } else {
                await requestCreateCategory(formData);
                message.success('Thêm danh mục thành công');
            }
            handleCloseModal();
            fetchCategories();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setSubmitting(true);
            await requestDeleteCategory(selectedCategory._id);
            message.success('Xóa danh mục thành công');
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
            fetchCategories();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const openDeleteModal = (category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Quản lý danh mục</h1>
                    <p className="text-white/50 text-sm mt-1">Quản lý danh mục xe (Sedan, SUV, Sport...)</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl text-white text-sm font-semibold transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm danh mục</span>
                </motion.button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm danh mục..."
                    className="w-full h-10 pl-10 pr-4 bg-[#1E293B] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF]/50 transition-all"
                />
            </div>

            {/* Categories Table */}
            <div className="bg-[#1E293B] border border-white/5 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/50">Chưa có danh mục nào</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="text-left text-white/40 text-xs font-medium px-5 py-4">STT</th>
                                <th className="text-left text-white/40 text-xs font-medium px-5 py-4">Tên danh mục</th>
                                <th className="text-left text-white/40 text-xs font-medium px-5 py-4">Ngày tạo</th>
                                <th className="text-right text-white/40 text-xs font-medium px-5 py-4">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category, idx) => (
                                <motion.tr
                                    key={category._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                                >
                                    <td className="px-5 py-4 text-white/50 text-sm">{idx + 1}</td>
                                    <td className="px-5 py-4">
                                        <span className="text-white text-sm font-medium">{category.name}</span>
                                    </td>
                                    <td className="px-5 py-4 text-white/50 text-sm">
                                        {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(category)}
                                                className="p-2 text-white/50 hover:text-[#0066FF] hover:bg-[#0066FF]/10 rounded-lg transition-all"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(category)}
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
                                    {selectedCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
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
                                        Tên danh mục *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="VD: Sedan, SUV, Sport..."
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
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] disabled:opacity-50 rounded-xl text-white text-sm font-semibold transition-all"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        <span>{selectedCategory ? 'Cập nhật' : 'Thêm mới'}</span>
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
                            <h3 className="text-white font-semibold text-lg mb-2">Xóa danh mục?</h3>
                            <p className="text-white/50 text-sm mb-6">
                                Bạn có chắc muốn xóa{' '}
                                <span className="text-white font-medium">{selectedCategory?.name}</span>?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-all"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-xl text-white text-sm font-semibold transition-all"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    <span>Xóa</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoryManager;
