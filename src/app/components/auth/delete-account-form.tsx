"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function DeleteAccountForm(): React.JSX.Element {
  const [message, setMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!window.confirm("Se eliminará tu cuenta y se anonimizará tu ficha. ¿Quieres continuar?")) {
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const result = await authClient.deleteUser({
        password: String(formData.get("password") ?? ""),
      });
      if (result.error !== null) {
        setMessage(
          result.error.message ?? "No se pudo eliminar la cuenta. Puedes volver a intentarlo.",
        );
        return;
      }
      window.location.assign("/");
    } catch {
      setMessage(
        "No se pudo conectar con el servidor. Tu cuenta sigue activa; puedes volver a intentarlo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="delete-account-form" onSubmit={handleSubmit}>
      <label className="form-field">
        Confirma tu contraseña para eliminar la cuenta
        <input autoComplete="current-password" name="password" required type="password" />
      </label>
      {message === undefined ? null : (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}
      <button className="button button-danger" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Eliminando…" : "Eliminar mi cuenta"}
      </button>
    </form>
  );
}
