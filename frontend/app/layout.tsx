import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TermsModal from "@/components/TermsModal";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gaytometro",
  description: "Descubre tu porcentaje GAY a través de la percepción colectiva.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white antialiased min-h-screen transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TermsModal />
          <main className="max-w-md mx-auto min-h-screen relative overflow-x-hidden overflow-y-auto">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
