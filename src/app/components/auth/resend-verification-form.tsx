"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ResendVerificationForm(): React.JSX.Element {
  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await authClient.sendVerificationEmail({
      email: String(formData.get("email") ?? "").trim(),
      callbackURL: "/auth/verified",
    });
    setIsSubmitting(false);
    setMessage(
      result.error === null
        ? "Si la cuenta necesita verificar el correo, enviaremos un nuevo enlace."
        : (result.error.message ?? "No se pudo enviar el correo."),
    );
  }

  return (
    <form className="form-fields" onSubmit={handleSubmit}>
      <label className="form-field">
        Correo electrónico
        <input autoComplete="email" name="email" required type="email" />
      </label>
      {message === undefined ? null : (
        <p aria-live="polite" className="form-message" role="status">
          {message}
        </p>
      )}
      <button className="button button-primary auth-submit" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Enviando…" : "Reenviar enlace"}
      </button>
    </form>
  );
}
