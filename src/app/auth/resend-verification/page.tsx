import Link from "next/link";
import { ResendVerificationForm } from "@/app/components/auth/resend-verification-form";

export default function ResendVerificationPage(): React.JSX.Element {
  return (
    <main className="page-container auth-page">
      <section aria-labelledby="resend-verification-title" className="auth-card">
        <span className="section-kicker">Activación de cuenta</span>
        <h1 id="resend-verification-title">Verifica tu correo</h1>
        <p className="auth-description">
          Si no recibiste el mensaje o caducó el enlace, puedes solicitar otro.
        </p>
        <ResendVerificationForm />
        <p className="auth-switch">
          <Link href="/auth/sign-in">Volver al inicio de sesión</Link>
        </p>
      </section>
    </main>
  );
}
