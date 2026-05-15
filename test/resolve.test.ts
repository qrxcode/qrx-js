import { afterAll, beforeAll, describe, expect, it } from "vitest";

import http, {
  type IncomingMessage,
  type ServerResponse
} from "node:http";

import { resolveQRX } from "../src/resolve";

let server: http.Server;
let baseUrl: string;

beforeAll(async () => {
  server = http.createServer(
    (
      req: IncomingMessage,
      res: ServerResponse
    ) => {
      if (req.url === "/rss") {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });

        res.end(`
          <html>
            <head>
              <link
                rel="alternate"
                type="application/rss+xml"
                href="/feed.xml">
            </head>
          </html>
        `);

        return;
      }

      if (req.url === "/multiple") {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });

        res.end(`
          <html>
            <head>
              <link
                rel="alternate"
                type="application/rss+xml"
                href="/feed.xml">

              <link
                rel="alternate"
                type="application/atom+xml"
                href="/atom.xml">

              <link
                rel="alternate"
                type="application/feed+json"
                href="/feed.json">
            </head>
          </html>
        `);

        return;
      }

      if (req.url === "/duplicates") {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });

        res.end(`
          <html>
            <head>
              <link
                rel="alternate"
                type="application/rss+xml"
                href="/feed.xml">

              <link
                rel="alternate"
                type="application/rss+xml"
                href="/feed.xml">
            </head>
          </html>
        `);

        return;
      }

      if (req.url === "/unsupported") {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });

        res.end(`
          <html>
            <head>
              <link
                rel="alternate"
                href="/feed.xml">

              <link
                rel="alternate"
                type="text/html"
                href="/print">

              <link
                type="application/rss+xml"
                href="/feed.xml">

              <link
                rel="alternate"
                type="application/rss+xml">
            </head>
          </html>
        `);

        return;
      }

      if (req.url === "/empty") {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });

        res.end(`
          <html>
            <head>
              <title>No flows here</title>
            </head>
          </html>
        `);

        return;
      }

      res.writeHead(404, {
        "Content-Type": "text/plain"
      });

      res.end("Not found");
    }
  );

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Failed to start test server");
  }

  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error?: Error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

describe("resolveQRX", () => {
  it("exists", () => {
    expect(typeof resolveQRX).toBe("function");
  });

  it("fetches a page and returns RSS as a feed flow", async () => {
    const result = await resolveQRX(
      `${baseUrl}/rss`
    );

    expect(result).toEqual({
      flows: [
        {
          flowType: "feed",
          rel: "alternate",
          href: `${baseUrl}/feed.xml`,
          type: "application/rss+xml"
        }
      ]
    });
  });

  it("returns top-level flows array", async () => {
    const result = await resolveQRX(
      `${baseUrl}/rss`
    );

    expect(result).toHaveProperty("flows");
    expect(Array.isArray(result.flows)).toBe(true);
  });

  it("returns multiple feed flows in discovery order", async () => {
    const result = await resolveQRX(
      `${baseUrl}/multiple`
    );

    expect(result).toEqual({
      flows: [
        {
          flowType: "feed",
          rel: "alternate",
          href: `${baseUrl}/feed.xml`,
          type: "application/rss+xml"
        },
        {
          flowType: "feed",
          rel: "alternate",
          href: `${baseUrl}/atom.xml`,
          type: "application/atom+xml"
        },
        {
          flowType: "feed",
          rel: "alternate",
          href: `${baseUrl}/feed.json`,
          type: "application/feed+json"
        }
      ]
    });
  });

  it("preserves duplicate feed flows", async () => {
    const result = await resolveQRX(
      `${baseUrl}/duplicates`
    );

    expect(result).toEqual({
      flows: [
        {
          flowType: "feed",
          rel: "alternate",
          href: `${baseUrl}/feed.xml`,
          type: "application/rss+xml"
        },
        {
          flowType: "feed",
          rel: "alternate",
          href: `${baseUrl}/feed.xml`,
          type: "application/rss+xml"
        }
      ]
    });
  });

  it("returns empty flows when no supported flows are found", async () => {
    const result = await resolveQRX(
      `${baseUrl}/empty`
    );

    expect(result).toEqual({
      flows: []
    });
  });

  it("does not guess or return unsupported links", async () => {
    const result = await resolveQRX(
      `${baseUrl}/unsupported`
    );

    expect(result).toEqual({
      flows: []
    });
  });

  it("does not return old flow.url field", async () => {
    const result = await resolveQRX(
      `${baseUrl}/rss`
    );

    expect(result.flows[0]).not.toHaveProperty("url");
  });

  it("does not use old protocol-specific flowType values", async () => {
    const result = await resolveQRX(
      `${baseUrl}/multiple`
    );

    expect(
      result.flows.some((flow) =>
        ["rss", "atom", "jsonfeed"].includes(flow.flowType)
      )
    ).toBe(false);

    expect(
      result.flows.every((flow) =>
        flow.flowType === "feed"
      )
    ).toBe(true);
  });
});