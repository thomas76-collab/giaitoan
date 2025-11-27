import { GoogleGenAI } from '@google/genai';

// Lấy API key từ biến môi trường
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.error('⚠️ API key không được tìm thấy. Vui lòng cấu hình VITE_GOOGLE_AI_API_KEY.');
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function solveMathProblem(input: File | string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    let prompt = `Bạn là một giáo viên toán học chuyên nghiệp. Hãy giải bài toán sau một cách chi tiết, từng bước:

QUAN TRỌNG: 
- Sử dụng LaTeX cho MỌI công thức toán học (inline: $...$ và block: $$...$$)
- Giải thích rõ ràng từng bước
- Trình bày chuyên nghiệp

`;

    let result;

    if (typeof input === 'string') {
      // Xử lý văn bản
      prompt += input;
      result = await model.generateContent(prompt);
    } else {
      // Xử lý file (ảnh hoặc PDF)
      const base64Data = await fileToBase64(input);
      const mimeType = input.type;

      result = await model.generateContent([
        prompt + '\n\nHãy phân tích và giải bài toán trong file đính kèm.',
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
      ]);
    }

    const response = result.response;
    const text = response.text();

    return text || 'Không thể tạo lời giải. Vui lòng thử lại.';
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error);
    return `⚠️ Đã xảy ra lỗi: ${error instanceof Error ? error.message : 'Lỗi không xác định'}. Vui lòng kiểm tra API key và thử lại.`;
  }
}

// Hàm chuyển file thành base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
