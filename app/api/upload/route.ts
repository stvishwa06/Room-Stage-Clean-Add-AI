import { fal } from "@fal-ai/client";
import { NextRequest } from "next/server";

// Initialize fal.ai client with API key
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY,
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.FAL_KEY) {
      return Response.json(
        { error: "FAL_KEY is not configured. Please set it in .env.local" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to fal.storage
    // fal.storage.upload returns a string URL directly
    const url = await fal.storage.upload(file);
    
    return Response.json({ url });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return Response.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

