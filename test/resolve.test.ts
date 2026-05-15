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
      if (req.url === "/feed") {
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

      if (req.url === "/qrx") {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });

        res.end(`
          <html>
            <head>
              <link
                rel="qrx"
                type="application/qrx+json"
                href="/qrx.json">
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
                rel="qrx"
                type="application/qrx+json"
                href="/qrx.json">
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
                rel="qrx"
                type="application/qrx+json"
                href="/qrx.json">

              <link
                rel="qrx"
                type="application/qrx+json"
                href="/qrx.json">
            </head>
          </html>
        `);

        return;
      }

      if (req.url === "/invalid-qrx") {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });

        res.end(`
          <html>
            <head>
              <link
                rel="qrx"
                href="/qrx.json">

              <link
                rel="qrx"
                type="application/qrx+json">

              <link
                rel="alternate qrx"
                type="application/qrx+json"
                href="/qrx.json">

              <link
                rel="qrx something"
                type="application/qrx+json"
                href="/qrx.json">

              <link
                rel="notqrx"
                type="application/qrx+json"
                href="/qrx.json">
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

  it("fetches a page and returns feed flows", async () => {
    const result = await resolveQRX(
      `${baseUrl}/feed`
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

  it("fetches a page and returns qrx flows", async () => {
    const result = await resolveQRX(
      `${baseUrl}/qrx`
    );

    expect(result).toEqual({
      flows: [
        {
          flowType: "qrx",
          rel: "qrx",
          href: `${baseUrl}/qrx.json`,
          type: "application/qrx+json"
        }
      ]
    });
  });

  it("returns feed and qrx flows in discovery order", async () => {
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
          flowType: "qrx",
          rel: "qrx",
          href: `${baseUrl}/qrx.json`,
          type: "application/qrx+json"
        }
      ]
    });
  });

  it("preserves duplicate qrx flows", async () => {
    const result = await resolveQRX(
      `${baseUrl}/duplicates`
    );

    expect(result).toEqual({
      flows: [
        {
          flowType: "qrx",
          rel: "qrx",
          href: `${baseUrl}/qrx.json`,
          type: "application/qrx+json"
        },
        {
          flowType: "qrx",
          rel: "qrx",
          href: `${baseUrl}/qrx.json`,
          type: "application/qrx+json"
        }
      ]
    });
  });

  it("ignores invalid qrx declarations", async () => {
    const result = await resolveQRX(
      `${baseUrl}/invalid-qrx`
    );

    expect(result).toEqual({
      flows: []
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

  it("returns top-level flows array", async () => {
    const result = await resolveQRX(
      `${baseUrl}/feed`
    );

    expect(result).toHaveProperty("flows");
    expect(Array.isArray(result.flows)).toBe(true);
  });
});