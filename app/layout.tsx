import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Min Asistente IA",
  description: "Interfaz de usuario futurista para el Asistente IA MIN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full w-full`}
      suppressHydrationWarning
    >
      <body 
        className="h-full w-full bg-transparent select-none overflow-hidden antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
