import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kraamweek App",
  description: "Een app voor het bijhouden van gegevens tijdens de kraamweek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
