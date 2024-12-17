import Answer from '~~/server/models/Answer'; // Adjust path based on your setup

export default defineEventHandler(async (event) => {
  const formId = event.context.params.id; // Grab the form ID from the route

  try {
    const answers = await Answer.find({schemaVersion : process.env.SCHEMA_VERSION, formId }); // Find answers by formId
    return answers; // Return the list of answers
  } catch (error) {
    console.error('Error fetching answers:', error);
    throw createError({ statusCode: 500, message: 'Failed to fetch answers' });
  }
});
