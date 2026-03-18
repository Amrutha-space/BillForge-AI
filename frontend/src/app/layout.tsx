import type { Metadata } from "next";
import "./../styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "BillForge AI",
  description: "SaaS billing automation with AI risk predictions",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen fintech-bg text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

