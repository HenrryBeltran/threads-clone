import { useRef } from "react";
import { Cancel01Icon } from "./icons/hugeicons";
import { Button } from "./ui/button";
import { useThreadStore } from "@/store";

export type Resource = {
  base64: string;
  size: { width: number; height: number };
};

type Props = {
  threadIndex: number;
  containerWidth: number;
  images: Resource[];
  /// TODO: to remove
  // deleteImage: (index: number) => void;
};

export function UploadedAlbumCarousel({ threadIndex, containerWidth, images }: Props) {
  const pointX = useRef<number | null>(null);

  return (
    <div className="ml-3 h-[220px] overflow-hidden">
      <div
        className="relative h-60 overflow-x-scroll"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;

          pointX.current = x;
        }}
        onPointerMove={(e) => {
          if (pointX.current) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const delta = pointX.current - x;

            e.currentTarget.scrollLeft += delta;
            pointX.current = x;
          }
        }}
        onPointerUp={() => {
          if (pointX.current) {
            pointX.current = null;
          }
        }}
        onPointerLeave={() => (pointX.current = null)}
      >
        <div className="absolute left-0 top-0 flex w-max gap-4 active:cursor-grabbing">
          {images?.map((image, idx) => (
            <div key={idx} className="relative">
              <DeleteButton threadIndex={threadIndex} imageIndex={idx} image={image} />
              <figure>
                <img
                  src={image.base64}
                  width={image.size.width * 0.4}
                  height={image.size.height * 0.4}
                  alt="Profile picture"
                  draggable="false"
                  style={{
                    width: image.size.width > image.size.height ? `calc(${containerWidth / 2}px - 8px)` : "9rem",
                  }}
                  className="pointer-events-none h-52 select-none rounded-xl object-cover"
                />
              </figure>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UploadedAlbumDouble({ threadIndex, containerWidth, images }: Props) {
  return (
    <div className="ml-3">
      <div className="grid w-max grid-cols-2 grid-rows-1 gap-4 active:cursor-grabbing">
        {images?.map((image, idx) => (
          <div key={idx} className="relative flex">
            <DeleteButton threadIndex={threadIndex} imageIndex={idx} image={image} />
            <figure>
              <img
                src={image.base64}
                width={image.size.width * 0.4}
                height={image.size.height * 0.4}
                alt="Profile picture"
                draggable="false"
                style={{
                  // -8 is for gap, -22 is for the left profile picture, -6 is for the container padding
                  width: `${containerWidth * 0.5 - 8 - 22 - 6}px`,
                }}
                className="pointer-events-none h-full max-h-96 select-none rounded-xl object-cover"
              />
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}

export function UploadedSingleView({ threadIndex, images }: Props) {
  const image = images[0];
  const imageWidth = image.size.width * 0.15;
  const imageHeight = image.size.height * 0.15;
  const resizeImageWidth =
    (imageWidth > 150 || imageHeight > 260) && imageWidth < imageHeight ? imageWidth : image.size.width * 0.3;
  const resizeImageHeight =
    (imageWidth > 150 || imageHeight > 260) && imageWidth < imageHeight ? imageHeight : image.size.height * 0.3;
  const width = image.size.width > image.size.height ? "100%" : `${resizeImageWidth}px`;
  const height = image.size.width > image.size.height ? "100%" : `${resizeImageHeight}px`;

  return (
    <div className="ml-3">
      <div className="flex">
        <figure className="relative">
          <DeleteButton threadIndex={threadIndex} imageIndex={0} image={image} />
          <img
            src={image.base64}
            width={resizeImageWidth}
            height={resizeImageHeight}
            alt="Profile picture"
            draggable="false"
            style={{ width, height }}
            className="pointer-events-none max-h-[520px] max-w-full select-none rounded-xl object-cover"
          />
        </figure>
      </div>
    </div>
  );
}

type ButtonProps = {
  threadIndex: number;
  imageIndex: number;
  image: Resource;
};

function DeleteButton({ threadIndex, imageIndex, image }: ButtonProps) {
  const deleteImage = useThreadStore((state) => state.removeImageToThread);

  return (
    <Button
      variant="secondary"
      type="button"
      size="icon"
      disabled={image == undefined}
      className="absolute right-2 top-2 h-7 w-7 rounded-full border border-neutral-700/50 bg-neutral-950/55 text-white transition-all hover:bg-neutral-950/70 active:scale-90"
      onClick={() => deleteImage(threadIndex, imageIndex)}
    >
      <Cancel01Icon width={16} height={16} strokeWidth={2.5} className="h-4 w-4" />
    </Button>
  );
}
