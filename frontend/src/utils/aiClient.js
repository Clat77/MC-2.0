// frontend/src/utils/aiClient.js

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (_) {
    const first = str.indexOf("{");
    const last = str.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = str.slice(first, last + 1);
      try {
        return JSON.parse(candidate);
      } catch (__) {}
    }
    return null;
  }
}

function buildSystemRules() {
  return `
Você é um ASSISTENTE DE CARREIRA (EA FC 26) para o "Escritório" do time.

Regras IMPORTANTÍSSIMAS:
- Sempre responda em PT-BR.
- Considere o momento do time (fase, últimos resultados, elenco, pressão, calendário).
- Quando sugerir punição/ação, só use coisas que o jogador CONSEGUE FORÇAR no EA FC 26:
  - Banco por X jogos
  - Não relacionar por X jogos
  - Tirar braçadeira / mudar capitão
  - Lista de transferências
  - Lista de empréstimo
  - Rebaixar pro time B / sub-21 (simulação)
  - Rescindir contrato (apenas se fizer sentido)
  - Vender / emprestar como decisão de diretoria
  - Conversar e advertir (roleplay)
- PROIBIDO sugerir como punição: multa, reduzir salário, lesão, "baixar moral", ou qualquer coisa que não dê pra aplicar direto no jogo.
- Eventos devem ser plausíveis e roleplayáveis no modo carreira.
- Para tarefas em JSON, retorne SOMENTE JSON válido, sem texto fora.
`.trim();
}

function promptForTask(task, payload, context) {
  const base = `Contexto (save): ${JSON.stringify(context).slice(0, 70000)}`;

  if (task === "generate_event") {
    return `
${base}

Gere 1 evento de vestiário/diretoria para o elenco, levando em conta o momento do time.

O evento DEVE:
- envolver 1 ou 2 jogadores (ou o elenco como um todo), citando IDs e nomes
- ter título e descrição curta e clara
- ter severidade: "positive" | "low" | "medium" | "high" | "critical"
- trazer ações EA FC 26 aplicáveis (lista) + uma recomendada
- incluir também uma "headline" (manchete) estilo jornal

Retorne SOMENTE este JSON:

{
  "title": "...",
  "description": "...",
  "severity": "low",
  "involvedPlayerIds": ["..."],
  "eaActions": [
    "Banco 1 jogo",
    "Não relacionar 1 jogo",
    "Banco 2 jogos",
    "Não relacionar 2 jogos",
    "Lista de transferências",
    "Lista de empréstimo",
    "Tirar braçadeira",
    "Rebaixar para o time B",
    "Rescindir contrato",
    "Conversar e advertir"
  ],
  "recommendedAction": "Banco 1 jogo",
  "category": "disciplina|tatico|midia|lideranca|mercado|elenco",
  "headline": "..."
}
`.trim();
  }

  if (task === "suggest_action") {
    return `
${base}

Você vai sugerir ações EA FC 26 aplicáveis para este evento abaixo.

Evento:
${JSON.stringify(payload)}

Retorne SOMENTE este JSON:

{
  "eaActions": ["...", "...", "..."],
  "recommendedAction": "...",
  "reasoningShort": "Explique em 1-2 frases, bem direto."
}
`.trim();
  }

  if (task === "generate_comms") {
    return `
${base}

Crie dois textos sobre o evento abaixo:
1) "internalNote": recado interno (diretoria + elenco) — firme, direto, sem expor demais.
2) "pressRelease": nota oficial (imprensa) — elegante, protege o clube, sem entregar tática.

Evento:
${JSON.stringify(payload)}

Retorne SOMENTE este JSON:
{
  "internalNote": "...",
  "pressRelease": "..."
}
`.trim();
  }

  if (task === "generate_headlines") {
    return `
${base}

Gere 5 manchetes curtas e impactantes, estilo jornal esportivo, baseadas no momento do time.

Regras:
- Use o nome do time e técnico do contexto.
- Se a fase estiver ruim, manchetes mais pesadas/pressionando.
- Se a fase estiver boa, manchetes empolgadas.

Retorne SOMENTE este JSON:
{
  "headlines": ["...", "...", "...", "...", "..."]
}
`.trim();
  }

  return `
${base}

Você é um auxiliar técnico/diretor de futebol no modo carreira.
O usuário vai conversar sobre táticas, escalação, elenco, mercado, momento do time.
Responda com criatividade e objetividade, e sempre proponha 2-3 opções práticas.

Pergunta do usuário:
${payload?.message || ""}

Responda em texto normal (não JSON).
`.trim();
}

async function callGroqDirect({ task, payload = {}, context = {}, temperature = 0.8 }) {
  const apiKey = process.env.REACT_APP_GROQ_API_KEY;
  const model = process.env.REACT_APP_GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error("REACT_APP_GROQ_API_KEY não foi definida.");
  }

  const system = buildSystemRules();
  const userPrompt = promptForTask(task, payload, context);

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const rawText = await res.text();

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (e) {
    throw new Error(`Resposta inválida da Groq (status ${res.status}): ${rawText.slice(0, 400)}`);
  }

  if (!res.ok) {
    const groqMsg =
      data?.error?.message ||
      data?.message ||
      `Erro da Groq (status ${res.status})`;

    throw new Error(groqMsg);
  }

  const content = data?.choices?.[0]?.message?.content ?? "";

  if (["generate_event", "suggest_action", "generate_comms", "generate_headlines"].includes(task)) {
    const parsed = safeJsonParse(content);

    if (!parsed) {
      return {
        ok: true,
        task,
        parsed: null,
        rawText: content,
        warning: "Não consegui parsear JSON. O modelo pode ter saído do formato.",
      };
    }

    return {
      ok: true,
      task,
      parsed,
    };
  }

  return {
    ok: true,
    task,
    text: content,
  };
}

export async function callOfficeAI({ task, payload = {}, context = {}, temperature = 0.8 }) {
  return callGroqDirect({ task, payload, context, temperature });
}