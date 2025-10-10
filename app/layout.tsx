// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import Link from "next/link";
import LogoutForm from "@/components/LogoutForm";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoHLAG Exam App",
  description: "A complete exam management platform",
  icons: {
    icon: "/images/NH.png",
    apple: "/images/NH.png", // For iOS
  },
  manifest: "/manifest.json",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userRole = session?.user?.role;

  return (
    <html lang="en">
      <body className={inter.className}>
        <Header userRole={session?.user?.role} session={session} />
        <main className="pt-20">
          {" "}
          {/* Add padding-top to account for fixed header */}
          {children}
        </main>
      </body>
    </html>
  );
}
