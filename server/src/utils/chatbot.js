const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CarModel = require('../models/cars.model');

/**
 * Format giá tiền VND
 */
const formatPrice = (price) => {
    if (!price) return 'Không có thông tin';
    if (price >= 1000000000) {
        return `${(price / 1000000000).toFixed(1)} tỷ VND`;
    }
    return `${(price / 1000000).toFixed(0)} triệu VND`;
};

/**
 * Lấy danh sách xe từ DB để cung cấp cho AI
 */
const getCarCatalog = async () => {
    try {
        const cars = await CarModel.find({ status: 'available' })
            .populate('brand', 'name')
            .populate('category', 'name')
            .lean();

        return cars
            .map(
                (car) =>
                    `- ${car.name} | Giá: ${formatPrice(car.price)}${car.discountPrice ? ` (KM: ${formatPrice(car.discountPrice)})` : ''} | ${car.seats} chỗ | ${car.fuelType} | ${car.transmission} | Hãng: ${car.brand?.name || 'N/A'} | Loại: ${car.category?.name || 'N/A'} | Năm: ${car.year}`,
            )
            .join('\n');
    } catch (error) {
        console.error('Error fetching car catalog:', error);
        return 'Không thể tải danh sách xe.';
    }
};

/**
 * System prompt cho chatbot tư vấn xe
 */
const buildSystemPrompt = (carCatalog) => {
    return `Bạn là AutoBot – chuyên viên tư vấn ô tô cao cấp tại showroom, thân thiện, chuyên nghiệp và am hiểu thị trường xe Việt Nam.

## NHIỆM VỤ:
- Tư vấn khách hàng chọn xe phù hợp dựa trên nhu cầu
- Trả lời tự nhiên, lịch sự như nhân viên showroom cao cấp
- Luôn gợi ý xe CỤ THỂ từ danh sách xe có sẵn

## THU THẬP THÔNG TIN KHÁCH HÀNG:
Hãy hỏi và tìm hiểu dần các thông tin sau (KHÔNG hỏi tất cả cùng lúc, hỏi tự nhiên theo ngữ cảnh):
1. Ngân sách dự kiến
2. Mục đích sử dụng (gia đình, kinh doanh, cá nhân, off-road, đi phố...)
3. Số chỗ ngồi mong muốn
4. Loại nhiên liệu (Xăng, Dầu, Điện, Hybrid)
5. Hộp số (Số sàn, Tự động)
6. Thương hiệu yêu thích
7. Có nhu cầu trả góp không
8. Có muốn đặt lịch lái thử không

## DANH SÁCH XE CÓ SẴN:
${carCatalog}

## QUY TẮC TRẢ LỜI:
- Trả lời bằng tiếng Việt
- Sử dụng emoji phù hợp để thân thiện
- Khi gợi ý xe, nêu rõ tên xe, giá, và tại sao phù hợp
- Nếu khách hỏi về trả góp, ước tính sơ bộ (lãi suất ~7-8%/năm)
- Nếu khách muốn lái thử, hướng dẫn đặt lịch

## BẮT BUỘC: ĐÁNH GIÁ KHẢ NĂNG MUA XE
Sau MỖII phản hồi, bạn PHẢI thêm một block JSON ở cuối cùng (sau nội dung trả lời), được bao bọc trong tag <INTEREST_JSON> như sau:

<INTEREST_JSON>
{"interestScore": number, "level": "Cold | Warm | Hot", "reason": "Giải thích ngắn gọn"}
</INTEREST_JSON>

Quy tắc đánh giá:
- 0-40 → Cold (chỉ tham khảo, hỏi chung chung)
- 41-70 → Warm (quan tâm, hỏi cụ thể về xe/giá/tính năng)
- 71-100 → Hot (hỏi trả góp, khuyến mãi, đặt lịch lái thử, so sánh nhiều xe, hỏi thời gian giao xe)

Tiêu chí đánh giá:
- Hỏi về giá cụ thể → +10-15 điểm
- Hỏi về trả góp → +15-20 điểm
- Hỏi khuyến mãi → +10-15 điểm
- Yêu cầu đặt lịch lái thử → +20-25 điểm
- So sánh nhiều xe → +10-15 điểm
- Hỏi thời gian giao xe → +15-20 điểm
- Chỉ chào hỏi/hỏi chung → 5-15 điểm`;
};

/**
 * Chat với AI bot
 * @param {Array} messages - Lịch sử tin nhắn [{role, content}]
 * @returns {Object} { reply, interestScore, level, reason }
 */
const chatWithBot = async (messages) => {
    try {
        // Lấy danh sách xe
        const carCatalog = await getCarCatalog();
        const systemPrompt = buildSystemPrompt(carCatalog);

        // Chuẩn bị messages cho Groq
        const groqMessages = [
            { role: 'system', content: systemPrompt },
            ...messages.map((m) => ({
                role: m.role,
                content: m.content,
            })),
        ];

        // Gọi Groq API
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 1500,
        });

        const fullResponse = completion.choices[0]?.message?.content || '';

        // Parse interest score từ response
        let interestData = { interestScore: 10, level: 'Cold', reason: 'Chưa đủ thông tin đánh giá' };

        const jsonMatch = fullResponse.match(/<INTEREST_JSON>\s*([\s\S]*?)\s*<\/INTEREST_JSON>/);
        if (jsonMatch) {
            try {
                interestData = JSON.parse(jsonMatch[1]);
                // Validate
                interestData.interestScore = Math.min(100, Math.max(0, Number(interestData.interestScore) || 0));
                if (!['Cold', 'Warm', 'Hot'].includes(interestData.level)) {
                    if (interestData.interestScore <= 40) interestData.level = 'Cold';
                    else if (interestData.interestScore <= 70) interestData.level = 'Warm';
                    else interestData.level = 'Hot';
                }
            } catch (e) {
                console.error('Error parsing interest JSON:', e);
            }
        }

        // Loại bỏ JSON block khỏi reply hiển thị
        const reply = fullResponse.replace(/<INTEREST_JSON>[\s\S]*?<\/INTEREST_JSON>/, '').trim();

        return {
            reply,
            interestScore: interestData.interestScore,
            level: interestData.level,
            reason: interestData.reason || '',
        };
    } catch (error) {
        console.error('Chatbot Error:', error);
        throw new Error(`Lỗi chatbot: ${error.message}`);
    }
};

module.exports = {
    chatWithBot,
    formatPrice,
};
