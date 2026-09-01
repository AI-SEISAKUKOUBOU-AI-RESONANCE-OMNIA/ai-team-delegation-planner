import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIチーム委任プランナー",
  description:
    "やりたいことをAIエージェントの役割分担と人間確認ポイントに分解する、無料のルールベースツール。",
  openGraph: {
    title: "AIチーム委任プランナー",
    description: "その仕事、AIチームならどう分ける？",
    type: "website",
    images: [{ url: "/og.png", width: 1730, height: 910 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIチーム委任プランナー",
    description: "その仕事、AIチームならどう分ける？",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
