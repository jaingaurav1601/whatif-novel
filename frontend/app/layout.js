import { Spectral, Lora, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const spectral = Spectral({
  weight: ['400', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-spectral",
  display: 'swap',
});

const lora = Lora({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-lora",
  display: 'swap',
});

const outfit = Outfit({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: 'swap',
});

export const metadata = {
  title: "What If Novel - Reimagine Your Favorite Stories",
  description: "Explore alternative storylines in your favorite fictional universes, powered by AI. Create unique 'what if' scenarios in Harry Potter, Marvel, Star Wars, and more.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${spectral.variable} ${lora.variable} ${outfit.variable} font-serif antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
