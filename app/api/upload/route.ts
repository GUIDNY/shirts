import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getSupabaseAdmin, DESIGNS_BUCKET, MOCKUPS_BUCKET } from "@/lib/supabase/server";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export async function POST(request: Request) {
  const formData = await request.formData();
  const design = formData.get("design");
  const mockup = formData.get("mockup");

  if (!(design instanceof File) || !(mockup instanceof File)) {
    return NextResponse.json({ error: "חסרים קבצים: יש להעלות תמונת עיצוב ותצוגה מקדימה" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(design.type)) {
    return NextResponse.json({ error: "יש להעלות קובץ תמונה מסוג PNG או JPG בלבד" }, { status: 400 });
  }

  if (design.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "גודל הקובץ חורג מ-20MB" }, { status: 400 });
  }

  const designExt = design.type === "image/png" ? "png" : "jpg";
  const designPath = `${uuidv4()}.${designExt}`;
  const mockupPath = `${uuidv4()}.png`;

  const designBuffer = Buffer.from(await design.arrayBuffer());
  const mockupBuffer = Buffer.from(await mockup.arrayBuffer());

  const { error: designError } = await getSupabaseAdmin().storage
    .from(DESIGNS_BUCKET)
    .upload(designPath, designBuffer, { contentType: design.type, upsert: false });

  if (designError) {
    return NextResponse.json({ error: `העלאת קובץ העיצוב נכשלה: ${designError.message}` }, { status: 500 });
  }

  const { error: mockupError } = await getSupabaseAdmin().storage
    .from(MOCKUPS_BUCKET)
    .upload(mockupPath, mockupBuffer, { contentType: "image/png", upsert: false });

  if (mockupError) {
    return NextResponse.json({ error: `העלאת תצוגה מקדימה נכשלה: ${mockupError.message}` }, { status: 500 });
  }

  const { data: publicUrlData } = getSupabaseAdmin().storage.from(MOCKUPS_BUCKET).getPublicUrl(mockupPath);

  return NextResponse.json({
    imagePath: designPath,
    mockupPath,
    mockupUrl: publicUrlData.publicUrl,
  });
}
