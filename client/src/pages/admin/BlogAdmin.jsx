import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    X,
    Upload,
    Loader2,
    FileText,
    Calendar,
    Image as ImageIcon,
    Save,
    Newspaper,
} from 'lucide-react';
import { message, Popconfirm } from 'antd';
import { Editor } from '@tinymce/tinymce-react';

import {
    requestUploadImage,
    requestCreateBlog,
    requestGetAllBlog,
    requestDeleteBlog,
    requestUpdateBlog,
} from '../../config/BlogRequest';

const BlogAdmin = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [previewBlog, setPreviewBlog] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({ title: '', content: '', image: '' });
    const [fileList, setFileList] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await requestGetAllBlog();
            setBlogs(res.metadata || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingBlog(null);
        setForm({ title: '', content: '', image: '' });
        setFileList(null);
        setImagePreview('');
        setIsModalOpen(true);
    };

    const openEditModal = (blog) => {
        setEditingBlog(blog);
        setForm({ title: blog.title, content: blog.content, image: blog.image });
        setFileList(null);
        setImagePreview(blog.image ? `${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${blog.image}` : '');
        setIsModalOpen(true);
    };

    const openPreview = (blog) => {
        setPreviewBlog(blog);
        setIsPreviewOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteBlog(id);
            message.success('Article deleted successfully');
            fetchBlogs();
        } catch (err) {
            message.error('Failed to delete article');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            message.error('Image must be smaller than 2MB');
            return;
        }
        setFileList(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        const content = editorRef.current ? editorRef.current.getContent() : '';

        if (!form.title.trim()) {
            message.error('Please enter a title');
            return;
        }
        if (!content.trim()) {
            message.error('Please enter content');
            return;
        }
        if (!fileList && !editingBlog?.image) {
            message.error('Please select an image');
            return;
        }

        setSubmitting(true);
        try {
            let imageName = editingBlog?.image || '';

            if (fileList) {
                const formData = new FormData();
                formData.append('image', fileList);
                const uploadRes = await requestUploadImage(formData);
                imageName = uploadRes?.metadata || '';
            }

            const blogData = { title: form.title.trim(), content, image: imageName };

            if (editingBlog) {
                await requestUpdateBlog(editingBlog._id, { id: editingBlog._id, ...blogData });
                message.success('Article updated successfully');
            } else {
                await requestCreateBlog(blogData);
                message.success('Article created successfully');
            }

            setIsModalOpen(false);
            fetchBlogs();
        } catch (err) {
            message.error('An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBlogs = blogs.filter((b) => b.title?.toLowerCase().includes(searchQuery.toLowerCase()));

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Article Management</h1>
                    <p className="text-white/60 mt-1">Manage news and articles</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Article
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0066FF]/20 rounded-xl flex items-center justify-center">
                            <Newspaper className="w-6 h-6 text-[#0066FF]" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">Total articles</p>
                            <p className="text-2xl font-bold text-white">{blogs.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">Articles today</p>
                            <p className="text-2xl font-bold text-white">
                                {
                                    blogs.filter((b) => {
                                        const today = new Date().toDateString();
                                        return new Date(b.createdAt).toDateString() === today;
                                    }).length
                                }
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-white/60 text-sm">This week</p>
                            <p className="text-2xl font-bold text-white">
                                {
                                    blogs.filter((b) => {
                                        const weekAgo = new Date();
                                        weekAgo.setDate(weekAgo.getDate() - 7);
                                        return new Date(b.createdAt) > weekAgo;
                                    }).length
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#0066FF]"
                    />
                </div>
            </div>

            {/* Blog List */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-20 text-white/50">
                        <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No articles found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Article</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Created date</th>
                                    <th className="text-left py-4 px-4 text-white/60 text-sm font-medium">Update</th>
                                    <th className="text-right py-4 px-4 text-white/60 text-sm font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBlogs.map((blog) => (
                                    <tr
                                        key={blog._id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                {blog.image && (
                                                    <img
                                                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${blog.image}`}
                                                        alt=""
                                                        className="w-14 h-10 rounded-lg object-cover bg-white/5"
                                                    />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-white font-medium text-sm truncate max-w-[300px]">
                                                        {blog.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-white/50 text-sm">{formatDate(blog.createdAt)}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-white/50 text-sm">{formatDate(blog.updatedAt)}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openPreview(blog)}
                                                    className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                    title="Carm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(blog)}
                                                    className="p-2 text-[#0066FF] hover:bg-[#0066FF]/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <Popconfirm
                                                    title="Delete article"
                                                    description="Are you sure you want to delete?"
                                                    onConfirm={() => handleDelete(blog._id)}
                                                    okText="Delete"
                                                    cancelText="Cancel"
                                                >
                                                    <button
                                                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </Popconfirm>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a2332] rounded-2xl w-full max-w-3xl my-8 overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">
                                    {editingBlog ? 'Edit article' : 'Add Article mới'}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-5 space-y-5">
                                {/* Title */}
                                <div>
                                    <label className="block text-white/60 text-xs font-medium mb-2">
                                        Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                        placeholder="Enter article title"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#0066FF]"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-white/60 text-xs font-medium mb-2">
                                        Image <span className="text-red-400">*</span>
                                    </label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative group border-2 border-dashed border-white/10 hover:border-[#0066FF]/40 rounded-xl p-4 cursor-pointer transition-colors"
                                    >
                                        {imagePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                                                    <p className="text-white text-sm">Click to change</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 py-6 text-white/40">
                                                <ImageIcon className="w-8 h-8" />
                                                <p className="text-sm">Click to select image</p>
                                                <p className="text-xs text-white/20">Max 2MB</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* Content Editor */}
                                <div>
                                    <label className="block text-white/60 text-xs font-medium mb-2">
                                        Content <span className="text-red-400">*</span>
                                    </label>
                                    <div className="rounded-xl overflow-hidden border border-white/10">
                                        <Editor
                                            apiKey="g2qwk2y6zg5bza6a968m294w0md3zbil24ymnczb48mcys7m"
                                            onInit={(evt, editor) => (editorRef.current = editor)}
                                            initialValue={editingBlog ? editingBlog.content : ''}
                                            init={{
                                                height: 400,
                                                menubar: true,
                                                plugins: [
                                                    'advlist',
                                                    'autolink',
                                                    'lists',
                                                    'link',
                                                    'image',
                                                    'charmap',
                                                    'preview',
                                                    'anchor',
                                                    'searchreplace',
                                                    'visualblocks',
                                                    'code',
                                                    'fullscreen',
                                                    'insertdatetime',
                                                    'media',
                                                    'table',
                                                    'wordcount',
                                                ],
                                                toolbar:
                                                    'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                                                content_style:
                                                    'body { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; }',
                                                skin: 'oxide-dark',
                                                content_css: 'dark',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-5 border-t border-white/10 flex gap-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {editingBlog ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview Modal */}
            <AnimatePresence>
                {isPreviewOpen && previewBlog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
                        onClick={() => setIsPreviewOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a2332] rounded-2xl w-full max-w-2xl my-8 overflow-hidden"
                        >
                            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Article preview</h3>
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                                <h2 className="text-xl font-bold text-white">{previewBlog.title}</h2>
                                {previewBlog.image && (
                                    <img
                                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${previewBlog.image}`}
                                        alt={previewBlog.title}
                                        className="w-full rounded-xl object-cover max-h-[300px]"
                                    />
                                )}
                                <div className="flex items-center gap-4 text-white/40 text-xs">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Created date: {formatDate(previewBlog.createdAt)}
                                    </span>
                                    <span>Update: {formatDate(previewBlog.updatedAt)}</span>
                                </div>
                                <div
                                    className="prose prose-invert prose-sm max-w-none text-white/80"
                                    dangerouslySetInnerHTML={{ __html: previewBlog.content }}
                                />
                            </div>
                            <div className="p-5 border-t border-white/10 flex gap-3">
                                <button
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setIsPreviewOpen(false);
                                        openEditModal(previewBlog);
                                    }}
                                    className="flex-1 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Chỉnh sửa
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlogAdmin;
