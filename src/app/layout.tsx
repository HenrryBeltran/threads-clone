import BottomNavbar from "@/components/BottomNavbar";
import Header from "@/components/Hearder";
import { ThemeProvider } from "@/components/ThemeProvider";
import UpdateTheme from "@/components/UpdateTheme";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Threads Clone",
  description: "Threads clone by Henrry Beltran.",
};

export const viewport: Viewport = {
  themeColor: "currentColor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} bg-white dark:bg-[#242526]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <UpdateTheme />
          <main className="bg-background">
            <Header />
            {children}
            <BottomNavbar />
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
