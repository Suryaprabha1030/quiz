import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { topic, difficulty, count } = await req.json();

    const prompt = `
Generate ${count} multiple choice questions about ${topic}.

Difficulty: ${difficulty}

Return valid JSON only:
{
  "questions":[
    {
      "text":"Question",
      "type":"mc",
      "options":["A","B","C","D"],
      "correct_index":0
    }
  ]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=`,
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
