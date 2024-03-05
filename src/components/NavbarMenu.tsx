"use client";

import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MenuIcon } from "./NavbarSVGs";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

export default function NavbarMenu() {
  const [appearanceModal, setAppearance] = useState(false);
  const { theme, systemTheme, setTheme } = useTheme();

  useEffect(() => {
    const themeColor = document.querySelector('meta[name="theme-color"]');

    if (themeColor) {
      if (theme === "system") {
        themeColor.setAttribute(
          "content",
          systemTheme === "dark" ? "#171717" : "#ffffff",
        );
      } else {
        themeColor.setAttribute("content", theme === "dark" ? "#171717" : "#ffffff");
      }
    }
  }, [theme, systemTheme]);

  return (
    <Popover>
      <PopoverTrigger>
        <div className="group mr-3 flex h-12 w-12 items-center justify-center">
          <MenuIcon className="h-6 w-6 fill-neutral-400/85 transition-colors duration-200 group-hover:fill-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="relative w-fit border-none bg-transparent shadow-none"
        align="end"
        side="top"
      >
        {!appearanceModal ? (
          <MenuOptions setAppearance={setAppearance} />
        ) : (
          <AppearanceOption
            setAppearance={setAppearance}
            setTheme={setTheme}
            theme={theme}
          />
        )}
        <div
          data-appearance={appearanceModal}
          className="absolute right-0 top-0 h-32 w-32 rounded-xl border-[0.5px] border-muted bg-card shadow-xl transition-all data-[appearance=true]:w-[418px]"
        ></div>
      </PopoverContent>
    </Popover>
  );
}

type OptionsProps = {
  setAppearance: Dispatch<SetStateAction<boolean>>;
};

function MenuOptions({ setAppearance }: OptionsProps) {
  return (
    <ul className="relative z-[60]">
      <li>
        <button onClick={() => setAppearance(true)}>Appearance</button>
      </li>
      <li>
        <button>Saved</button>
      </li>
      <li>
        <button>Logout</button>
      </li>
    </ul>
  );
}

type AppearanceProps = {
  setAppearance: Dispatch<SetStateAction<boolean>>;
  setTheme: (theme: string) => void;
  theme?: string;
};

function AppearanceOption({ setAppearance, setTheme, theme }: AppearanceProps) {
  return (
    <div className="relative z-[60] w-96">
      <button onClick={() => setAppearance(false)}>
        <ArrowLeft />
      </button>
      <h2>Appearance</h2>
      <ToggleGroup type="single" defaultValue={theme} variant="outline">
        <ToggleGroupItem value="light" onClick={() => setTheme("light")}>
          <Sun />
        </ToggleGroupItem>
        <ToggleGroupItem value="dark" onClick={() => setTheme("dark")}>
          <Moon />
        </ToggleGroupItem>
        <ToggleGroupItem value="system" onClick={() => setTheme("system")}>
          Auto
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
