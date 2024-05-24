import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortUrl(url: string) {
  if (url.includes("https://")) {
    return url.slice(8);
  } else if (url.includes("https://www.")) {
    return url.slice(12);
  } else if (url.includes("http://")) {
    return url.slice(7);
  } else if (url.includes("http://www.")) {
    return url.slice(11);
  } else {
    return url;
  }
}
