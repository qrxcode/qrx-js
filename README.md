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

- Feed flows

In QRX, a "flow" is a recognized machine-readable relationship
that applications can discover and interact with.

QRX does not replace RSS or existing feed technologies.

QRX helps applications discover and work with them more naturally.

Learn more at https://qrx.dev

## Breaking change in 0.3.0

Version `0.3.0` introduces a breaking cleanup of feed flow classification.

Before `0.3.0`, RSS, Atom, and JSON Feed were represented as separate
QRX flow types:

```js
{
  flowType: "rss",
  rel: "alternate",
  href: "https://example.com/feed.xml",
  type: "application/rss+xml"
}
````

Starting from `0.3.0`, RSS, Atom, and JSON Feed are represented as the same
QRX flow category:

```js
{
  flowType: "feed",
  rel: "alternate",
  href: "https://example.com/feed.xml",
  type: "application/rss+xml"
}
```

The actual feed format remains in the original HTML/link media type:

```js
type: "application/rss+xml"
type: "application/atom+xml"
type: "application/feed+json"
```

Core formula:

```txt
flowType = QRX category
type = original web/media format
```

Migration:

* `flow.flowType === "rss"` is now `flow.flowType === "feed" && flow.type === "application/rss+xml"`.
* `flow.flowType === "atom"` is now `flow.flowType === "feed" && flow.type === "application/atom+xml"`.
* `flow.flowType === "jsonfeed"` is now `flow.flowType === "feed" && flow.type === "application/feed+json"`.

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
    flowType: "feed",
    rel: "alternate",
    href: "https://podnews.net/rss",
    type: "application/rss+xml"
  },
  {
    flowType: "feed",
    rel: "alternate",
    href: "https://podnews.net/feed.json",
    type: "application/feed+json"
  }
]
```

## Selecting flows

To select all feed flows:

```js
import {
  resolveQRX,
  selectFlowsByFlowType
} from "@qrxcode/js";

const result = await resolveQRX(
  "https://podnews.net"
);

const feeds = selectFlowsByFlowType(
  result.flows,
  ["feed"]
);
```

This returns RSS, Atom, and JSON Feed flows together.

To select only RSS feeds, filter by the original media type:

```js
const rssFeeds = result.flows.filter(
  (discoveredFlow) =>
    discoveredFlow.flowType === "feed" &&
    discoveredFlow.type === "application/rss+xml"
);
```

To select only Atom feeds:

```js
const atomFeeds = result.flows.filter(
  (discoveredFlow) =>
    discoveredFlow.flowType === "feed" &&
    discoveredFlow.type === "application/atom+xml"
);
```

To select only JSON Feed feeds:

```js
const jsonFeeds = result.flows.filter(
  (discoveredFlow) =>
    discoveredFlow.flowType === "feed" &&
    discoveredFlow.type === "application/feed+json"
);
```

## Supported flow types

* feed

## Supported feed formats

* RSS: `application/rss+xml`
* Atom: `application/atom+xml`
* JSON Feed: `application/feed+json`

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

QRX discovers recognized flows.

Applications decide what to do with them.

With QRX, sources can expose machine-readable flows,
and applications can understand and interact with them naturally.
