import { NextResponse } from "next/server";
import { getSiteData, setSiteData } from "@/lib/store";
import { uploadToBlob, deleteFromBlob } from "@/lib/blob";

function checkPassword(request) {
  const pass = request.headers.get("x-admin-password");
  return pass && pass === (process.env.ADMIN_PASSWORD || "Nodirbek2003");
}

export async function GET() {
  const data = await getSiteData();
  return NextResponse.json(data);
}

export async function PUT(request) {
  if (!checkPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const oldData = await getSiteData();

  const data = { ...oldData };

  [
    "firstName",
    "lastName",
    "badge",
    "subtitle",
    "description",
    "telegram",
    "stat1",
    "stat1Text",
    "stat2",
    "stat2Text",
    "stat3",
    "stat3Text",
    "stat4",
    "stat4Text",
    "contactTitle",
    "contactText",
  ].forEach((key) => {
    const value = form.get(key);
    if (typeof value === "string") data[key] = value;
  });

  const profileFile = form.get("profileFile");
  if (profileFile && typeof profileFile !== "string" && profileFile.size > 0) {
    if (oldData.profilePath) await deleteFromBlob(oldData.profilePath);
    const uploaded = await uploadToBlob(profileFile, "profile");
    data.profile = uploaded.url;
    data.profilePath = uploaded.pathname;
  }

  await setSiteData(data);
  return NextResponse.json(data);
}
