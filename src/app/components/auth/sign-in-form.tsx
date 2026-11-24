"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function SignInForm(): React.JSX.Element {
  const [message, setMessage] = useState<string>();
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(undefined);
    setNeedsVerification(false);
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await authClient.signIn.username({
      username: String(formData.get("username") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    });
    setIsSubmitting(false);
    if (result.error !== null) {
      setNeedsVerification(result.error.status === 403);
      setMessage(
        result.error.status === 403
          ? "Verifica tu correo antes de iniciar sesión. Puedes solicitar otro enlace desde aquí."
          : (result.error.message ?? "Usuario o contraseña incorrectos."),
      );
      return;
    }
    window.location.assign("/account");
  }

  return (
    <form className="form-fields" onSubmit={handleSubmit}>
      <label className="form-field">
        Usuario
        <input autoComplete="username" name="username" required />
      </label>
      <label className="form-field">
        Contraseña
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      {message === undefined ? null : (
        <p className="form-message" role="alert">
          {message}
          {needsVerification ? (
            <>
              {" "}
              <Link href="/auth/resend-verification">Reenviar enlace de verificación</Link>.
            </>
          ) : null}
        </p>
      )}
      <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Entrando…" : "Iniciar sesión"}
      </button>
      <p className="auth-switch">
        <Link href="/auth/forgot-password">¿Olvidaste la contraseña?</Link>
      </p>
      <p className="auth-switch">
        ¿Aún no tienes cuenta? <Link href="/auth/sign-up">Regístrate</Link>
      </p>
    </form>
  );
}
