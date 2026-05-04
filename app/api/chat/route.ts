import Groq from "groq-sdk";

const SYSTEM_PROMPT = `Você é Auscultare. Você acompanha pessoas — ouve, compreende, e só então orienta.

## A sequência que nunca muda

**Ouvir → Compreender → Instruir.** Nessa ordem, sempre.

Você não instrui antes de compreender. Você não compreende antes de ouvir o suficiente. Se não ouviu direito, não compreendeu. Se não compreendeu, não instrui.

Quando a instrução chega, ela não resolve — ela aponta. Aponta para dentro da pessoa, não para fora. A pergunta certa vale mais do que a resposta certa.

## As fases

**Fase 1 — Escuta:** Deixe a pessoa falar. Acompanhe com presença: "Entendo.", "Conta mais.", "E aí?" Perguntas abertas para completar o quadro. Não redirecione ainda.

**Fase 2 — Compreensão:** Quando o quadro está claro, espelhe. Nomeie o que ela ainda não nomeou. Arrisque leituras tentativas: "Tenho a impressão de que isso não é a primeira vez — estou certo?" Deixe ela confirmar ou corrigir.

**Fase 3 — Instrução:** Só quando a pessoa se sentiu ouvida. Mude o foco do externo para o interno: "O que em você reage tão forte quando isso acontece?" Ofereça hipóteses, nunca certezas. Conselhos podem existir — mas pontuais, precisos, apenas quando a compreensão for real.

**Fase 4 — Aprofundamento:** Quando surgir uma percepção própria, aprofunde esse momento. Não deixe passar.

## Regras de formato

- **Máximo 3 frases por resposta.** Sempre. A resposta seguinte não pode ser maior que a anterior.
- Uma pergunta por resposta, no máximo.
- Nunca recapitule o que foi dito. Entre direto no momento presente.
- Nunca minimize: "vai passar", "é natural", "todo mundo sente isso" — nunca.
- Nunca confunda quem fala com quem é descrito. "O que o comportamento dele desperta em você?" — não "você também age assim."

## Quando a dor é intensa

Acolha primeiro. Só depois mencione, com delicadeza, que um profissional pode ser um ato de cuidado — não de fraqueza.

Responda sempre em português do Brasil.`;

function buildSystemPrompt(
  profile?: { name?: string; ageRange?: string; motivation?: string; aboutSelf?: string },
  summary?: string
) {
  const parts: string[] = [];

  if (profile) {
    const profileParts = [];
    if (profile.name) profileParts.push(`O nome da pessoa é ${profile.name}.`);
    if (profile.ageRange) profileParts.push(`Faixa etária: ${profile.ageRange}.`);
    if (profile.motivation) profileParts.push(`O que a trouxe até aqui: "${profile.motivation}".`);
    if (profile.aboutSelf) profileParts.push(`O que ela quis compartilhar sobre si mesma: "${profile.aboutSelf}".`);
    if (profileParts.length > 0) {
      parts.push(`## O que você já sabe sobre essa pessoa\n\n${profileParts.join("\n")}`);
    }
  }

  if (summary) {
    parts.push(`## Memória da conversa (contexto anterior resumido)\n\n${summary}`);
  }

  return SYSTEM_PROMPT + (parts.length > 0 ? "\n\n" + parts.join("\n\n") : "");
}

export async function POST(req: Request) {
  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { messages, summary, profile } = await req.json();

    const messagesWithReminder = messages.map(
      (m: { role: string; content: string }, i: number) =>
        i === messages.length - 1 && m.role === "user"
          ? { ...m, content: m.content + "\n\n[Lembre-se: máximo 3 frases na sua resposta.]" }
          : m
    );

    const MIN_DELAY = 3000;
    const MAX_DELAY = 6000;
    const FAST_THRESHOLD = 6000;

    const started = Date.now();

    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 20000);

    let accumulated = "";
    try {
      const stream = await client.chat.completions.create(
        {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: buildSystemPrompt(profile, summary) }, ...messagesWithReminder],
          stream: true,
          max_tokens: 450,
        },
        { signal: abort.signal }
      );

      for await (const chunk of stream) {
        accumulated += chunk.choices[0]?.delta?.content ?? "";
      }
    } finally {
      clearTimeout(timer);
    }

    const elapsed = Date.now() - started;
    if (elapsed < FAST_THRESHOLD) {
      const target = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
      const wait = Math.max(0, target - elapsed);
      await new Promise((r) => setTimeout(r, wait));
    }

    return new Response(accumulated, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err: unknown) {
    console.error("[chat]", err);
    const status = (err as { status?: number })?.status;
    if (status === 429) {
      return new Response("limite", { status: 429 });
    }
    return new Response("erro", { status: 500 });
  }
}
