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
 * Tạo prompt mô tả chi tiết về một xe
 */
const buildCarDescription = (car) => {
    const specs = car.specifications || {};

    return `
**${car.name}**
- Giá: ${formatPrice(car.price)}${car.discountPrice ? ` (Giảm còn ${formatPrice(car.discountPrice)})` : ''}
- Năm sản xuất: ${car.year || 'N/A'}
- Nhiên liệu: ${car.fuelType || 'N/A'}
- Hộp số: ${car.transmission || 'N/A'}
- Số chỗ ngồi: ${car.seats || 'N/A'}
- Động cơ: ${car.engine || 'N/A'}
- Tiêu hao nhiên liệu: ${car.mileage ? `${car.mileage} L/100km` : 'N/A'}
- Công suất: ${specs.horsepower || 'N/A'}
- Mô-men xoắn: ${specs.torque || 'N/A'}
- Kích thước (DxRxC): ${specs.length || 'N/A'} x ${specs.width || 'N/A'} x ${specs.height || 'N/A'}
- Chiều dài cơ sở: ${specs.wheelBase || 'N/A'}
- Màu sắc có sẵn: ${car.colors?.map((c) => c.name).join(', ') || 'N/A'}
- Phiên bản: ${car.versions?.map((v) => `${v.name} (${formatPrice(v.price)})`).join(', ') || 'N/A'}
- Thương hiệu: ${car.brand?.name || 'N/A'}
- Loại xe: ${car.category?.name || 'N/A'}
    `.trim();
};

/**
 * Map requirement ID sang mô tả tiếng Việt
 */
const requirementDescriptions = {
    family: 'Phù hợp cho gia đình (đánh giá độ rộng rãi, an toàn, tiện nghi)',
    fuel_efficiency: 'Tiết kiệm nhiên liệu (so sánh mức tiêu hao, chi phí vận hành)',
    investment: 'Đầu tư dài hạn (phân tích giá trị giữ lại, chi phí bảo dưỡng, độ bền)',
    performance: 'Hiệu suất cao (so sánh công suất, tốc độ, khả năng vận hành)',
    budget: 'Phù hợp ngân sách (phân tích giá trị đồng tiền bỏ ra, chi phí tổng thể)',
    daily_use: 'Sử dụng hàng ngày (đánh giá sự tiện lợi trong di chuyển hàng ngày, đô thị)',
};

/**
 * AI phân tích so sánh 2 xe
 * @param {string} car1Id - ID xe thứ nhất
 * @param {string} car2Id - ID xe thứ hai
 * @param {string[]} requirements - Mảng các requirement IDs
 * @param {string} customRequirement - Yêu cầu tùy chỉnh từ người dùng
 */
