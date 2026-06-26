import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, difficulty, questionCounts, description } = await req.json();

    //     const prompt = `
    // Generate ${count} multiple choice questions about ${topic}.

    // Difficulty: ${difficulty}

    // Return valid JSON only:
    // {
    //   "questions":[
    //     {
    //       "text":"Question",
    //       "type":"mc",
    //       "options":["A","B","C","D"],
    //       "correct_index":0
    //     }
    //   ]
    // }
    // `;

    const totalQuestions =
      questionCounts.multipleChoice +
      questionCounts.trueFalse +
      questionCounts.shortAnswer +
      questionCounts.rating;

    const prompt = `
Generate exactly ${totalQuestions} questions about "${topic}".

Description: ${description || "None"}
Difficulty: ${difficulty}

Question distribution:
- ${questionCounts.multipleChoice} Multiple Choice
- ${questionCounts.trueFalse} True/False
- ${questionCounts.shortAnswer} Short Answer
- ${questionCounts.rating} Rating (1-10)

Return ONLY valid JSON in this format:

{
  "questions": [
    {
      "text": "Question text",
      "type": "mc",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0
    },
    {
      "text": "Question text",
      "type": "tf",
      "correct_bool": true
    },
    {
      "text": "Question text",
      "type": "text",
      "sample_answer": "Sample answer"
    },
    {
      "text": "Question text",
      "type": "rating"
    }
  ]
}

Rules:
- Generate exactly ${questionCounts.multipleChoice} Multiple Choice questions.
- Generate exactly ${questionCounts.trueFalse} True/False questions.
- Generate exactly ${questionCounts.shortAnswer} Short Answer questions.
- Generate exactly ${questionCounts.rating} Rating questions.
- Do not generate more or fewer questions.
- Return JSON only. No markdown or explanations.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.AI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      },
    );

    console.log("STATUS:", response.status);
    const data = await response.json();

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```/g, "")
      .trim();

    const json = JSON.parse(cleaned);

    return NextResponse.json(json);
  } catch (err: any) {
    console.error("ERROR:", err);

    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 },
    );
  }
}
