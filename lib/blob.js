import { put, del } from "@vercel/blob";

export async function uploadToBlob(file, folder) {
  if (!file || file.size === 0) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `${folder}/${Date.now()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

export async function deleteFromBlob(pathOrUrl) {
  if (!pathOrUrl) return;
  try {
    await del(pathOrUrl);
  } catch (error) {
    console.error("Blob delete failed:", error);
  }
}
