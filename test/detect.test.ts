import { describe, expect, it } from "vitest";

import { detectFlows } from "../src/detect";

describe("detectFlows", () => {
  it("detects RSS feed flow from HTML head", () => {
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
      }
    ]);
  });

  it("detects qrx flow with application/qrx+json", () => {
    const html = `
      <html>
        <head>
          <link
            rel="qrx"
            type="application/qrx+json"
            href="/qrx.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json",
        source: "html"
      }
    ]);
  });

  it("detects qrx flow with text/html", () => {
    const html = `
      <html>
        <head>
          <link
            rel="qrx"
            type="text/html"
            href="/demo.html">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/demo.html",
        type: "text/html",
        source: "html"
      }
    ]);
  });

  it("detects qrx flow with application/json", () => {
    const html = `
      <html>
        <head>
          <link
            rel="qrx"
            type="application/json"
            href="/manifest.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/manifest.json",
        type: "application/json",
        source: "html"
      }
    ]);
  });

  it("ignores qrx links without explicit type", () => {
    const html = `
      <html>
        <head>
          <link
            rel="qrx"
            href="/qrx.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("ignores qrx links without href", () => {
    const html = `
      <html>
        <head>
          <link
            rel="qrx"
            type="application/qrx+json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("ignores qrx when rel is alternate qrx", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate qrx"
            type="text/html"
            href="/demo.html">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("ignores qrx when rel is qrx something", () => {
    const html = `
      <html>
        <head>
          <link
            rel="qrx something"
            type="application/qrx+json"
            href="/qrx.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("ignores qrx when rel is notqrx", () => {
    const html = `
      <html>
        <head>
          <link
            rel="notqrx"
            type="text/html"
            href="/demo.html">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("ignores qrx when rel is uppercase QRX", () => {
    const html = `
      <html>
        <head>
          <link
            rel="QRX"
            type="application/qrx+json"
            href="/qrx.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([]);
  });

  it("returns feed and qrx flows in discovery order", () => {
    const html = `
      <html>
        <head>
          <link
            rel="alternate"
            type="application/rss+xml"
            href="/feed.xml">

          <link
            rel="qrx"
            type="application/qrx+json"
            href="/qrx.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
      },
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json",
        source: "html"
      }
    ]);
  });

  it("preserves duplicate qrx flows exactly as discovered", () => {
    const html = `
      <html>
        <head>
          <link rel="qrx" type="application/qrx+json" href="/qrx.json">
          <link rel="qrx" type="application/qrx+json" href="/qrx.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json",
        source: "html"
      },
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json",
        source: "html"
      }
    ]);
  });

  it("resolves qrx href to absolute URL", () => {
    const html = `
      <html>
        <head>
          <link
            rel="qrx"
            type="application/qrx+json"
            href="./qrx.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com/demo/")).toEqual([
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/demo/qrx.json",
        type: "application/qrx+json",
        source: "html"
      }
    ]);
  });

  it("normalizes qrx type to lowercase", () => {
    const html = `
      <html>
        <head>
          <link
            rel="qrx"
            type="Application/QRX+JSON"
            href="/qrx.json">
        </head>
      </html>
    `;

    expect(detectFlows(html, "https://example.com")).toEqual([
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json",
        source: "html"
      }
    ]);
  });

  it("detects Atom feed flow from HTML head", () => {
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/atom.xml",
        type: "application/atom+xml",
        source: "html"
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.json",
        type: "application/feed+json",
        source: "html"
      }
    ]);
  });

  it("returns multiple recognized feed flows in discovery order", () => {
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
      },
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/atom.xml",
        type: "application/atom+xml",
        source: "html"
      },
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.json",
        type: "application/feed+json",
        source: "html"
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

  it("ignores unsupported feed MIME types", () => {
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

  it("matches alternate when rel has multiple values for feed detection", () => {
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
        flowType: "feed",
        rel: "something alternate other",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
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

  it("matches feed rel values case-insensitively", () => {
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
        flowType: "feed",
        rel: "Alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
      }
    ]);
  });

  it("normalizes feed type to lowercase", () => {
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/blog/feed.xml",
        type: "application/rss+xml",
        source: "html"
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/blog/feed.xml",
        type: "application/rss+xml",
        source: "html"
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
        flowType: "feed",
        rel: "alternate",
        href: "https://cdn.example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
      }
    ]);
  });

  it("preserves duplicate feed flows exactly as discovered", () => {
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
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
      },
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
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

  it("returns the current API shape", () => {
    const html = `
      <html>
        <head>
          <link
            rel="qrx"
            type="application/qrx+json"
            href="/qrx.json">
        </head>
      </html>
    `;

    const [flow] = detectFlows(html, "https://example.com");

    expect(Object.keys(flow)).toEqual([
      "flowType",
      "rel",
      "href",
      "type",
      "source"
    ]);
  });
});