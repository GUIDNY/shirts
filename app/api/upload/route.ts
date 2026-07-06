import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { uploadPublicFile } from "@/lib/storage";

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
  const id = uuidv4();

  try {
    const [imageUrl, mockupUrl] = await Promise.all([
      uploadPublicFile(`designs/${id}.${designExt}`, design, design.type),
      uploadPublicFile(`mockups/${id}.png`, mockup, "image/png"),
    ]);

    return NextResponse.json({ imageUrl, mockupUrl });
  } catch (err) {
    return NextResponse.json(
      { error: `העלאת הקבצים נכשלה: ${err instanceof Error ? err.message : "שגיאה לא ידועה"}` },
      { status: 500 }
    );
  }
}
