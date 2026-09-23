import type { Metadata } from "next";
import {
  DM_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Solar System | Field Guide",
  description: "Explora el sistema solar y aprende sobre sus planetas.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${dmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
