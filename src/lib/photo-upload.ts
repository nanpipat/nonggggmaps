"use client";

/** Convert FileList → array of resized base64 JPEGs (max 800px) */
export async function filesToDataUrls(
  files: FileList | null,
  options: { max?: number; quality?: number; limit?: number } = {},
): Promise<string[]> {
  if (!files) return [];
  const { max = 1000, quality = 0.85, limit = 6 } = options;
  const list: File[] = Array.from(files).slice(0, limit);

  const promises = list.map(
    (file) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
          const img = new window.Image();
          img.onerror = reject;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let { width, height } = img;
            if (width > max || height > max) {
              const ratio = Math.min(max / width, max / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("no canvas context"));
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", quality));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      }),
  );

  return Promise.all(promises);
}