const analyzeCarComparison = async (car1Id, car2Id, requirements = [], customRequirement = '') => {
    try {
        // Lấy thông tin chi tiết 2 xe
        const [car1, car2] = await Promise.all([
            CarModel.findById(car1Id).populate('brand category').lean(),
            CarModel.findById(car2Id).populate('brand category').lean(),
        ]);

        if (!car1 || !car2) {
            throw new Error('Không tìm thấy thông tin xe');
        }

        // Xây dựng mô tả xe
        const car1Description = buildCarDescription(car1);
        const car2Description = buildCarDescription(car2);

        // Xây dựng danh sách tiêu chí đánh giá
        const criteriaList = requirements
            .filter((req) => requirementDescriptions[req])
            .map((req) => `- ${requirementDescriptions[req]}`)
            .join('\n');

        // Xây dựng prompt
        const analysisPrompt = `
Bạn là chuyên gia tư vấn ô tô với nhiều năm kinh nghiệm. Hãy phân tích và so sánh 2 xe sau đây một cách chi tiết, khách quan và dễ hiểu.

## THÔNG TIN XE 1:
${car1Description}

## THÔNG TIN XE 2:
${car2Description}

## TIÊU CHÍ ĐÁNH GIÁ:
${criteriaList || 'Đánh giá tổng quan các yếu tố quan trọng khi mua xe.'}

${customRequirement ? `## YÊU CẦU RIÊNG CỦA KHÁCH HÀNG:\n${customRequirement}` : ''}

## YÊU CẦU TRẢ LỜI:
Hãy phân tích theo cấu trúc JSON sau (CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC):
{
    "summary": "Tóm tắt ngắn gọn kết quả so sánh (2-3 câu)",
    "recommendation": "Tên xe được đề xuất",
    "recommendationReason": "Lý do đề xuất xe này (1-2 câu)",
    "details": [
        {
            "category": "Tên danh mục đánh giá",
            "car1Score": điểm từ 1-10,
            "car2Score": điểm từ 1-10,
            "analysis": "Phân tích chi tiết cho danh mục này"
        }
    ],
    "prosAndCons": {
        "car1": {
            "pros": ["Ưu điểm 1", "Ưu điểm 2"],
            "cons": ["Nhược điểm 1", "Nhược điểm 2"]
        },
        "car2": {
            "pros": ["Ưu điểm 1", "Ưu điểm 2"],
            "cons": ["Nhược điểm 1", "Nhược điểm 2"]
        }
    },
    "finalVerdict": "Kết luận cuối cùng và lời khuyên cho người mua"
}
        `.trim();

        // Gọi Groq API
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content:
                        'Bạn là AutoBot – chuyên viên tư vấn ô tô thân thiện, am hiểu thị trường xe Việt Nam và luôn đưa ra lời khuyên khách quan dựa trên nhu cầu thực tế của khách hàng. Trả lời bằng tiếng Việt.',
                },
                { role: 'user', content: analysisPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const responseText = completion.choices[0]?.message?.content || '';

        // Parse JSON từ response
        let analysisResult;
        try {
            // Tìm JSON trong response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Không tìm thấy JSON trong response');
            }
        } catch (parseError) {
            console.error('Error parsing AI response:', parseError);
            // Trả về response dạng text nếu parse JSON thất bại
            analysisResult = {
                summary: responseText,
                recommendation: car1.name,
                recommendationReason: 'Dựa trên phân tích tổng quan',
                details: [],
                prosAndCons: {
                    car1: { pros: [], cons: [] },
                    car2: { pros: [], cons: [] },
                },
                finalVerdict: responseText,
            };
        }

        // Thêm thông tin xe vào kết quả
        return {
            success: true,
            car1: {
                _id: car1._id,
                name: car1.name,
                image: car1.images?.[0] || null,
                price: car1.price,
            },
            car2: {
                _id: car2._id,
                name: car2.name,
                image: car2.images?.[0] || null,
                price: car2.price,
            },
            analysis: analysisResult,
            analyzedAt: new Date().toISOString(),
        };
    } catch (error) {
        console.error('AI Analysis Error:', error);
        throw new Error(`Lỗi phân tích AI: ${error.message}`);
    }
};

/**
 * So sánh nhanh 2 xe (không cần AI, chỉ dựa trên data)
 */
const quickCompare = async (car1Id, car2Id) => {
    try {
        const [car1, car2] = await Promise.all([
            CarModel.findById(car1Id).populate('brand category').lean(),
            CarModel.findById(car2Id).populate('brand category').lean(),
        ]);

        if (!car1 || !car2) {
            throw new Error('Không tìm thấy thông tin xe');
        }

        // So sánh các thông số
        const comparisons = [
            {
                label: 'Giá bán',
                car1Value: car1.price,
                car2Value: car2.price,
                car1Display: formatPrice(car1.price),
                car2Display: formatPrice(car2.price),
                winner: car1.price < car2.price ? 'car1' : car1.price > car2.price ? 'car2' : 'tie',
                lowerIsBetter: true,
            },
            {
                label: 'Năm sản xuất',
                car1Value: car1.year,
                car2Value: car2.year,
                car1Display: car1.year?.toString() || 'N/A',
                car2Display: car2.year?.toString() || 'N/A',
                winner: car1.year > car2.year ? 'car1' : car1.year < car2.year ? 'car2' : 'tie',
                lowerIsBetter: false,
            },
            {
                label: 'Số chỗ ngồi',
                car1Value: car1.seats,
                car2Value: car2.seats,
                car1Display: car1.seats?.toString() || 'N/A',
                car2Display: car2.seats?.toString() || 'N/A',
                winner: car1.seats > car2.seats ? 'car1' : car1.seats < car2.seats ? 'car2' : 'tie',
                lowerIsBetter: false,
            },
            {
                label: 'Tiêu hao nhiên liệu',
                car1Value: car1.mileage,
                car2Value: car2.mileage,
                car1Display: car1.mileage ? `${car1.mileage} L/100km` : 'N/A',
                car2Display: car2.mileage ? `${car2.mileage} L/100km` : 'N/A',
                winner:
                    car1.mileage && car2.mileage
                        ? car1.mileage < car2.mileage
                            ? 'car1'
                            : car1.mileage > car2.mileage
                              ? 'car2'
                              : 'tie'
                        : 'tie',
                lowerIsBetter: true,
            },
        ];

        return {
            success: true,
            car1: {
                _id: car1._id,
                name: car1.name,
                image: car1.images?.[0] || null,
                brand: car1.brand?.name,
                category: car1.category?.name,
            },
            car2: {
                _id: car2._id,
                name: car2.name,
                image: car2.images?.[0] || null,
                brand: car2.brand?.name,
                category: car2.category?.name,
            },
            comparisons,
            summary: `So sánh giữa ${car1.name} và ${car2.name}`,
        };
    } catch (error) {
        console.error('Quick Compare Error:', error);
        throw new Error(`Lỗi so sánh: ${error.message}`);
    }
};

module.exports = {
    analyzeCarComparison,
    quickCompare,
    formatPrice,
};
