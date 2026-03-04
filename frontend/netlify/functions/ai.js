// netlify/functions/ai.js
/* eslint-disable */

// CORS liberado (pra funcionar suave no seu site)
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (_) {
    // tenta extrair um JSON do meio do texto
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
- PROIBIDO sugerir como punição: multa, reduzir salário, lesão, “baixar moral”, qualquer coisa que não dê pra aplicar direto no jogo.
- Eventos devem ser plausíveis e “roleplayáveis” no modo carreira.
- Para tarefas em JSON, retorne SOMENTE JSON válido, sem texto fora.
`.trim();
}

function promptForTask(task, payload, context) {
  const base = `Contexto (save): ${JSON.stringify(context).slice(0, 120000)}`;

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

  // chat (texto normal)
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

async function callGroqChat({ messages, model, temperature }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY env var");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Groq error ${res.status}: ${t}`);
  }

  return res.json();
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: CORS_HEADERS, body: "" };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: false, error: "Method not allowed" }),
      };
    }

    const body = safeJsonParse(event.body || "{}") || {};
    const task = body.task;
    const payload = body.payload || {};
    const context = body.context || {};

    if (!task) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: false, error: "Missing task" }),
      };
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-70b-versatile";
    const temperature = typeof body.temperature === "number" ? body.temperature : 0.8;

    const system = buildSystemRules();
    const userPrompt = promptForTask(task, payload, context);

    const messages = [
      { role: "system", content: system },
      { role: "user", content: userPrompt },
    ];

    const data = await callGroqChat({ messages, model, temperature });
    const content = data?.choices?.[0]?.message?.content ?? "";

    // tasks que DEVEM voltar JSON
    if (["generate_event", "suggest_action", "generate_comms", "generate_headlines"].includes(task)) {
      const parsed = safeJsonParse(content);

      // se a IA sair do formato, devolve raw também
      if (!parsed) {
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            ok: true,
            task,
            parsed: null,
            rawText: content,
            warning: "Não consegui parsear JSON. O modelo pode ter saído do formato.",
          }),
        };
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: true, task, parsed }),
      };
    }

    // chat (texto)
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: true, task, text: content }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: err.message || String(err) }),
    };
  }
};