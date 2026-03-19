import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ArrowLeft, Loader2, Clock, Share2 } from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { requestGetBlogById, requestGetAllBlog } from '../config/BlogRequest';

const BlogDetailPage = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [blogRes, allRes] = await Promise.all([requestGetBlogById(id), requestGetAllBlog()]);
                setBlog(blogRes.metadata);
                const related = (allRes.metadata || []).filter((b) => b._id !== id).slice(0, 3);
                setRelatedBlogs(related);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    const getReadingTime = (html) => {
        const text = html?.replace(/<[^>]*>/g, '') || '';
        const words = text.split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    };

    const stripHtml = (html) => {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: blog.title, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f]">
                <Header />
                <div className="flex items-center justify-center pt-40 pb-20">
                    <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-[#0a0a0f]">
                <Header />
                <div className="flex flex-col items-center justify-center pt-40 pb-20 text-center px-4">
                    <h2 className="text-white text-2xl font-bold mb-2">Article not found</h2>
                    <p className="text-white/50 mb-6">This article does not exist or has been removed.</p>
                    <Link
                        to="/tin-tuc"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to news
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            <Header />

            {/* Hero Image */}
            <div className="relative pt-20">
                <div className="relative h-[350px] md:h-[450px] overflow-hidden">
                    <img
                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${blog.image}`}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
                </div>
            </div>

            {/* Content */}
            <article className="relative max-w-[800px] mx-auto px-4 -mt-32 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Back link */}
                    <Link
                        to="/tin-tuc"
                        className="inline-flex items-center gap-2 text-white/40 hover:text-white text-xs mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to news
                    </Link>

                    {/* Meta */}
                    <div className="flex items-center flex-wrap gap-4 text-white/40 text-xs mb-4">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(blog.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {getReadingTime(blog.content)} min read
                        </span>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 hover:text-[#0066FF] transition-colors ml-auto"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            Share
                        </button>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-8 leading-tight">{blog.title}</h1>

                    {/* Article Body */}
                    <div
                        className="prose prose-invert prose-lg max-w-none
                            prose-headings:text-white prose-headings:font-bold
                            prose-p:text-white/70 prose-p:leading-relaxed
                            prose-a:text-[#0066FF] prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-xl prose-img:w-full
                            prose-strong:text-white
                            prose-blockquote:border-[#0066FF] prose-blockquote:bg-white/5 prose-blockquote:rounded-r-xl prose-blockquote:py-1
                            prose-li:text-white/70
                            prose-code:text-[#0066FF] prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                        "
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </motion.div>
            </article>

            {/* Related Posts */}
            {relatedBlogs.length > 0 && (
                <section className="border-t border-white/5 py-16">
                    <div className="max-w-[1100px] mx-auto px-4">
                        <h2 className="text-xl font-bold text-white mb-8">Related articles</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedBlogs.map((item, index) => (
                                <motion.div
                                    key={item._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Link to={`/tin-tuc/${item._id}`}>
                                        <article className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-[#0066FF]/30 hover:bg-white/[0.05] transition-all duration-500 h-full flex flex-col">
                                            <div className="relative overflow-hidden aspect-[16/10]">
                                                <img
                                                    src={`${import.meta.env.VITE_URL_IMAGE}/uploads/blogs/${item.image}`}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                            </div>
                                            <div className="p-5 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 text-white/40 text-xs mb-2.5">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{formatDate(item.createdAt)}</span>
                                                </div>
                                                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[#0066FF] transition-colors leading-snug">
                                                    {item.title}
                                                </h3>
                                                <p className="text-white/40 text-xs line-clamp-2 flex-1">
                                                    {stripHtml(item.content)}
                                                </p>
                                            </div>
                                        </article>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
};

export default BlogDetailPage;
