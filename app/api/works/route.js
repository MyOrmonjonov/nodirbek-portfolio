import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSiteData, setSiteData } from "@/lib/store";
import { uploadToBlob, deleteFromBlob } from "@/lib/blob";

function checkPassword(request) {
  const pass = request.headers.get("x-admin-password");
  return pass && pass === (process.env.ADMIN_PASSWORD || "Nodirbek2003");
}

export async function POST(request) {
  if (!checkPassword(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const data = await getSiteData();

  const title = String(form.get("title") || "");
  const text = String(form.get("text") || "");
  const imageFile = form.get("imageFile");
  const pdfFile = form.get("pdfFile");

  if (!title || !text) return NextResponse.json({ error: "Title and text required" }, { status: 400 });
  if (!imageFile || typeof imageFile === "string" || imageFile.size === 0) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  const image = await uploadToBlob(imageFile, "works/images");
  let pdf = null;
  if (pdfFile && typeof pdfFile !== "string" && pdfFile.size > 0) {
    pdf = await uploadToBlob(pdfFile, "works/pdf");
  }

  data.works = [
    {
      id: randomUUID(),
      title,
      text,
      image: image.url,
      imagePath: image.pathname,
      pdf: pdf?.url || null,
      pdfPath: pdf?.pathname || null,
    },
    ...(data.works || []),
  ];

  await setSiteData(data);
  return NextResponse.json(data);
}

export async function DELETE(request) {
  if (!checkPassword(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getSiteData();

  for (const work of data.works || []) {
    if (work.imagePath) await deleteFromBlob(work.imagePath);
    if (work.pdfPath) await deleteFromBlob(work.pdfPath);
  }

  data.works = [];
  await setSiteData(data);
  return NextResponse.json(data);
}
