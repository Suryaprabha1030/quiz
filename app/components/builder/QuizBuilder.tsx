"use client";

import { sb } from "@/app/lib/supabase";
import { useState } from "react";
import toast from "react-hot-toast";

interface QuizBuilderProps {
  session: any;
  onSaved: () => void;
  onCancel: () => void;
}

const LETTERS = ["A", "B", "C", "D", "E"];
const emptyQuestion = () => ({
  id: Math.random().toString(36).slice(2),
  text: "",
  type: "mc",
  options: ["", ""],
  correct_index: 0,
  correct_bool: true,
  sample_answer: "",
  position: 0,
  ratingValue: 5,
});

export function QuizBuilder({
  session,
  // toast,
  onSaved,
  onCancel,
}: QuizBuilderProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [mode, setMode] = useState("quiz");
  const [timeLimit, setTimeLimit] = useState(0);
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState("medium");
  const [aiCount, setAiCount] = useState(10);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [mcCount, setMcCount] = useState(5);
  const [tfCount, setTfCount] = useState(3);
  const [shortCount, setShortCount] = useState(2);
  const [aiDescription, setAiDescription] = useState("");
  const [ratingCount, setRatingCount] = useState(0);
  // const [aiTopic, setAiTopic] = useState("");
  // const [aiDifficulty, setAiDifficulty] = useState("medium");
  // const [aiCount, setAiCount] = useState(10);
  async function generateWithAI() {
    if (!aiTopic.trim()) {
      toast.error("Enter topic");
      return;
    }

    try {
      setAiLoading(true);
      setTitle(aiTopic);

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: aiTopic,
          description: aiDescription,

          difficulty: aiDifficulty, // 1-10
          questionCounts: {
            multipleChoice: mcCount,
            trueFalse: tfCount,
            shortAnswer: shortCount,
            rating: ratingCount,
          },
          // questionCounts: {
          //   multipleChoice: mcCount,
          //   trueFalse: tfCount,
          //   shortAnswer: shortCount,
          // },
        }),
      });

      const data = await res.json();

      if (!data.questions) {
        toast.error("AI generation failed!");
        return;
      }

      const mappedQuestions = data.questions.map((q: any, index: number) => ({
        id: Math.random().toString(36).slice(2),
        text: q.text || "",
        type: q.type || "mc",
        options: q.options || ["", ""],
        correct_index: q.correct_index ?? 0,
        correct_bool: q.correct_bool ?? true,
        sample_answer: q.sample_answer || "",
        position: index,
        ratingValue: q.ratingValue ?? 5,
      }));

      setQuestions(mappedQuestions);

      toast.success(
        `${mappedQuestions.length} questions generated successfully!`,
      );

      setShowAI(false);

      // toast(`${mappedQuestions.length} questions generated`, "success");
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Please try again.");
      setAiLoading(false);
    } finally {
      setAiLoading(false);
    }
  }

  function updateQ(idx: any, field: any, val: any) {
    setQuestions((p) =>
      p.map((q, i) => (i === idx ? { ...q, [field]: val } : q)),
    );
  }
  function addOption(qi: any) {
    setQuestions((p) =>
      p.map((q, i) => (i === qi ? { ...q, options: [...q.options, ""] } : q)),
    );
  }
  function updateOption(qi: any, oi: any, val: any) {
    setQuestions((p) =>
      p.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? val : o)) }
          : q,
      ),
    );
  }
  function removeOption(qi: any, oi: any) {
    setQuestions((p) =>
      p.map((q, i) =>
        i === qi
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== oi),
              correct_index: Math.max(
                0,
                q.correct_index - (oi <= q.correct_index ? 1 : 0),
              ),
            }
          : q,
      ),
    );
  }
  function addQuestion() {
    setQuestions((p) => [...p, emptyQuestion()]);
  }
  function removeQuestion(idx: any) {
    if (questions.length > 1)
      setQuestions((p) => p.filter((_, i) => i !== idx));
  }

  async function save() {
    if (!title.trim()) {
      toast.error("Enter a quiz title");
      return;
    }

    if (questions.some((q) => !q.text.trim())) {
      toast.error("Fill all question texts");
      return;
    }

    setSaving(true);

    try {
      // Save quiz
      const quizTable = await sb.from("quizzes", session.token);

      const result = await quizTable.insert({
        title,
        description: desc,
        mode,
        time_limit: timeLimit,
        created_by: session.user.id,
        creator_email: session.user.email,
        is_public: true,
      });
      const quiz = result?.[0];

      const shareUrls = `${window.location.origin}/quiz/${quiz.id}`;
      console.log(quiz.id, shareUrls, "shareUrls");
      const quizTables = await sb.from("quizzes", session.token);

      if (!quiz?.id) {
        toast.error("Failed to save quiz");
        setSaving(false);
        return;
      }

      // Save questions
      // const questionTable = await sb.from("questions", session.token);
      const questionTable = await sb.from("questions", session.token);
      // const quizTables = await sb.from("quizzes");
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const shareUrl = `${window.location.origin}/quiz/${quiz.id}`;
        await quizTables.update(
          {
            shareUrl: shareUrl,
          },
          `id=eq.${quiz.id}`,
        );

        await questionTable.insert({
          quiz_id: quiz.id,
          question: q.text,
          type: q.type,
          options: q.type === "mc" ? q.options : null,
          correct_answer:
            q.type === "mc"
              ? q.options[q.correct_index]
              : q.type === "tf"
                ? q.correct_bool
                : q.sample_answer,
          shareUrl: shareUrl,
        });
      }

      //   await questionTable.insert({
      //     quiz_id: quiz.id,
      //     text: q.text,
      //     type: q.type,
      //     options: q.type === "mc" ? q.options : null,
      //     correct_index: q.type === "mc" ? q.correct_index : null,
      //     correct_answer: q.type === "tf" ? q.correct_bool : null,
      //     sample_answer: q.type === "text" ? q.sample_answer : null,
      //     position: i,
      //   });
      // }

      // Save id
      setSavedId(quiz.id);

      // Generate live URL
      const shareUrl = `${window.location.origin}/quiz/${quiz.id}`;

      // console.log("Quiz Link:", shareUrl);

      // Copy to clipboard
      // await navigator.clipboard.writeText(shareUrl);
      // router.push(`/quiz/${quiz.id}`);
      // toast.success("Quiz published! Link copied 🚀");

      // Redirect to live quiz
      // window.location.href = shareUrl;
    } catch (e) {
      console.error(e);
      toast.error("Error saving quiz");
    }

    setSaving(false);
  }

  const shareUrl: string | null = savedId
    ? `${window.location.origin}/quiz/${savedId}`
    : null;

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
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>
          ← Back
        </button>
        <h2 className="builder-title" style={{ marginBottom: 0 }}>
          Quiz Builder
        </h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowAI(true)}
        >
          🤖 Generate with AI
        </button>
      </div>

      {showAI && (
        <div className="ai-modal-overlay" onClick={() => setShowAI(false)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-header">
              <h3>🤖 AI Quiz Generator</h3>

              <button className="close-btn" onClick={() => setShowAI(false)}>
                ✕
              </button>
            </div>

            <div className="ai-body">
              <label>Topic</label>
              <input
                className="input"
                placeholder="React, JavaScript, AWS..."
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              />
              <label className="block mb-2 text-sm text-gray-300">
                Description
              </label>
              <input
                className="input"
                placeholder="React, JavaScript, AWS..."
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Multiple Choice</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={mcCount}
                    onChange={(e) => setMcCount(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block mb-2">True / False</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={tfCount}
                    onChange={(e) => setTfCount(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block mb-2">Short Answer</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={shortCount}
                    onChange={(e) => setShortCount(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block mb-2">Rating</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={ratingCount}
                    onChange={(e) => setRatingCount(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block mb-2">Difficulty</label>
                  <select
                    className="input"
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                {/* 
                <div>
                  <label className="block mb-2">Total Questions</label>
                  <input
                    type="number"
                    className="input"
                    value={totalQuestions}
                    readOnly
                  />
                </div> */}
              </div>
              {/* <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Multiple Choice</label>
                  <input
                    type="number"
                    className="input"
                    value={mcCount}
                    onChange={(e) => setMcCount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block mb-2">True / False</label>
                  <input
                    type="number"
                    className="input"
                    value={tfCount}
                    onChange={(e) => setTfCount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block mb-2">Short Answer</label>
                  <input
                    type="number"
                    className="input"
                    value={shortCount}
                    onChange={(e) => setShortCount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block mb-2">Difficulty</label>
                  <select
                    className="input"
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label>Difficulty</label>{" "}
                  <select
                    className="input"
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                  >
                    {" "}
                    <option value="easy">Easy</option>{" "}
                    <option value="medium">Medium</option>{" "}
                    <option value="hard">Hard</option>{" "}
                  </select>{" "}
                </div>
                <div>
                  <label>Number of Questions</label>{" "}
                  <input
                    className="input"
                    type="number"
                    min={1}
                    max={50}
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                  />
                </div>
              </div> */}

              <button
                className="btn btn-primary"
                onClick={generateWithAI}
                disabled={aiLoading}
              >
                {aiLoading ? (
                  <>
                    <span className="spinner" /> Generating...
                  </>
                ) : (
                  "🚀 Generate Questions"
                )}
              </button>

              {/* <button
                className="btn btn-primary"
                style={{
                  width: "100%",
                  marginTop: "1rem",
                }}
                onClick={async () => {
                  await generateWithAI();
                  setShowAI(false);
                }}
              >
                🚀 Generate Questions
              </button> */}
            </div>
          </div>
        </div>
      )}
      {savedId && (
        <div className="success-msg" style={{ marginBottom: "1rem" }}>
          ✅ Quiz published! Share this link:
          <div className="link-box" style={{ marginTop: ".5rem" }}>
            <span className="link-text">{shareUrl}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                if (!shareUrl) return;
                await navigator.clipboard.writeText(shareUrl);
                toast.success("Copied!");
              }}
            >
              Copy
            </button>
          </div>
        </div>
      )}
      <div className="builder-layout">
        <div>
          <div className="card" style={{ marginBottom: "1.25rem" }}>
            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <label>Quiz Title *</label>
                <input
                  className="input"
                  placeholder="e.g. World Geography Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label>Description</label>
                <textarea
                  className="input textarea py-3"
                  placeholder="What's this quiz about?"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label>Mode</label>
                  <select
                    className="input select"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="quiz">Scored Quiz</option>
                    <option value="survey">Survey (no score)</option>
                  </select>
                </div>
                <div>
                  <label>Time Limit (seconds, 0 = none)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(+e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {questions.map((q, qi) => (
            <div key={q.id} className="q-builder-card">
              <button className="delete-q" onClick={() => removeQuestion(qi)}>
                ✕
              </button>
              <div className="q-num">Question {qi + 1}</div>
              <div style={{ marginBottom: ".75rem" }}>
                <label>Question Text *</label>
                <textarea
                  className="input textarea"
                  // style={{ minHeight: "54px" }}
                  placeholder="Enter your question..."
                  value={q.text}
                  onChange={(e) => updateQ(qi, "text", e.target.value)}
                />
              </div>
              <div className="type-pills">
                {[
                  ["mc", "Multiple Choice"],
                  ["tf", "True / False"],
                  ["text", "Short Answer"],
                  ["rating", "Rating 1–10"],
                ].map(([t, l]) => (
                  <button
                    key={t}
                    className={`type-pill ${q.type === t ? "active" : ""}`}
                    onClick={() => updateQ(qi, "type", t)}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {q.type === "mc" && (
                <div>
                  <label>
                    Options{" "}
                    <span
                      style={{
                        color: "var(--muted2)",
                        fontWeight: 400,
                        textTransform: "none",
                      }}
                    >
                      (click ○ to mark correct)
                    </span>
                  </label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="option-input-row">
                      <button
                        className={`correct-check ${q.correct_index === oi ? "active" : ""}`}
                        onClick={() => updateQ(qi, "correct_index", oi)}
                        title="Mark as correct"
                      >
                        {q.correct_index === oi && (
                          <svg width="10" height="10" viewBox="0 0 10 10">
                            <path
                              d="M2 5l2.5 2.5L8 3"
                              stroke="#000"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </button>
                      <input
                        className="input"
                        placeholder={`Option ${LETTERS[oi]}`}
                        value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                      />
                      {q.options.length > 2 && (
                        <button
                          className="delete-q"
                          style={{ position: "static" }}
                          onClick={() => removeOption(qi, oi)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 5 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => addOption(qi)}
                    >
                      + Add option
                    </button>
                  )}
                </div>
              )}
              {q.type === "tf" && (
                <div>
                  <label>Correct Answer</label>
                  <select
                    className="input select"
                    style={{ maxWidth: 200 }}
                    value={q.correct_bool ? "true" : "false"}
                    onChange={(e) =>
                      updateQ(qi, "correct_bool", e.target.value === "true")
                    }
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              )}
              {q.type === "text" && (
                <div>
                  <label>Sample/Accepted Answer (optional)</label>
                  <input
                    className="input"
                    placeholder="Acceptable answer..."
                    value={q.sample_answer}
                    onChange={(e) =>
                      updateQ(qi, "sample_answer", e.target.value)
                    }
                  />
                </div>
              )}
              {/* {q.type === "rating" && (
                <p style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                  Respondents pick a value from 1 to 10.
                </p>
              )} */}

              {q.type === "rating" && (
                <div style={{ marginTop: "1rem" }}>
                  <label>
                    Rating: <strong>{q.ratingValue ?? 5}</strong>
                  </label>

                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={q.ratingValue ?? 5}
                    onChange={(e) =>
                      updateQ(qi, "ratingValue", Number(e.target.value))
                    }
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      cursor: "pointer",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginTop: "4px",
                    }}
                  >
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                    <span>7</span>
                    <span>8</span>
                    <span>9</span>
                    <span>10</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            className="btn btn-ghost"
            onClick={addQuestion}
            style={{
              width: "100%",
              justifyContent: "center",
              border: "1px dashed var(--border2)",
              marginTop: ".25rem",
            }}
          >
            + Add Question
          </button>
        </div>

        <div>
          <div className="sidebar-card">
            <div className="sidebar-title">Quiz Summary</div>
            <div className="sidebar-stat">
              <span>Questions</span>
              <span>{questions.length}</span>
            </div>
            <div className="sidebar-stat">
              <span>Mode</span>
              <span style={{ textTransform: "capitalize" }}>{mode}</span>
            </div>
            <div className="sidebar-stat">
              <span>Time limit</span>
              <span>{timeLimit > 0 ? `${timeLimit}s` : "None"}</span>
            </div>
            <div className="sidebar-stat">
              <span>Types</span>
              <span style={{ fontSize: ".75rem" }}>
                {[...new Set(questions.map((q) => q.type))].join(", ")}
              </span>
            </div>
            <hr className="divider" />
            <button
              className="btn btn-primary"
              onClick={save}
              disabled={saving}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {saving ? (
                <>
                  <span className="spinner" /> Saving…
                </>
              ) : savedId ? (
                "Update Quiz"
              ) : (
                "Publish Quiz 🚀"
              )}
            </button>
            {savedId && (
              <button
                className="btn btn-ghost"
                onClick={onSaved}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: ".5rem",
                }}
              >
                View All Quizzes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
