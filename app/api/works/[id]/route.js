import { NextResponse } from "next/server";
import { getSiteData, setSiteData } from "@/lib/store";
import { uploadToBlob, deleteFromBlob } from "@/lib/blob";

function checkPassword(request) {
  const pass = request.headers.get("x-admin-password");
  return pass && pass === (process.env.ADMIN_PASSWORD || "Nodirbek2003");
}

export async function PUT(request, { params }) {
  if (!checkPassword(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const data = await getSiteData();
  const index = (data.works || []).findIndex((w) => w.id === params.id);

  if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const oldWork = data.works[index];

  const title = String(form.get("title") || oldWork.title);
  const text = String(form.get("text") || oldWork.text);
  const imageFile = form.get("imageFile");
  const pdfFile = form.get("pdfFile");

  const nextWork = { ...oldWork, title, text };

  if (imageFile && typeof imageFile !== "string" && imageFile.size > 0) {
    if (oldWork.imagePath) await deleteFromBlob(oldWork.imagePath);
    const uploaded = await uploadToBlob(imageFile, "works/images");
    nextWork.image = uploaded.url;
    nextWork.imagePath = uploaded.pathname;
  }

  if (pdfFile && typeof pdfFile !== "string" && pdfFile.size > 0) {
    if (oldWork.pdfPath) await deleteFromBlob(oldWork.pdfPath);
    const uploaded = await uploadToBlob(pdfFile, "works/pdf");
    nextWork.pdf = uploaded.url;
    nextWork.pdfPath = uploaded.pathname;
  }

  data.works[index] = nextWork;
  await setSiteData(data);
  return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
  if (!checkPassword(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getSiteData();
  const index = (data.works || []).findIndex((w) => w.id === params.id);

  if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [removed] = data.works.splice(index, 1);

  if (removed.imagePath) await deleteFromBlob(removed.imagePath);
  if (removed.pdfPath) await deleteFromBlob(removed.pdfPath);

  await setSiteData(data);
  return NextResponse.json(data);
}
