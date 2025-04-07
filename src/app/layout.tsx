import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/nav";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "FastFilms - Community Cinema Crowdfunding",
  description: "Support and attend community film screenings across Cornwall. Book tickets, pre-order food and drinks, and help bring cinema to your local area.",
  keywords: ["cinema", "crowdfunding", "Cornwall", "film screenings", "community cinema", "tickets", "food", "drinks"],
  authors: [{ name: "FastFilms" }],
  creator: "FastFilms",
  publisher: "FastFilms",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fastfilms.co.uk'),
  openGraph: {
    title: "FastFilms - Community Cinema Crowdfunding",
    description: "Support and attend community film screenings across Cornwall",
    url: 'https://fastfilms.co.uk',
    siteName: 'FastFilms',
    locale: 'en_GB',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Nav />
            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
