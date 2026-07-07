import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { uploadPublicFile } from "@/lib/storage";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

function validateDesign(file: unknown, label: string): string | null {
  if (!(file instanceof File)) return `חסר קובץ עיצוב (${label})`;
  if (!ALLOWED_TYPES.includes(file.type)) return "יש להעלות קובץ תמונה מסוג PNG או JPG בלבד";
  if (file.size > MAX_SIZE_BYTES) return "גודל הקובץ חורג מ-20MB";
  return null;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const designFront = formData.get("design_front");
  const mockupFront = formData.get("mockup_front");
  const designBack = formData.get("design_back");
  const mockupBack = formData.get("mockup_back");

  const frontError = validateDesign(designFront, "חזית");
  if (frontError) return NextResponse.json({ error: frontError }, { status: 400 });
  if (!(mockupFront instanceof File)) {
    return NextResponse.json({ error: "חסרה תצוגה מקדימה לחזית" }, { status: 400 });
  }

  const hasBack = designBack !== null || mockupBack !== null;
  if (hasBack) {
    const backError = validateDesign(designBack, "גב");
    if (backError) return NextResponse.json({ error: backError }, { status: 400 });
    if (!(mockupBack instanceof File)) {
      return NextResponse.json({ error: "חסרה תצוגה מקדימה לגב" }, { status: 400 });
    }
  }

  const id = uuidv4();
  const ext = (f: File) => (f.type === "image/png" ? "png" : "jpg");

  try {
    const uploads: Promise<string>[] = [
      uploadPublicFile(`designs/${id}-front.${ext(designFront as File)}`, designFront as File, (designFront as File).type),
      uploadPublicFile(`mockups/${id}-front.png`, mockupFront, "image/png"),
    ];
    if (hasBack) {
      uploads.push(
        uploadPublicFile(`designs/${id}-back.${ext(designBack as File)}`, designBack as File, (designBack as File).type),
        uploadPublicFile(`mockups/${id}-back.png`, mockupBack as File, "image/png")
      );
    }

    const [imageUrl, mockupUrl, backImageUrl, backMockupUrl] = await Promise.all(uploads);

    return NextResponse.json({
      imageUrl,
      mockupUrl,
      backImageUrl: backImageUrl || null,
      backMockupUrl: backMockupUrl || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `העלאת הקבצים נכשלה: ${err instanceof Error ? err.message : "שגיאה לא ידועה"}` },
      { status: 500 }
    );
  }
}
