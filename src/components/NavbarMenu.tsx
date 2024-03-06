"use client";

import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";
import { MenuIcon } from "./NavbarSVGs";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function NavbarMenu() {
  const { theme, setTheme } = useTheme();
  const [appearanceModal, setAppearanceModal] = useState(false);

  return (
    <Popover>
      <PopoverTrigger className="mr-3 justify-self-end">
        <div className="group flex h-12 w-12 items-center justify-center">
          <MenuIcon className="h-6 w-6 fill-neutral-400/85 transition duration-200 group-hover:fill-foreground group-active:scale-90" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        data-appearance={appearanceModal}
        align="end"
        side="top"
        className="h-[187px] w-40 rounded-2xl border-[0.5px] p-0 shadow-xl transition-all duration-200 data-[appearance=true]:h-[118px] data-[appearance=true]:w-80 dark:bg-neutral-900"
      >
        {!appearanceModal ? (
          <MenuOptions setAppearance={() => setAppearanceModal(true)} />
        ) : (
          <AppearanceOption
            setAppearance={() => setAppearanceModal(false)}
            setTheme={setTheme}
            theme={theme}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

type OptionsProps = {
  setAppearance: () => void;
};

function MenuOptions({ setAppearance }: OptionsProps) {
  return (
    <ul className="relative z-[60] divide-y-[0.5px] divide-muted-foreground/30 py-1 font-[550]">
      <li>
        <button onClick={() => setAppearance()} className="px-5 py-2.5 outline-none">
          Appearance
        </button>
      </li>
      <li>
        <Link href="/saved" className="inline-block px-5 py-2.5">
          Saved
        </Link>
      </li>
      <li>
        <Link href="/liked" className="inline-block px-5 py-2.5">
          Your likes
        </Link>
      </li>
      <li>
        <button className="px-5 py-2.5">Logout</button>
      </li>
    </ul>
  );
}

type AppearanceProps = {
  setAppearance: () => void;
  setTheme: (theme: string) => void;
  theme?: string;
};

function AppearanceOption({ setAppearance, setTheme, theme }: AppearanceProps) {
  return (
    <div className="relative z-[60] w-80">
      <div className="flex w-full items-center justify-between">
        <button
          onClick={() => setAppearance()}
          className="flex h-12 w-12 items-center justify-center"
        >
          <ArrowLeft absoluteStrokeWidth strokeWidth={1.5} size={20} />
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
            <Sun absoluteStrokeWidth strokeWidth={1.5} size={20} />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="dark"
            className="rounded-2xl py-5 text-muted-foreground/80 hover:!bg-transparent aria-checked:border aria-checked:border-neutral-300 aria-checked:!bg-neutral-200/50 dark:aria-checked:border-neutral-600 dark:aria-checked:!bg-neutral-700/70"
            onClick={() => setTheme("dark")}
          >
            <Moon absoluteStrokeWidth strokeWidth={1.5} size={20} />
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
