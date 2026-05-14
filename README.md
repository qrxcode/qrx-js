# QRX flow discovery SDK for JavaScript

Detect machine-readable flows from normal website and page URLs.

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

In QRX, a "flow" is a recognized machine-readable relationship
that applications can discover and interact with.

QRX does not replace RSS or existing feed technologies.

QRX helps applications discover and work with them more naturally.

Learn more at https://qrx.dev

## Breaking change in 0.2.0

Version `0.2.0` introduces a breaking cleanup of the flow output model.

Before `0.2.0`, flow objects looked like this:

```js
{
  type: "rss",
  url: "https://example.com/feed.xml"
}
````

Starting from `0.2.0`, flow objects look like this:

```js
{
  flowType: "rss",
  rel: "alternate",
  href: "https://example.com/feed.xml",
  type: "application/rss+xml"
}
```

Migration:

* `flow.type` used to mean QRX flow classification.
* QRX flow classification is now `flow.flowType`.
* `flow.type` now means the original HTML/link media type.
* `flow.url` is now `flow.href`.

QRX now separates QRX flow classification from original web metadata.

QRX discovers recognized flows. Applications decide what to do with them.

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
    flowType: "rss",
    rel: "alternate",
    href: "https://podnews.net/rss",
    type: "application/rss+xml"
  },
  {
    flowType: "jsonfeed",
    rel: "alternate",
    href: "https://podnews.net/feed.json",
    type: "application/feed+json"
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
