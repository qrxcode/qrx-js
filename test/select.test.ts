import { describe, expect, it } from "vitest";

import { selectFlowsByFlowType } from "../src/select";

import type { Flow } from "../src/types";

describe("selectFlowsByFlowType", () => {
  it("returns all feed flows when selecting feed", () => {
    const flows: Flow[] = [
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
      },
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json",
        source: "http"
      }
    ];

    expect(
      selectFlowsByFlowType(flows, ["feed"])
    ).toEqual([
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

  it("returns qrx flows when selecting qrx", () => {
    const flows: Flow[] = [
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
        source: "http"
      }
    ];

    expect(
      selectFlowsByFlowType(flows, ["qrx"])
    ).toEqual([
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json",
        source: "http"
      }
    ]);
  });

  it("applications can filter RSS feeds by original media type", () => {
    const flows: Flow[] = [
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
    ];

    const rssFeeds = flows.filter(
      (discoveredFlow) =>
        discoveredFlow.flowType === "feed" &&
        discoveredFlow.type === "application/rss+xml"
    );

    expect(rssFeeds).toEqual([
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml",
        source: "html"
      }
    ]);
  });
});