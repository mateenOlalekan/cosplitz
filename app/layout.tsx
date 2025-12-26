import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900",],
});

export const metadata: Metadata = {
  title: "Cosplitz",
  description:
    "CoSplitz helps you share expenses, organize group payments, and buy things together — whether you're a seller or just need people to split costs with.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
