import ForgottenPasswordForm from "@/components/forms/forgotten-password-form";
import { Link, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/forgotten-password")({
  component: ForgottenPassword,
});

function ForgottenPassword() {
  return (
    <>
      <main className="flex min-h-[calc(100svh-48px)] w-full flex-col items-center justify-center px-5 pt-6 sm:px-5">
        <header className="w-full space-y-12 py-8">
          <div className="mx-auto h-12 w-12">
            <Link to="/login">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 32 32"
                style={{ background: "transparent" }}
              >
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="80%">
                    <stop offset="0%" style={{ stopColor: "#8b5cf6" }} />
                    <stop offset="55%" style={{ stopColor: "#ec4899" }} />
                    <stop offset="100%" style={{ stopColor: "#f59e0b" }} />
                  </linearGradient>
                </defs>
                <g>
                  <path
                    className="fill-current"
                    d="M22.3,8.2l0,8.8c0,1.1,0.1,2.9,0.6,3.5c1.4,1.9,4.3-0.6,4-6.1C26.7,7.9,22,2.9,16.3,3.3C9.8,3.7,4.9,9.7,5.2,16.9
                      c0.4,10.3,7.9,14.6,17.1,9.8l0.8,3.1C12.4,35.5,2.6,29.6,2.2,17.1C1.9,8.1,8.1,0.6,16.2,0c7.4-0.5,13.3,5.7,13.6,14.1
                      c0.3,11.3-8.7,12.1-9.6,6.8c-0.7,2-2.7,3.6-5,3.8c-4.3,0.3-6.5-3.4-6.3-7.7c0.1-4.4,2.2-8.4,6.5-8.7c1.9-0.1,3.5,0.6,4.3,2V8.4
                      L22.3,8.2z M15.7,22.1c2.8-0.2,3.9-3,4-5.8c0-2.9-1.1-5.5-3.9-5.3c-2.8,0.2-3.9,2.9-4,5.9C11.8,19.7,12.9,22.3,15.7,22.1z"
                    style={{ fill: "url(#gradient)" }}
                  />
                </g>
              </svg>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-sm md:max-w-lg">
          <h1 className="text-balance text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Request Password Reset
          </h1>
          <p className="mb-8 mt-2 text-pretty text-center text-sm text-muted-foreground">
            If you forgot your password, write you email to request a reset password.
          </p>
          <ForgottenPasswordForm />
        </div>
      </main>
      <footer className="flex min-h-12 w-full items-start justify-center px-5 pb-5 pt-1 text-center text-[.8125rem] text-muted-foreground sm:px-0">
        &copy;2024 Threads Clone project by Henrry Beltran
      </footer>
    </>
  );
}
