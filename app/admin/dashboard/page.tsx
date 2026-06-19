// "use client";

// import { useEffect, useState } from "react";
// import { sb } from "@/app/lib/supabase";

// export default function Dashboard() {
//   const [attempts, setAttempts] = useState([]);
//   const [email, setEmail] = useState("");

//   useEffect(() => {
//     const creatorEmail = localStorage.getItem("admin_email");

//     if (!creatorEmail) return;

//     setEmail(creatorEmail);

//     fetchAttempts(creatorEmail);
//   }, []);

//   async function fetchAttempts(creatorEmail: string) {
//     const tbl = await sb.from("responses");

//     const data = await tbl.select(
//       "*",
//       `creator_email=eq.${creatorEmail}&order=created_at.desc`,
//     );

//     setAttempts(data || []);
//   }

//   return (
//     <div className="page">
//       <h1>Creator Dashboard</h1>

//       <p>{email}</p>

//       {attempts.map((a: any) => (
//         <div key={a.id} className="quiz-card">
//           <h3>{a.quiz_title}</h3>

//           <p>Attendee: {a.attendee_email}</p>

//           <p>
//             Score: {a.score}/{a.total}
//           </p>

//           <p>Time: {a.time_taken}s</p>

//           <p>Date: {new Date(a.created_at).toLocaleString()}</p>
//         </div>
//       ))}
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
    setLoading(true);

    const tbl = await sb.from("responses");

    const data = await tbl.select(
      "*",
      `creator_email=eq.${creatorEmail}&order=created_at.desc`,
    );

    setAttempts(data || []);
    setLoading(false);
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Creator Dashboard</h1>
          <p>{email}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalAttempts}</h3>
          <span>Total Attempts</span>
        </div>

        <div className="stat-card">
          <h3>{stats.avgScore}%</h3>
          <span>Average Score</span>
        </div>

        <div className="stat-card">
          <h3>{stats.uniqueUsers}</h3>
          <span>Unique Attendees</span>
        </div>
      </div>

      <div className="responses-section">
        <div className="section-header">
          <h2>Recent Responses</h2>
        </div>

        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : attempts.length === 0 ? (
          <div className="empty-state">No responses yet</div>
        ) : (
          <div className="response-grid">
            {attempts.map((a: any) => (
              <div key={a.id} className="response-card">
                <div className="response-top">
                  <h3>{a.quiz_title || "Untitled Quiz"}</h3>

                  <span className="score-badge">
                    {a.score}/{a.total}
                  </span>
                </div>

                <div className="response-body">
                  <p>👤 {a.attendee_email}</p>

                  <p>⏱ {a.time_taken}s</p>

                  <p>📅 {new Date(a.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
