import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ success: false, message: "Not Authenticated" }, { status: 401 });
  }

  // Extract `messageid` from request URL
  const url = new URL(req.url);
  const messageid = url.pathname.split("/").pop(); // Get last part of URL

  if (!messageid || !mongoose.Types.ObjectId.isValid(messageid)) {
    return NextResponse.json({ success: false, message: "Invalid Message ID" }, { status: 400 });
  }

  try {
    const user = await UserModel.findById(session.user._id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const updateResult = await UserModel.updateOne(
      { _id: session.user._id },
      { $pull: { messages: { _id: new mongoose.Types.ObjectId(messageid) } } }
    );

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "Message Not Found or Already Deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Message Deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error in deleting message route:", error);
    return NextResponse.json({ success: false, message: "Error deleting message" }, { status: 500 });
  }
}
