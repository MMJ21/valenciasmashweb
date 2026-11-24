"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function AuthActions(): React.JSX.Element {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div aria-hidden="true" className="header-actions">
        <span className="button button-secondary">Cuenta</span>
      </div>
    );
  }

  if (session !== null) {
    return (
      <div className="header-actions">
        <Link className="button button-secondary" href="/account">
          Mi ficha
        </Link>
        <button
          className="button button-primary"
          onClick={async () => {
            await authClient.signOut();
            window.location.assign("/");
          }}
          type="button"
        >
          Salir
        </button>
      </div>
    );
  }

  return (
    <div className="header-actions">
      <Link className="button button-secondary" href="/auth/sign-in">
        Entrar
      </Link>
      <Link className="button button-primary" href="/auth/sign-up">
        Crear cuenta
      </Link>
    </div>
  );
}
