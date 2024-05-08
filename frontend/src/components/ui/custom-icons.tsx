import { JSX } from "solid-js";

export function ThreadsCloneLogo(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      class={props.class}
    >
      <g>
        <path
          d="M22.3,8.2l0,8.8c0,1.1,0.1,2.9,0.6,3.5c1.4,1.9,4.3-0.6,4-6.1C26.7,7.9,22,2.9,16.3,3.3C9.8,3.7,4.9,9.7,5.2,16.9
		        c0.4,10.3,7.9,14.6,17.1,9.8l0.8,3.1C12.4,35.5,2.6,29.6,2.2,17.1C1.9,8.1,8.1,0.6,16.2,0c7.4-0.5,13.3,5.7,13.6,14.1
		        c0.3,11.3-8.7,12.1-9.6,6.8c-0.7,2-2.7,3.6-5,3.8c-4.3,0.3-6.5-3.4-6.3-7.7c0.1-4.4,2.2-8.4,6.5-8.7c1.9-0.1,3.5,0.6,4.3,2V8.4
		        L22.3,8.2z M15.7,22.1c2.8-0.2,3.9-3,4-5.8c0-2.9-1.1-5.5-3.9-5.3c-2.8,0.2-3.9,2.9-4,5.9C11.8,19.7,12.9,22.3,15.7,22.1z"
        />
      </g>
    </svg>
  );
}

export function MenuIcon(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-label="More"
      class={props.class}
    >
      <rect class="fill-inherit" width={21} height={2.5} rx={1.25} x={3} y={7}></rect>
      <rect class="fill-inherit" width={14} height={2.5} rx={1.25} x={10} y={15}></rect>
    </svg>
  );
}
