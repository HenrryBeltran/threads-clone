"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { MenuIcon } from "./NavbarSVGs";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { useTheme } from "next-themes";

export default function NavbarMenu() {
  const [appearanceModal, setAppearance] = useState(false);

  return (
    <Popover>
      <PopoverTrigger>
        <div className="group mr-3 flex h-12 w-12 items-center justify-center">
          <MenuIcon className="h-6 w-6 fill-neutral-400/85 transition-colors duration-200 group-hover:fill-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="" align="end" side="top">
        {!appearanceModal ? (
          <MenuOptions setAppearance={setAppearance} />
        ) : (
          <AppearanceOption setAppearance={setAppearance} />
        )}
      </PopoverContent>
    </Popover>
  );
}

type OptionsProps = {
  setAppearance: Dispatch<SetStateAction<boolean>>;
};

function MenuOptions({ setAppearance }: OptionsProps) {
  return (
    <ul>
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

function AppearanceOption({ setAppearance }: OptionsProps) {
  const { setTheme } = useTheme();

  return (
    <div className="w-96">
      <button onClick={() => setAppearance(false)}>
        <ArrowLeft />
      </button>
      <h2>Appearance</h2>
      <ToggleGroup type="single" defaultValue="system" variant="outline">
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
