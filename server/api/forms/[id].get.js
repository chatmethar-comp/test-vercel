// server/api/forms/[id].get.js
import connectToDatabase from "~/server/utils/mongodb";
import Form from "~/server/models/Form";

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();

    const { id } = event.context.params; // Extract the ID from the route
    const form = await Form.findById(id);
    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: "Form not found",
      });
    }

    return form;
  } catch (error) {
    console.error("Error fetching form:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch form",
    });
  }
});
