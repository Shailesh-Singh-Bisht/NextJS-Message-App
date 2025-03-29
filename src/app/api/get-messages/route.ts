/* eslint-disable @typescript-eslint/no-unused-vars */
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Not Authenticated",
      }),
      { status: 401 }
    );
  }

  try {
    const userId = new mongoose.Types.ObjectId(session.user._id);

    const user = await UserModel.aggregate([
      {
        $match: { _id: userId }, // ✅ Fix: Match `_id` instead of `id`
      },
      {
        $unwind: { path: "$messages", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { "messages.createdAt": -1 },
      },
      {
        $group: { _id: "$_id", messages: { $push: "$messages" } },
      },
    ]);

    if (!user || user.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No messages found",
          messages: [],
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messages: user[0].messages, // ✅ Fix: Return `messages`, not `message`
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching messages",
      }),
      { status: 500 }
    );
  }
}
