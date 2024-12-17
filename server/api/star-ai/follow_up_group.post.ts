import OpenAI from "openai";
import GeneratedQuestion from "~/server/models/generatedQuestion";
import connectToDatabase from "~/server/utils/mongodb";

function getOpenAIInstance(lang: string): { openai: OpenAI; model: string } {
  let openai: OpenAI;
  let model: string;

  switch (lang) {
    case "EN":
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY as string,
      });
      model = "gpt-4o";
      break;

    case "TH":
      openai = new OpenAI({
        apiKey: process.env.OPEN_TYPHOON_API_KEY as string,
        baseURL: "https://api.opentyphoon.ai/v1",
      });
      model = "typhoon-v1.5x-70b-instruct";
      break;

    default:
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY as string,
      });
      model = "gpt-4o";
  }

  return { openai, model };
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const body = await readBody(event);

  const { openai, model } = getOpenAIInstance(query.lang as string);

  const messages = [
    {
      role: "system",
      content:
        "You are an expert in user interviews. Your task is to ask insightful and relevant follow-up questions by considering your overall conversation. Respond in Thai. Response within 60 characters.",
    },
  ];

  const questionsAndAnswers = body.map((item: any) => {
    messages.push({ role: "assistant", content: item.question_text });

    const userAnswer = Array.isArray(item.answer)
      ? item.answer.join(",")
      : item.answer;

    messages.push({ role: "user", content: userAnswer });

    return {
      questionText: item.question_text,
      userAnswer: userAnswer,
    };
  });

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: messages,
    });

    const response = completion.choices[0].message;

    await connectToDatabase();

    await GeneratedQuestion.create({
      questionsAndAnswers,
      generatedQuestion: response.content,
      instance: model,
    });

    return { success: true, model: model, response };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Follow Up API Error:", error.message);
      return { success: false, error: error.message };
    } else {
      console.error("Unexpected Error:", error);
      return { success: false, error: "An unknown error occurred." };
    }
  }
});