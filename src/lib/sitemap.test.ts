import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { isSitemapRouteIncluded, sitemapStaticPaths, sitemapXML } from "./sitemap";

describe("sitemap route inventory", () => {
  it("includes public pages and excludes account pages and parameterized examples", () => {
    const root = createRootRoute({ staticData: { sitemap: false } });
    const publicPage = createRoute({ getParentRoute: () => root, path: "acerca", staticData: { sitemap: true } });
    const account = createRoute({ getParentRoute: () => root, path: "dashboard", staticData: { sitemap: false } });
    const example = createRoute({ getParentRoute: () => root, path: "animais/$id", staticData: { sitemap: false } });
    const router = createRouter({ routeTree: root.addChildren([publicPage, account, example]) });
    expect(sitemapStaticPaths(router)).toEqual(["/acerca"]);
    expect(isSitemapRouteIncluded(account)).toBe(false);
    expect(isSitemapRouteIncluded(example)).toBe(false);
  });

  it("does not allow descendants to override a private subtree", () => {
    const root = createRootRoute({ staticData: { sitemap: false } });
    const privateArea = createRoute({ getParentRoute: () => root, path: "account", staticData: { sitemap: "exclude-subtree" } });
    const child = createRoute({ getParentRoute: () => privateArea, path: "profile", staticData: { sitemap: true } });
    createRouter({ routeTree: root.addChildren([privateArea.addChildren([child])]) });
    expect(isSitemapRouteIncluded(child)).toBe(false);
  });

  it("uses the published origin without inventing modification dates", () => {
    const xml = sitemapXML("https://patacerta-pack-hub.lovable.app", [{ path: "/" }, { path: "/acerca" }, { path: "/acerca" }]);
    expect(xml).toContain("<loc>https://patacerta-pack-hub.lovable.app/acerca</loc>");
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml).not.toContain("<lastmod>");
  });

  it("rejects external destinations", () => {
    expect(() => sitemapXML("https://patacerta-pack-hub.lovable.app", [{ path: "//other.example/path" }])).toThrow("Invalid sitemap path");
  });
});