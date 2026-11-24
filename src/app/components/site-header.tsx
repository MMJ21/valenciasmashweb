import Image from "next/image";
import Link from "next/link";
import { AuthActions } from "@/app/components/auth/auth-actions";

export function SiteHeader(): React.JSX.Element {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link aria-label="ValenciaSmash, inicio" className="brand" href="/">
          <Image alt="" height={42} priority src="/logo.jpg" unoptimized width={42} />
          <span className="brand-name">
            Valencia<span>Smash</span>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="primary-nav">
          <Link href="/#torneos">Torneos</Link>
          <Link href="/#ranking">Ranking</Link>
          <Link href="/#comunidad">Comunidad</Link>
        </nav>

        <AuthActions />
      </div>
    </header>
  );
}
