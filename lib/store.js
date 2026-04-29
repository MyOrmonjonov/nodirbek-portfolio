import { kv } from "@vercel/kv";
import { defaultData } from "./defaultData";

export const SITE_KEY = "nodirbek:portfolio:site";

export async function getSiteData() {
  const data = await kv.get(SITE_KEY);
  return { ...defaultData, ...(data || {}) };
}

export async function setSiteData(data) {
  await kv.set(SITE_KEY, data);
  return data;
}
