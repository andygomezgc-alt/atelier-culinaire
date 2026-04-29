import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireUser } from "@/lib/auth";
import { withErrorHandler, err } from "@/lib/api/handler";

export const runtime = "nodejs";

export const POST = withErrorHandler(async (req: Request) => {
  await requireUser();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return err("no file", 400);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buf);
  return NextResponse.json({ url: `/uploads/${filename}` });
});
