import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

/**
 * Issues client upload tokens for @vercel/blob's direct browser-to-Blob
 * upload. The file bytes never pass through this (or any) serverless
 * function, so there's no request body size limit to hit — unlike
 * POSTing the file to a normal route handler, which is capped by the
 * platform well under what a real phone photo needs (confirmed: a 10MB
 * photo came back "FUNCTION_PAYLOAD_TOO_LARGE" even as a single file).
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_TYPES,
        maximumSizeInBytes: MAX_SIZE_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "שגיאה לא ידועה" },
      { status: 400 }
    );
  }
}
