import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProviderContext } from "@/contexts/auth-context";
import AuthProvider from "@/providers/auth-provider";
import QueryProvider from "@/providers/query-provider";
import SessionWarning from "@/features/authentication/components/SessionWarning";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomiePG - Manager Portal",
  description: "Operational assistant control center for HomiePG paying guest management SaaS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProviderContext>
          <QueryProvider>
            <AuthProvider>
              {children}
              <SessionWarning />
              <Toaster position="top-right" closeButton richColors theme="dark" />
            </AuthProvider>
          </QueryProvider>
        </AuthProviderContext>
      </body>
    </html>
  );
}
