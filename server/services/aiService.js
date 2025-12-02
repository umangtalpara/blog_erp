const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI;
let model;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
} else {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.');
}

const generatePostContent = async (topic) => {
  if (!model) throw new Error('Gemini API Key is missing');
  try {
    const prompt = `You are a professional blog post writer. Generate a catchy title and engaging content (in HTML format) for a blog post about: "${topic}". 
    
    Return the response strictly as a valid JSON object with the following structure:
    {
      "title": "Your Title Here",
      "content": "<p>Your HTML content here...</p>"
    }
    Do not include markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON string.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting if Gemini adds it despite instructions
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Error generating post content:', error);
    throw new Error('Failed to generate content');
  }
};

const improvePostContent = async (currentContent, instructions) => {
  if (!model) throw new Error('Gemini API Key is missing');
  try {
    const prompt = `You are a professional editor. Improve the following blog post content based on these instructions: "${instructions}".
    
    Current Content:
    ${currentContent}
    
    Return the response strictly as a valid JSON object with the following structure:
    {
      "content": "<p>Your improved HTML content here...</p>"
    }
    Do not include markdown formatting like \`\`\`json or \`\`\`. Just the raw JSON string.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up potential markdown formatting
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const jsonResponse = JSON.parse(cleanText);
    return jsonResponse.content;
  } catch (error) {
    console.error('Error improving post content:', error);
    throw new Error('Failed to improve content');
  }
};

module.exports = { generatePostContent, improvePostContent };
