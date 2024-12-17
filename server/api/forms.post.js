// server/api/forms.post.js
import connectToDatabase from "~/server/utils/mongodb";
import Form from "~/server/models/Form";

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();

    const body = await readBody(event);
    
    // Validate required fields
    if (!body.title || !body.sections || !Array.isArray(body.sections)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Title and sections array are required",
      });
    }

    // Validate that each section has required fields
    for (const section of body.sections) {
      if (!section.section_name || !Array.isArray(section.questions)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Each section must have a name and questions array",
        });
      }
    }

    const newForm = await Form.create({
      creator: body.creator,
      title: body.title,
      sections: body.sections,
      schemaVersion: process.env.SCHEMA_VERSION
    });

    return { id: newForm._id };
  } catch (error) {
    console.error("Error creating form:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to save form",
      data: error.message,
    });
  }
});
