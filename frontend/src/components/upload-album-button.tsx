import { Album02Icon } from "./icons/hugeicons";

type UploadProps = {
  imagesLength: number;
  handleUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const UploadAlbumButton = ({ imagesLength, handleUploadFile }: UploadProps) => {
  return (
    <>
      <label
        htmlFor="upload-images"
        aria-disabled={imagesLength >= 10}
        className="group flex h-9 w-9 cursor-pointer items-center justify-center aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        onClick={(e) => {
          if (imagesLength >= 10) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <Album02Icon
          width={20}
          height={20}
          strokeWidth={1.5}
          className="h-5 w-5 text-muted-foreground transition-transform group-aria-[disabled=false]:group-active:scale-90"
        />
        <input
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
};
