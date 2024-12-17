import { defineEventHandler, readBody } from "h3";
import connectToDatabase from "~/server/utils/mongodb";
import User from "~/server/models/user";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    const { credential } = await readBody(event);

    if (!credential) {
      return { success: false, message: "Credential is missing." };
    }

    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    
    if (!googleResponse.ok) {
      return { success: false, message: "Invalid Google token." };
    }

    const googleData = await googleResponse.json();
    let user = await User.findOne({ googleId: googleData.sub });

    if (!user) {
      user = new User({
        googleId: googleData.sub,
        email: googleData.email,
        name: googleData.name,
        picture: googleData.picture,
      });
      await User.create(user);
    }

    // Generate JWT with minimal claims
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: '3d',
        algorithm: 'HS256'
      }
    );

    // Return minimal user data
    return {
      success: true,
      token
    };
  } catch (error) {
    console.error("Error during authentication:", error);
    return { success: false, message: "An error occurred." };
  }
});
