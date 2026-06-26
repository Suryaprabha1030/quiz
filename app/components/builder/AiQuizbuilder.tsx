"use client";

import { useState } from "react";

export default function AIQuizGenerator() {
  const [topic, setTopic] = useState("");

  const [difficulty, setDifficulty] = useState("medium");

  const [count, setCount] = useState(10);

  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);

  async function generateQuiz() {
    try {
      setLoading(true);

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          difficulty,
          count,
        }),
      });

      const data = await res.json();

      setQuestions(data.questions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-box">
      <h2>🤖 AI Quiz Generator</h2>

      <input
        className="input"
        placeholder="Topic (React, JavaScript...)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />

      <select
        className="input"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <input
        className="input"
        type="number"
        min={1}
        max={50}
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
      />

      <button
        className="btn btn-primary"
        onClick={generateQuiz}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Quiz"}
      </button>

      {questions.length > 0 && (
        <div
          style={{
            marginTop: "2rem",
          }}
        >
          <h3>Generated Questions</h3>

          {questions.map((q: any, index: number) => (
            <div key={index} className="quiz-card">
              <h4>
                {index + 1}. {q.text}
              </h4>

              <ul>
                {q.options?.map((opt: string, i: number) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>

              <p>Correct: {q.options?.[q.correct_index]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
