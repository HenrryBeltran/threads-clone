import LoginForm from "@/components/forms/login-form";
import LoginFooter from "@/components/login-footer";

export default function Login() {
  return (
    <>
      <div class="flex min-h-[calc(100svh-48px)] flex-col justify-center py-8">
        <header class="flex w-full items-end justify-center px-5 py-6">
          <div class="w-full space-y-8">
            <h1 class="mx-auto w-fit bg-gradient-to-r from-purple-500 via-red-500 via-65% to-orange-400 bg-clip-text text-[10.5vw] font-extrabold leading-none tracking-tight text-transparent sm:text-[8vw] lg:text-[7vw] xl:text-[5.5vw]">
              Threads Clone
            </h1>
            <div class="mx-auto max-w-sm space-y-2">
              <h2 class="tracking-tigh text-center text-2xl font-bold leading-none">
                Log in
              </h2>
              <p class="text-center text-sm leading-none text-muted-foreground">
                Welcome to this threads clone project!
              </p>
            </div>
          </div>
        </header>
        <main class="flex w-full flex-col items-center justify-center px-5">
          <LoginForm />
          <LoginFooter />
        </main>
      </div>
      <footer class="flex min-h-12 w-full items-start justify-center px-5 pb-5 pt-1 text-center text-[.8125rem] text-muted-foreground sm:px-0">
        &copy;2024 Threads Clone project by Henrry Beltran
      </footer>
    </>
  );
}
