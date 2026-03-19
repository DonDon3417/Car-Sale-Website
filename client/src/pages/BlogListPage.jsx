import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Search, Loader2, Newspaper } from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestGetAllBlog } from '../config/BlogRequest';

const BlogListPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await requestGetAllBlog();
                setBlogs(res.metadata || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    const filteredBlogs = blogs.filter((b) => b.title?.toLowerCase().includes(searchQuery.toLowerCase()));

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    const stripHtml = (html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <Header />

            {/* Hero */}
            <section className="relative pt-28 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0066FF]/10 via-transparent to-transparent" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#0066FF]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px]" />
                <div className="relative max-w-[1100px] mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 bg-[#0066FF]/10 text-[#0066FF] text-xs font-medium rounded-full mb-4 border border-[#0066FF]/20">
                            News & Article
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                            Automotive <span className="text-[#0066FF]">News</span>
                        </h1>
                        <p className="text-white/50 text-sm md:text-base max-w-md mx-auto">
                            Get the latest updates on the car market, reviews, and trends
                        </p>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-lg mx-auto mt-8"
                    >
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search articles..."
                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#0066FF]/50 transition-colors backdrop-blur-sm"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="max-w-[1100px] mx-auto px-4 pb-20">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-20">
                        <Newspaper className="w-16 h-16 mx-auto mb-4 text-white/20" />
                        <p className="text-white/50 text-lg">No articles found</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Post (first one) */}
                        {filteredBlogs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mb-10"
                            >
                                <Link to={`/tin-tuc/${filteredBlogs[0]._id}`}>
                                    <div className="group relative bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-[#0066FF]/30 transition-all duration-500">
                                        <div className="grid md:grid-cols-2 gap-0">
                                            <div className="relative overflow-hidden aspect-[16/10] md:aspect-auto">
                                                <img
                                                    src={`${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${filteredBlogs[0].image}`}
                                                    alt={filteredBlogs[0].title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:bg-gradient-to-r" />
                                                <span className="absolute top-4 left-4 px-3 py-1 bg-[#0066FF] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                    Newest
                                                </span>
                                            </div>
                                            <div className="p-6 md:p-8 flex flex-col justify-center">
                                                <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{formatDate(filteredBlogs[0].createdAt)}</span>
                                                </div>
                                                <h2 className="text-xl md:text-2xl font-bold text-white mb-3 line-clamp-2 group-hover:text-[#0066FF] transition-colors">
                                                    {filteredBlogs[0].title}
                                                </h2>
                                                <p className="text-white/50 text-sm line-clamp-3 mb-5">
                                                    {stripHtml(filteredBlogs[0].content)}
                                                </p>
                                                <div className="flex items-center gap-2 text-[#0066FF] text-sm font-medium group-hover:gap-3 transition-all">
                                                    <span>Read more</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )}

                        {/* Rest of the blogs */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBlogs.slice(1).map((blog, index) => (
                                <motion.div
                                    key={blog._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Link to={`/tin-tuc/${blog._id}`}>
                                        <article className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-[#0066FF]/30 hover:bg-white/[0.05] transition-all duration-500 h-full flex flex-col">
                                            <div className="relative overflow-hidden aspect-[16/10]">
                                                <img
                                                    src={`${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${blog.image}`}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            </div>
                                            <div className="p-5 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 text-white/40 text-xs mb-2.5">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{formatDate(blog.createdAt)}</span>
                                                </div>
                                                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[#0066FF] transition-colors leading-snug">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-white/40 text-xs line-clamp-2 mb-4 flex-1">
                                                    {stripHtml(blog.content)}
                                                </p>
                                                <div className="flex items-center gap-1 text-[#0066FF] text-xs font-medium group-hover:gap-2 transition-all">
                                                    <span>Read more</span>
                                                    <ArrowRight className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </section>

            <Footer />
        </div>
    );
};

export default BlogListPage;
