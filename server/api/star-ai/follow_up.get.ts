import OpenAI from "openai";

export default defineEventHandler(async (event) => {

  const openai = new OpenAI({
    apiKey: process.env.OPEN_TYPHOON_API_KEY as string,
    baseURL: "https://api.opentyphoon.ai/v1",
  });

  const query = getQuery(event);

  const question = query.question;
  const response = query.response;

  if (!question || !response) {
    return {
      success: false,
      error: "Bad input: 'question' and 'response' are required.",
    };
  }

  const messages = [
    {
      role: "system",
      content:
        "You are an expert in user interview. Your task is to ask insightful and relevant follow-up questions. response a in Thai. response within 60 characters",
    },
    {
      role: "assistant",
      content: question,
    },
    {
      role: "user",
      content: response,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "typhoon-v1.5x-70b-instruct",
      messages,
    });

    const response = completion.choices[0].message;
    return { success: true, response };
  } catch (error) {
    if (error instanceof Error) {
      // Handle known error type
      console.error("OpenAI API Error:", error.message);
      return { success: false, error: error.message };
    } else {
      // Handle unknown error type
      console.error("Unexpected Error:", error);
      return { success: false, error: "An unknown error occurred." };
    }
  }
});
