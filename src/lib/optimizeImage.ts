type OptimizeImage = {
  file: File;
  base64: string;
  name: string;
};

export function optimizeImage(
  file: File,
  targetSize: { x: number; y: number },
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

      canvas.width = targetSize.x;
      canvas.height = targetSize.y;

      let newWidth: number;
      let newHeight: number;

      if (image.naturalWidth > image.naturalHeight) {
        newWidth = image.naturalHeight;
        newHeight = image.naturalHeight;
      } else {
        newHeight = image.naturalWidth;
        newWidth = image.naturalWidth;
      }

      const sx = (image.naturalWidth - newWidth) / 2;
      const sy = (image.naturalHeight - newHeight) / 2;

      ctx?.drawImage(
        image,
        sx,
        sy,
        newWidth,
        newHeight,
        0,
        0,
        targetSize.x,
        targetSize.y,
      );

      const dataURL = canvas.toDataURL(type, quality);
      const blob = new Blob([dataURL], { type });
      const newFile = new File([blob], file.name, { type });

      resolve({ file: newFile, base64: dataURL, name: file.name });
    };
  });
}
