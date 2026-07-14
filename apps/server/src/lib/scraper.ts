import * as cheerio from "cheerio";
import { logger } from "./logger";

export interface ScrapedMeta {
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
  favicon: string | null;
  readingTimeMinutes: number | null;
}

const EMPTY_META = (url: string): ScrapedMeta => ({
  url,
  title: null,
  description: null,
  imageUrl: null,
  siteName: null,
  favicon: null,
  readingTimeMinutes: null,
});

function estimateReadingTime(text: string): number | null {
  const words = text.trim().split(/\s+/).length;
  if (words < 50) return null;
  return Math.ceil(words / 238); 
}

export async function scrapeUrl(url: string): Promise<ScrapedMeta> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StashdBot/1.0; +https://stashd.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      logger.warn({ url, status: res.status }, "Scrape returned non-200");
      return EMPTY_META(url);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) {
      return EMPTY_META(url);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const og = (name: string) =>
      $(`meta[property="og:${name}"]`).attr("content") ??
      $(`meta[name="og:${name}"]`).attr("content") ??
      null;

    const meta = (name: string) =>
      $(`meta[name="${name}"]`).attr("content") ??
      $(`meta[property="${name}"]`).attr("content") ??
      null;

    const title = og("title") ?? ($("title").first().text().trim() || null);

    const description =
      og("description") ?? meta("description") ?? meta("twitter:description") ?? null;

    const imageUrl = og("image") ?? meta("twitter:image") ?? null;

    const siteName = og("site_name") ?? meta("application-name") ?? null;

    let favicon: string | null = null;
    const faviconHref =
      $('link[rel="icon"]').attr("href") ??
      $('link[rel="shortcut icon"]').attr("href") ??
      $('link[rel="apple-touch-icon"]').attr("href") ??
      null;

    if (faviconHref) {
      try {
        favicon = new URL(faviconHref, url).href;
      } catch {
        favicon = null;
      }
    } else {
      try {
        favicon = `${new URL(url).origin}/favicon.ico`;
      } catch {
        favicon = null;
      }
    }

    const bodyText = $("article, main, .content, body").first().text();
    const readingTimeMinutes = estimateReadingTime(bodyText);

    return { url, title, description, imageUrl, siteName, favicon, readingTimeMinutes };
  } catch (err) {
    logger.warn({ url, err }, "Scrape failed");
    return EMPTY_META(url);
  }
}