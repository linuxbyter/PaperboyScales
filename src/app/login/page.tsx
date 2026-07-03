import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="relay">
            <span className="relay-node" />
            <span className="relay-line" />
            <span className="relay-node" />
          </div>
          <h1 className="text-3xl font-bold text-ink" style={{ fontFamily: "var(--font-display)" }}>
            Paperboy Network
          </h1>
          <p className="text-muted">Sign in to your agent portal</p>
        </div>

        <div className="card p-8 flex justify-center">
          <SignIn routing="hash" />
        </div>

        <p className="text-center text-sm text-muted">
          New agent?{" "}
          <Link href="/signup" className="text-brass hover:text-brass-light">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
