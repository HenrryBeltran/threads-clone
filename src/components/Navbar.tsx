import { Heart, Home, Search, SquarePen, User } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between md:mx-auto md:h-[74px] md:max-w-screen-xl">
      <Link href="/">
        <ThreadsCloneLogo className="ml-[22px] h-8 w-8" />
      </Link>

      <ul className="grid grid-flow-col grid-rows-1 text-neutral-400/85">
        <li className="group relative mx-0.5 my-1 flex justify-center rounded-md px-8 py-5">
          <Home
            className="relative z-10"
            size={26}
            absoluteStrokeWidth
            strokeWidth={2.5}
          />
          <div className="absolute left-0 top-0 h-full w-full scale-90 rounded-lg transition-all group-hover:scale-100 group-hover:bg-neutral-100/90"></div>
        </li>
        <li className="group relative mx-0.5 my-1 flex justify-center rounded-md px-8 py-5">
          <Search
            className="relative z-10"
            size={26}
            absoluteStrokeWidth
            strokeWidth={2.5}
          />
          <div className="absolute left-0 top-0 h-full w-full scale-90 rounded-lg transition-all group-hover:scale-100 group-hover:bg-neutral-100/90"></div>
        </li>
        <li className="group relative mx-0.5 my-1 flex justify-center rounded-md px-8 py-5">
          <SquarePen
            className="relative z-10"
            size={26}
            absoluteStrokeWidth
            strokeWidth={2.5}
          />
          <div className="absolute left-0 top-0 h-full w-full scale-90 rounded-lg transition-all group-hover:scale-100 group-hover:bg-neutral-100/90"></div>
        </li>
        <li className="group relative mx-0.5 my-1 flex justify-center rounded-md px-8 py-5">
          <Heart
            className="relative z-10"
            size={26}
            absoluteStrokeWidth
            strokeWidth={2.5}
          />
          <div className="absolute left-0 top-0 h-full w-full scale-90 rounded-lg transition-all group-hover:scale-100 group-hover:bg-neutral-100/90"></div>
        </li>
        <li className="group relative mx-0.5 my-1 flex justify-center rounded-md px-8 py-5">
          <User
            className="relative z-10"
            size={26}
            absoluteStrokeWidth
            strokeWidth={2.5}
          />
          <div className="absolute left-0 top-0 h-full w-full scale-90 rounded-lg transition-all group-hover:scale-100 group-hover:bg-neutral-100/90"></div>
        </li>
      </ul>

      <div className="group mr-3 flex h-12 w-12 items-center justify-center">
        <MenuIcon className="h-6 w-6 fill-neutral-400/85 transition-colors group-hover:fill-foreground" />
      </div>
    </nav>
  );
}

function ThreadsCloneLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <g>
        <path
          d="M356.2,132l0.8,141.4c-0.3,18.3,1.1,46.4,9.2,55.3c22.4,31.1,68.1-9.2,64.6-96.9c-3.7-106-78-185.7-169.7-179.3
		c-104.5,7.3-182,102.6-177.6,218c6.2,164.3,126.6,233.2,273.1,157l13.6,49.4c-171.5,91.9-327.9-3.5-334.4-203
		C30.5,129.6,129.2,9.6,259.1,0.5c118.2-8.3,213.1,91.4,217.2,226.3c5.2,181.3-138.8,193.9-154.4,108.9
		c-10.5,32.2-43.3,58.4-79.4,60.9c-68.4,4.8-103.4-53.8-101.4-123.7c1.5-69.9,35.4-134.5,103.8-139.3c30.8-2.2,56.1,9.9,69.3,31.6
		l0-30.2L356.2,132z M251.2,353.1c44.5-3.1,62.7-47.8,63.3-92.5c0.5-45.9-17.3-88.1-61.9-85c-44.5,3.1-62.2,47.1-63.3,93.7
		C189.4,314.7,206.7,356.3,251.2,353.1z"
        />
      </g>
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-label="More"
      className={className}
    >
      <rect className="fill-inherit" width={21} height={2.5} rx={1.25} x={3} y={7}></rect>
      <rect
        className="fill-inherit"
        width={14}
        height={2.5}
        rx={1.25}
        x={10}
        y={15}
      ></rect>
    </svg>
  );
}
