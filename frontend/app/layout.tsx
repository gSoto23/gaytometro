import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TermsModal from "@/components/TermsModal";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: "GAYMOMETRO | Descubre tu porcentaje",
    template: "%s | GAYMOMETRO",
  },
  description: "Desliza, vota y descubre qué tan GAY cree la gente que eres. La experiencia viral más divertida.",
  keywords: ["gaymometro", "porcentaje gay", "juego", "votar fotos", "swipe", "diversidad", "lgtb", "entretenimiento", "app social"],
  authors: [{ name: "Gaymometro Team" }],
  creator: "Gaymometro",
  publisher: "Gaymometro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "GAYMOMETRO | Descubre tu porcentaje",
    description: "Sube tu foto y deja que la comunidad decida. ¡Totalmente anónimo!",
    url: "https://gaymometro.com",
    siteName: "GAYMOMETRO",
    images: [
      {
        url: "/logobk.jpeg",
        width: 1200,
        height: 630,
        alt: "GAYMOMETRO Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GAYMOMETRO | Descubre tu porcentaje",
    description: "Sube tu foto y deja que la comunidad decida. ¡Totalmente anónimo!",
    images: ["/logobk.jpeg"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦄</text></svg>",
    apple: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🦄</text></svg>",
  },
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
