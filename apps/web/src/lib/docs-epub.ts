import { strToU8, zipSync } from "fflate";

import { SITE } from "@/constants/site";

// One docs page as an EPUB 3 book, built in the browser from the rendered
// article.

const escapeXml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const xhtml = (title: string, lang: string, body: string) =>
  `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}" lang="${lang}">
<head><meta charset="utf-8" /><title>${escapeXml(title)}</title></head>
<body>${body}</body>
</html>`;

export interface DocsEpubInput {
  title: string;
  description: string;
  /** Absolute URL of the page, the book's identifier. */
  url: string;
  lang: string;
  /** The rendered article; buttons and `[data-epub-skip]` are left out. */
  article: HTMLElement;
}

/** The page as an `.epub` file. */
export const buildDocsEpub = ({
  title,
  description,
  url,
  lang,
  article,
}: DocsEpubInput) => {
  const copy = article.cloneNode(true);
  if (!(copy instanceof HTMLElement)) {
    throw new TypeError("Article is not an element");
  }
  for (const node of copy.querySelectorAll("button, [data-epub-skip]")) {
    node.remove();
  }
  // XMLSerializer writes HTML elements as well-formed XHTML.
  const serializer = new XMLSerializer();
  const body = [...copy.childNodes]
    .map((node) => serializer.serializeToString(node))
    .join("");
  const modified = `${new Date().toISOString().slice(0, 19)}Z`;
  const chapter = xhtml(
    title,
    lang,
    `<h1>${escapeXml(title)}</h1><p>${escapeXml(description)}</p>${body}`
  );
  const nav = xhtml(
    title,
    lang,
    `<nav epub:type="toc"><ol><li><a href="page.xhtml">${escapeXml(title)}</a></li></ol></nav>`
  );
  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id" xml:lang="${lang}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="id">${escapeXml(url)}</dc:identifier>
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>${lang}</dc:language>
    <dc:publisher>${escapeXml(SITE.NAME)}</dc:publisher>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav" />
    <item id="page" href="page.xhtml" media-type="application/xhtml+xml" />
  </manifest>
  <spine><itemref idref="page" /></spine>
</package>`;
  const container = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" /></rootfiles>
</container>`;
  // `mimetype` must come first and stay uncompressed (EPUB OCF).
  const zip = zipSync({
    mimetype: [strToU8("application/epub+zip"), { level: 0 }],
    "META-INF/container.xml": strToU8(container),
    "OEBPS/content.opf": strToU8(opf),
    "OEBPS/nav.xhtml": strToU8(nav),
    "OEBPS/page.xhtml": strToU8(chapter),
  });
  return new Blob([zip], { type: "application/epub+zip" });
};
