// // "use client";

// // import { useEffect, useState } from "react";
// // import { sb } from "@/app/lib/supabase";

// // export default function Dashboard() {
// //   const [attempts, setAttempts] = useState([]);
// //   const [email, setEmail] = useState("");

// //   useEffect(() => {
// //     const creatorEmail = localStorage.getItem("admin_email");

// //     if (!creatorEmail) return;

// //     setEmail(creatorEmail);

// //     fetchAttempts(creatorEmail);
// //   }, []);

// //   async function fetchAttempts(creatorEmail: string) {
// //     const tbl = await sb.from("responses");

// //     const data = await tbl.select(
// //       "*",
// //       `creator_email=eq.${creatorEmail}&order=created_at.desc`,
// //     );

// //     setAttempts(data || []);
// //   }

// //   return (
// //     <div className="page">
// //       <h1>Creator Dashboard</h1>

// //       <p>{email}</p>

// //       {attempts.map((a: any) => (
// //         <div key={a.id} className="quiz-card">
// //           <h3>{a.quiz_title}</h3>

// //           <p>Attendee: {a.attendee_email}</p>

// //           <p>
// //             Score: {a.score}/{a.total}
// //           </p>

// //           <p>Time: {a.time_taken}s</p>

// //           <p>Date: {new Date(a.created_at).toLocaleString()}</p>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { sb } from "@/app/lib/supabase";

// export default function Dashboard() {
//   const [attempts, setAttempts] = useState<any[]>([]);
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const creatorEmail = localStorage.getItem("admin_email");

//     if (!creatorEmail) return;

//     setEmail(creatorEmail);

//     fetchAttempts(creatorEmail);
//   }, []);

//   async function fetchAttempts(creatorEmail: string) {
//     setLoading(true);

//     const tbl = await sb.from("responses");

//     const data = await tbl.select(
//       "*",
//       `creator_email=eq.${creatorEmail}&order=created_at.desc`,
//     );

//     setAttempts(data || []);
//     setLoading(false);
//   }

//   const stats = useMemo(() => {
//     const totalAttempts = attempts.length;

//     const avgScore =
//       attempts.length > 0
//         ? Math.round(
//             attempts.reduce(
//               (sum, a) =>
//                 sum + ((a.score || 0) / Math.max(a.total || 1, 1)) * 100,
//               0,
//             ) / attempts.length,
//           )
//         : 0;

//     const uniqueUsers = new Set(attempts.map((a: any) => a.attendee_email))
//       .size;

//     return {
//       totalAttempts,
//       avgScore,
//       uniqueUsers,
//     };
//   }, [attempts]);

//   return (
//     <div className="dashboard-page">
//       <div className="dashboard-header">
//         <div>
//           <h1>Creator Dashboard</h1>
//           <p>{email}</p>
//         </div>
//       </div>

//       <div className="stats-grid">
//         <div className="stat-card">
//           <h3>{stats.totalAttempts}</h3>
//           <span>Total Attempts</span>
//         </div>

//         <div className="stat-card">
//           <h3>{stats.avgScore}%</h3>
//           <span>Average Score</span>
//         </div>

//         <div className="stat-card">
//           <h3>{stats.uniqueUsers}</h3>
//           <span>Unique Attendees</span>
//         </div>
//       </div>

//       <div className="responses-section">
//         <div className="section-header">
//           <h2>Recent Responses</h2>
//         </div>

//         {loading ? (
//           <div className="empty-state">Loading...</div>
//         ) : attempts.length === 0 ? (
//           <div className="empty-state">No responses yet</div>
//         ) : (
//           <div className="response-grid">
//             {attempts.map((a: any) => (
//               <div key={a.id} className="response-card">
//                 <div className="response-top">
//                   <h3>{a.quiz_title || "Untitled Quiz"}</h3>

//                   <span className="score-badge">
//                     {a.score}/{a.total}
//                   </span>
//                 </div>

//                 <div className="response-body">
//                   <p>👤 {a.attendee_email}</p>

//                   <p>⏱ {a.time_taken}s</p>

//                   <p>📅 {new Date(a.created_at).toLocaleString()}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { sb } from "@/app/lib/supabase";

