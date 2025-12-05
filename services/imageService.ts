
/**
 * Resizes an image file to a maximum dimension while maintaining aspect ratio.
 * Converts to JPEG to ensure consistent compression and smaller size.
 */
export const resizeImage = (
  file: File, 
  maxWidth: number = 1024, 
  quality: number = 0.85
): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Always convert to jpeg for consistency and compression
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        // Extract base64
        const base64 = dataUrl.split(',')[1];
        
        resolve({ base64, mimeType });
      };
      
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};
