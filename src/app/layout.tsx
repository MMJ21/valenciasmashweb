import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ValenciaSmash",
  description: "La comunidad de Smash Ultimate de Valencia.",
  applicationName: "ValenciaSmash",
  appleWebApp: { capable: true, title: "ValenciaSmash" },
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
