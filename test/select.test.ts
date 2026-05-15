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
        type: "application/rss+xml"
      },
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/atom.xml",
        type: "application/atom+xml"
      },
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.json",
        type: "application/feed+json"
      },
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json"
      }
    ];

    expect(
      selectFlowsByFlowType(flows, ["feed"])
    ).toEqual([
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      },
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/atom.xml",
        type: "application/atom+xml"
      },
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.json",
        type: "application/feed+json"
      }
    ]);
  });

  it("returns qrx flows when selecting qrx", () => {
    const flows: Flow[] = [
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      },
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json"
      }
    ];

    expect(
      selectFlowsByFlowType(flows, ["qrx"])
    ).toEqual([
      {
        flowType: "qrx",
        rel: "qrx",
        href: "https://example.com/qrx.json",
        type: "application/qrx+json"
      }
    ]);
  });

  it("applications can filter RSS feeds by original media type", () => {
    const flows: Flow[] = [
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.xml",
        type: "application/rss+xml"
      },
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/atom.xml",
        type: "application/atom+xml"
      },
      {
        flowType: "feed",
        rel: "alternate",
        href: "https://example.com/feed.json",
        type: "application/feed+json"
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
        type: "application/rss+xml"
      }
    ]);
  });
});