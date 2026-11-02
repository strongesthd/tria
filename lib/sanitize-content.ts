import sanitizeHtml from "sanitize-html";

const contentOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "a", "b", "blockquote", "br", "caption", "code", "del", "em", "figcaption", "figure",
    "h1", "h2", "h3", "h4", "hr", "i", "img", "li", "ol", "p", "pre", "s", "strong",
    "sub", "sup", "table", "tbody", "td", "th", "thead", "tr", "u", "ul",
  ],
  allowedAttributes: {
    a: ["href", "name", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height"],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
};

export function sanitizeContentHtml(value: string) {
  return sanitizeHtml(value, contentOptions);
}

export function contentToPlainText(value: string, maxLength = 200) {
  const text = sanitizeHtml(value.replace(/<\/(?:p|h[1-6]|li|div)>/gi, " ").replace(/<br\s*\/?>/gi, " "), {
    allowedTags: [],
    allowedAttributes: {},
    textFilter: (text) => text,
  })
    .replace(/\s+/g, " ")
    .trim();

  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}
