const WORKER_URL = "https://career-ai-proxy.robust9223.workers.dev";

document.getElementById("submitBtn").addEventListener("click", async () => {
  const resultBox = document.getElementById("result");
  resultBox.innerText = "Analyzing your profile...";

  // Collect form values
  const name = document.getElementById("name").value;
  const stream = document.getElementById("stream").value;
  const marks = document.getElementById("marks").value;

  const quizAnswers = Array.from(
    document.querySelectorAll(".quiz")
  ).map(q => q.value);

  // 🔴 VERY IMPORTANT: build ONE STRING prompt
  const prompt = `
You are an expert career counselor for Indian students.

Student Name: ${name}
Stream: ${stream}
12th Marks: ${marks}%

Quiz Responses:
${quizAnswers.join(", ")}

Based on this, suggest:
1. Top 3 career options
2. Why each is suitable
3. What to do after 12th
`;

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();

    if (data.text) {
      resultBox.innerText = data.text;
    } else {
      resultBox.innerText = "No response from AI.";
    }

  } catch (error) {
    console.error(error);
    resultBox.innerText = "Error connecting to AI service.";
  }
});
