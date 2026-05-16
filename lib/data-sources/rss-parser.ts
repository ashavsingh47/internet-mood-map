/**
 * Minimal RSS 2.0 / Atom parser with zero dependencies.
 *
 * Public news feeds (BBC, Reuters, Al Jazeera, NPR, ...) are well-formed
 * XML, so a careful regex extractor is enough for the dashboard's needs
 * and avoids pulling in a parser dependency. The functions here are
 * intentionally tolerant: on any unexpected shape they return an empty
 * array rather than throwing.
 */

export type ParsedFeedItem = {
  title: string;
  description: string;
  link?: string;
  pubDate?: string;
  guid?: string;
};

function escapeRegexTag(tagName: string): string {
  return tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Pull the inner text of the first occurrence of `<tag>...</tag>`,
 * tolerating attributes and namespace prefixes that don't break on `\b`
 * (e.g. `<dc:date>`, `<content:encoded>`, `<title type="text">`).
 */
function readTag(xml: string, tagName: string): string | undefined {
  const escaped = escapeRegexTag(tagName);
  const re = new RegExp(
    `<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`,
    "i",
  );
  const match = re.exec(xml);
  if (!match) return undefined;
  return decodeContent(match[1]);
}

/** Decode CDATA, strip nested HTML tags, decode the common HTML entities. */
function decodeContent(raw: string): string {
  let content = raw.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");
  content = content.replace(/<[^>]+>/g, " ");
  content = content
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Generic numeric entities (best-effort)
    .replace(/&#(\d+);/g, (_, code: string) => {
      const num = Number(code);
      return Number.isFinite(num) ? String.fromCodePoint(num) : " ";
    });
  return content.replace(/\s+/g, " ").trim();
}

function extractBlocks(xml: string, tagName: string): string[] {
  const escaped = escapeRegexTag(tagName);
  const re = new RegExp(
    `<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`,
    "gi",
  );
  const result: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    result.push(match[1]);
  }
  return result;
}

function parseRssItem(itemXml: string): ParsedFeedItem {
  return {
    title: readTag(itemXml, "title") ?? "",
    description:
      readTag(itemXml, "description") ??
      readTag(itemXml, "content:encoded") ??
      "",
    link: readTag(itemXml, "link"),
    pubDate:
      readTag(itemXml, "pubDate") ?? readTag(itemXml, "dc:date"),
    guid: readTag(itemXml, "guid"),
  };
}

function parseAtomEntry(entryXml: string): ParsedFeedItem {
  // Atom <link> uses an attribute, not text content.
  const linkMatch = /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\/?>/i.exec(
    entryXml,
  );
  return {
    title: readTag(entryXml, "title") ?? "",
    description:
      readTag(entryXml, "summary") ?? readTag(entryXml, "content") ?? "",
    link: linkMatch?.[1],
    pubDate:
      readTag(entryXml, "published") ?? readTag(entryXml, "updated"),
    guid: readTag(entryXml, "id"),
  };
}

/**
 * Parse an RSS 2.0 or Atom document into a flat list of items.
 * Returns an empty array if the input is not recognizable XML.
 */
export function parseFeed(xml: string): ParsedFeedItem[] {
  if (typeof xml !== "string" || xml.length === 0) return [];

  const rssItems = extractBlocks(xml, "item");
  if (rssItems.length > 0) {
    return rssItems
      .map(parseRssItem)
      .filter((item) => item.title.length > 0 || item.description.length > 0);
  }

  const atomEntries = extractBlocks(xml, "entry");
  if (atomEntries.length > 0) {
    return atomEntries
      .map(parseAtomEntry)
      .filter((item) => item.title.length > 0 || item.description.length > 0);
  }

  return [];
}
