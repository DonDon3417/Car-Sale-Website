import { motion } from 'framer-motion';
import { ArrowRight, Calendar } from 'lucide-react';
import newsTech from '../assets/news-tech.png';
import newsEvent from '../assets/news-event.png';
import newsReview from '../assets/news-review.png';

const News = () => {
    const articles = [
        {
            id: 1,
            image: newsTech,
            tag: 'Công nghệ',
            tagColor: '#0066FF',
            title: 'Công nghệ lái tự động Level 4 sẽ ra mắt năm 2027',
            date: '05/02/2026',
        },
        {
            id: 2,
            image: newsEvent,
            tag: 'Sự kiện',
            tagColor: '#E10600',
            title: 'Triển lãm ô tô Việt Nam 2026 thu hút 50,000 khách',
            date: '01/02/2026',
        },
        {
            id: 3,
            image: newsReview,
            tag: 'Đánh giá',
            tagColor: '#10B981',
            title: 'Top 5 xe SUV tốt nhất 2026: Lựa chọn nào?',
            date: '28/01/2026',
        },
    ];

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <section className="py-10 lg:py-14">
            <div className="max-w-[1000px] mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-[1px] bg-[#0066FF]" />
                            <span className="text-[#0066FF] text-[10px] font-semibold tracking-[0.15em] uppercase">
                                Tin tức
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Tin tức ô tô</h2>
                        <p className="text-white/50 text-xs">Cập nhật xu hướng và công nghệ mới nhất</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/20 hover:border-[#0066FF] rounded-lg text-white text-xs font-medium transition-all"
                    >
                        <span>Xem tất cả</span>
                        <ArrowRight className="w-3 h-3" />
                    </motion.button>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {articles.map((article) => (
                        <motion.article
                            key={article.id}
                            variants={cardVariants}
                            whileHover={{ y: -4 }}
                            className="group bg-[#111827] border border-white/5 rounded-xl overflow-hidden transition-all hover:border-white/10 hover:shadow-lg"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-transparent" />
                                <span
                                    className="absolute top-2 left-2 px-2 py-0.5 rounded text-white text-[9px] font-semibold uppercase tracking-wider backdrop-blur-sm"
                                    style={{ backgroundColor: `${article.tagColor}CC` }}
                                >
                                    {article.tag}
                                </span>
                            </div>
                            <div className="p-3">
                                <div className="flex items-center gap-1 text-white/40 text-[10px] mb-1.5">
                                    <Calendar className="w-2.5 h-2.5" />
                                    <span>{article.date}</span>
                                </div>
                                <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-[#0066FF] transition-colors">
                                    {article.title}
                                </h3>
                                <button className="inline-flex items-center gap-1 text-[#0066FF] text-xs font-medium group-hover:gap-2 transition-all">
                                    <span>Đọc thêm</span>
                                    <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default News;
