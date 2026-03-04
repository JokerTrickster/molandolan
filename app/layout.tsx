import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { AuthProvider } from "@/lib/auth-context";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7C3AED",
};

export const metadata: Metadata = {
  title: "모란도란 - 소식 · 굿즈 · 게임",
  description: "모란도란의 소식을 확인하고, 굿즈를 구매하고, 재미있는 미니게임을 즐겨보세요!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <div className="max-w-md mx-auto min-h-screen bg-white shadow-sm">
            <Header />
            <main className="pb-20">{children}</main>
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
