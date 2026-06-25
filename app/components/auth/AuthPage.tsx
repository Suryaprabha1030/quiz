"use client";

import { sb } from "@/app/lib/supabase";
import { useState } from "react";

interface AuthPageProps {
  onAuth: (session: any) => void;
  toast: (message: string, type?: string) => void;
}

export function AuthPage({ onAuth, toast }: AuthPageProps) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [companyName, setCompanyName] = useState("");

  async function submit() {
    if (!email || !password) {
      setError("Fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res =
        mode === "login"
          ? await sb.signIn(email, password)
          : await sb.signUp(email, password, companyName);
      if (res.error || res.error_description) {
        setError(res.error_description || res.error?.message || "Auth failed");
      } else if (res.access_token) {
        toast("Welcome! 🎉", "success");
        onAuth({ token: res.access_token, user: res.user });
      } else if (mode === "signup") {
        toast("Check your email to confirm signup!", "success");
      }
    } catch (e) {
      setError("Network error – check your Supabase URL/key");
    }
    setLoading(false);
  }

  return (
    <div className="page-center ">
      <div style={{ textAlign: "center", marginBottom: "rem" }}>
        <h1 className="auth-title">
          {mode === "login" ? "Welcome back" : "Join QuizForge"}
        </h1>
        <p className="auth-sub">
          {mode === "login"
            ? "Sign in to create & take quizzes"
            : "Create your account to get started"}
        </p>
      </div>
      <div className="auth-box ">
        {error && <div className="error-msg">{error}</div>}
        <div className="auth-form">
          <div>
            <label>Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>

          {mode === "signup" && (
            <div>
              <label>Company Name</label>
              <input
                className="input"
                type="text"
                placeholder="Acme Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={loading}
            style={{ justifyContent: "center", padding: ".8rem" }}
          >
            {loading ? (
              <span className="spinner" />
            ) : mode === "login" ? (
              "Sign In →"
            ) : (
              "Create Account →"
            )}
          </button>
        </div>
        <p className="auth-switch">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
