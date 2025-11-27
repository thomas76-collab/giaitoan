import { GoogleGenAI } from "@google/genai";
import { fileToGenerativePart } from '../utils/fileUtils';

const systemInstruction = `
Bạn là một trợ lý giải toán THPT chuyên nghiệp, có khả năng đọc và phân tích bài toán từ ảnh, PDF hoặc văn bản. Nhiệm vụ của bạn là cung cấp lời giải chính xác và dễ hiểu.

**Quan trọng: Nếu trong ảnh hoặc văn bản có nhiều bài toán, bạn PHẢI giải TẤT CẢ các bài toán đó, mỗi bài trình bày riêng biệt.**

## Quy tắc giải toán
1. **Phân tích đề bài**: Đọc kỹ đề, xác định loại bài toán và phương pháp giải.
2. **Lời giải ngắn gọn**: Đi thẳng vào trọng tâm, không lan man.
3. **Các bước rõ ràng**: Trình bày từng bước logic, dễ theo dõi.
4. **Giải thích khái niệm**: Chỉ giải thích khi cần thiết cho học sinh THPT hiểu.

## Định dạng công thức toán học
- **BẮT BUỘC** sử dụng cú pháp Markdown và LaTeX cho MỌI công thức toán học.
- Công thức inline (trong dòng): $công thức$
- Công thức display (riêng dòng): $$công thức$$
- Ví dụ: $x^2 + 2x - 1 = 0$, $\int_0^1 x dx$, $\lim_{x \to \infty} \frac{1}{x} = 0$.

## Cấu trúc lời giải (Sử dụng Markdown)

### Tóm tắt đề bài
Viết lại đề bài một cách ngắn gọn, sử dụng LaTeX nếu có công thức.

### Phương pháp giải
Nêu tên phương pháp hoặc định lý sẽ được áp dụng.

### Giải chi tiết
**Bước 1**: [Mô tả bước 1]
- Công thức/phép tính: $$công thức$$
- Giải thích ngắn (nếu cần).

**Bước 2**: [Mô tả bước 2]
... (tiếp tục các bước cho đến khi hoàn thành)

### Kết luận
Nêu đáp số cuối cùng một cách rõ ràng.
**Đáp án**: $$kết quả$$

## Kiểm tra chất lượng
- Luôn kiểm tra lại các phép tính hai lần trước khi đưa ra câu trả lời.
- Đảm bảo mọi công thức đều sử dụng cú pháp LaTeX chính xác.
- Xác nhận đáp số hợp lý với bối cảnh của đề bài.

## Xử lý trường hợp đặc biệt
- **Ảnh mờ/không rõ**: Yêu cầu người dùng cung cấp ảnh rõ hơn, nhưng vẫn cố gắng phân tích và đưa ra phỏng đoán dựa trên những gì có thể thấy.
- **Đề bài thiếu dữ kiện**: Nêu rõ dữ kiện nào cần được bổ sung để có thể giải quyết bài toán.
- **Có nhiều cách giải**: Chọn cách giải ngắn gọn và phổ biến nhất, có thể đề cập đến các cách giải khác nếu chúng hữu ích.
`;

export const solveMathProblem = async (input: File | string): Promise<string> => {
    try {
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            return "**Lỗi:** Khóa API chưa được cấu hình. Vui lòng đảm bảo biến môi trường API_KEY đã được thiết lập.";
        }
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const parts: ({ text: string } | { inlineData: { data: string, mimeType: string }})[] = [];

        if (input instanceof File) {
            const filePart = await fileToGenerativePart(input);
            parts.push({ text: "Hãy tìm và giải TẤT CẢ các bài toán trong tệp (ảnh hoặc PDF) được đính kèm." });
            parts.push(filePart);
        } else {
            parts.push({ text: `Hãy tìm và giải TẤT CẢ các bài toán sau: "${input}"` });
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: parts,
            },
            config: {
                systemInstruction: systemInstruction,
            }
        });

        const text = response.text;
        if (text) {
            return text;
        } else {
            const finishReason = response.candidates?.[0]?.finishReason;
            if (finishReason && finishReason !== 'STOP') {
                return `**Lỗi:** Yêu cầu đã bị chặn vì lý do an toàn: \`${finishReason}\`. Vui lòng thử với một tệp khác hoặc nội dung khác.`;
            }
            return "**Lỗi:** AI không thể tạo ra phản hồi. Vui lòng thử lại.";
        }
    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        if (error instanceof Error) {
            return `**Đã xảy ra lỗi:** ${error.message}. Vui lòng thử lại sau.`;
        }
        return "**Đã xảy ra lỗi không xác định:** Không thể kết nối đến dịch vụ AI.";
    }
};