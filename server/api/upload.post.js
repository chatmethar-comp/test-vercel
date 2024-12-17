import { writeFile } from "fs/promises";
import { join } from "path";

export default defineEventHandler(async (event) => {
  const file = await readMultipartFormData(event);

  if (!file || file.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "No file uploaded",
    });
  }

  const uploadedFile = file[0]; // Assume single file upload
  const filePath = join("uploads", uploadedFile.filename);

  // Save the file to the uploads directory
  await writeFile(filePath, uploadedFile.data);

  return { message: "File uploaded successfully", filePath };
});
