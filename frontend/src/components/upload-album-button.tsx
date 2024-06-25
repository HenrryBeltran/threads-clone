import { Album02Icon } from "./icons/hugeicons";

type UploadProps = {
  handleUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const UploadAlbumButton = ({ handleUploadFile }: UploadProps) => {
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
