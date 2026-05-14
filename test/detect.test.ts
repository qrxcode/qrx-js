import { describe, expect, it } from "vitest";

import { detectFlows } from "../src/detect";

describe("detectFlows", () => {
  it("detects RSS flow from HTML head", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/rss+xml"
            href="/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "rss",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      }
    ]);
  });

  it("detects Atom flow from HTML head", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/atom+xml"
            href="/atom.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "atom",
        rel: "alternate",
        href: "https://example.com/atom.xml",
        type: "application/atom+xml"
      }
    ]);
  });

  it("detects JSON Feed flow from HTML head", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/feed+json"
            href="/feed.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "jsonfeed",
        rel: "alternate",
        href: "https://example.com/feed.json",
        type: "application/feed+json"
      }
    ]);
  });

  it("returns multiple recognized flows in discovery order", () => {
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
      {
        flowType: "rss",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      },
      {
        flowType: "atom",
        rel: "alternate",
        href: "https://example.com/atom.xml",
        type: "application/atom+xml"
      },
      {
        flowType: "jsonfeed",
        rel: "alternate",
        href: "https://example.com/feed.json",
        type: "application/feed+json"
      }
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

  it("ignores alternate links without explicit type", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            href="/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("ignores unsupported MIME types", () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="text/html" href="/print">
          <link rel="alternate" type="application/pdf" href="/file.pdf">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("ignores links without rel", () => {
    const html = `
      <html>
        <head>
          <link
            type="application/rss+xml"
            href="/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("ignores links without href", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/rss+xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("matches alternate when rel has multiple values", () => {
    const html = `
      <html>
        <head>
          <link
            rel="something alternate other"
            type="application/rss+xml"
            href="/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "rss",
        rel: "something alternate other",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      }
    ]);
  });

  it("preserves original rel string in output", () => {
    const html = `
      <html>
        <head>
          <link
            rel="something alternate other"
            type="application/rss+xml"
            href="/feed.xml">
        </head>
      </html>
    `;

    const flows = detectFlows(html, "https://example.com");

    expect(flows[0].rel).toBe("something alternate other");
  });

  it("normalizes link type to lowercase", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="Application/RSS+XML"
            href="/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "rss",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      }
    ]);
  });

  it("resolves root-relative href to absolute URL", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/rss+xml"
            href="/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com/blog/")).toEqual([
      {
        flowType: "rss",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      }
    ]);
  });

  it("resolves dot-relative href to absolute URL", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/rss+xml"
            href="./feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com/blog/")).toEqual([
      {
        flowType: "rss",
        rel: "alternate",
        href: "https://example.com/blog/feed.xml",
        type: "application/rss+xml"
      }
    ]);
  });

  it("resolves path-relative href to absolute URL", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/rss+xml"
            href="feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com/blog/")).toEqual([
      {
        flowType: "rss",
        rel: "alternate",
        href: "https://example.com/blog/feed.xml",
        type: "application/rss+xml"
      }
    ]);
  });

  it("keeps absolute href unchanged", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/rss+xml"
            href="https://cdn.example.com/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "rss",
        rel: "alternate",
        href: "https://cdn.example.com/feed.xml",
        type: "application/rss+xml"
      }
    ]);
  });

  it("preserves duplicate flows exactly as discovered", () => {
    const html = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="/feed.xml">
          <link rel="alternate" type="application/rss+xml" href="/feed.xml">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "rss",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      },
      {
        flowType: "rss",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      }
    ]);
  });

  it("does not return old API shape", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/rss+xml"
            href="/feed.xml">
        </head>
      </html>
    `;

    const [flow] = detectFlows(html, "https://example.com");

    expect(flow).not.toHaveProperty("url");
    expect(flow.type).not.toBe("rss");
  });

  it("returns the new API shape", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/rss+xml"
            href="/feed.xml">
        </head>
      </html>
    `;

    const [flow] = detectFlows(html, "https://example.com");

    expect(Object.keys(flow)).toEqual([
      "flowType",
      "rel",
      "href",
      "type"
    ]);
  });

  it("matches rel values case-insensitively", () => {
  const html = `
    <html>
      <head>
        <link
          rel="Alternate"
          type="application/rss+xml"
          href="/feed.xml">
      </head>
    </html>
  `;

  expect(detectFlows(html, "https://example.com")).toEqual([
    {
      flowType: "rss",
      rel: "Alternate",
      href: "https://example.com/feed.xml",
      type: "application/rss+xml"
    }
  ]);
});

it("supports single-quoted attributes", () => {
  const html = `
    <html>
      <head>
        <link
          rel='alternate'
          type='application/rss+xml'
          href='/feed.xml'>
      </head>
    </html>
  `;

  expect(detectFlows(html, "https://example.com")).toEqual([
    {
      flowType: "rss",
      rel: "alternate",
      href: "https://example.com/feed.xml",
      type: "application/rss+xml"
    }
  ]);
});
});