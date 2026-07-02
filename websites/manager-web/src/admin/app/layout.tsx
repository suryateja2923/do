import type { Metadata } from "next";
import "./globals.css";
import { AuthProviderContext } from "../contexts/auth-context";
import AuthProvider from "../providers/auth-provider";
import QueryProvider from "../providers/query-provider";
import SessionWarning from "../features/authentication/components/SessionWarning";

export const metadata: Metadata = {
  title: "HomiePG - Enterprise Admin Portal",
  description: "Administrative control center for HomiePG paying guest management SaaS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProviderContext>
          <QueryProvider>
            <AuthProvider>
              {children}
              <SessionWarning />
            </AuthProvider>
          </QueryProvider>
        </AuthProviderContext>
      </body>
    </html>
  );
}
