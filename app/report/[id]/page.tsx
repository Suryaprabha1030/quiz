// "use client";

// import { useEffect, useState } from "react";
// import { sb } from "@/app/lib/supabase";
// import { useParams } from "next/navigation";
// export default function ReportPage() {
//   const params = useParams();
//   console.log(params, "params");
//   const reportId = params?.id as string;

//   const [report, setReport] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     (async () => {
//       try {
//         const tbl = await sb.from("responses");

//         const data: any = await tbl.select("*", `report_id=eq.${params.id}`);

//         setReport(Array.isArray(data) ? data[0] : data);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [params.id]);

//   if (loading) return <h1>Loading...</h1>;

//   if (!report) return <h1>Report not found</h1>;

//   return (
//     <div style={{ padding: "2rem" }}>
//       <h1>Quiz Report</h1>

//       <p>
//         <strong>Attendee:</strong> {report.attendee_email}
//       </p>

//       <p>
//         <strong>Score:</strong> {report.score}/{report.total}
//       </p>

//       <p>
//         <strong>Time Taken:</strong> {report.time_taken}s
//       </p>

//       <p>
//         <strong>Share URL:</strong> {report.share_url}
//       </p>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { sb } from "@/app/lib/supabase";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function ReportPage() {
  const { id } = useParams();

  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const tbl = await sb.from("responses");

      const data: any = await tbl.select("*", `report_id=eq.${id}`);

      setReport(Array.isArray(data) ? data[0] : data);
    })();
  }, [id]);
  const item = Array.isArray(report) ? report[0] : report;
  const totalQuestions = item?.questions?.length || 0;

  const correctCount =
    item?.questions?.filter((q: any, i: number) => {
      const userAns = item?.answers?.[i];

      return q.type === "mc"
        ? userAns === q?.correct_index
        : q.type === "tf"
          ? userAns === q?.correct_bool
          : false;
    }).length || 0;

  const wrongCount = totalQuestions - correctCount;

  if (!report) return <div>Loading...</div>;

  return (
    // <div className="page">
    //   <div className="result-wrap">
    //     <h2>{report.quiz_title || "Quiz Report"}</h2>

    //     <div className="stats-row">
    //       <div className="stat-box">
    //         <div className="stat-val">
    //           {report.score}/{report.total}
    //         </div>
    //         <div className="stat-key">Score</div>
    //       </div>

    //       <div className="stat-box">
    //         <div className="stat-val">
    //           {Math.floor(report.time_taken / 60)}:
    //           {String(report.time_taken % 60).padStart(2, "0")}
    //         </div>
    //         <div className="stat-key">Time</div>
    //       </div>
    //     </div>

    //     {report.questions?.map((q: any, i: number) => {
    //       const userAns = report.answers?.[i];

    //       const isCorrect =
    //         q.type === "mc"
    //           ? userAns === q.correct_index
    //           : q.type === "tf"
    //             ? userAns === q.correct_bool
    //             : true;

    //       return (
    //         <div key={i} className="q-take-card">
    //           <div className="q-num">Question {i + 1}</div>

    //           <div className="q-text">{q.question}</div>

    //           {q.type === "mc" &&
    //             q.options?.map((opt: string, oi: number) => (
    //               <div
    //                 key={oi}
    //                 className={`option-btn ${
    //                   oi === q.correct_index
    //                     ? "correct"
    //                     : oi === userAns
    //                       ? "wrong"
    //                       : ""
    //                 }`}
    //               >
    //                 <div className="opt-letter">{LETTERS[oi]}</div>

    //                 {opt}

    //                 {oi === userAns && (
    //                   <span style={{ marginLeft: "auto" }}>👈 Selected</span>
    //                 )}

    //                 {oi === q.correct_index && (
    //                   <span style={{ marginLeft: "10px" }}>✅ Correct</span>
    //                 )}
    //               </div>
    //             ))}

    //           <div
    //             style={{
    //               marginTop: "10px",
    //               display: "grid",
    //               gap: "6px",
    //             }}
    //           >
    //             <div>
    //               <strong>Your Answer:</strong>{" "}
    //               {userAns !== undefined
    //                 ? q.options?.[userAns]
    //                 : "Not Answered"}
    //             </div>

    //             <div>
    //               <strong>Correct Answer:</strong>{" "}
    //               {q.options?.[q.correct_index]}
    //             </div>

    //             <div>
    //               <strong>Status:</strong>{" "}
    //               <span
    //                 style={{
    //                   color: isCorrect ? "#22c55e" : "#ef4444",
    //                   fontWeight: 600,
    //                 }}
    //               >
    //                 {isCorrect ? "Correct ✅" : "Incorrect ❌"}
    //               </span>
    //             </div>
    //           </div>
    //         </div>
    //       );
    //     })}
    //   </div>
    // </div>

    <div style={{ marginTop: "2rem", padding: "2rem 2rem" }} className="px-10">
      <h2>Review Answers</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: "16px",
          margin: "24px",
        }}
      >
        <div className="stat-box">
          <div className="stat-key">Attendee</div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>
            {item.attendee_email}
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-val">
            {item.score}/{item.total}
          </div>
          <div className="stat-key">Score</div>
        </div>

        <div className="stat-box">
          <div className="stat-val">{correctCount}</div>
          <div className="stat-key">Correct</div>
        </div>

        <div className="stat-box">
          <div className="stat-val">{wrongCount}</div>
          <div className="stat-key">Wrong</div>
        </div>

        <div className="stat-box">
          <div className="stat-val">
            {Math.floor(item.time_taken / 60)}m {item.time_taken % 60}s
          </div>
          <div className="stat-key">Time Taken</div>
        </div>
      </div>

      {report.questions?.map((q: any, i: number) => {
        const userAns = report.answers?.[i];

        const isCorrect =
          q.type === "mc"
            ? userAns === q.correct_index
            : q.type === "tf"
              ? userAns === q.correct_bool
              : true;

        return (
          <div
            key={q.id || i}
            className="q-take-card"
            style={{
              marginBottom: "1rem",
              borderColor:
                q.type === "text" || q.type === "rating"
                  ? "var(--border)"
                  : isCorrect
                    ? "rgba(67,233,123,0.3)"
                    : "rgba(255,101,132,0.3)",
            }}
          >
            <div className="q-num">Question {i + 1}</div>

            <div className="q-text">{q.question}</div>

            {q.type === "mc" &&
              q.options?.map((opt: string, oi: number) => (
                <div
                  key={oi}
                  className={`option-btn ${oi === userAns ? "selected" : ""} ${
                    oi === q.correct_index ? "correct" : ""
                  }`}
                  style={{
                    cursor: "default",
                    marginBottom: "8px",
                  }}
                >
                  <div className="opt-letter">{LETTERS[oi]}</div>

                  {opt}

                  {oi === userAns && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontWeight: 600,
                      }}
                    >
                      👈 Selected
                    </span>
                  )}

                  {oi === q.correct_index && (
                    <span
                      style={{
                        marginLeft: "10px",
                        color: "green",
                        fontWeight: 600,
                      }}
                    >
                      ✅ Correct
                    </span>
                  )}
                </div>
              ))}

            {q.type === "tf" && (
              <>
                <div className="option-btn">
                  True
                  {userAns === true && (
                    <span style={{ marginLeft: "auto" }}>👈 Selected</span>
                  )}
                  {q.correct_bool === true && (
                    <span style={{ marginLeft: "10px" }}>✅ Correct</span>
                  )}
                </div>

                <div className="option-btn">
                  False
                  {userAns === false && (
                    <span style={{ marginLeft: "auto" }}>👈 Selected</span>
                  )}
                  {q.correct_bool === false && (
                    <span style={{ marginLeft: "10px" }}>✅ Correct</span>
                  )}
                </div>
              </>
            )}

            {q.type === "text" && (
              <div style={{ marginTop: "10px" }}>
                <strong>Your Answer:</strong> {userAns || "Not Answered"}
              </div>
            )}

            {q.type === "rating" && (
              <div style={{ marginTop: "10px" }}>
                <strong>Your Rating:</strong> {userAns || "-"}
              </div>
            )}

            {(q.type === "mc" || q.type === "tf") && (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "10px",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      color: isCorrect ? "var(--accent3)" : "var(--accent2)",
                      fontWeight: 600,
                    }}
                  >
                    {isCorrect ? "Correct ✅" : "Incorrect ❌"}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
