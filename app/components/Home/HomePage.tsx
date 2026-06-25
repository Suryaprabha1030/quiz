// import { useEffect, useState } from "react";

// export default function HomePage({
//   session,
//   toast,
//   onCreateQuiz,
//   onTakeQuiz,
//   onViewResults,
// }: any) {
//   const [quizzes, setQuizzes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [tab, setTab] = useState("all");

//   async function fetchQuizzes() {
//     setLoading(true);
//     try {
//       const tbl = await sb.from("quizzes", session?.token);
//       const data = await tbl.select(
//         "*",
//         tab === "mine"
//           ? `created_by=eq.${session?.user?.id}&order=created_at.desc`
//           : "order=created_at.desc",
//       );
//       if (Array.isArray(data)) setQuizzes(data);
//     } catch (e) {
//       toast("Failed to load quizzes", "error");
//     }
//     setLoading(false);
//   }

//   useEffect(() => {
//     fetchQuizzes();
//   }, [tab]);

//   const modes = {
//     quiz: { badge: "badge-purple", label: "Scored Quiz" },
//     survey: { badge: "badge-pink", label: "Survey" },
//   };

//   return (
//     <div className="page-wide">
//       {/* <SetupNotice /> */}
//       <div className="hero">
//         <h1>
//           Build. Share. <span>Quiz.</span>
//         </h1>
//         <p>
//           Create dynamic quizzes, share a link, and track every response in real
//           time.
//         </p>
//         <button
//           className="btn btn-primary"
//           onClick={onCreateQuiz}
//           style={{ fontSize: "1rem", padding: ".8rem 2rem" }}
//         >
//           + Create Quiz
//         </button>
//       </div>
//       <hr className="divider" />
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           marginBottom: ".75rem",
//         }}
//       >
//         <div className="section-title" style={{ marginBottom: 0 }}>
//           Browse Quizzes
//         </div>
//         <div className="tabs" style={{ marginBottom: 0, width: "auto" }}>
//           <button
//             className={`tab ${tab === "all" ? "active" : ""}`}
//             onClick={() => setTab("all")}
//           >
//             All Public
//           </button>
//           <button
//             className={`tab ${tab === "mine" ? "active" : ""}`}
//             onClick={() => setTab("mine")}
//           >
//             My Quizzes
//           </button>
//         </div>
//       </div>
//       {loading ? (
//         <div className="empty">
//           <span className="spinner" />
//         </div>
//       ) : quizzes.length === 0 ? (
//         <div className="empty">
//           <div className="empty-icon">📋</div>
//           <p>No quizzes yet. Be the first to create one!</p>
//         </div>
//       ) : (
//         <div className="quiz-grid">
//           {quizzes.map((q: any) => (
//             <div key={q.id} className="quiz-card">
//               <div className="quiz-card-title">{q.title}</div>
//               <div className="quiz-card-desc">
//                 {q.description || "No description"}
//               </div>
//               <div
//                 className="quiz-card-meta"
//                 style={{ marginBottom: ".85rem" }}
//               >
//                 <span
//                   className={`badge ${modes[q.mode]?.badge || "badge-purple"}`}
//                 >
//                   {modes[q.mode]?.label || q.mode}
//                 </span>
//                 {q.time_limit > 0 && (
//                   <span className="badge badge-amber">⏱ {q.time_limit}s</span>
//                 )}
//                 <span className="badge badge-green">
//                   🕐 {new Date(q.created_at).toLocaleDateString()}
//                 </span>
//               </div>
//               <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
//                 <button
//                   className="btn btn-primary btn-sm"
//                   onClick={() => onTakeQuiz(q)}
//                 >
//                   Take Quiz
//                 </button>
//                 {session?.user?.id === q.created_by && (
//                   <button
//                     className="btn btn-ghost btn-sm"
//                     onClick={() => onViewResults(q)}
//                   >
//                     Results
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { sb } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

