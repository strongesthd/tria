import { buildOrganizationJsonLd } from "../../lib/site-data";

/** Site-wide structured data. Rendered once in the root layout. */
export default function JsonLd() {
  const data = buildOrganizationJsonLd();
  return (
    <script
      type="application/ld+json"
      // The payload is built from trusted local constants, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
