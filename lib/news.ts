/**
 * 경제 뉴스 — RSS 피드 기반 (API 키 불필요, 서버에서 조회).
 * 한국: 연합뉴스 경제 + SBS 경제
 * 미국: CNBC 경제 + CNBC Top News(정책·빅테크 등 폭넓은 비즈니스 뉴스) + MarketWatch
 *       + 연준(Fed) 공식 보도자료(통화정책·FOMC 등 — 헤드라인 신호 위주, 정부 1차 소스)
 *
 * 요약(summary)은 각 기사 RSS description의 리드 텍스트를 정제한 것.
 * 카드에서 5줄로 클램프해 "핵심 요약" 느낌을 준다. (정밀 5줄 AI 요약은 lib/summarize.ts)
 */

export type NewsMarket = "KR" | "US";

export interface NewsItem {
  title: string;
  link: string;
  summary: string;
  source: string;
  pubDate: string; // ISO
  image?: string;
  ai?: boolean; // AI가 실제로 요약한 항목이면 true
}

interface FeedConfig {
  source: string;
  url: string;
}

const FEEDS: Record<NewsMarket, FeedConfig[]> = {
  KR: [
    { source: "연합뉴스", url: "https://www.yna.co.kr/rss/economy.xml" },
    {
      source: "SBS",
      url: "https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=02",
    },
  ],
  US: [
    {
      source: "CNBC",
      url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
    },
    {
      source: "CNBC",
      url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114",
    },
    {
      source: "MarketWatch",
      url: "http://feeds.marketwatch.com/marketwatch/topstories/",
    },
    {
      source: "Fed",
      url: "https://www.federalreserve.gov/feeds/press_all.xml",
    },
  ],
};

const REVALIDATE_SECONDS = 600; // 뉴스는 10분 캐시

function decodeEntitiesOnce(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&");
}

// CDATA 제거 후, 이중 인코딩(&amp;#x27; 등)까지 안정될 때까지 반복 디코딩
function decodeEntities(s: string): string {
  let out = s.replace(/<!\[CDATA\[|\]\]>/g, "");
  for (let i = 0; i < 3; i++) {
    const next = decodeEntitiesOnce(out);
    if (next === out) break;
    out = next;
  }
  return out.trim();
}

// CDATA 마커를 먼저 벗겨야 내부 한글 리드문이 통째로 태그로 오인돼 삭제되지 않음
function stripHtml(s: string): string {
  const noCdata = s.replace(/<!\[CDATA\[|\]\]>/g, "");
  return decodeEntities(noCdata.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function pick(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].trim() : "";
}

function extractImage(block: string): string | undefined {
  const enclosure = block.match(/<enclosure[^>]*url="([^"]+)"/i);
  if (enclosure) return enclosure[1];
  const media = block.match(/<media:(?:content|thumbnail)[^>]*url="([^"]+)"/i);
  if (media) return media[1];
  const img = block.match(/<img[^>]*src="([^"]+)"/i);
  if (img) return img[1];
  return undefined;
}

function parseFeed(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);
  for (const raw of blocks) {
    const block = raw.slice(0, raw.search(/<\/item>/i));
    const title = decodeEntities(pick(block, "title"));
    let link = decodeEntities(pick(block, "link"));
    // 일부 피드는 <link> 대신 CDATA/guid에 URL을 담음
    if (!link) {
      const g = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      if (g && /^https?:/.test(g[1].trim())) link = g[1].trim();
    }
    if (!title || !link) continue;
    const desc = pick(block, "description") || pick(block, "content:encoded");
    const summary = stripHtml(desc);
    // 일부 피드(Fed 등)는 pubDate도 CDATA로 감싸므로 벗겨내고 파싱해야 한다.
    // 안 벗기면 Date 파싱 실패 → "지금"으로 폴백돼 정렬 순서가 왜곡된다.
    const pubRaw = decodeEntities(pick(block, "pubDate") || pick(block, "dc:date"));
    const d = pubRaw ? new Date(pubRaw) : new Date();
    items.push({
      title,
      link,
      summary,
      source,
      pubDate: isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(),
      image: extractImage(block),
    });
  }
  return items;
}

async function fetchFeed(cfg: FeedConfig): Promise<NewsItem[]> {
  try {
    const res = await fetch(cfg.url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseFeed(xml, cfg.source);
  } catch {
    return [];
  }
}

/** 시장별 경제 뉴스 (최신순, 제목 중복 제거) */
export async function fetchNews(market: NewsMarket, limit = 24): Promise<NewsItem[]> {
  const lists = await Promise.all(FEEDS[market].map(fetchFeed));
  const merged = lists.flat();
  const seen = new Set<string>();
  const unique = merged.filter((n) => {
    const key = n.title.slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.sort((a, b) => +new Date(b.pubDate) - +new Date(a.pubDate));
  return unique.slice(0, limit);
}
