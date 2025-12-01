const OpenAI = require('openai');

let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.warn('OPENAI_API_KEY is not set. AI features will not work.');
}

const generatePostContent = async (topic) => {
  if (!openai) throw new Error('OpenAI API Key is missing');
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional blog post writer. Generate a catchy title and engaging content (in HTML format) for a blog post based on the given topic. Return the response as a JSON object with 'title' and 'content' fields."
        },
        { role: "user", content: `Write a blog post about: ${topic}` }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response;
  } catch (error) {
    console.error('Error generating post content:', error);
    throw new Error('Failed to generate content');
  }
};

const improvePostContent = async (currentContent, instructions) => {
  if (!openai) throw new Error('OpenAI API Key is missing');
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional editor. Improve the following blog post content based on the user's instructions. Return the response as a JSON object with a 'content' field containing the improved HTML content."
        },
        { role: "user", content: `Content: ${currentContent}\n\nInstructions: ${instructions}` }
      ],
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
    });

    const response = JSON.parse(completion.choices[0].message.content);
    return response.content;
  } catch (error) {
    console.error('Error improving post content:', error);
    throw new Error('Failed to improve content');
  }
};

module.exports = { generatePostContent, improvePostContent };
