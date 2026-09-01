import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CustomCursor from "../components/CustomCursor";
import SplashLoader from "../components/SplashLoader";

export const metadata: Metadata = {
  title: "Impano Entertainment | Cinematic Production & Post-Production",
  description: "Elevating Rwandan creative expression to the global stage through cinematic excellence and innovative storytelling. Master-class production and advanced post-production services in Kigali, Rwanda.",
  keywords: ["Cinematography", "Production Design", "Post-Production", "VFX", "Rwandan Film", "Impano Entertainment", "Kigali", "Color Grading"],
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SplashLoader />
        <Header />
        {children}
        <Footer />
        <CustomCursor />
      </body>
    </html>
  );
}
