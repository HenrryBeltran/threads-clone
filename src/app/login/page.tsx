import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <>
      <section className="flex min-h-[calc(100svh-48px)] w-full flex-col items-center justify-center px-5 sm:px-5">
        <header className="w-full space-y-16 pb-6">
          <h1 className="mx-auto w-fit bg-gradient-to-r from-purple-500 via-red-500 to-orange-400 bg-clip-text text-[12vw] font-extrabold leading-none tracking-tight text-transparent sm:text-[10vw] lg:text-[8vw] xl:text-[7vw]">
            Threads Clone
          </h1>
          <div className="mx-auto max-w-sm space-y-2">
            <h2 className="text-center text-3xl font-bold">Login</h2>
            <p className="text-center text-sm text-muted-foreground">
              A threads clone project.
            </p>
          </div>
        </header>
        <form action="" className="w-full">
          <div className="mx-auto max-w-sm space-y-2 pb-16">
            <div>
              <Input
                name="email"
                type="email"
                placeholder="Username or email address"
                className="rounded-xl border-none bg-muted px-4 py-7 dark:bg-muted/75"
              />
            </div>
            <div>
              <Input
                name="password"
                type="password"
                placeholder="Password"
                className="rounded-xl border-transparent bg-muted px-4 py-7 dark:bg-muted/75"
              />
            </div>
            <Button type="button" className="!mt-8 w-full rounded-xl py-6 text-base">
              Log in
            </Button>
          </div>
        </form>
      </section>
      <footer className="flex min-h-12 w-full items-start justify-center px-5 pb-5 pt-1 text-center text-[.8125rem] text-muted-foreground sm:px-0">
        &copy;2024 Threads Clone project by Henrry Beltran
      </footer>
    </>
  );
}
