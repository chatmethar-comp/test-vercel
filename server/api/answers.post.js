import connectToDatabase from "~/server/utils/mongodb";
import Answer from "~/server/models/Answer";

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    const body = await readBody(event); // Read the incoming request body
    const { formId, answers, questionIds, followUpAnswers } = body;

    if (!formId || !answers || !questionIds) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing required fields: formId, answers, or questionIds",
      });
    }

    const structuredAnswers = questionIds.map(
      (questionId, index) => answers[index]
    );

    // Save the answers in the database
    await Answer.create({
      formId,
      questionIds,
      answers: structuredAnswers,
      followUpAnswers: followUpAnswers,
      schemaVersion: process.env.SCHEMA_VERSION,
    });

    return { message: "Answers saved successfully" };
  } catch (error) {
    console.error("Error saving answers:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to save answers",
    });
  }
});
