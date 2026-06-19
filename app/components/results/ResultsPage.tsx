"use client";
import { sb } from "@/app/lib/supabase";
import { useEffect, useState } from "react";

interface ResultsPageProps {
  quiz: any;
  session: any;
  toast: (message: string, type?: string) => void;
  onBack: () => void;
}

export function ResultsPage({
  quiz,
  session,
  toast,
  onBack,
}: ResultsPageProps) {
  const [responses, setResponses] = useState<any>([]);
  const [questions, setQuestions] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("leaderboard");

  useEffect(() => {
    (async () => {
      try {
        const rtbl = await sb.from("responses", session.token);
        const data: any = await rtbl.select(
          "*",
          `quiz_id=eq.${quiz.id}&order=score.desc,time_taken.asc`,
        );
        if (Array.isArray(data)) setResponses(data);
        const qtbl = await sb.from("questions", session.token);
        const qdata: any = await qtbl.select(
          "*",
          `quiz_id=eq.${quiz.id}&order=position.asc`,
        );
        if (Array.isArray(qdata)) setQuestions(qdata);
      } catch (e) {
        toast("Failed to load results", "error");
      }
      setLoading(false);
    })();
  }, [quiz.id]);

  const rankClass = (i: any) =>
    i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
  const rankEmoji = (i: any) =>
    i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <button className="btn btn-ghost btn-sm" onClick={onBack}>
          ← Back
        </button>
        <div>
          <h2
            style={{
              fontFamily: "var(--font-head)",
              fontSize: "1.4rem",
              fontWeight: 800,
            }}
          >
            {quiz.title}
          </h2>
          <p style={{ fontSize: ".8rem", color: "var(--muted)" }}>
            {responses.length} total response{responses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem" }}>
          <button
            className={`btn btn-sm ${tab === "leaderboard" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("leaderboard")}
          >
            🏆 Leaderboard
          </button>
          <button
            className={`btn btn-sm ${tab === "analytics" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setTab("analytics")}
          >
            📊 Analytics
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty">
          <span className="spinner" />
        </div>
      ) : responses.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📭</div>
          <p>No responses yet. Share the quiz link!</p>
          <div
            className="link-box"
            style={{ maxWidth: 480, margin: ".75rem auto 0" }}
          >
            <span className="link-text">{`${window.location.href}#quiz/${quiz.id}`}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.href}#quiz/${quiz.id}`,
                );
                toast("Copied!", "success");
              }}
            >
              Copy
            </button>
          </div>
        </div>
      ) : tab === "leaderboard" ? (
        <div>
          {responses.map((r: any, i: any) => (
            <div key={r.id} className="lb-row">
              <div className={`lb-rank ${rankClass(i)}`}>{rankEmoji(i)}</div>
              <div className="lb-email">{r.user_email || "Anonymous"}</div>
              <div className="lb-time">
                {Math.floor((r.time_taken || 0) / 60)}:
                {String((r.time_taken || 0) % 60).padStart(2, "0")}
              </div>
              {quiz.mode === "quiz" && (
                <div className="lb-score">
                  {r.score}/{r.total}{" "}
                  <span
                    style={{
                      fontWeight: 400,
                      fontSize: ".75rem",
                      color: "var(--muted)",
                    }}
                  >
                    ({r.total ? Math.round((r.score / r.total) * 100) : 0}%)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {questions.map((q: any, qi: any) => {
            const qresps = responses.map((r: any) => r.answers?.[qi]);
            return (
              <div
                key={q.id}
                className="card-sm"
                style={{ marginBottom: ".75rem" }}
              >
                <div className="q-num">
                  Q{qi + 1} · {q.type}
                </div>
                <div style={{ fontWeight: 600, marginBottom: ".75rem" }}>
                  {q.text}
                </div>
                {q.type === "mc" &&
                  (q.options || []).map((opt: any, oi: any) => {
                    const count = qresps.filter((a: any) => a === oi).length;
                    const pct = responses.length
                      ? Math.round((count / responses.length) * 100)
                      : 0;
                    return (
                      <div key={oi} style={{ marginBottom: ".5rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: ".82rem",
                            marginBottom: ".2rem",
                          }}
                        >
                          <span
                            style={{
                              color:
                                oi === q.correct_index
                                  ? "var(--accent3)"
                                  : "var(--text)",
                            }}
                          >
                            {opt}
                            {oi === q.correct_index ? " ✓" : ""}
                          </span>
                          <span style={{ color: "var(--muted)" }}>
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: "var(--border)",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background:
                                oi === q.correct_index
                                  ? "var(--accent3)"
                                  : "var(--accent)",
                              borderRadius: 3,
                              transition: "width .4s",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {q.type === "tf" &&
                  [true, false].map((v: any) => {
                    const count = qresps.filter((a: any) => a === v).length;
                    const pct = responses.length
                      ? Math.round((count / responses.length) * 100)
                      : 0;
                    return (
                      <div key={String(v)} style={{ marginBottom: ".5rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: ".82rem",
                            marginBottom: ".2rem",
                          }}
                        >
                          <span
                            style={{
                              color:
                                v === q.correct_bool
                                  ? "var(--accent3)"
                                  : "var(--text)",
                            }}
                          >
                            {v ? "True" : "False"}
                            {v === q.correct_bool ? " ✓" : ""}
                          </span>
                          <span style={{ color: "var(--muted)" }}>
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: "var(--border)",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background:
                                v === q.correct_bool
                                  ? "var(--accent3)"
                                  : "var(--accent)",
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {q.type === "text" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: ".4rem",
                    }}
                  >
                    {qresps.filter(Boolean).map((a: any, ai: any) => (
                      <div
                        key={ai}
                        style={{
                          background: "var(--surface2)",
                          borderRadius: 8,
                          padding: ".5rem .85rem",
                          fontSize: ".82rem",
                          color: "var(--muted)",
                        }}
                      >
                        {a}
                      </div>
                    ))}
                    {!qresps.filter(Boolean).length && (
                      <p style={{ fontSize: ".82rem", color: "var(--muted2)" }}>
                        No text answers
                      </p>
                    )}
                  </div>
                )}
                {q.type === "rating" &&
                  (() => {
                    const vals = qresps.filter((v: any) => v !== undefined);
                    const avg = vals.length
                      ? (
                          vals.reduce((a: any, b: any) => a + b, 0) /
                          vals.length
                        ).toFixed(1)
                      : "—";
                    return (
                      <div
                        style={{
                          fontFamily: "var(--font-head)",
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          color: "var(--accent)",
                        }}
                      >
                        {avg}{" "}
                        <span
                          style={{
                            fontSize: ".8rem",
                            fontFamily: "var(--font-body)",
                            fontWeight: 400,
                            color: "var(--muted)",
                          }}
                        >
                          avg rating · {vals.length} responses
                        </span>
                      </div>
                    );
                  })()}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
