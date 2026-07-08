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
  const printFront = formData.get("print_front");
  const designBack = formData.get("design_back");
  const mockupBack = formData.get("mockup_back");
  const printBack = formData.get("print_back");

  const frontError = validateDesign(designFront, "חזית");
  if (frontError) return NextResponse.json({ error: frontError }, { status: 400 });

  // mockup/print are optional: flat products (posters/totes/canvas/mugs)
  // have no separate compositing step, so the design file itself doubles
  // as the mockup and print file — uploading it three times as identical
  // copies would triple the request payload and can blow past the
  // platform's function body size limit for a normal-sized photo.
  if (mockupFront !== null && !(mockupFront instanceof File)) {
    return NextResponse.json({ error: "תצוגה מקדימה לחזית אינה תקינה" }, { status: 400 });
  }
  if (printFront !== null && !(printFront instanceof File)) {
    return NextResponse.json({ error: "קובץ הדפסה לחזית אינו תקין" }, { status: 400 });
  }

  const hasBack = designBack !== null || mockupBack !== null;
  if (hasBack) {
    const backError = validateDesign(designBack, "גב");
    if (backError) return NextResponse.json({ error: backError }, { status: 400 });
    if (mockupBack !== null && !(mockupBack instanceof File)) {
      return NextResponse.json({ error: "תצוגה מקדימה לגב אינה תקינה" }, { status: 400 });
    }
    if (printBack !== null && !(printBack instanceof File)) {
      return NextResponse.json({ error: "קובץ הדפסה לגב אינו תקין" }, { status: 400 });
    }
  }

  const id = uuidv4();
  const ext = (f: File) => (f.type === "image/png" ? "png" : "jpg");

  try {
    const imageUrlPromise = uploadPublicFile(
      `designs/${id}-front.${ext(designFront as File)}`,
      designFront as File,
      (designFront as File).type
    );
    const mockupUrlPromise =
      mockupFront instanceof File
        ? uploadPublicFile(`mockups/${id}-front.png`, mockupFront, "image/png")
        : imageUrlPromise;
    const printFileUrlPromise =
      printFront instanceof File
        ? uploadPublicFile(`prints/${id}-front.png`, printFront, "image/png")
        : imageUrlPromise;

    let backImageUrlPromise: Promise<string> | null = null;
    let backMockupUrlPromise: Promise<string> | null = null;
    let backPrintFileUrlPromise: Promise<string> | null = null;
    if (hasBack) {
      backImageUrlPromise = uploadPublicFile(
        `designs/${id}-back.${ext(designBack as File)}`,
        designBack as File,
        (designBack as File).type
      );
      backMockupUrlPromise =
        mockupBack instanceof File
          ? uploadPublicFile(`mockups/${id}-back.png`, mockupBack, "image/png")
          : backImageUrlPromise;
      backPrintFileUrlPromise =
        printBack instanceof File
          ? uploadPublicFile(`prints/${id}-back.png`, printBack, "image/png")
          : backImageUrlPromise;
    }

    const [imageUrl, mockupUrl, printFileUrl, backImageUrl, backMockupUrl, backPrintFileUrl] = await Promise.all([
      imageUrlPromise,
      mockupUrlPromise,
      printFileUrlPromise,
      backImageUrlPromise ?? Promise.resolve(null),
      backMockupUrlPromise ?? Promise.resolve(null),
      backPrintFileUrlPromise ?? Promise.resolve(null),
    ]);

    return NextResponse.json({
      imageUrl,
      mockupUrl,
      printFileUrl,
      backImageUrl: backImageUrl || null,
      backMockupUrl: backMockupUrl || null,
      backPrintFileUrl: backPrintFileUrl || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `העלאת הקבצים נכשלה: ${err instanceof Error ? err.message : "שגיאה לא ידועה"}` },
      { status: 500 }
    );
  }
}
