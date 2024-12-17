import User from "~/server/models/user";
import jwt from "jsonwebtoken";
import connectToDatabase from "~/server/utils/mongodb";

export default defineEventHandler(async (event) => {
  try {
    const authHeader = event.req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Missing or invalid token'
      });
    }
    await connectToDatabase();
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId)
    .select('-googleId -schemaVersion'); // Exclude sensitive fields
    
    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'User not found'
      });
    }

    return user;
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: error as string
    });
  }
}); 