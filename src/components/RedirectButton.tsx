"use client";

import { useRouter } from "next/navigation";

type Props = { children: React.ReactNode; href: string };

export default function RedirectButton({ children, href }: Props) {
  const { push } = useRouter();

  return <div onClick={() => push(href)}>{children}</div>;
}
