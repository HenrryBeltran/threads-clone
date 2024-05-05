import { MenuIcon } from "@/components/ui/custom-icons";
import {
  ArrowLeft02Icon,
  Loading03AnimatedIcon,
  Moon02Icon,
  Sun03Icon,
} from "@/components/ui/hugeicons";
import { A } from "@solidjs/router";

export default function Menu() {
  /// TODO: make this to work as modal and change the theme
  // const { theme, setTheme } = useTheme();
  // const [modal, setModal] = useState(false);
  // const [appearanceModal, setAppearanceModal] = useState(false);

  return (
    <div class="flex justify-end">
      <div class="mr-3">
        <div class="group flex h-12 w-12 items-center justify-center">
          <MenuIcon class="h-6 w-6 fill-neutral-400/85 transition duration-200 group-hover:fill-foreground group-active:scale-90" />
        </div>
      </div>
      {/* <div */}
      {/*   // data-appearance={appearanceModal} */}
      {/*   class="h-[187px] w-40 rounded-2xl border-[0.5px] p-0 shadow-xl transition-all duration-200 data-[appearance=true]:h-[118px] data-[appearance=true]:w-80 dark:bg-neutral-900" */}
      {/* > */}
      {/*   {!appearanceModal ? ( */}
      {/*     <MenuOptions */}
      {/*       setAppearance={() => setAppearanceModal(true)} */}
      {/*       setModal={() => setModal(false)} */}
      {/*     /> */}
      {/*   ) : ( */}
      {/*     <AppearanceOption */}
      {/*       setAppearance={() => setAppearanceModal(false)} */}
      {/*       setTheme={setTheme} */}
      {/*       theme={theme} */}
      {/*     /> */}
      {/*   )} */}
      {/* </div> */}
    </div>
  );
}

type OptionsProps = {
  setAppearance: () => void;
  setModal: () => void;
};

function MenuOptions({ setAppearance, setModal }: OptionsProps) {
  // const [loading, setLoading] = useState(false);

  return (
    <ul class="relative z-[60] divide-y-[0.5px] divide-muted-foreground/30 py-1 font-[550]">
      <li>
        <button onClick={() => setAppearance()} class="px-5 py-2.5 outline-none">
          Appearance
        </button>
      </li>
      <li>
        <A href="/saved" onClick={() => setModal()} class="inline-block px-5 py-2.5">
          Saved
        </A>
      </li>
      <li>
        <A href="/liked" onClick={() => setModal()} class="inline-block px-5 py-2.5">
          Your likes
        </A>
      </li>
      <li>
        <button
          class="flex w-full items-center justify-between px-5 py-2.5"
          // onClick={async () => {
          //   setLoading(true);
          //   await logoutAction();
          //   setLoading(false);
          // }}
        >
          Log out
          <Loading03AnimatedIcon
            /// TODO: aria-hidden={!loading} should be in a loading state
            aria-hidden={true}
            class="text-foreground aria-hidden:hidden"
            stroke-width={2}
            width={20}
            height={20}
          />
        </button>
      </li>
    </ul>
  );
}

type AppearanceProps = {
  setAppearance: () => void;
  setTheme: (theme: string) => void;
  /// TODO: check this unused
  theme?: string;
};

function AppearanceOption({ setAppearance, setTheme }: AppearanceProps) {
  return (
    <div class="relative z-[60] w-80">
      <div class="flex w-full items-center justify-between">
        {/* TODO: open modal i think */}
        <button
          onClick={() => setAppearance()}
          class="flex h-12 w-12 items-center justify-center"
        >
          <ArrowLeft02Icon stroke-width={1.5} width={20} height={20} />
        </button>
        <h2 class="text-center font-[550]">Appearance</h2>
        <div class="p-6" />
      </div>
      <div class="w-full px-4 pb-5 pt-2">
        <div class="grid w-full grid-cols-3 grid-rows-1 rounded-2xl bg-muted/80 dark:bg-neutral-950">
          {/* TODO: set to ligth */}
          <button
            type="button"
            class="rounded-2xl py-5 text-muted-foreground/80 hover:!bg-transparent aria-checked:border aria-checked:border-neutral-300 aria-checked:!bg-neutral-200/50 dark:aria-checked:border-neutral-600 dark:aria-checked:!bg-neutral-700/70"
            onClick={() => setTheme("light")}
          >
            <Sun03Icon stroke-width={1.5} width={20} height={20} />
          </button>
          {/* TODO: set to dark */}
          <button
            type="button"
            class="rounded-2xl py-5 text-muted-foreground/80 hover:!bg-transparent aria-checked:border aria-checked:border-neutral-300 aria-checked:!bg-neutral-200/50 dark:aria-checked:border-neutral-600 dark:aria-checked:!bg-neutral-700/70"
            onClick={() => setTheme("dark")}
          >
            <Moon02Icon stroke-width={1.5} width={20} height={20} />
          </button>
          {/* TODO: set to system */}
          <button
            type="button"
            class="rounded-2xl py-5 text-muted-foreground/80 hover:!bg-transparent aria-checked:border aria-checked:border-neutral-300 aria-checked:!bg-neutral-200/50 dark:aria-checked:border-neutral-600 dark:aria-checked:!bg-neutral-700/70"
            onClick={() => setTheme("system")}
          >
            Auto
          </button>
        </div>
      </div>
    </div>
  );
}
