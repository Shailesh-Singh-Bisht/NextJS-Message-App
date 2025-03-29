import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
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

  const messageId = params.messageid;
  if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid Message ID",
      }),
      { status: 400 }
    );
  }

  try {
    const user = await UserModel.findById(session.user._id);
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "User not found",
        }),
        { status: 404 }
      );
    }

    const updateResult = await UserModel.updateOne(
      { _id: session.user._id },
      { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageId) } } }
    );

    if (updateResult.modifiedCount === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Message Not Found Or Already Deleted",
        }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Message Deleted",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in deleting message route:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error deleting message",
      }),
      { status: 500 }
    );
  }
}