export default function Dashboard() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const creatorEmail = localStorage.getItem("admin_email");

    if (!creatorEmail) return;

    setEmail(creatorEmail);
    fetchAttempts(creatorEmail);
  }, []);

  async function fetchAttempts(creatorEmail: string) {
    try {
      setLoading(true);

      const tbl = await sb.from("responses");

      const data = await tbl.select(
        "*",
        `creator_email=eq.${creatorEmail}&order=created_at.desc`,
      );

      setAttempts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    const totalAttempts = attempts.length;

    const avgScore =
      attempts.length > 0
        ? Math.round(
            attempts.reduce(
              (sum, a) =>
                sum + ((a.score || 0) / Math.max(a.total || 1, 1)) * 100,
              0,
            ) / attempts.length,
          )
        : 0;

    const uniqueUsers = new Set(attempts.map((a: any) => a.attendee_email))
      .size;

    return {
      totalAttempts,
      avgScore,
      uniqueUsers,
    };
  }, [attempts]);

  const getCorrectWrong = (attempt: any) => {
    let correct = 0;

    (attempt.questions || []).forEach((q: any, i: number) => {
      const userAns = attempt.answers?.[i];

      const ok =
        q.type === "mc"
          ? userAns === q.correct_index
          : q.type === "tf"
            ? userAns === q.correct_bool
            : false;

      if (ok) correct++;
    });

    return {
      correct,
      wrong: Math.max((attempt.questions?.length || 0) - correct, 0),
    };
  };

  return (
    <div className="min-h-screen bg-black flex justify-center text-white py-3">
      <div className="max-w-8xl w-[90%] mx-auto px-6 py-8 flex flex-col gap-[2rem]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">Creator Dashboard</h1>
            <p className="mt-2 text-gray-400">{email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2rem] mb-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 py-[1rem] text-center">
            <h3 className="text-4xl font-bold">{stats.totalAttempts}</h3>
            <p className="mt-2 text-gray-400">Total Attempts</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 py-[1rem] text-center">
            <h3 className="text-4xl font-bold">{stats.avgScore}%</h3>
            <p className="mt-2 text-gray-400">Average Score</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 py-[1rem] text-center">
            <h3 className="text-4xl font-bold">{stats.uniqueUsers}</h3>
            <p className="mt-2 text-gray-400">Unique Attendees</p>
          </div>
        </div>

        {/* Table Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <h2 className="text-2xl font-semibold">Quiz Attempts</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : attempts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No responses yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-6 py-4 text-left">Quiz</th>
                    <th className="px-6 py-4 text-left">Attendee</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-center">Correct</th>
                    <th className="px-6 py-4 text-center">Wrong</th>
                    <th className="px-6 py-4 text-center">Time</th>
                    <th className="px-6 py-4 text-center">Report</th>
                    <th className="px-6 py-4 text-center">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {attempts.map((a: any) => {
                    const { correct, wrong } = getCorrectWrong(a);

                    return (
                      <tr
                        key={a.id}
                        className="border-t border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium">
                          {a.quiz_title || "Untitled Quiz"}
                        </td>

                        <td className="px-6 py-4">{a.attendee_email}</td>

                        <td className="px-6 py-4 text-center font-semibold">
                          {a.score}/{a.total}
                        </td>

                        <td className="px-6 py-4 text-center font-bold text-green-400">
                          {correct}
                        </td>

                        <td className="px-6 py-4 text-center font-bold text-red-400">
                          {wrong}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {Math.floor(a.time_taken / 60)}m {a.time_taken % 60}s
                        </td>

                        <td className="px-6 py-4 text-center">
                          {a.share_url ? (
                            <a
                              href={a.share_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center px-4 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 transition font-medium"
                            >
                              View Report
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>

                        <td className="px-6 py-4 text-center text-sm text-gray-400">
                          {new Date(a.created_at).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    // <div className="w-full mx-auto flex flex-col justify-center  items-center gap-5 p-8">
    //   <div className="flex justify-between items-center mb-8 w-[90%]">
    //     <div>
    //       <h1 className="text-[32px] font-bold m-0">Creator Dashboard</h1>
    //       <p className="mt-1.5 opacity-70">{email}</p>
    //     </div>
    //   </div>

    //   <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 w-[90%]">
    //     <div
    //       className="rounded-[18px] border p-6 text-center"
    //       style={{
    //         background: "var(--card)",
    //         borderColor: "var(--border)",
    //       }}
    //     >
    //       <h3 className="text-[34px] font-bold">{stats.totalAttempts}</h3>
    //       <span className="block mt-2 opacity-70">Total Attempts</span>
    //     </div>

    //     <div
    //       className="rounded-[18px] border p-6 text-center"
    //       style={{
    //         background: "var(--card)",
    //         borderColor: "var(--border)",
    //       }}
    //     >
    //       <h3 className="text-[34px] font-bold">{stats.avgScore}%</h3>
    //       <span className="block mt-2 opacity-70">Average Score</span>
    //     </div>

    //     <div
    //       className="rounded-[18px] border p-6 text-center"
    //       style={{
    //         background: "var(--card)",
    //         borderColor: "var(--border)",
    //       }}
    //     >
    //       <h3 className="text-[34px] font-bold">{stats.uniqueUsers}</h3>
    //       <span className="block mt-2 opacity-70">Unique Attendees</span>
    //     </div>
    //   </div>

    //   <div className="px-6 py-5 w-[90%]">
    //     <h2 className="text-xl font-semibold ">Quiz Attempts</h2>
    //   </div>

    //   <div
    //     className="rounded-[20px]  border w-[90%]"
    //     style={{
    //       background: "var(--card)",
    //       borderColor: "var(--border)",
    //     }}
    //   >
    //     {loading ? (
    //       <div className="p-12 text-center opacity-70">Loading...</div>
    //     ) : attempts.length === 0 ? (
    //       <div className="p-12 text-center opacity-70">No responses yet</div>
    //     ) : (
    //       <div className="overflow-x-auto">
    //         <table className="w-[90%] p-5 border-collapse">
    //           <thead>
    //             <tr
    //               style={{
    //                 borderBottom: "1px solid var(--border)",
    //                 background: "rgba(255,255,255,.03)",
    //               }}
    //             >
    //               <th className="p-4 text-left">Quiz</th>
    //               <th className="p-4 text-left">Attendee</th>
    //               <th className="p-4 text-center">Score</th>
    //               <th className="p-4 text-center">Correct</th>
    //               <th className="p-4 text-center">Wrong</th>
    //               <th className="p-4 text-center">Time</th>
    //               <th className="p-4 text-center">Report</th>
    //               <th className="p-4 text-center">Date</th>
    //             </tr>
    //           </thead>

    //           <tbody>
    //             {attempts.map((a: any) => {
    //               const { correct, wrong } = getCorrectWrong(a);

    //               return (
    //                 <tr
    //                   key={a.id}
    //                   className="hover:bg-white/5 transition"
    //                   style={{
    //                     borderBottom: "1px solid var(--border)",
    //                   }}
    //                 >
    //                   <td className="p-4 font-medium">
    //                     {a.quiz_title || "Untitled Quiz"}
    //                   </td>

    //                   <td className="p-4">{a.attendee_email}</td>

    //                   <td className="p-4 text-center font-semibold">
    //                     {a.score}/{a.total}
    //                   </td>

    //                   <td className="p-4 text-center font-bold text-green-500">
    //                     {correct}
    //                   </td>

    //                   <td className="p-4 text-center font-bold text-red-500">
    //                     {wrong}
    //                   </td>

    //                   <td className="p-4 text-center">
    //                     {Math.floor(a.time_taken / 60)}m {a.time_taken % 60}s
    //                   </td>

    //                   <td className="p-4 text-center">
    //                     {a.share_url ? (
    //                       <a
    //                         href={a.share_url}
    //                         target="_blank"
    //                         rel="noreferrer"
    //                         className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-white transition"
    //                         style={{
    //                           background: "var(--accent)",
    //                         }}
    //                       >
    //                         View Report
    //                       </a>
    //                     ) : (
    //                       "-"
    //                     )}
    //                   </td>

    //                   <td className="p-4 text-center text-sm opacity-70">
    //                     {new Date(a.created_at).toLocaleString()}
    //                   </td>
    //                 </tr>
    //               );
    //             })}
    //           </tbody>
    //         </table>
    //       </div>
    //     )}
    //   </div>
    // </div>
    // <div className="w-full flex flex-col justify-center">
    //   <div className="text-2xl px-5">
    //     <div>
    //       <h1>Creator Dashboard</h1>
    //       <p>{email}</p>
    //     </div>
    //   </div>

    //   <div className="stats-grid">
    //     <div className="stat-card">
    //       <h3>{stats.totalAttempts}</h3>
    //       <span>Total Attempts</span>
    //     </div>

    //     <div className="stat-card">
    //       <h3>{stats.avgScore}%</h3>
    //       <span>Average Score</span>
    //     </div>

    //     <div className="stat-card">
    //       <h3>{stats.uniqueUsers}</h3>
    //       <span>Unique Attendees</span>
    //     </div>
    //   </div>

    //   <div className="responses-section">
    //     <div className="section-header">
    //       <h2>Quiz Attempts</h2>
    //     </div>

    //     {loading ? (
    //       <div className="empty-state">Loading...</div>
    //     ) : attempts.length === 0 ? (
    //       <div className="empty-state">No responses yet</div>
    //     ) : (
    //       <div
    //         style={{
    //           overflowX: "auto",
    //           background: "var(--card)",
    //           borderRadius: "16px",
    //           border: "1px solid var(--border)",
    //         }}
    //       >
    //         <table
    //           style={{
    //             width: "100%",
    //             borderCollapse: "collapse",
    //           }}
    //         >
    //           <thead>
    //             <tr
    //               style={{
    //                 borderBottom: "1px solid var(--border)",
    //                 background: "rgba(255,255,255,.03)",
    //               }}
    //             >
    //               <th style={{ padding: 14, textAlign: "left" }}>Quiz</th>

    //               <th style={{ padding: 14, textAlign: "left" }}>Attendee</th>

    //               <th style={{ padding: 14, textAlign: "center" }}>Score</th>

    //               <th style={{ padding: 14, textAlign: "center" }}>Correct</th>

    //               <th style={{ padding: 14, textAlign: "center" }}>Wrong</th>

    //               <th style={{ padding: 14, textAlign: "center" }}>
    //                 Time Taken
    //               </th>

    //               <th style={{ padding: 14, textAlign: "center" }}>Report</th>

    //               <th style={{ padding: 14, textAlign: "center" }}>Date</th>
    //             </tr>
    //           </thead>

    //           <tbody>
    //             {attempts.map((a: any) => {
    //               const { correct, wrong } = getCorrectWrong(a);

    //               return (
    //                 <tr
    //                   key={a.id}
    //                   style={{
    //                     borderBottom: "1px solid var(--border)",
    //                   }}
    //                 >
    //                   <td style={{ padding: 14 }}>
    //                     {a.quiz_title || "Untitled Quiz"}
    //                   </td>

    //                   <td style={{ padding: 14 }}>{a.attendee_email}</td>

    //                   <td
    //                     style={{
    //                       padding: 14,
    //                       textAlign: "center",
    //                       fontWeight: 600,
    //                     }}
    //                   >
    //                     {a.score}/{a.total}
    //                   </td>

    //                   <td
    //                     style={{
    //                       padding: 14,
    //                       textAlign: "center",
    //                       color: "#22c55e",
    //                       fontWeight: 700,
    //                     }}
    //                   >
    //                     {correct}
    //                   </td>

    //                   <td
    //                     style={{
    //                       padding: 14,
    //                       textAlign: "center",
    //                       color: "#ef4444",
    //                       fontWeight: 700,
    //                     }}
    //                   >
    //                     {wrong}
    //                   </td>

    //                   <td
    //                     style={{
    //                       padding: 14,
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     {Math.floor(a.time_taken / 60)}m {a.time_taken % 60}s
    //                   </td>

    //                   <td
    //                     style={{
    //                       padding: 14,
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     {a.share_url ? (
    //                       <a
    //                         href={a.share_url}
    //                         target="_blank"
    //                         rel="noreferrer"
    //                         style={{
    //                           color: "#3b82f6",
    //                           textDecoration: "none",
    //                           fontWeight: 600,
    //                         }}
    //                       >
    //                         View Report
    //                       </a>
    //                     ) : (
    //                       "-"
    //                     )}
    //                   </td>

    //                   <td
    //                     style={{
    //                       padding: 14,
    //                       textAlign: "center",
    //                     }}
    //                   >
    //                     {new Date(a.created_at).toLocaleString()}
    //                   </td>
    //                 </tr>
    //               );
    //             })}
    //           </tbody>
    //         </table>
    //       </div>
    //     )}
    //   </div>
    // </div>
  );
}
