import {
  createServer,
  type IncomingMessage,
  type ServerResponse
} from "node:http";

import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import { resolveQRX } from "../src/resolve";

let server: ReturnType<
  typeof createServer
> | null = null;

function createTestServer(
  handler: (
    req: IncomingMessage,
    res: ServerResponse
  ) => void
): Promise<string> {
  return new Promise((resolve) => {
    server = createServer();

    server.on("request", handler);

    server.listen(0, () => {
      const address = server?.address();

      if (
        address &&
        typeof address === "object"
      ) {
        resolve(
          `http://127.0.0.1:${address.port}`
        );
      }
    });
  });
}

afterEach(() => {
  server?.close();

  server = null;
});

describe("resolveQRX", () => {
  it(
    "returns HTTP Link header flows before HTML flows",
    async () => {
      const baseUrl =
        await createTestServer(
          (_req, res) => {
            res.setHeader(
              "Link",
              '</header-qrx>; rel="qrx"; type="text/html"'
            );

            res.end(`
        <html>
          <head>
            <link
              rel="qrx"
              type="application/qrx+json"
              href="/html-qrx.json">
          </head>
        </html>
      `);
          }
        );

      await expect(
        resolveQRX(baseUrl)
      ).resolves.toEqual({
        flows: [
          {
            flowType: "qrx",
            rel: "qrx",
            href: `${baseUrl}/header-qrx`,
            type: "text/html"
          },
          {
            flowType: "qrx",
            rel: "qrx",
            href: `${baseUrl}/html-qrx.json`,
            type: "application/qrx+json"
          }
        ]
      });
    }
  );

  it(
    "preserves duplicate flows from HTTP header and HTML",
    async () => {
      const baseUrl =
        await createTestServer(
          (_req, res) => {
            res.setHeader(
              "Link",
              '</demo/>; rel="qrx"; type="text/html"'
            );

            res.end(`
        <html>
          <head>
            <link
              rel="qrx"
              type="text/html"
              href="/demo/">
          </head>
        </html>
      `);
          }
        );

      await expect(
        resolveQRX(baseUrl)
      ).resolves.toEqual({
        flows: [
          {
            flowType: "qrx",
            rel: "qrx",
            href: `${baseUrl}/demo/`,
            type: "text/html"
          },
          {
            flowType: "qrx",
            rel: "qrx",
            href: `${baseUrl}/demo/`,
            type: "text/html"
          }
        ]
      });
    }
  );
});