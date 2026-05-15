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
      }
    ];

    expect(
      selectFlowsByFlowType(flows, ["feed"])
    ).toEqual(flows);
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