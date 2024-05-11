import { Button, ButtonProps } from "@/components/ui/button";
import { NavigateOptions, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";

export interface Props extends ButtonProps {
  children: React.ReactNode;
  navigateOptions: NavigateOptions;
}

export function LinkButton({ children, navigateOptions, ...props }: Props) {
  const navigate = useNavigate();

  function handleClick() {
    navigate(navigateOptions);
  }

  return (
    <Button
      {...props}
      onClick={handleClick}
      className={clsx("rounded-xl", props.className)}
    >
      {children}
    </Button>
  );
}
