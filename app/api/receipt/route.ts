import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

// VULN (A01/A03 — path traversal): `filename` is joined onto the storage dir
// and read without any normalization. Traversing with ../ lets the caller
// read arbitrary files the process can access, e.g.
//   /api/receipt?filename=../../.env.local
//   /api/receipt?filename=../../package.json
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") ?? "";

  if (!filename) {
    return NextResponse.json({ error: "Missing ?filename=" }, { status: 400 });
  }

  const dir = process.env.RECEIPT_STORAGE_DIR ?? "./public/receipts";
  const full = path.join(dir, filename);

  try {
    const content = await readFile(full, "utf8");
    return NextResponse.json({ filename: full, content });
  } catch {
    return NextResponse.json({ filename: full, error: "Could not read that file." }, { status: 404 });
  }
}
