const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;
let model;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });
} else {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.');
}

const parseAIResponse = (text) => {
  const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleanText);
  } catch {
    throw Object.assign(new Error('AI returned an invalid response. Please try again.'), { code: 'INVALID_AI_RESPONSE' });
  }
};

const generatePostContent = async (topic) => {
  if (!model) {
    throw Object.assign(new Error('AI service is not configured. Please contact the administrator.'), { code: 'AI_NOT_CONFIGURED' });
  }

  const prompt = `You are a professional blog post writer. Generate a catchy title and engaging content (in HTML format) for a blog post about: "${topic}". 
    
    Return the response strictly as a valid JSON object with the following structure:
    {
      "title": "Your Title Here",
      "content": "<p>Your HTML content here...</p>"
    }
    Do not include markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON string.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseAIResponse(text);
  } catch (error) {
    if (error.code === 'INVALID_AI_RESPONSE' || error.code === 'AI_NOT_CONFIGURED') throw error;
    if (error.status === 429 || error.message?.includes('429')) {
      throw Object.assign(new Error('AI quota exceeded. The free tier limit has been reached. Please try again later or contact the administrator.'), { code: 'AI_QUOTA_EXCEEDED' });
    }
    console.error('Gemini API error (generatePost):', { message: error.message, status: error.status });
    throw Object.assign(new Error(`Failed to generate content: ${error.message}`), { code: 'AI_API_ERROR' });
  }
};

const improvePostContent = async (currentContent, instructions) => {
  if (!model) {
    throw Object.assign(new Error('AI service is not configured. Please contact the administrator.'), { code: 'AI_NOT_CONFIGURED' });
  }

  const prompt = `You are a professional editor. Improve the following blog post content based on these instructions: "${instructions}".
    
    Current Content:
    ${currentContent}
    
    Return the response strictly as a valid JSON object with the following structure:
    {
      "content": "<p>Your improved HTML content here...</p>"
    }
    Do not include markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON string.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = parseAIResponse(text);
    return parsed.content;
  } catch (error) {
    if (error.code === 'INVALID_AI_RESPONSE' || error.code === 'AI_NOT_CONFIGURED') throw error;
    if (error.status === 429 || error.message?.includes('429')) {
      throw Object.assign(new Error('AI quota exceeded. The free tier limit has been reached. Please try again later or contact the administrator.'), { code: 'AI_QUOTA_EXCEEDED' });
    }
    console.error('Gemini API error (improvePost):', { message: error.message, status: error.status });
    throw Object.assign(new Error('Failed to improve content. The AI service may be temporarily unavailable.'), { code: 'AI_API_ERROR' });
  }
};

module.exports = { generatePostContent, improvePostContent };
