import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function saveFile(file: File, folder: string): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    // Sanitize filename
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = `${timestamp}-${originalName}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return `/uploads/${folder}/${filename}`;
}
