import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Topbar } from "../components/Topbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CSV-PROCESING",
  description: "Sistema de procesamiento asíncrono de documentos CSV — Prueba técnica CarbonBox",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <Topbar />
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-slate-100/95 p-4 shadow-popover backdrop-blur-sm sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
