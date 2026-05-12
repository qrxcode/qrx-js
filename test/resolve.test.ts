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
  it("fetches a page and returns RSS flows", async () => {
    const result = await resolveQRX(
      `${baseUrl}/rss`
    );

    expect(result).toEqual({
      flows: [
        {
          type: "rss",
          url: `${baseUrl}/feed.xml`
        }
      ]
    });
  });

  it("returns multiple flows from one page", async () => {
    const result = await resolveQRX(
      `${baseUrl}/multiple`
    );

    expect(result).toEqual({
      flows: [
        {
          type: "rss",
          url: `${baseUrl}/feed.xml`
        },
        {
          type: "atom",
          url: `${baseUrl}/atom.xml`
        },
        {
          type: "jsonfeed",
          url: `${baseUrl}/feed.json`
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
});