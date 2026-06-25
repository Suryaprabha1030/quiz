// "use client";

// import { useEffect, useState } from "react";
// import { sb } from "@/app/lib/supabase";

// type Props = {
//   session: {
//     token: string;
//     user?: {
//       id?: string;
//       email?: string;
//     };
//   };
// };

// type Quiz = {
//   id: string;
//   title: string;
//   created_by: string;
//   created_at: string;
// };

// export default function AdminDashboard({ session }: Props) {
//   const [loading, setLoading] = useState(true);

//   const [stats, setStats] = useState({
//     users: 0,
//     quizzes: 0,
//     attempts: 0,
//   });

//   const [quizzes, setQuizzes] = useState<Quiz[]>([]);

//   async function loadDashboard() {
//     try {
//       const users = await (
//         await sb.from("profiles", session?.token)
//       ).select("*");

//       const quizzesData = await (
//         await sb.from("quizzes", session?.token)
//       ).select("*");

//       const attempts = await (
//         await sb.from("quiz_attempts", session?.token)
//       ).select("*");

//       setStats({
//         users: users?.length || 0,
//         quizzes: quizzesData?.length || 0,
//         attempts: attempts?.length || 0,
//       });

//       setQuizzes(
//         [...(quizzesData || [])].sort(
//           (a, b) =>
//             new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
//         ),
//       );
//     } catch (err) {
//       console.error("Dashboard error:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadDashboard();

//     // const interval = setInterval(() => {
//     //   loadDashboard();
//     // }, 5000);

//     // return () => clearInterval(interval);
//   }, []);

//   if (loading) {
//     return <div className="dashboard-loading">Loading Dashboard...</div>;
//   }

//   return (
//     <div className="admin-dashboard">
//       <div className="dashboard-header">
//         <div>
//           <h1>📊 Quiz Admin Dashboard</h1>
//           <p>Live overview of platform activity</p>
//         </div>

//         <div className="live-indicator">
//           <span className="pulse" />
//           Live
//         </div>
//       </div>

//       <div className="stats-grid">
//         <div className="stat-card">
//           <h3>Total Users</h3>
//           <span>{stats.users}</span>
//         </div>

//         <div className="stat-card">
//           <h3>Total Quizzes</h3>
//           <span>{stats.quizzes}</span>
//         </div>

//         <div className="stat-card">
//           <h3>Total Attempts</h3>
//           <span>{stats.attempts}</span>
//         </div>

//         <div className="stat-card">
//           <h3>Refresh Rate</h3>
//           <span>5s</span>
//         </div>
//       </div>

//       <div className="table-card">
//         <div className="table-header">
//           <h2>Recently Created Quizzes</h2>
//         </div>

//         <table className="quiz-table">
//           <thead>
//             <tr>
//               <th>Quiz Title</th>
//               <th>Created By</th>
//               <th>Created At</th>
//             </tr>
//           </thead>

//           <tbody>
//             {quizzes.length === 0 ? (
//               <tr>
//                 <td colSpan={3}>No quizzes found</td>
//               </tr>
//             ) : (
//               quizzes.map((quiz) => (
//                 <tr key={quiz.id}>
//                   <td>{quiz.title}</td>
//                   <td>{quiz.creator_email}</td>
//                   <td>{quiz.shareUrl}</td>
//                   <td>{new Date(quiz.created_at).toLocaleString()}</td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { sb } from "@/app/lib/supabase";
import { Fragment } from "react";

type Props = {
  session: {
    token: string;
    user?: {
      id?: string;
      email?: string;
    };
  };
};

type Quiz = {
  id: string;
  title: string;
  creator_email?: string;
  shareUrl?: string;
  created_at: string;
};

export default function AdminDashboard({ session }: Props) {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    users: 0,
    quizzes: 0,
    attempts: 0,
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  async function loadDashboard() {
    try {
      const users = await (
        await sb.from("profiles", session?.token)
      ).select("*");

      const quizzesData = await (
        await sb.from("quizzes", session?.token)
      ).select("*");

      const attempts = await (
        await sb.from("quiz_attempts", session?.token)
      ).select("*");

      setStats({
        users: users?.length || 0,
        quizzes: quizzesData?.length || 0,
        attempts: attempts?.length || 0,
      });

      setQuizzes(
        [...(quizzesData || [])].sort(
          (a: Quiz, b: Quiz) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      );
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const groupedQuizzes = quizzes.reduce((acc: Record<string, Quiz[]>, quiz) => {
    const email = quiz.creator_email || "Unknown";

    if (!acc[email]) {
      acc[email] = [];
    }

    acc[email].push(quiz);

    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black flex justify-center text-white py-3">
      <div className="max-w-8xl w-[90%] mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">📊 Quiz Admin Dashboard</h1>

            <p className="mt-2 text-gray-400">
              Live overview of platform activity
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-sm font-medium">Live</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 py-6 text-center">
            <h3 className="text-4xl font-bold">{stats.users}</h3>
            <p className="mt-2 text-gray-400">Total Users</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 py-6 text-center">
            <h3 className="text-4xl font-bold">{stats.quizzes}</h3>
            <p className="mt-2 text-gray-400">Total Quizzes</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 py-6 text-center">
            <h3 className="text-4xl font-bold">{stats.attempts}</h3>
            <p className="mt-2 text-gray-400">Total Attempts</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 py-6 text-center">
            <h3 className="text-4xl font-bold">Live</h3>
            <p className="mt-2 text-gray-400">Status</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-2xl font-semibold">Recently Created Quizzes</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : quizzes.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No quizzes found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-6 py-4 text-left">Quiz Title</th>

                    <th className="px-6 py-4 text-left">Creator</th>

                    <th className="px-6 py-4 text-center">Share Link</th>

                    <th className="px-6 py-4 text-center">Created At</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(groupedQuizzes).map(
                    ([email, creatorQuizzes]) => (
                      <Fragment key={email}>
                        {/* Creator Header */}
                        <tr
                          key={email}
                          className="bg-cyan-500/10 border-t border-cyan-500/30"
                        >
                          <td
                            colSpan={4}
                            className="px-6 py-4 font-bold text-cyan-400 text-lg"
                          >
                            {email} ({creatorQuizzes.length} Quiz
                            {creatorQuizzes.length > 1 ? "zes" : ""})
                          </td>
                        </tr>

                        {/* Creator Quizzes */}
                        {creatorQuizzes.map((quiz) => (
                          <tr
                            key={quiz.id}
                            className="border-t border-white/10 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium">
                              {quiz.title}
                            </td>

                            <td className="px-6 py-4">{quiz.creator_email}</td>

                            <td className="px-6 py-4 text-center">
                              {quiz.shareUrl ? (
                                <a
                                  href={quiz.shareUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 transition font-medium"
                                >
                                  Open Quiz
                                </a>
                              ) : (
                                "-"
                              )}
                            </td>

                            <td className="px-6 py-4 text-center text-sm text-gray-400">
                              {new Date(quiz.created_at).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ),
                  )}
                </tbody>

                {/* <tbody>
                  {quizzes.map((quiz) => (
                    <tr
                      key={quiz.id}
                      className="border-t border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{quiz.title}</td>

                      <td className="px-6 py-4">{quiz.creator_email || "-"}</td>

                      <td className="px-6 py-4 text-center">
                        {quiz.shareUrl ? (
                          <a
                            href={quiz.shareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 transition font-medium"
                          >
                            Open Quiz
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-gray-400">
                        {new Date(quiz.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody> */}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
