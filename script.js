// Get form elements
const nameInput = document.getElementById("name");
const streamInput = document.getElementById("stream");
const marksInput = document.getElementById("marks");
const resultBox = document.getElementById("result");
const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener("click", async () => {
  resultBox.innerText = "Analyzing your profile...";

  // 1️⃣ Initialize aptitude scores
  const scores = {
    logical: 0,
    creative: 0,
    social: 0,
    practical: 0
  };

  // 2️⃣ Read quiz answers
  document.querySelectorAll(".quiz").forEach(q => {
    const type = q.dataset.type;   // logical / creative / social / practical
    const value = Number(q.value);
    scores[type] += value;
  });

  // 3️⃣ Build AI prompt
  const prompt = `
Act as an expert career counselor for Indian students.

Student Profile:
Name: ${nameInput.value}
Stream: ${streamInput.value}
12th Marks: ${marksInput.value}

Aptitude Scores:
Logical: ${scores.logical}
Creative: ${scores.creative}
Social: ${scores.social}
Practical: ${scores.practical}

Task:
Suggest the TOP 3 suitable career paths.
Explain why each career matches the student.
Give clear next steps after 12th (courses, exams, skills).
Use simple language.
`;

  try {
    // 4️⃣ Call Cloudflare Worker (Gemini proxy)
    const response = await fetch(
      "https://career-ai-proxy.robust9223.workers.dev",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

   const data = await response.json();

// Correct handling of Worker response
if (!data.text) {
  resultBox.innerText = "AI could not generate a response. Please try again.";
  return;
}

resultBox.innerText = data.text;

  } catch (error) {
    console.error("Fetch error:", error);
    resultBox.innerText = "Error connecting to AI service.";
  }
});