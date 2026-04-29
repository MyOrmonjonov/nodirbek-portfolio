import { NextResponse } from "next/server";
import { getSiteData, setSiteData } from "@/lib/store";

function checkPassword(request) {
  const pass = request.headers.get("x-admin-password");
  return pass && pass === (process.env.ADMIN_PASSWORD || "Nodirbek2003");
}

export async function POST(request) {
  if (!checkPassword(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, direction } = await request.json();
  const data = await getSiteData();
  const index = (data.works || []).findIndex((w) => w.id === id);

  if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= data.works.length) return NextResponse.json(data);

  [data.works[index], data.works[target]] = [data.works[target], data.works[index]];
  await setSiteData(data);
  return NextResponse.json(data);
}
