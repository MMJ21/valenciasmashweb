"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthActions(): React.JSX.Element {
  const { data: session, isPending } = authClient.useSession();
  const [signOutError, setSignOutError] = useState<string>();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut(): Promise<void> {
    setSignOutError(undefined);
    setIsSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error !== null) {
        setSignOutError(result.error.message ?? "No se pudo cerrar la sesión. Inténtalo de nuevo.");
        return;
      }
      window.location.assign("/");
    } catch {
      setSignOutError("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsSigningOut(false);
    }
  }

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
          disabled={isSigningOut}
          onClick={handleSignOut}
          type="button"
        >
          {isSigningOut ? "Cerrando…" : "Salir"}
        </button>
        {signOutError === undefined ? null : (
          <p className="header-auth-error" role="alert">
            {signOutError}
          </p>
        )}
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
