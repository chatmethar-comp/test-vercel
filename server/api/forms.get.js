import connectToDatabase from "~/server/utils/mongodb";
import Form from "~/server/models/Form";

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();

    const query = getQuery(event);

    const filter = {
      schemaVersion: process.env.SCHEMA_VERSION,
    };

    if (query.creator) {
      filter.creator = query.creator;
    }

    const forms = await Form.find(
      filter,
      { title: 1, sections: 1 }
    );
    return forms;
  } catch (error) {
    console.error("Error fetching forms:", error.message);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch forms",
    });
  }
});
