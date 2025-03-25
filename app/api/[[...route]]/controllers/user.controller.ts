import { Context } from "hono";
import { prisma } from "~/lib/prisma";
import { success, err, validationErr } from "../utils/response";
import { userSchema } from "../schemas/user.schema";

export const createOrUpdateUser = async (c: Context) => {
  try {
    const data = await c.req.json();
    const result = userSchema.safeParse(data);

    if (!result.success) {
      return c.json(validationErr(result.error), 400);
    }

    const { walletAddress, name, role } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: { name, role },
      });
      return c.json(success(updatedUser));
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        walletAddress,
        role,
      },
    });

    return c.json(success(user));
  } catch (error) {
    console.error("Error in createOrUpdateUser:", error);
    return c.json(err("Failed to create or update user"), 500);
  }
};

export const getUserByWallet = async (c: Context) => {
  try {
    const address = c.req.param("address");

    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
    });

    if (!user) {
      return c.json(err("User not found"), 404);
    }

    return c.json(success(user));
  } catch (error) {
    console.error("Error in getUserByWallet:", error);
    return c.json(err("Failed to get user"), 500);
  }
};
