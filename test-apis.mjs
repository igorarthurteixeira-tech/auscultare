const CEREBRAS_KEY = "csk-vmntywjmwkfeycdf543p8hkkhrwdtwwhd8y2nvwh4d5j4p2f";
const GROQ_KEY = "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";
const GEMINI_KEY = "AIzaSyDHTNJiLpU3HeHntPLDOgcSI_EP8aa_8hk";

const TEST_MESSAGE = "Olá, responda em português em uma frase curta.";

async function testCerebras() {
  const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${CEREBRAS_KEY}` },
    body: JSON.stringify({
      model: "llama3.1-8b",
      messages: [{ role: "user", content: TEST_MESSAGE }],
      max_tokens: 100,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? res.status);
  return data.choices[0].message.content;
}

async function testGroq() {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: TEST_MESSAGE }],
      max_tokens: 100,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? res.status);
  return data.choices[0].message.content;
}

async function testGemini() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: TEST_MESSAGE }] }],
        generationConfig: { maxOutputTokens: 100 },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? res.status);
  return data.candidates[0].content.parts[0].text;
}

const providers = [
  { name: "Cerebras", fn: testCerebras },
  { name: "Groq",     fn: testGroq },
  { name: "Gemini",   fn: testGemini },
];

console.log("Testando providers...\n");

for (const { name, fn } of providers) {
  process.stdout.write(`${name}... `);
  try {
    const reply = await fn();
    console.log(`✓ OK\n  → "${reply.trim()}"\n`);
  } catch (err) {
    console.log(`✗ FALHOU\n  → ${err.message}\n`);
  }
}
