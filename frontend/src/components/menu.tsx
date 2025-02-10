import { MenuIcon } from "@/components/icons/custom-icons";
import { ArrowLeft02Icon, Loading03AnimatedIcon, Moon02Icon, Sun03Icon } from "@/components/icons/hugeicons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from "@/hooks/theme";
import { api } from "@/lib/api";
import { safeTry } from "@server/lib/safe-try";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Theme } from "./theme-provider";

export default function Menu() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"options" | "appearance">("options");

  return (
    <Popover open={open} onOpenChange={(value) => setOpen(value)}>
      <PopoverTrigger className="mr-3 justify-self-end">
        <div className="group flex h-12 w-12 items-center justify-center">
          <MenuIcon className="h-6 w-6 fill-neutral-400/85 transition duration-200 group-hover:fill-foreground group-active:scale-90" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        data-appearance={state === "appearance"}
        className="h-[187px] w-40 origin-top-right !animate-none rounded-2xl border border-muted-foreground/20 p-0 shadow-xl transition-all data-[appearance=true]:h-[118px] data-[appearance=true]:w-80 data-[state=open]:!animate-appear dark:bg-neutral-900"
        onCloseAutoFocus={() => setState("options")}
      >
        {state === "options" ? (
          <MenuOptions setState={() => setState("appearance")} close={() => setOpen(false)} />
        ) : (
          <AppearanceMenu setState={() => setState("options")} setTheme={setTheme} theme={theme} />
        )}
      </PopoverContent>
    </Popover>
  );
}

type OptionsProps = {
  setState: () => void;
  close: () => void;
};

function MenuOptions({ setState, close }: OptionsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await safeTry(api.auth.logout.$post());

      if (error) {
        return null;
      }
    },
    onSuccess: () => {
      queryClient.clear();
      navigate({ to: "/login" });
    },
  });

  return (
    <ul className="relative z-[60] divide-y divide-muted-foreground/20 py-1 font-[550]">
      <li>
        <button onClick={() => setState()} className="w-full px-5 py-2.5 text-start outline-none">
          Appearance
        </button>
      </li>
      <li>
        <Link
          onClick={async (e) => {
            e.preventDefault();
            close();
            await navigate({ to: "/saved" });
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          className="inline-block w-full px-5 py-2.5"
        >
          Saved
        </Link>
      </li>
      <li>
        <Link
          onClick={async (e) => {
            e.preventDefault();
            close();
            await navigate({ to: "/liked" });
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
          className="inline-block w-full px-5 py-2.5"
        >
          Your likes
        </Link>
      </li>
      <li>
        <button className="flex w-full items-center justify-between px-5 py-2.5" onClick={() => mutation.mutate()}>
          Log out
          <Loading03AnimatedIcon
            aria-hidden={!mutation.isPending}
            className="text-foreground aria-hidden:hidden"
            strokeWidth={3}
            width={20}
            height={20}
          />
        </button>
      </li>
    </ul>
  );
}

type AppearanceProps = {
  setState: () => void;
  setTheme: (theme: Theme) => void;
  theme?: string;
};

function AppearanceMenu({ setState, setTheme, theme }: AppearanceProps) {
  return (
    <div className="relative z-[60] w-80">
      <div className="flex w-full items-center justify-between">
        <button onClick={() => setState()} className="flex h-12 w-12 items-center justify-center">
          <ArrowLeft02Icon strokeWidth={1.5} width={20} height={20} />
        </button>
        <h2 className="text-center font-[550]">Appearance</h2>
        <div className="p-6" />
      </div>
      <ToggleGroup type="single" className="w-full px-4 pb-5 pt-2" defaultValue={theme}>
        <div className="grid w-full grid-cols-3 grid-rows-1 rounded-2xl bg-muted/80 dark:bg-neutral-950">
          <ToggleGroupItem
            value="light"
            className="rounded-2xl py-5 text-muted-foreground/80 hover:!bg-transparent aria-checked:border aria-checked:border-neutral-300 aria-checked:!bg-neutral-200/50 dark:aria-checked:border-neutral-600 dark:aria-checked:!bg-neutral-700/70"
            onClick={() => setTheme("light")}
          >
            <Sun03Icon strokeWidth={1.5} width={20} height={20} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="dark"
            className="rounded-2xl py-5 text-muted-foreground/80 hover:!bg-transparent aria-checked:border aria-checked:border-neutral-300 aria-checked:!bg-neutral-200/50 dark:aria-checked:border-neutral-600 dark:aria-checked:!bg-neutral-700/70"
            onClick={() => setTheme("dark")}
          >
            <Moon02Icon strokeWidth={1.5} width={20} height={20} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="system"
            className="rounded-2xl py-5 text-muted-foreground/80 hover:!bg-transparent aria-checked:border aria-checked:border-neutral-300 aria-checked:!bg-neutral-200/50 dark:aria-checked:border-neutral-600 dark:aria-checked:!bg-neutral-700/70"
            onClick={() => setTheme("system")}
          >
            Auto
          </ToggleGroupItem>
        </div>
      </ToggleGroup>
    </div>
  );
}
