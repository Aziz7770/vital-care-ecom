import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const html = readFileSync("index.html", "utf8");

it("loads Google Tag Manager GTM-PDX2KQTZ only behind the owner-domain gate", () => {
  const start = html.indexOf("<!-- Google Tag Manager");
  const block = html.slice(start, html.indexOf("<!-- End Google Tag Manager -->"));
  expect(start).toBeGreaterThan(-1);
  expect(block).toContain("if (window.__TRACK_OK)");
  expect(block).toContain("GTM-PDX2KQTZ");
  expect(html.match(/googletagmanager\.com/g)?.length).toBe(1);
});
