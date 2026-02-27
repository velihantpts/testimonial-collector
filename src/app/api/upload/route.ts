import { NextResponse } from "next/server";

// POST: Upload file (avatar or video)
// Accepts multipart/form-data
// Falls back to base64 data URL if Supabase is not configured
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (5MB for images, 50MB for videos)
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${isVideo ? "50MB" : "5MB"}.`,
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Allowed: JPEG, PNG, WebP images and MP4, WebM, MOV videos.",
        },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      // Upload to Supabase Storage
      try {
        const { uploadFile } = await import("@/lib/supabase");

        const bucket = isVideo ? "videos" : "avatars";
        const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
        const path = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const publicUrl = await uploadFile(bucket, path, file);

        return NextResponse.json({
          url: publicUrl,
          type: isVideo ? "video" : "image",
        });
      } catch (supabaseError) {
        console.error("Supabase upload failed, falling back to base64:", supabaseError);
        // Fall through to base64 fallback
      }
    }

    // Fallback: Convert to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      url: dataUrl,
      type: isVideo ? "video" : "image",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
