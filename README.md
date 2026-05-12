# QRX flow discovery SDK for JavaScript

Detect RSS, Atom and JSON Feed flows from normal website and page URLs.

With QRX, applications with QR scanners can interact with QR codes
more like browsers interact with links.

QRX works with:

- QR code scanners
- pasted links
- shared URLs
- typed URLs
- browser extensions
- app share sheets
- any workflow that receives a URL

A normal QR code still contains a normal URL.

QRX-compatible applications resolve the URL,
discover machine-readable flows from the HTML `<head>`,
and let the application decide what to do next.

This works especially well with podcast websites,
because many podcast sites already expose one or multiple feeds.

With QRX, podcast subscriptions can become as simple
and natural as following someone on social media.

Examples of flows:

- RSS feeds
- Atom feeds
- JSON feeds

At the moment, "flow" is a broad term used by QRX
to describe machine-readable update streams and feeds.

QRX does not replace RSS or existing feed technologies.

QRX helps applications discover and work with them more naturally.

Learn more at https://qrx.dev

## Install

```bash
npm install @qrxcode/js
```

## Usage

```js
import { resolveQRX } from "@qrxcode/js";

const result = await resolveQRX(
  "https://podnews.net"
);

console.log(result.flows);
```

## Example output

```js
[
  {
    type: "rss",
    url: "https://podnews.net/rss"
  },
  {
    type: "jsonfeed",
    url: "https://podnews.net/feed.json"
  }
]
```

## Supported flow types

* RSS
* Atom
* JSON Feed

## Supported discovery methods

```html
<link
  rel="alternate"
  type="application/rss+xml"
  href="/feed.xml">
```

```html
<link
  rel="alternate"
  type="application/atom+xml"
  href="/atom.xml">
```

```html
<link
  rel="alternate"
  type="application/feed+json"
  href="/feed.json">
```

## Philosophy

QRX does not change QR codes.

With QRX, sources can expose machine-readable flows,
and applications can understand and interact with them naturally.

