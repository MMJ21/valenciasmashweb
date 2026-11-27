"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm(): React.JSX.Element {
  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(undefined);
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const result = await authClient.requestPasswordReset({
        email: String(formData.get("email") ?? "").trim(),
        redirectTo: "/auth/reset-password",
      });
      if (result.error !== null) {
        setMessage(result.error.message ?? "No se pudo enviar el correo. Inténtalo más tarde.");
        return;
      }
      setMessage(
        "Si el correo está registrado, recibirás instrucciones para restablecer la contraseña.",
      );
    } catch {
      setMessage("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-fields" onSubmit={handleSubmit}>
      <label className="form-field">
        Correo electrónico de la cuenta
        <input autoComplete="email" name="email" required type="email" />
      </label>
      {message === undefined ? null : (
        <p aria-live="polite" className="form-message" role="status">
          {message}
        </p>
      )}
      <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enviando…" : "Enviar instrucciones"}
      </button>
    </form>
  );
}
