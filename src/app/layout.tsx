import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { ThemeProvider } from "@/components/ThemeProvider";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CampusHub",
  description: "AI-Powered College Ecosystem Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex text-foreground bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {session?.user ? (
            <>
              <Sidebar role={session.user.role ?? 'STUDENT'} />
              <div className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all">
                <Navbar user={{
                  name: session.user.name ?? 'User',
                  email: session.user.email ?? '',
                  image: session.user.image ?? null,
                  role: session.user.role ?? 'STUDENT',
                  branch: session.user.branch,
                }} />
                <main className="flex-1 p-6 lg:p-10 relative overflow-hidden">
                  <PageTransition>{children}</PageTransition>
                </main>
                <footer className="py-6 px-6 lg:px-10 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/20 dark:bg-zinc-950/20 text-center text-xs text-muted-foreground font-semibold flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <div>
                    <span>Made with ❤️ by </span>
                    <span className="font-bold text-foreground">Manish Kumar</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>Support: <a href="mailto:ritikji1214@gmail.com" className="text-primary hover:underline font-bold">ritikji1214@gmail.com</a></span>
                    <span className="text-slate-300 dark:text-zinc-700">|</span>
                    <span>CampusHub v1.0.0</span>
                  </div>
                </footer>
              </div>
            </>
          ) : (
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
