// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import { sb } from "@/app/lib/supabase";
// import { TakeQuiz } from "@/app/components/quiz/TakeQuiz";

// export default function QuizPage() {
//   const params = useParams();
//   const id = params.id as string;

//   const [quiz, setQuiz] = useState<any>(null);
//   const [questions, setQuestions] = useState<any>([]);
//   const [loading, setLoading] = useState(true);

//   const current = 0;

//   // ❌ undefined.text

//   useEffect(() => {
//     if (!id) return;

//     async function loadQuiz() {
//       try {
//         // Load quiz
//         const quizTable = await sb.from("quizzes");
//         const quizData = await quizTable.select("*", `id=eq.${id}`);

//         if (Array.isArray(quizData) && quizData.length > 0) {
//           setQuiz(quizData[0]);
//         }

//         // Load questions
//         const questionTable = await sb.from("questions");
//         const questionData = await questionTable.select(
//           "*",
//           `quiz_id=eq.${id}&order=position.asc`,
//         );

//         setQuestions(Array.isArray(questionData) ? questionData : []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadQuiz();
//   }, [id]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!quiz) {
//     return <div>Quiz not found</div>;
//   }

//   return (
//     <TakeQuiz quiz={quiz} session={session} toast={toast} onDone={() => {}} />
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sb } from "@/app/lib/supabase";
import { TakeQuiz } from "@/app/components/quiz/TakeQuiz";

type Quiz = {
  id: string;
  title?: string;
  description?: string;
  mode?: string;
  time_limit?: number;
};

type Session = {
  token?: string;
  user?: {
    id?: string;
    email?: string;
  };
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const stored = localStorage.getItem("session");

        if (stored) {
          setSession(JSON.parse(stored));
        }

        const quizTable = await sb.from("quizzes");
        const quizData = await quizTable.select("*", `id=eq.${id}`);

        if (Array.isArray(quizData) && quizData.length > 0) {
          setQuiz(quizData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const toast = (message: string, type?: string) => {
    console.log(`[${type || "info"}] ${message}`);
  };

  if (loading) {
    return (
      <div className="page">
        <div className="empty">
          <span className="spinner" />
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty-icon">❌</div>
          <p>Quiz not found</p>
        </div>
      </div>
    );
  }

  return (
    <TakeQuiz
      quiz={quiz}
      toast={toast}
      session={session}
      onDone={() => router.push("/")}
    />
  );
}
