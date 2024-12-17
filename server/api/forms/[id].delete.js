import connectToDatabase from "~/server/utils/mongodb";
import Form from "~/server/models/Form";

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();

    const { id } = event.context.params; // Form ID
    await Form.findByIdAndDelete(id);

    return { message: "Form deleted successfully" };
  } catch (error) {
    console.error("Error deleting form:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to delete form",
    });
  }
});
