type OptimizeImage = {
  file: File;
  base64: string;
  name: string;
  size: { width: number; height: number };
};

export function optimizeImage(
  file: File,
  targetSize?: { x: number; y: number },
  quality: number = 0.6,
  type: string = "image/jpeg",
): Promise<OptimizeImage> {
  return new Promise((resolve: (value: OptimizeImage) => void) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.src = url;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let newTargetWidth: number;
      let newTargetHeight: number;
      let newWidth: number;
      let newHeight: number;

      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (image.naturalWidth > image.naturalHeight) {
        newTargetWidth = image.naturalWidth < 1440 ? image.naturalWidth : 1440;
        newTargetHeight = newTargetWidth * (image.naturalHeight / image.naturalWidth);

        newWidth = image.naturalHeight;
        newHeight = image.naturalHeight;
      } else {
        newTargetHeight = image.naturalHeight < 1920 ? image.naturalHeight : 1920;
        newTargetWidth = newTargetHeight * (image.naturalWidth / image.naturalHeight);

        newHeight = image.naturalWidth;
        newWidth = image.naturalWidth;
      }

      const sx = (image.naturalWidth - newWidth) / 2;
      const sy = (image.naturalHeight - newHeight) / 2;

      if (targetSize) {
        canvas.width = targetSize.x;
        canvas.height = targetSize.y;

        ctx?.drawImage(image, sx, sy, newWidth, newHeight, 0, 0, targetSize.y, targetSize.y);
      } else {
        canvas.width = newTargetWidth;
        canvas.height = newTargetHeight;

        ctx?.drawImage(image, 0, 0, newTargetWidth, newTargetHeight);
      }

      const dataURL = canvas.toDataURL(type, quality);

      const arr = dataURL.split(",");
      const baseString = atob(arr[arr.length - 1]);
      let i = baseString.length;
      const u8arr = new Uint8Array(i);

      while (i--) {
        u8arr[i] = baseString.charCodeAt(i);
      }

      const newFile = new File([u8arr], file.name, { type });

      URL.revokeObjectURL(url);

      resolve({
        file: newFile,
        base64: dataURL,
        name: file.name,
        size: { width: canvas.width, height: canvas.height },
      });
    };
  });
}
