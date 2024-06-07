import { useBackdropStore } from "@/store";

export function Backdrop() {
  const { open } = useBackdropStore();

  return (
    <>{open && <div className="absolute left-0 top-0 z-20 h-svh w-svw bg-neutral-700/50 dark:bg-black/80"></div>}</>
  );
}
