"use client";

import { useState } from "react";
import Link from "next/link";

export function SignUpForm(): React.JSX.Element {
  const [message, setMessage] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(undefined);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    try {
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: username,
          username,
          email,
          password,
          adultConfirmed: true,
          termsAccepted: true,
          callbackURL: "/auth/verified",
        }),
      });
      if (!response.ok) {
        const errorBody: unknown = await response.json().catch(() => undefined);
        const errorMessage =
          typeof errorBody === "object" &&
          errorBody !== null &&
          "message" in errorBody &&
          typeof errorBody.message === "string"
            ? errorBody.message
            : "No se pudo crear la cuenta. Inténtalo de nuevo.";
        setMessage(errorMessage);
        return;
      }
      setSuccess(true);
    } catch {
      setMessage("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div aria-live="polite" className="form-message form-message-success" role="status">
        Cuenta creada. Revisa tu correo para verificar la dirección y activar el acceso.
      </div>
    );
  }

  return (
    <form className="form-fields" onSubmit={handleSubmit}>
      <label className="form-field">
        Usuario
        <input
          autoComplete="username"
          maxLength={32}
          minLength={3}
          name="username"
          pattern="[A-Za-z0-9_.]+"
          placeholder="por ejemplo, valencia_player"
          required
        />
      </label>
      <label className="form-field">
        Correo electrónico
        <input
          autoComplete="email"
          name="email"
          placeholder="tu@correo.com"
          required
          type="email"
        />
      </label>
      <label className="form-field">
        Contraseña
        <input
          autoComplete="new-password"
          minLength={12}
          name="password"
          placeholder="Al menos 12 caracteres"
          required
          type="password"
        />
      </label>
      {message === undefined ? null : (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}
      <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
      </button>
      <label className="form-consent">
        <input name="termsAccepted" required type="checkbox" />
        <span>
          Confirmo que soy mayor de edad y acepto los{" "}
          <Link href="/legal/terms">términos de uso</Link>.
        </span>
      </label>
      <p className="auth-switch">
        ¿Ya tienes cuenta? <Link href="/auth/sign-in">Inicia sesión</Link>
      </p>
    </form>
  );
}
