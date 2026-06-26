"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import useToast from "@/hooks/useToast";
import { sb } from "@/app/lib/supabase";
import HomePage from "./components/Home/HomePage";
import Navbar from "./components/layout/Navbar";
import { AuthPage } from "./components/auth/AuthPage";
import { QuizBuilder } from "./components/builder/QuizBuilder";
import { ResultsPage } from "./components/results/ResultsPage";
import { TakeQuiz } from "./components/quiz/TakeQuiz";
import AIQuizGenerator from "./components/builder/AiQuizbuilder";
import toast from "react-hot-toast";

type Session = {
  token?: string;
  user?: {
    id?: string;
    email?: string;
  };
};

type Quiz = {
  id: string;
  title?: string;
  description?: string;
  mode?: string;
  time_limit?: number;
  created_at?: string;
  created_by?: string;
};

export default function Page() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState("home");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem("session");

    if (savedSession) {
      setSession(JSON.parse(savedSession));
      setView("home");
    } else {
      setView("auth");
    }
  }, []);

  async function openQuiz(quiz: Quiz) {
    console.log("surya clicked", "surya");
    const shareUrl = `${window.location.origin}/quiz/${quiz.id}`;
    router.push(`/quiz/${quiz.id}`);
    try {
      await navigator.clipboard.writeText(shareUrl);

      toast.success("Quiz link copied to clipboard!");
    } catch (error) {
      console.warn("Clipboard write failed", error);
      toast.error("Opening quiz — link not copied");
    }
    router.push(shareUrl);
  }

  function logout() {
    if (session?.token) {
      sb.signOut(session.token);
    }

    setSession(null);
    setView("home");
  }
  console.log(
    "Has key:",
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return (
    <>
      <Navbar
        session={session}
        logout={logout}
        setView={setView}
        setActiveQuiz={setActiveQuiz}
      />

      {view === "auth" && (
        <AuthPage
          onAuth={(s) => {
            setSession(s);
            setView("home");
          }}
        />
      )}

      {view === "home" && (
        <HomePage
          session={session}
          onCreateQuiz={() => (session ? setView("builder") : setView("auth"))}
          onTakeQuiz={openQuiz}
          onViewResults={(q) => {
            setActiveQuiz(q);
            setView("results");
          }}
        />
      )}

      {view === "builder" && session && (
        <QuizBuilder
          session={session}
          onSaved={() => setView("home")}
          onCancel={() => setView("home")}
        />

        // <AIQuizGenerator />
      )}

      {view === "take" && activeQuiz && (
        <TakeQuiz
          quiz={activeQuiz}
          session={session}
          onDone={() => setView("home")}
        />
      )}

      {view === "results" && activeQuiz && session && (
        <ResultsPage
          quiz={activeQuiz}
          session={session}
          onBack={() => setView("home")}
        />
      )}

      {/* <Toasts toasts={toasts} /> */}
    </>
  );
}
