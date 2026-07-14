import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function stripCodeFence(text: string): string {
  return text.replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim();
}

export async function generateSummary(
  url: string,
  title: string,
  description: string | null,
): Promise<string | null> {
  try {
    const model = getClient().getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are summarizing a saved web link for a personal read-later app.
Link: ${url}
Title: ${title}
${description ? `Description: ${description}` : ""}

Write a 2-3 sentence plain-English summary of what this page/article is about. Be concise, specific, and useful. Do not start with "This article" or "This page". Just describe the content directly.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return text || null;
  } catch (err) {
    logger.warn({ err, url }, "Gemini summary failed");
    return null;
  }
}

export async function generateTags(
  url: string,
  title: string,
  description: string | null,
  aiSummary: string | null,
): Promise<string[]> {
  try {
    const model = getClient().getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are auto-tagging a saved web link for a personal read-later app.
Link: ${url}
Title: ${title}
${description ? `Description: ${description}` : ""}
${aiSummary ? `Summary: ${aiSummary}` : ""}

Suggest 2-4 concise, lowercase tags/categories that best describe this content (e.g. "ai", "design", "programming", "productivity", "science", "business", "tutorial", "news").
Return ONLY a JSON array of strings. No explanation. Example: ["ai", "productivity"]`;

    const result = await model.generateContent(prompt);
    const cleaned = stripCodeFence(result.response.text().trim());
    const tags: unknown = JSON.parse(cleaned);
    if (Array.isArray(tags)) {
      return tags.slice(0, 4).map((t) => String(t).toLowerCase().trim());
    }
    return [];
  } catch (err) {
    logger.warn({ err, url }, "Gemini tagging failed");
    return [];
  }
}

interface SearchableLink {
  id: number;
  url: string;
  title: string;
  description: string | null;
  aiSummary: string | null;
  tags: string[];
}

export async function semanticSearch(query: string, links: SearchableLink[]): Promise<number[]> {
  if (links.length === 0) return [];
  try {
    const model = getClient().getGenerativeModel({ model: "gemini-1.5-flash" });
    const catalog = links
      .map(
        (l) =>
          `ID:${l.id} | Title: ${l.title} | URL: ${l.url}${l.aiSummary ? ` | Summary: ${l.aiSummary}` : ""}${l.tags.length ? ` | Tags: ${l.tags.join(", ")}` : ""}`,
      )
      .join("\n");

    const prompt = `You are a smart search engine for a personal "save for later" app.

User query: "${query}"

Saved links:
${catalog}

Return ONLY a JSON array of the IDs of the most relevant links (best match first, up to 20). If nothing matches, return [].
Example: [3, 7, 1]`;

    const result = await model.generateContent(prompt);
    const cleaned = stripCodeFence(result.response.text().trim());
    const ids: unknown = JSON.parse(cleaned);
    if (Array.isArray(ids)) {
      return ids.map((id) => Number(id)).filter((id) => !Number.isNaN(id));
    }
    return [];
  } catch (err) {
    logger.warn({ err, query }, "Gemini search failed");
    return [];
  }
}