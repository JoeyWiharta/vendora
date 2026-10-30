import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@wrksz/themes/next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { QueryProvider } from "@/query/queryProvider";
import { Toaster } from "@/components/ui/sonner";

const jakartaFont = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Vendora",
  description: "Buy better. Sell smarter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased font-sans", jakartaFont.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>{children}</QueryProvider>
          <Toaster position="top-right" duration={4000} visibleToasts={1} />
        </ThemeProvider>
      </body>
    </html>
  );
}