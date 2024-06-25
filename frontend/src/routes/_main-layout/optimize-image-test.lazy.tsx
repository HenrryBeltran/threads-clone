import { Album02Icon, Camera02Icon, Cancel01Icon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { optimizeImage } from "@/lib/optimize-image";
import { createLazyFileRoute } from "@tanstack/react-router";
import { forwardRef, useRef, useState } from "react";

export const Route = createLazyFileRoute("/_main-layout/optimize-image-test")({
  component: OptimizeImageTest,
});

type Resource = {
  base64: string;
  size: { width: number; height: number };
};

function OptimizeImageTest() {
  const [images, setImages] = useState<Resource[]>();
  const ref = useRef<HTMLInputElement>(null);

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }
    const files = Array.from<File>(e.target.files);

    for (const file of files) {
      const { base64, size } = await optimizeImage(
        file,
        undefined,
        // {
        //   x: 1080,
        //   y: 1080,
        // },
        0.8,
      );

      setImages((prev) => {
        if (prev) {
          return [...prev, { base64, size }];
        }
        return [{ base64, size }];
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-24">
      <h1 className="text-[2.8vw] font-bold leading-none tracking-tighter text-foreground/90">Optimize Image Test</h1>
      <UploadButton handleUploadFile={handleUploadFile} />
      <div className="flex flex-col gap-4 divide-y">
        {images?.map((image, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-end gap-4 py-4">
              <label
                htmlFor="profile-picture"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800/45 transition-colors"
              >
                <Camera02Icon width={20} height={20} strokeWidth={2} className="h-5 w-5 -translate-y-px text-white" />
              </label>
              <Button
                variant="outline"
                type="button"
                size="icon"
                disabled={image == undefined}
                className="rounded-full transition-all active:scale-95"
                onClick={() => {
                  if (ref.current) {
                    ref.current.value = "";
                  }
                  setImages((prev) => prev?.filter((_, index) => index !== idx));
                }}
              >
                <Cancel01Icon width={16} height={16} strokeWidth={2.5} />
              </Button>
            </div>
            <figure className="">
              <img
                src={image.base64}
                width={image.size.width * 0.3}
                height={image.size.height * 0.3}
                alt="Profile picture"
                style={{
                  width: `${image.size.width * 0.3}px`,
                  height: `${image.size.height * 0.3}px`,
                }}
                className="rounded-lg border border-muted-foreground/30"
              />
            </figure>
          </div>
        ))}
        <p className="pt-4 text-sm text-muted-foreground">Some images for testing.</p>
      </div>
    </div>
  );
}

type UploadProps = {
  handleUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const UploadButton = forwardRef<HTMLInputElement, UploadProps>(({ handleUploadFile }, ref) => {
  return (
    <>
      <label htmlFor="upload-images" className="group flex h-9 w-9 cursor-pointer items-center justify-center">
        <Album02Icon
          width={20}
          height={20}
          strokeWidth={1.5}
          className="h-5 w-5 text-muted-foreground transition-transform group-active:scale-90"
        />
        <input
          ref={ref}
          id="upload-images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={true}
          hidden
          className="hidden"
          onChange={handleUploadFile}
        />
      </label>
    </>
  );
});
