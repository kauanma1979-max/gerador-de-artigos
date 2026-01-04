
import { GoogleGenAI, Type } from "@google/genai";
import { Video, ArticleConfig, GeneratedArticle } from "../types";

const API_KEY = process.env.API_KEY || "";

export const searchVideosAI = async (query: string): Promise<Video[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Gere uma lista de 6 vídeos fictícios mas realistas do YouTube sobre o tema: "${query}". 
    A lista deve ser em JSON seguindo o formato: 
    Array<{ id: string, title: string, channel: string, duration: string, thumbnail: string, views: string, published: string }>.
    Use URLs de imagens do Picsum para as thumbnails.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            channel: { type: Type.STRING },
            duration: { type: Type.STRING },
            thumbnail: { type: Type.STRING },
            views: { type: Type.STRING },
            published: { type: Type.STRING }
          },
          required: ["id", "title", "channel", "duration", "thumbnail", "views", "published"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Error parsing search response", e);
    return [];
  }
};

export const generateTranscriptionAI = async (video: Video): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Aja como um transcritor profissional. Gere uma transcrição detalhada em português (PT-BR) de um vídeo do YouTube com o título "${video.title}" do canal "${video.channel}". 
    O texto deve parecer uma fala natural de um churrasqueiro especialista, contendo dicas, passos e entusiasmo.`,
  });

  return response.text || "Erro ao gerar transcrição.";
};

export const generateArticleAI = async (video: Video, config: ArticleConfig): Promise<GeneratedArticle> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `
    Aja como um redator especialista em SEO para o site "Barão do Espetinho".
    Com base no vídeo: "${video.title}" e na transcrição: "${video.transcription}",
    gere um artigo de alta qualidade do tipo "${config.type}" focado nas palavras-chave: ${config.keywords.join(", ")}.
    O artigo deve ter aproximadamente ${config.length === 'short' ? '1000' : config.length === 'medium' ? '1800' : '2500'} palavras.
    
    Regras:
    - Use HTML para formatação (h2, h3, p, strong, ul, li).
    - Inclua as seguintes seções conforme solicitado: FAQ (${config.includeFAQ}), Dicas (${config.includeTips}), Receitas (${config.includeRecipes}), Equipamentos (${config.includeEquipment}).
    - O tom deve ser profissional porém apaixonado por churrasco.
    - Otimize para SEO (densidade de palavras-chave, headings).
    
    Retorne o resultado em JSON com: title, content (HTML), seoScore (0-100), wordCount, readingTime (minutos), keywordDensity (porcentagem), headingCount, internalLinks, imageCount, metaTags (formatado em texto).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          seoScore: { type: Type.NUMBER },
          wordCount: { type: Type.NUMBER },
          readingTime: { type: Type.NUMBER },
          keywordDensity: { type: Type.STRING },
          headingCount: { type: Type.NUMBER },
          internalLinks: { type: Type.NUMBER },
          imageCount: { type: Type.NUMBER },
          metaTags: { type: Type.STRING }
        },
        required: ["title", "content", "seoScore", "wordCount", "readingTime", "keywordDensity", "headingCount", "internalLinks", "imageCount", "metaTags"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("Erro ao processar o artigo gerado pela IA.");
  }
};
