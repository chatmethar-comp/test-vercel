import connectToDatabase from "~/server/utils/mongodb";
import Form from "~/server/models/Form";

export default defineEventHandler(async (event) => {
  if (event.req.method !== "PUT") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method not allowed",
    });
  }

  try {
    await connectToDatabase();

    const { id } = event.context.params;
    const { title, sections } = await readBody(event);

    // Validate required fields
    if (!title || !sections) {
      throw createError({
        statusCode: 400,
        statusMessage: "Title and sections are required",
      });
    }

    // Validate sections structure
    if (!Array.isArray(sections)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Sections must be an array",
      });
    }

    // Validate each section and its questions
    for (const section of sections) {
      if (!section.section_name) {
        throw createError({
          statusCode: 400,
          statusMessage: "Each section must have a section_name",
        });
      }

      if (!Array.isArray(section.questions)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Each section must have a questions array",
        });
      }

      // Validate questions within the section
      if (section.questions.some(q => !q.questionText || !q.answerType)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Each question must have 'questionText' and 'answerType' fields",
        });
      }

      // Validate options for radio/checkbox questions
      for (const question of section.questions) {
        if (['radio', 'checkbox'].includes(question.answerType)) {
          if (!Array.isArray(question.options) || question.options.length === 0) {
            throw createError({
              statusCode: 400,
              statusMessage: "Radio and checkbox questions must have at least one option",
            });
          }
        }
      }
    }

    // Find the form by ID and update it
    const updatedForm = await Form.findByIdAndUpdate(
      id,
      { title, sections },
      { new: true, runValidators: true }
    );

    if (!updatedForm) {
      throw createError({
        statusCode: 404,
        statusMessage: "Form not found",
      });
    }

    return updatedForm;
  } catch (error) {
    console.error("Error updating form:", error.message);

    if (error.name === "ValidationError") {
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal server error",
    });
  }
});