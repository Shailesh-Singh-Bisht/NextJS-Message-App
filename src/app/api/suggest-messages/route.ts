import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction.";

    // Generate the streaming text response
    const result = streamText({
      model: openai("gpt-4o"),
      prompt,
    });

    // ✅ Properly return the streaming response

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("An unexpected error occurred:", error);

    return NextResponse.json(
      {
        success: false,
        name: error instanceof Error ? error.name : "UnknownError",
        message: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
