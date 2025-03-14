import type { Metadata } from "next";
import "./globals.css";
import ContextProvider from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "dApp test",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`dark antialiased`}>
        <ContextProvider cookies="{cookies}">{children}</ContextProvider>
      </body>
    </html>
  );
}
