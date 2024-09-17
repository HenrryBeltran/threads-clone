import { optimizeImage } from "@/lib/optimize-image";
import { useThreadStore } from "@/store";
import { toast } from "sonner";
import { Album02Icon } from "./icons/hugeicons";
import { Resource } from "./upload-album-view";

type UploadProps = {
  index: number;
};

const upTo10AttachmentsMessage = () =>
  toast("You can have up to 10 attachments.", {
    position: "bottom-center",
    classNames: {
      title:
        "text-base text-center text-secondary font-medium shadow-xl py-3.5 px-6 border border-muted-foreground/10 dark:bg-white bg-neutral-900 rounded-xl",
      toast: "!bg-transparent pointer-events-none p-0 flex justify-center border-none !shadow-none",
    },
  });

export const UploadAlbumButton = ({ index }: UploadProps) => {
  const thread = useThreadStore((state) => state.thread);
  const addImageToThread = useThreadStore((state) => state.addImageToThread);
  const changeCurrentIndexTo = useThreadStore((state) => state.changeCurrentIndexTo);

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const files = Array.from<File>(e.target.files);
    const optimizedImages: Resource[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (i > 9) {
        upTo10AttachmentsMessage();
        break;
      }

      const { base64, size } = await optimizeImage(file, undefined, 1);
      optimizedImages.push({ base64, size });
    }

    addImageToThread(index, optimizedImages, upTo10AttachmentsMessage);
  }

  return (
    <>
      <label
        htmlFor="upload-images"
        aria-disabled={thread[index].images.length >= 10}
        className="group flex h-9 w-9 cursor-pointer items-center justify-center aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        data-index={index}
        onPointerDown={(e) => changeCurrentIndexTo(Number(e.currentTarget.dataset.index))}
        onClick={(e) => {
          if (thread[index].images.length >= 10) {
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
