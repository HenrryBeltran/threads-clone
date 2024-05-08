import LoginForm from "@/components/forms/login-form";
import LoginFooter from "@/components/login-footer";
import { closeLoginModal, isModalOpen } from "@/lib/login-store";
import { Show, createEffect, onCleanup } from "solid-js";
import { Portal } from "solid-js/web";

export default function LoginModal() {
  const body = document.querySelector("body");

  createEffect(() => {
    if (!body) {
      return;
    }

    if (isModalOpen()) {
      body.style.height = "100svh";
      body.style.overflow = "hidden";
    } else {
      body.style.height = "auto";
      body.style.overflow = "visible";
    }
  });

  onCleanup(() => {
    closeLoginModal();
  });

  return (
    <Show when={isModalOpen()}>
      <Portal>
        <div
          style={`top: ${window.scrollY}px`}
          class="absolute z-50 flex h-svh w-svw items-center justify-center bg-neutral-800/50 dark:bg-black/75"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            closeLoginModal();
          }}
        >
          <div
            class="m-6 w-full max-w-sm rounded-2xl bg-white p-6 dark:bg-neutral-900"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h1 class="mb-4 text-center text-lg font-bold">Log in</h1>
            <LoginForm />
            <LoginFooter />
          </div>
        </div>
      </Portal>
    </Show>
  );
}
