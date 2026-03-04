// frontend/src/utils/aiClient.js

export async function callOfficeAI({ task, payload = {}, context = {}, temperature = 0.8 }) {
  try {
    const response = await fetch("/.netlify/functions/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task,
        payload,
        context,
        temperature,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Erro ao chamar a IA");
    }

    return data;
  } catch (error) {
    console.error("Erro na chamada da IA:", error);
    throw error;
  }
}