interface HomePageProps {
  session: any;
  toast: (message: string, type?: string) => void;
  onCreateQuiz: () => void;
  onTakeQuiz: (quiz: any) => void;
  onViewResults: (quiz: any) => void;
}

export default function HomePage({
  session,
  toast,
  onCreateQuiz,
  onTakeQuiz,
  onViewResults,
}: HomePageProps) {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "mine">("mine");
  const router = useRouter();

  async function fetchQuizzes() {
    if (!session?.user?.id) return;
    console.log(!session?.user?.id, "!session?.user?.id");
    setLoading(true);

    try {
      const tbl = await sb.from("quizzes", session.token);

      let query = "order=created_at.desc";

      if (tab === "mine") {
        query = `created_by=eq.${session.user.id}&order=created_at.desc`;
      }

      console.log("tab:", tab);
      console.log("query:", query);

      const data = await tbl.select("*", query);

      if (Array.isArray(data)) {
        setQuizzes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchQuizzes();
    }
  }, [tab]);

  const modes: Record<string, { badge: string; label: string }> = {
    quiz: {
      badge: "badge-purple",
      label: "Scored Quiz",
    },
    survey: {
      badge: "badge-pink",
      label: "Survey",
    },
  };

  async function openQuiz(quiz: any) {
    const shareUrl = `${window.location.origin}/quiz/${quiz.id}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast("Quiz link copied to clipboard!", "success");
    } catch (error) {
      console.warn("Clipboard write failed", error);
      toast("Opening quiz — link not copied", "warning");
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    // router.push(`/quiz/${quiz.id}`);
  }

  return (
    <div className="page-wide">
      <div className="hero">
        <h1>
          Build. Share. <span>Quiz.</span>
        </h1>

        <p>
          Create dynamic quizzes, share a link, and track every response in real
          time.
        </p>

        <button
          className="btn btn-primary"
          onClick={onCreateQuiz}
          style={{
            fontSize: "1rem",
            padding: ".8rem 2rem",
          }}
        >
          + Create Quiz
        </button>
      </div>

      <hr className="divider" />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: ".75rem",
        }}
      >
        <div
          className="section-title"
          style={{
            marginBottom: 0,
          }}
        >
          Browse Quizzes
        </div>

        <div
          className="tabs"
          style={{
            marginBottom: 0,
            width: "auto",
          }}
        >
          <button
            className={`tab ${tab === "mine" ? "active" : ""}`}
            onClick={() => setTab("mine")}
          >
            My Quizzes
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty">
          <span className="spinner" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📋</div>
          <p>No quizzes yet. Be the first to create one!</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map((q: any) => (
            <div
              key={q.id}
              className="quiz-card"
              // onClick={() => {
              //   alert("clicked");
              //   openQuiz(q);
              // }}
            >
              <div className="quiz-card-title">{q.title}</div>

              <div className="quiz-card-desc">
                {q.description || "No description"}
              </div>

              <div
                className="quiz-card-meta"
                style={{
                  marginBottom: ".85rem",
                }}
              >
                <span
                  className={`badge ${modes[q.mode]?.badge || "badge-purple"}`}
                >
                  {modes[q.mode]?.label || q.mode}
                </span>

                {q.time_limit > 0 && (
                  <span className="badge badge-amber">⏱ {q.time_limit}s</span>
                )}

                <span className="badge badge-green">
                  🕐 {new Date(q.created_at).toLocaleDateString()}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: ".5rem",
                  flexWrap: "wrap",
                }}
              >
                {/* <button
                  type="button"
                  className="z-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert("Copy button clicked");
                    copyQuizLink(q);
                  }}
                >
                  📋 Copy Link
                </button> */}
                <button
                  className="btn btn-primary btn-sm"
                  // onClick={() => openQuiz(q)}
                  onClick={() => {
                    openQuiz(q);
                  }}
                >
                  Take Quiz
                </button>

                {session?.user?.id === q.created_by && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => onViewResults(q)}
                  >
                    Results
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
