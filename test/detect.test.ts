import { describe, expect, it } from "vitest";
import { detectFlows } from "../src/detect";

describe("detectFlows", () => {
  it("detects RSS feed from HTML head", () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      { type: "rss", url: "https://example.com/feed.xml" }
    ]);
  });

  it("detects Atom feed from HTML head", () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/atom+xml" href="/atom.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      { type: "atom", url: "https://example.com/atom.xml" }
    ]);
  });

  it("detects JSON Feed from HTML head", () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/feed+json" href="/feed.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      { type: "jsonfeed", url: "https://example.com/feed.json" }
    ]);
  });

  it("detects multiple flows", () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="/feed.xml">
          <link rel="alternate" type="application/atom+xml" href="/atom.xml">
          <link rel="alternate" type="application/feed+json" href="/feed.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      { type: "rss", url: "https://example.com/feed.xml" },
      { type: "atom", url: "https://example.com/atom.xml" },
      { type: "jsonfeed", url: "https://example.com/feed.json" }
    ]);
  });

  it("ignores unsupported link types", () => {
    const html = `
      <html>
        <head>
          <link rel="stylesheet" href="/style.css">
          <link rel="alternate" type="text/html" href="/page.html">
          <link rel="icon" href="/favicon.ico">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("keeps absolute feed URLs", () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="https://feeds.example.com/rss.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      { type: "rss", url: "https://feeds.example.com/rss.xml" }
    ]);
  });

  it("resolves relative feed URLs", () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com/blog/")).toEqual([
      { type: "rss", url: "https://example.com/blog/feed.xml" }
    ]);
  });

  it("deduplicates duplicate flows", () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="/feed.xml">
          <link rel="alternate" type="application/rss+xml" href="/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      { type: "rss", url: "https://example.com/feed.xml" }
    ]);
  });

  it("returns empty array when no flows are found", () => {
    const html = `
      <html>
        <head>
          <title>No feeds here</title>
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });
});