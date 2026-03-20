import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { Manrope } from "next/font/google";

const appSans = Manrope({
  subsets: ["latin"],
  variable: "--font-app-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${appSans.variable} font-sans`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
