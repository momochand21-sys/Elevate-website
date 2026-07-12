import type { MetadataRoute } from "next";

/**
 * Public robots.txt. The marketing site is indexable; the CRM and its APIs are
 * explicitly disallowed so they never show up in search engines.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"],
    },
  };
}
