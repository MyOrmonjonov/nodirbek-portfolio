import { NextResponse } from "next/server";
import { getSiteData, setSiteData } from "@/lib/store";
import { randomUUID } from "crypto";

function checkPassword(request) {
  const pass = request.headers.get("x-admin-password");
  return pass && pass === (process.env.ADMIN_PASSWORD || "Nodirbek2003");
}

export async function POST(request) {
  if (!checkPassword(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const data = await getSiteData();

  data.services = [{ id: randomUUID(), title: body.title, text: body.text }, ...(data.services || [])];

  await setSiteData(data);
  return NextResponse.json(data);
}

export async function DELETE(request) {
  if (!checkPassword(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const index = Number(searchParams.get("index"));
  const data = await getSiteData();

  if (!Number.isNaN(index)) data.services.splice(index, 1);

  await setSiteData(data);
  return NextResponse.json(data);
}
