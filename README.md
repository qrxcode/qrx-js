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
- QRX flows

In QRX, a "flow" is a recognized machine-readable relationship
that applications can discover and interact with.

QRX does not replace RSS or existing feed technologies.

QRX helps applications discover and work with them more naturally.

Learn more at https://qrx.dev

## Breaking change in 0.3.0

Version `0.3.0` introduced a breaking cleanup of feed flow classification.

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

## New in 0.4.0

Version `0.4.0` adds a new flow category:

```js
flowType: "qrx"
```

A QRX flow is discovered from an explicit HTML `<link>` declaration:

```html
<link
  rel="qrx"
  type="application/qrx+json"
  href="/qrx.json">
```

QRX flow discovery requires all of these:

* `rel="qrx"`
* `href`
* explicit `type`

For `qrx` flows, `rel` must be exactly `qrx`.

These are valid:

```html
<link rel="qrx" type="application/qrx+json" href="/qrx.json">
<link rel="qrx" type="text/html" href="/demo.html">
<link rel="qrx" type="application/json" href="/manifest.json">
```

These are not valid QRX flow declarations:

```html
<link rel="alternate qrx" type="application/qrx+json" href="/qrx.json">
<link rel="qrx something" type="application/qrx+json" href="/qrx.json">
<link rel="notqrx" type="application/qrx+json" href="/qrx.json">
<link rel="qrx" href="/qrx.json">
```

The `type` value can be any explicit media type, not only
`application/qrx+json`.

The package does not fetch or parse QRX payloads. It only discovers the
declared flow.

Applications decide what to do with discovered QRX flows.

## Install

```bash
npm install @qrxcode/js
```

## Usage

```js
import { resolveQRX } from "@qrxcode/js";

const result = await resolveQRX(
  "https://example.com"
);

console.log(result.flows);
```

## Example output

```js
[
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
  "https://example.com"
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

To select QRX flows:

```js
const qrxFlows = selectFlowsByFlowType(
  result.flows,
  ["qrx"]
);
```

## Supported flow types

* feed
* qrx

## Supported feed formats

* RSS: `application/rss+xml`
* Atom: `application/atom+xml`
* JSON Feed: `application/feed+json`

## Supported discovery methods

Feed flow:

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

QRX flow:

```html
<link
  rel="qrx"
  type="application/qrx+json"
  href="/qrx.json">
```

## Philosophy

QRX does not change QR codes.

QRX discovers recognized flows.

Applications decide what to do with them.

With QRX, sources can expose machine-readable flows,
and applications can understand and interact with them naturally.
