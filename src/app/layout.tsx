import type { Metadata } from "next";
import { SiteFooter } from "@/app/components/site-footer";
import { SiteHeader } from "@/app/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "ValenciaSmash",
  description: "La comunidad de Smash Ultimate de Valencia.",
  applicationName: "ValenciaSmash",
  icons: { icon: "/logo.jpg" },
  appleWebApp: { capable: true, title: "ValenciaSmash" },
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  return (
    <html lang="es">
      <body>
        <div className="site-shell">
          <SiteHeader />
          <div className="site-main">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
