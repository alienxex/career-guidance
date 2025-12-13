const WORKER_URL = "https://career-ai-proxy.robust9223.workers.dev";

document.getElementById("submitBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const stream = document.getElementById("stream").value;
  const marks = document.getElementById("marks").value;
  const quiz = document.querySelectorAll(".quiz");
  const resultBox = document.getElementById("result");

  if (!name || !marks) {
    resultBox.innerText = "Please fill all details.";
    return;
  }

  let scores = [];
  quiz.forEach(q => scores.push(Number(q.value)));

  const prompt = `
Act as an expert career counselor for Indian students.

Student Profile:
Name: ${name}
Stream: ${stream}
12th Marks: ${marks}%

Aptitude Scores:
Logical: ${scores[0]}
Creative: ${scores[1]}
Social: ${scores[2]}
Practical: ${scores[3]}

Tasks:
1. Suggest top 3 suitable career paths.
2. Explain why each is suitable.
3. Give next steps after 12th.

Respond clearly in bullet points.
`;

  resultBox.innerText = "Analyzing your profile...";

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    let aiText = "";

    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];

      if (candidate.content && candidate.content.parts) {
        aiText = candidate.content.parts.map(p => p.text).join("\n");
      } else if (candidate.output_text) {
        aiText = candidate.output_text;
      }
    }

    if (!aiText) {
      throw new Error("Empty AI response");
    }

    resultBox.innerText = aiText;

  } catch (error) {
    console.error(error);
    resultBox.innerText = "AI could not generate a response. Please try again.";
  }
});
