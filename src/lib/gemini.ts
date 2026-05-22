import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PodcastScriptEntry {
  speaker: "Jandira" | "Diogo";
  text: string;
}

export async function generateExplanationAndScript(
  content: string | { data: string; mimeType: string },
  host1: string = "Jandira",
  host2: string = "Diogo"
): Promise<{ explanation: string; script: PodcastScriptEntry[] }> {
  const prompt = `Você é a inteligência acadêmica do "Explica+" - uma plataforma premium de educação executiva e mentoria científica. Sua missão é desmistificar e simplificar assuntos extremamente complexos de forma elegante, profunda e perfeitamente memorável, sem subestimar a capacidade do usuário.

  DIRETRIZES DE PERSONA:
  - Tom: Intelectual, articulado, polido, empático e cativante (estilo Masterclass, TED Talks ou documentários da BBC).
  - Linguagem: Extremamente clara, pragmática, rica em analogias elegantes (ex: se o assunto for finanças, referencie arquitetura de portfólio; se for ciência, referencie dinâmicas da física quântica ou biologia celular). Nunca use infantilismos, onomatopeias bobas, exclamações excessivas ou gírias infanto-juvenis.

  DIRETRIZES DE CONTEÚDO (INTELECTUAL E ADAPTATIVO):
  1. EXPLICAÇÃO (MÉTODO DE SÍNTESE INTELLECTUAL): Um ensaio de 450-700 palavras, lindamente estruturado sob títulos elegantes. Deve conter:
     - Uma analogia unificadora elegante e madura.
     - Detalhamento passo a passo das mecânicas do assunto.
     - Implicações práticas e aplicações de mercado ou do mundo real (seja em tecnologia, negócios, filosofia ou química).

  2. ROTEIRO DE PODCAST (MINUTAGEM DE 10+ MINUTOS):
     - Um diálogo denso, instigante e natural entre os mentores ${host1} (provocativa, analítica, focada no porquê) e ${host2} (o especialista sênior, mestre em metáforas instrutivas).
     - O roteiro deve ter entre 18 e 25 turnos ricos de conversação substantiva.
     - COMECEM DIRETO NO ASSUNTO, com uma pergunta provocativa de ${host1}. Sem introduções robóticas ou saudações genéricas de podcast.
     - O diálogo deve cobrir 4 capítulos sequenciais do assunto: 
       A) Conflito de Base (Por que esse assunto é mal compreendido?)
       B) Estrutura Oculta (Como as engrenagens dele realmente funcionam?)
       C) Impacto Tangível (Aplicações brilhantes no mercado ou na vida prática)
       D) Síntese de Aprendizado (Resumo final conectivo)

  IMPORTANTE: Retorne estritamente um JSON no seguinte formato:
  {
    "explanation": "Texto sofisticado da explicação com marcação HTML simples opcional nas palavras chave (como strong, em, etc) ou parágrafos...",
    "script": [
      {"speaker": "${host1}", "text": "Início direto do diálogo sobre o assunto, abordando o paradoxo inicial..."},
      {"speaker": "${host2}", "text": "Resposta profunda explorando a analogia principal..."}
    ]
  }

  Conteúdo original do material de entrada: ${typeof content === "string" ? content : "[Documento Científico / Anexo de Estudo]"}`;

  const contents = typeof content === "string" 
    ? prompt 
    : {
        parts: [
          { text: prompt },
          { inlineData: content }
        ]
      };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    const text = response.text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse unified response", e);
    throw new Error("Erro ao processar conteúdo. O modelo pode ter gerado um formato inválido.");
  }
}

export async function generatePodcastAudio(
  script: PodcastScriptEntry[], 
  host1Name: string = "Jandira",
  host1Voice: string = "Kore",
  host2Name: string = "Diogo",
  host2Voice: string = "Zephyr"
) {
  // Compile a larger slice of the elegant turns for high-fidelity masterclass synthesis
  const conversation = script
    .slice(0, 16)
    .map((s) => `${s.speaker}: ${s.text}`)
    .join("\n\n");

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-tts-preview",
    contents: [{ parts: [{ text: `Realize o TTS (Texto para Fala) humano e natural desta conversa entre ${host1Name} e ${host2Name}:\n\n${conversation}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            {
              speaker: host1Name,
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: host1Voice },
              },
            },
            {
              speaker: host2Name,
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: host2Voice },
              },
            },
          ],
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("A síntese de áudio falhou.");

  // Fast decoding
  const binary = atob(base64Audio);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  return bytes;
}
