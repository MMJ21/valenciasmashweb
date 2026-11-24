"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm(): React.JSX.Element {
  const [message, setMessage] = useState<string>();
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setMessage(undefined);
    const token = new URLSearchParams(window.location.search).get("token");
    if (token === null) {
      setMessage("El enlace no es válido. Solicita un restablecimiento nuevo.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await authClient.resetPassword({
      newPassword: String(formData.get("password") ?? ""),
      token,
    });
    setIsSubmitting(false);
    if (result.error !== null) {
      setMessage(result.error.message ?? "No se pudo cambiar la contraseña.");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="form-message form-message-success" role="status">
        Contraseña actualizada. <Link href="/auth/sign-in">Inicia sesión</Link>.
      </div>
    );
  }

  return (
    <form className="form-fields" onSubmit={handleSubmit}>
      <label className="form-field">
        Nueva contraseña
        <input
          autoComplete="new-password"
          minLength={12}
          name="password"
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
        {isSubmitting ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
