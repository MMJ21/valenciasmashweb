import { SignInForm } from "@/app/components/auth/sign-in-form";

export default function SignInPage(): React.JSX.Element {
  return (
    <main className="page-container auth-page">
      <section aria-labelledby="sign-in-title" className="auth-card sign-in-card">
        <h1 id="sign-in-title">Iniciar sesión</h1>
        <SignInForm />
      </section>
    </main>
  );
}
