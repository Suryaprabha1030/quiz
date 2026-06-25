"use client";
import { sb } from "@/app/lib/supabase";
import { navigate } from "next/dist/client/components/segment-cache/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TakeQuizProps {
  quiz: any;
  session: any;
  toast: (message: string, type?: string) => void;
  onDone: () => void;
}
interface CSSVars extends React.CSSProperties {
  "--pct"?: string;
}

export function TakeQuiz({ quiz, session, toast, onDone }: TakeQuizProps) {
  const [questions, setQuestions] = useState<any>([]);
  const [answers, setAnswers] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit || 0);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [started, setStarted] = useState(false);
  const LETTERS = ["A", "B", "C", "D", "E"];

  useEffect(() => {
    (async () => {
      try {
        const tbl = await sb.from("questions", session?.token);
        const data: any = await tbl.select("*", `quiz_id=eq.${quiz.id}`);
        console.log();
        if (Array.isArray(data)) setQuestions(data);
        console.log(data, "questions");
      } catch (e) {
        toast("Failed to load questions", "error");
      }
      setLoading(false);
    })();
  }, [quiz.id]);

  useEffect(() => {
    // if (submitted || loading) return;
    if (!started || submitted || loading) return;
    const t = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [started, submitted, loading]);

  useEffect(() => {
    if (!started || !quiz.time_limit || submitted) return;

    setTimeLeft(quiz.time_limit);

    const t = setInterval(() => {
      setTimeLeft((p: any) => {
        if (p <= 1) {
          clearInterval(t);
          handleSubmit();
          return 0;
        }
        return p - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [started, quiz.time_limit, submitted]);

  async function handleSubmit() {
    alert("SUBMIT CLICKED");
    if (submitting) return;
    setSubmitting(true);
    let score = 0;
    let total = 0;
    questions.forEach((q: any, i: any) => {
      if (q.type === "mc") {
        total++;
        if (answers[i] === q.correct_index) score++;
      } else if (q.type === "tf") {
        total++;
        if (answers[i] === q.correct_bool) score++;
      }
    });
    const res: any = {
      score,
      total,
      answers: JSON.parse(JSON.stringify(answers)),
      time: elapsed,
    };

    const attemptQuestions = questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      correct_answer: q.correct_answer,
      correct_index: q.correct_index,
      correct_bool: q.correct_bool,
    }));
    console.log("Saving response...");
    // if (session) {
    console.log("Saving response...", session);
    try {
      const tbl = await sb.from("responses", session?.token);

      // await tbl.insert({
      //   quiz_id: quiz.id,
      //   creator_email: quiz.creator_email,
      //   attendee_email: email,
      //   score,
      //   total,
      //   time_taken: elapsed,
      // });

      const reportId = crypto.randomUUID();

      const shareUrl = `${window.location.origin}/report/${reportId}`;

      console.log(shareUrl, "shareUrl");

      await tbl.insert({
        report_id: reportId,
        share_url: shareUrl,

        quiz_id: quiz.id,
        creator_email: quiz.creator_email,
        attendee_email: email,

        score,
        total,
        time_taken: elapsed,

        questions: attemptQuestions,
        answers,
      });

      // await tbl.insert({
      //   quiz_id: quiz.id,

      //   creator_email: quiz.creator_email,
      //   attendee_email: email,

      //   quiz_title: quiz.title,
      //   quiz_description: quiz.description,
      //   score,
      //   total,
      //   time_taken: elapsed,

      //   questions: attemptQuestions,
      //   answers,
      // });
      console.log("Insert result:", result);
      // await tbl.insert({
      //   quiz_id: quiz.id,

      //   creator_email: quiz.creator_email, // quiz owner
      //   attendee_email: email, // entered by attendee

      //   answers,
      //   score,
      //   total,
      //   time_taken: elapsed,
      // });
      // await tbl.insert({
      //   quiz_id: quiz.id,
      //   user_id: session.user.id,
      //   user_email: session.user.email,
      //   answers,
      //   score,
      //   total,
      //   time_taken: elapsed,
      // });
    } catch (e) {
      /* best effort */
    }
    // }
    setResult(res);
    setSubmitted(true);
    setSubmitting(false);
  }

  const answered = Object.keys(answers).length;
  const pct = questions.length
    ? Math.round((answered / questions.length) * 100)
    : 0;

  if (loading)
    return (
      <div className="page">
        <div className="empty">
          <span className="spinner" />
        </div>
      </div>
    );
  if (!started) {
    return (
      <div className=" w-full h-full flex flex-col justify-center items-center gap-20 ">
        {/* <div className="bubbles">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div> */}
        <Link href="/home" className="nav-brand ">
          <h1 className="text-3xl">🧠 QuizForge</h1>
          {/* /const companyName = res.user?.user_metadata?.companyName; */}
        </Link>
        {/* <div className="w-1/2"> */}
        <h1 className="text-xl mb-10">
          Continue Your Quiz ! After Enter Your mail
        </h1>

        <div className="auth-box">
          <h2 className="text-2xl m-10">{quiz.title}</h2>
          {quiz.description && <p className="take-desc">{quiz.description}</p>}

          <div style={{ marginTop: "1.5rem" }}>
            <label>Email Address *</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "1rem",
            }}
            disabled={!email}
            onClick={() => setStarted(true)}
          >
            Start Quiz →
          </button>
        </div>
        {/* </div> */}

        {/* <div className="quiz-toy-cube w-1/2">🎲</div> */}

        {/* <div className="cube-frame">
          <span className="corner top-left"></span>
          <span className="corner top-right"></span>
          <span className="corner bottom-left"></span>
          <span className="corner bottom-right"></span>

          <div className="auth-boxs">...</div>
        </div> */}
      </div>
    );
  }
  if (submitted && result) {
    const scorePct: any =
      result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div className="page">
        <div className="result-wrap">
          <div
            className="score-ring"
            // style={{ "--pct": `${scorePct * 3.6}deg` }}
            style={{ "--pct": `${scorePct * 3.6}deg` } as React.CSSProperties}
          >
            <div className="score-inner">
              <div
                className="score-num"
                style={{
                  color:
                    scorePct >= 70
                      ? "var(--accent3)"
                      : scorePct >= 40
                        ? "#ffc94d"
                        : "var(--accent2)",
                }}
              >
                {quiz.mode === "quiz" ? `${scorePct}%` : "✓"}
              </div>
              <div className="score-label">
                {quiz.mode === "quiz" ? "Score" : "Done"}
              </div>
            </div>
          </div>
          <h2 className="result-title">
            {quiz.mode === "quiz"
              ? scorePct >= 70
                ? "Excellent! 🎉"
                : scorePct >= 40
                  ? "Good effort! 💪"
                  : "Keep practicing 📚"
              : "Thank you! 🙏"}
          </h2>
          <p className="result-sub">{quiz.title}</p>
          <div className="stats-row">
            {quiz.mode === "quiz" && (
              <>
                <div className="stat-box">
                  <div className="stat-val" style={{ color: "var(--accent3)" }}>
                    {result.score}
                  </div>
                  <div className="stat-key">Correct</div>
                </div>
              </>
            )}
            <div className="stat-box">
              <div className="stat-val">{questions.length}</div>
              <div className="stat-key">Questions</div>
            </div>
            <div className="stat-box">
              <div className="stat-val">
                {Math.floor(elapsed / 60)}:
                {String(elapsed % 60).padStart(2, "0")}
              </div>
              <div className="stat-key">Time</div>
            </div>
            {quiz.mode !== "quiz" && (
              <div className="stat-box">
                <div className="stat-val">{answered}</div>
                <div className="stat-key">Answered</div>
              </div>
            )}
          </div>
          {quiz.mode === "quiz" && (
            <div style={{ marginBottom: "2rem" }}>
              <div className="section-title" style={{ textAlign: "left" }}>
                Review Answers
              </div>
              {questions.map((q: any, i: any) => {
                const userAns = answers[i];
                const isCorrect =
                  q.type === "mc"
                    ? userAns === q.correct_answer
                    : q.type === "tf"
                      ? userAns === q.correct_answer
                      : true;
                return (
                  <div
                    key={q.id}
                    className="q-take-card"
                    style={{
                      borderColor:
                        q.type === "rating" || q.type === "text"
                          ? "var(--border)"
                          : isCorrect
                            ? "rgba(67,233,123,0.3)"
                            : "rgba(255,101,132,0.3)",
                    }}
                  >
                    <div className="q-num">
                      Q{i + 1} ·{" "}
                      {q.type === "mc"
                        ? "Multiple Choice"
                        : q.type === "tf"
                          ? "True/False"
                          : q.type === "text"
                            ? "Short Answer"
                            : "Rating"}
                    </div>
                    <div className="q-text">{q.question}</div>
                    {q.type === "mc" &&
                      q.options?.map((opt: any, oi: any) => (
                        <div
                          key={oi}
                          className={`option-btn ${oi === q.correct_answer ? "correct" : oi === userAns && oi !== q.correct_answer ? "wrong" : ""}`}
                          style={{ cursor: "default" }}
                        >
                          <div className="opt-letter">{LETTERS[oi]}</div>
                          {opt}
                        </div>
                      ))}
                    {q.type === "tf" && (
                      <p
                        style={{
                          fontSize: ".85rem",
                          color: isCorrect
                            ? "var(--accent3)"
                            : "var(--accent2)",
                        }}
                      >
                        Your answer:{" "}
                        {userAns === undefined
                          ? "Not answered"
                          : userAns
                            ? "True"
                            : "False"}{" "}
                        — Correct: {q.correct_answer ? "True" : "False"}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* <div
            style={{ display: "flex", gap: ".75rem", justifyContent: "center" }}
          >
            <button className="btn btn-primary" onClick={onDone}>
              Back to Quizzes
            </button>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <button className="btn btn-ghost btn-sm" onClick={onDone}>
          ← Exit
        </button>
        <div className="quiz-attendee">
          <label>Email</label>
          <input type="email" value={email || ""} disabled />
        </div>
        {quiz.time_limit > 0 && (
          <div
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-head)",
              fontWeight: 700,
              color: timeLeft < 30 ? "var(--accent2)" : "var(--accent)",
              fontSize: ".95rem",
            }}
          >
            ⏱ {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, "0")}
          </div>
        )}
      </div>
      <div className="take-header">
        <h2 className="take-title">{quiz.title}</h2>
        {quiz.description && <p className="take-desc">{quiz.description}</p>}
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div
        style={{
          fontSize: ".78rem",
          color: "var(--muted)",
          marginBottom: "1.25rem",
        }}
      >
        {answered}/{questions.length} answered
      </div>

      {questions.map((q: any, i: any) => (
        <div key={q.id} className="q-take-card">
          <div className="q-num">
            Question {i + 1} of {questions.length}
          </div>
          <div className="q-text">{q.question}</div>
          {q.type === "mc" &&
            (q.options || []).map((opt: any, oi: any) => (
              <button
                key={oi}
                className={`option-btn ${answers[i] === oi ? "selected" : ""}`}
                onClick={() => setAnswers((p: any) => ({ ...p, [i]: oi }))}
              >
                <div className="opt-letter">{LETTERS[oi]}</div>
                {opt}
              </button>
            ))}
          {q.type === "tf" && (
            <div className="tf-row">
              {[true, false].map((v: any) => (
                <button
                  key={String(v)}
                  className={`option-btn ${answers[i] === v ? "selected" : ""}`}
                  onClick={() => setAnswers((p: any) => ({ ...p, [i]: v }))}
                >
                  <div className="opt-letter">{v ? "T" : "F"}</div>
                  {v ? "True" : "False"}
                </button>
              ))}
            </div>
          )}
          {q.type === "text" && (
            <textarea
              className="input textarea text-ans"
              placeholder="Your answer..."
              value={answers[i] || ""}
              onChange={(e) =>
                setAnswers((p: any) => ({ ...p, [i]: e.target.value }))
              }
            />
          )}
          {q.type === "rating" && (
            <div className="rating-row">
              {Array.from({ length: 10 }, (_, r) => (
                <button
                  key={r}
                  className={`rating-btn-take ${answers[i] === r + 1 ? "selected" : ""}`}
                  onClick={() => setAnswers((p: any) => ({ ...p, [i]: r + 1 }))}
                >
                  {r + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: "100%",
          justifyContent: "center",
          padding: ".9rem",
          fontSize: "1rem",
          marginTop: ".5rem",
        }}
      >
        {submitting ? (
          <>
            <span className="spinner" /> Submitting…
          </>
        ) : (
          "Submit Quiz →"
        )}
      </button>
    </div>
  );
}
