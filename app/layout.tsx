import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/components/CartProvider";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: "TEEVO — הדפסה על חולצות בעיצוב אישי",
  description: "מעלים תמונה, בוחרים חולצה, משלמים, מקבלים עד הבית.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </CartProvider>
      </body>
    </html>
  );
}
