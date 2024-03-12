import SignUpForm from "./SignUpForm";

export default function SignUpPage() {
  return (
    <>
      <section className="flex min-h-[calc(100svh-48px)] w-full flex-col items-center justify-center px-5 pt-6 sm:px-5">
        <header className="w-full space-y-16 pb-6">
          <h1 className="mx-auto w-fit bg-gradient-to-r from-purple-500 via-red-500 to-orange-400 bg-clip-text text-[12vw] font-extrabold leading-none tracking-tight text-transparent sm:text-[10vw] lg:text-[8vw] xl:text-[7vw]">
            Threads Clone
          </h1>
          <div className="mx-auto max-w-sm space-y-1">
            <h2 className="text-center text-3xl font-bold">Sign Up</h2>
            <p className="text-center text-sm text-muted-foreground">
              Hi there! 👋 Join us now, and start a new thread!
            </p>
          </div>
        </header>
        <SignUpForm />
      </section>
      <footer className="flex min-h-12 w-full items-start justify-center px-5 pb-5 pt-1 text-center text-[.8125rem] text-muted-foreground sm:px-0">
        &copy;2024 Threads Clone project by Henrry Beltran
      </footer>
    </>
  );
}
