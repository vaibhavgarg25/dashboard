import bcrypt from "bcrypt";
import { prisma } from "./utils/db.js";
import { generateToken } from "./utils/jwt.js";

export const signup = async (_, { input }) => {
  try {
    const { name, email, password, role } = input;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role }
    });

    const token = generateToken(user);
    return { token, user };
  } catch (error) {
    console.error("Signup error:", error);
    throw new Error(error.message || "An error occurred during signup");
  }
};

export const login = async (_, { email, password }) => {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    const token = generateToken(user);
    return { token, user };
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error.message || "An error occurred during login");
  }
};

export const updateProfile = async (_, { input }, { user }) => {
  try {
    console.log(user)
    if (!user) throw new Error("Not authenticated");

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: input
    });

    return updated;
  } catch (error) {
    console.error("Update profile error:", error);
    throw new Error(error.message || "An error occurred while updating profile");
  }
};
