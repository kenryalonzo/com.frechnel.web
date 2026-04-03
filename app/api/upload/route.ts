import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier uploadé" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nom unique
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // Assurer que public/uploads existe
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Écrire le fichier
    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    // Retourner l'URL publique
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 },
    );
  }
}
