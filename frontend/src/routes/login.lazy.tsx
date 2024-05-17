import { LoginForm } from "@/components/forms/login-form";
import { LoginFooter } from "@/components/login-footer";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <>
      <div className="flex min-h-[calc(100svh-48px)] flex-col justify-center py-8">
        <header className="flex w-full items-end justify-center px-5 py-6">
          <div className="w-full space-y-8">
            <h1 className="mx-auto w-fit bg-gradient-to-r from-purple-500 via-red-500 via-65% to-orange-400 bg-clip-text text-[10.5vw] font-extrabold leading-none tracking-tight text-transparent sm:text-[8vw] lg:text-[7vw] xl:text-[5.5vw]">
              Threads Clone
            </h1>
            <div className="mx-auto max-w-sm space-y-2">
              <h2 className="tracking-tigh text-center text-2xl font-bold leading-none">
                Log in
              </h2>
              <p className="text-center text-sm leading-none text-muted-foreground">
                Welcome to this threads clone project!
              </p>
            </div>
          </div>
        </header>
        <main className="flex w-full flex-col items-center justify-center px-5">
          <LoginForm />
          <LoginFooter />
        </main>
      </div>
      <footer className="flex min-h-12 w-full items-start justify-center px-5 pb-5 pt-1 text-center text-[.8125rem] text-muted-foreground sm:px-0">
        &copy;2024 Threads Clone project by Henrry Beltran
      </footer>
    </>
  );
}
