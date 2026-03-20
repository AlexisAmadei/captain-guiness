/**
 * Compresses an image file using canvas API
 * @param file - The image file to compress
 * @param size - Output square size in pixels (default: 800)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Promise resolving to compressed File
 */
export async function compressImage(
  file: File,
  size: number = 800,
  quality: number = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const shortestSide = Math.min(img.width, img.height);
        const sourceX = (img.width - shortestSide) / 2;
        const sourceY = (img.height - shortestSide) / 2;

        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          shortestSide,
          shortestSide,
          0,
          0,
          size,
          size,
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}
