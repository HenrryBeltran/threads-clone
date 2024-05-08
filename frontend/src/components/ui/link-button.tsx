import { Button, ButtonProps } from "@/components/ui/button";
import { NavigateOptions, useNavigate } from "@solidjs/router";
import clsx from "clsx";
import { JSXElement } from "solid-js";

export interface Props extends ButtonProps {
  href: string;
  children: JSXElement;
  class?: string;
  options?: Partial<NavigateOptions>;
}

export function LinkButton({ href, children, options, ...props }: Props) {
  const navigate = useNavigate();

  function handleClick() {
    navigate(href, options);
  }

  return (
    <Button {...props} onClick={handleClick} class={clsx("rounded-xl", props.class)}>
      {children}
    </Button>
  );
}
