# Zoetel

Frontend for a cloud telephony platform — buy and manage phone numbers, run SIP trunks,
handle telecom compliance, and watch usage and spend. Built Egypt-first (NTRA rules, EGP,
Cairo/Alexandria ranges) with the country model, rate tables and compliance copy already
parameterised for expansion.

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
npm run build        # typecheck + production bundle
npm run typecheck    # tsc only
npm run lint         # oxlint
npm run format       # prettier
```

A first-time visitor lands on `/welcome` (the onboarding flow). Skipping or completing it
drops you into the dashboard with a seeded workspace. **Settings → Workspace → Reset
workspace data** restores the sample data at any time.

---

## What's in here

| Area | Route | Notes |
| --- | --- | --- |
| Onboarding | `/welcome` | 8 steps: welcome → account type → profile → workspace → use case → KYC → funding → success |
| Overview | `/` | Wallet, live calls, spend/usage trends, setup checklist, activity |
| Number marketplace | `/numbers/buy` | Instant search over generated inventory, favourites, multi-select |
| Checkout | `/numbers/checkout` | Cost breakdown, wallet impact, animated provisioning, success state |
| Guided setup | `/numbers/:id/setup` | Post-purchase flow — one question per screen: routing → caller ID → address |
| Number management | `/numbers`, `/numbers/:id` | A configuration checklist; each item opens on its own |
| SIP trunking | `/sip`, `/sip/:id` | Credential/IP/FQDN auth, codecs, failover, health, assigned numbers |
| Usage | `/analytics` | Minutes, spend, call/message logs, quality (MOS, ASR, ACD, PDD) |
| Billing | `/billing` | Wallet, auto-recharge, spend limit, transactions, invoices, payment methods |
| Pricing | `/pricing` | Pay-as-you-go vs volume, tier calculator, rate table |
| Developers | `/developers`, `/developers/webhooks`, `/developers/logs` | Keys, event endpoints, request inspector |
| Compliance | `/verification` | Individual and business KYC with drag-drop upload, OCR preview, review timeline |
| Team | `/team` | Members, roles, security policy, sessions, audit log |
| Settings | `/settings` | Workspace, profile, appearance, notification matrix |

---

## Stack

React 19 · TypeScript · Vite · TailwindCSS 3 · Framer Motion · Radix UI primitives ·
TanStack Query · React Router · React Hook Form + Zod · Zustand · cmdk · Sonner · Lucide ·
Geist + Inter

Charts are hand-built SVG (`src/components/charts`) rather than a charting library — it
keeps the visual language consistent with the rest of the system and the bundle small.

---

## Architecture

```
src/
  components/
    canvas/      composition primitives — hero, section, config list,
                 journey rail, next-step spotlight, attention list
    ui/          design-system primitives (button, table, dialog, inputs, …)
    layout/      app shell, floating rail, mobile dock, utilities,
                 command palette, notifications
    shared/      composed pieces (wallet, capability pills)
    charts/      area, bar, sparkline, donut
  features/      one folder per product area, each owning its page(s)
  lib/
    journey.ts   where the customer stands, and what they should do next
    data/        countries, inventory generator, seeded fixtures
    format.ts    money, phone, duration, relative-time formatting
    types.ts     the domain model
  store/app.ts   persisted app state — the mock backend
  hooks/
```

Feature folders never import from each other except through `components/` and `lib/`, so a
page can be lifted out or replaced without touching the rest.

### The data layer

There is no server. `store/app.ts` is a Zustand store persisted to `localStorage` that acts
as the backend: purchases debit the wallet, create transactions, push notifications and
activity entries; SIP connections provision asynchronously; KYC uploads move documents
through a real state machine. Mutations are the same shape a real API client would expose,
so swapping in `fetch` is a store-level change.

Marketplace inventory is generated deterministically (`lib/data/numbers.ts`) from a seeded
PRNG keyed on the search query, so the same search always returns the same numbers — and
prices/capabilities follow the real numbering rules for each country (Egyptian mobile
prefixes 10/11/12/15, Cairo area code 2, `0800` toll-free, and so on). Marketplace search
runs through TanStack Query to get genuine loading, refetch and error states.

All usage figures come from one shared 90-day series (`usageSeries`, `monthToDate`), so
"spend this month" reads identically on the dashboard, the billing page and the upgrade
banner.

---

## Design language

The interface is built from typography, space and composition. Cards are the
exception, not the default.

### Composition

Three primitives carry every page:

- **`Hero`** (`components/canvas/hero.tsx`) — the atmospheric band that opens each
  major page. By default a blurred CSS mesh bleeds past the content column and
  dissolves downward through a mask, so a page never begins with a hard rectangle.
  Each section carries its own `mood`, which shifts the secondary hues while the
  brand violet anchors all of them, so the product still reads as one thing. The
  phone-number surfaces instead pass `backdropImage`, which top-anchors real
  artwork — see below.
- **`Section`** — a page section separated by type, space and at most a hairline.
  There is no box. This is the default container.
- **`ConfigTabs`** — settings as tabs with the form already on screen. The rail
  carries the state a checklist would (what's set, what still needs attention) so
  nothing is lost by having the first section open, and anything `required` is the
  section that opens first. `layout="stacked"` swaps the vertical rail for a
  horizontal tab strip, for narrow columns. That strip is deliberately underlined
  rather than pills: pills carrying a state tick read as status badges, not
  navigation, so it uses the one shape that is unmistakably a tab — a shared
  baseline with the active underline sliding along it — and demotes state to a
  small dot beside the label.
- **`FlowDialog`** — a multi-step flow in a sheet at 90% of the viewport, so the
  page stays visible at the edges and the flow reads as something you stepped
  into rather than navigated to. It owns the chrome (stepper, close, footer) and
  slides steps horizontally in the direction of travel; the caller owns the step
  state so a step can validate before it lets go.
- **`SidePanel`** — a detached slide-over in the nav rail's physical language:
  inset from the window edges, own rounded shell, own shadow. Deliberately not
  modal — no scrim, no focus trap — so the list behind it stays readable and
  clickable and you can walk down a set of records without closing anything.
  Sized past half the viewport (`--panel-w`, `clamp(34rem, 56vw, 72rem)`) because
  it holds real forms, with the shell wide and the reading measure inside it
  capped. Because it's anchored to the viewport while the page column is capped
  and centred, opening one drops that cap (`[data-side-panel='open']`) — otherwise
  the column's right gutter eats the room the list needs and the rows crush. The
  list's secondary columns stand down while a panel is open: beside it, the list
  is an index, not a report.

Content sits directly on the canvas. Where grouping genuinely helps, a
translucent `.veil` does it without a border. Genuine elevation is reserved for
things that are transient (drawers, modals), floating (the nav rail, the
selection bar) or transactional (the wallet, the order summary).

### Hero artwork

The phone-number surfaces open with a telecom banner (`public/phone-numbers.webp`)
rather than the gradient. A few decisions worth knowing:

- The band is sized from the hero's own height (`100% + 9rem`), so a taller hero
  simply reveals more of the artwork and the content below always stays clean.
- It spans the viewport rather than the content column, otherwise the mast and
  skyline on the right fall off-screen.
- `mix-blend-multiply` at 60% keeps the artwork's own pale plate from showing as
  a panel; dark mode screens it at 20% instead so the line work still reads.
- If the file is ever missing, the hero falls back to the gradient rather than
  leaving a gap.
- The 1.1 MB source PNG lives in `design/` and is **not** deployed. The served
  WebP is 16 KB and pixel-for-pixel equivalent at this blend and opacity —
  alpha range and per-band luminance both match the original.

To swap the artwork, replace `public/phone-numbers.webp` and keep the source in
`design/`. `HERO_ART` in `hero.tsx` is the single reference.

### Colour

Every colour is a CSS custom property in `src/index.css`, defined once for light
and redefined for `[data-theme="dark"]`. Dark mode is a palette swap, not a
second design.

- **Neutrals carry the interface.** `--canvas`, `--surface`, `--veil`, hairline
  `--line-soft`, and a four-step text ramp: `--ink` → `--ink-muted` →
  `--ink-subtle` → `--ink-faint`.
- **One accent** (`--brand`, an indigo-violet) marks the primary action and the
  current location. Nothing decorative uses it.
- **Semantics are reserved for meaning**: green success, blue information, amber
  pending, red error — each with a `-soft` background and an `-ink` foreground.
- **`--onyx`** is a deep surface that stays dark in both themes, so the wallet,
  the selection bar and the onboarding rail read as deliberate dark objects
  rather than inverting into white cards.
- **`--hero-1/2/3`** drive the hero atmosphere per section.

Every text level clears WCAG AA (≥4.5:1) against the canvas in both themes,
including the 11px `.eyebrow` — verified by measuring computed colours in the
browser rather than by eye.

### Type

Two faces, each with a job:

- **Geist** (`.headline`, `.display`) for headlines and hero-scale numerals, set at
  600 with −0.028em tracking. It is geometric and squared-off, so headlines read
  engineered rather than decorative — the register this product wants.
- **Inter Variable** for everything else, on an 8pt spacing grid. It is still the
  better face for dense UI text at 12–15px.

Metrics, money, phone numbers and table figures use tabular numerals (`.tnum` /
`.display`) so digits don't shift while values animate. `.eyebrow` — small,
uppercase, tracked — replaces most card headers.

### Navigation

Chrome and navigation are kept strictly apart:

- The **floating rail** is navigation and nothing else — a mark, grouped
  destinations, and the wallet. No create button, no workspace switcher competing
  with the destinations. Active state is a 3px accent on the rail's edge rather
  than a filled tile. It expands *over* the canvas on hover or when pinned, so
  opening the nav costs nothing in layout.
- The **floating chrome** (top right) holds everything global: a **New** menu for
  create actions, search, the live/test switch, notifications and the account menu
  — which is also where workspace context lives.
- **Contextual** navigation lives in each page's hero as quiet chips. There is no
  top bar, because a horizontal rule across the page would fight the hero's fade.

Rail badges come from the same journey engine that drives the dashboard, so the nav
tells you where a problem is before you go looking. On phones the rail is replaced
by a thumb-reachable floating dock with an overflow sheet.

### Motion

Framer Motion throughout, with rules:

- Motion shows **where something came from** — page transitions, drawer and modal
  springs, staggered entry, the rail's shared-layout active pill, the rail's width.
- Motion shows **change** — animated counters, progress fills, chart path draws,
  the provisioning sequence, success springs.
- Nothing animates purely for decoration, and durations sit between 120 and 450ms.
- `<MotionConfig reducedMotion="user">` wraps the app, so every JS-driven animation
  honours the OS setting — a CSS media query alone cannot do that.

Modals and the command palette are centred by a grid wrapper rather than CSS
transforms, because Framer's inline `transform` would otherwise fight
`-translate-x-1/2` and leave the panel off-centre mid-animation.

---

## Designed around progress, not features

`src/lib/journey.ts` derives, from state we already hold, where the customer
actually stands:

```
Account → Identity → Wallet → Number → Routing → Go live → Monitor → Optimise
```

It returns the stages, a prioritised `attention` list, and a single `spotlight` —
whatever deserves the top of the page right now. A blocking problem always
outranks the next setup step, which outranks an optimisation nudge.

Every surface asks the same question through that one hook:

- The **overview** leads with the spotlight, then the attention list, then service
  health. It is a product guide, not a reporting dashboard — charts and logs live
  on their own pages so this one stays about decisions.
### The rail

Onyx, not the translucent chrome the rest of the furniture uses. The rail is the
one piece of permanent structure on screen, and a solid dark plane says that
better than another pane of frosted glass — it also gives the light canvas
something to sit against.

The icons are **genuinely filled** — Phosphor at `weight="fill"`, not lucide.
Lucide is a stroke-only set, so filling its paths works for Phone or Users but
turns the line glyphs (usage, webhooks, request logs) into blobs; Phosphor ships a
solid weight for all of them. Navigation is the only place that uses Phosphor —
everything else in the product stays lucide, where an outline is correct.

Icons are 22px inside 40px tiles, and the active tile is solid brand (animated
between the collapsed and expanded rails with `layoutId`). The rail is 76px
collapsed / 264px expanded. `ChartBar` rather than `ChartLineUp` for usage: filled,
the latter is a framed square and reads as an image icon at 20px.

Cost: ~45 kB raw / 12 kB gzipped for the thirteen glyphs. Deep per-icon imports
build to exactly the same size as the barrel, so the barrel stays for
readability — the weight is the path data, not the module graph.

Sizing is bounded by a real constraint: all twelve destinations plus three group
labels have to fit a ~900px window without Settings falling off the bottom. A
44px tile overflowed by 49px; 40px with tighter group rhythm fits exactly.

- The **rail** badges the section a problem lives in.
- The **rail footer** shows setup progress until setup is done, then gets out of
  the way.

### Glass

Every page is carded, and the treatment lives in `Section` rather than being
repeated across sixteen feature files — all 77 sections in the product inherit it
from one edit. `card={false}` opts out for the rare section that is an inline
sub-group, since glass nested in glass reads as a mistake, and `divided` is ignored
on a card because the card's own edge does the separating. Section spacing dropped
from 56px to 20px: cards need a tighter rhythm than borderless blocks did.

One catch worth recording: the numbers and SIP lists yield room to the slide-over
with `lg:pr-[--panel-w]`. On a card that padding has to sit on a *wrapper* — inside
it, the card stretches under the panel and only its contents move.

Two weights, both with a bright inner hairline for the lit top edge and a soft
cast shadow:

- **`.glass`** — cards. 42% surface at 30px blur, translucent enough that the hero
  art reads through it.
- **`.glass-panel`** — sheets and popups: the slide-over, modals, drawers, the
  verification flow. 74% at 34px blur. Deliberately a step more opaque than a card,
  because these hold forms and already float over a blurred scrim; past that point
  transparency costs legibility for nothing.

`.chrome` (the floating top cluster, mobile dock, identity pill) went to 72% at
30px to match. Glass needs something behind it to read as glass rather than a
tinted card, which is why the overview's cards are pulled up to overlap the harbour
artwork's fade. (An earlier, unused `.glass` sat in the utilities layer and would
have won on source order; it's gone.)

Pushing the cards this far had a cost worth recording: at 42% over the saturated
phone-numbers artwork, `--ink-subtle` and `--ink-faint` measured 4.25:1 and 4.05:1
— under AA. Rather than pull the glass back, both were darkened three points of
lightness (44%→41%, 46%→42%), which clears AA on the worst-case backdrop (4.80 and
4.64) and still reads as secondary text everywhere else.

### The page has no flat colour

`body` carries three very wide, very pale radial washes — violet from the top
left, cooler blue from the top right, a faint lift from the bottom — over
`--canvas`, `background-attachment: fixed` so they don't slide while you scroll.
Wide enough that no edge or band is ever visible. The glass cards need something
to sit on; a flat fill gave them nothing to be translucent *against*.

### Which artwork goes where

Four images cover every section, grouped by what the section is *about* rather
than one image per route — a bespoke piece per page would dilute all of them:

| art | sections |
| --- | --- |
| **overview** (harbour) | Overview, Verification, Team, Settings |
| **phone-numbers** (holographic) | Phone numbers only |
| **sip** (tower) | SIP, API keys, Webhooks, Request logs |
| **usage** (satellite) | Usage, Billing, Pricing |

The holographic gradient stays exclusive to the number surfaces: it is the loudest
of the four and reads as their identity. Inner flows — buying, checkout, a single
number or trunk, guided setup — stay on the gradient mesh, because the artwork
marks *arriving* at a section rather than working inside one.

### Hero artwork fade

`.hero-fade` is an eleven-stop approximation of an ease-out curve, not a two-stop
linear ramp. A straight alpha ramp has a detectable start, and on strongly coloured
art that start reads as an edge. The stops are in CSS rather than a Tailwind
arbitrary value simply because the gradient is too long to stay readable inline.

The curve also needs vertical room to be imperceptible: the artwork's tail went
from `+9rem` to `+20rem` past the hero. At 9rem the whole fade completed inside
~140px and still looked like a boundary. What runs past the hero is nearly
transparent anyway, and it gives the first glass card something to sit against.

### Hero artwork intensity

`backdropOpacity` exists because the artwork isn't tonally uniform. The harbour,
tower and satellite illustrations are pale line work and want ~0.6. The holographic
phone-numbers gradient is the opposite problem: it is *mostly near-white*, so
`mix-blend-multiply` barely darkens anything and it needs 0.85 before it reads at
all in light mode — measured at 12.3:1 contrast under the title, so the extra
intensity costs nothing in legibility. The
value feeds a `--hero-img` custom property and dark mode takes `calc(var * 0.36)`,
preserving the 0.2/0.6 ratio the pale art was tuned at — so one number per hero
covers both themes.

### The rail's expanded state

A *pinned* rail pushes the content column across rather than covering it — an
expanded rail that overlays hides the first column of every table behind it.
Hover-expand still overlays, because pushing the whole page on hover would jitter.
That means `navPinned` lives in the store rather than in the rail's local state:
the shell and the marketplace's fixed selection bar both have to yield to it.

### The overview is a hub

Not a report, not a wall of cards. It does three things: welcomes you, shows what
is still outstanding, and gives the headline numbers — all on one continuous
surface under the harbour artwork, so it reads as a place you pass *through* on
the way somewhere rather than a set of separate objects.

- **Welcome.** The greeting is back, at `size="lg"`, over `/overview.webp`
  top-anchored and fading down (same treatment as the phone-number, SIP and usage
  heroes). One line beneath it counts what is waiting on you.
- **What's left** — the hub's reason to exist. A numbered run of the *pending*
  journey steps, with the outstanding problems continuing the same run, because a
  problem is also just something to do. Only the first row gets the filled marker
  and a solid button; that is enough to say "start here" without a banner.
  Rows sit directly on the canvas, divided by hairlines, so the sequence reads as
  one path.
- **Where things stand** — five inline figures on hairline dividers. No
  containers; the wallet keeps its "Add funds" action inline.
- **A quiet tail** — what changed, and a short list of ways onward.

Earlier attempts here were a metrics grid and a bento of cards. Both gave the
page the wrong job: they described the account instead of moving you through it.

### No cards in the header

`Hero`'s `aside` slot is gone from every page. A fixed-width card in the header
sat in a `justify-between` row with the title, which left a large hole beside the
headline and broke the layout at in-between widths — the taller the card, the worse
the hole. Those figures now live in the page body, in the same hairline-divided
glass row the rest of the product uses:

- **Webhooks** — deliveries and the 2xx/4xx/5xx split as a four-up row.
- **API keys** — the 7-day request count with its sparkline beside it.
- **Team** — active, invited and 2FA coverage as a three-up row.
- **Billing** — the wallet keeps its elevation but drops into the body beside the
  three spend figures, rather than floating in the header.

The header is now only ever eyebrow, title, lede and actions.

### One label per section

Every section had an eyebrow, a title *and* a lede — three labels doing one
label's job, which is what made the overview read as a wall of prose. Sections
now carry a single heading, and the dashboard dropped its "Going deeper" block
entirely: a paragraph plus two buttons restating links the sections above already
carried.

The wallet is the one deliberately elevated object in the product, and it stays
short on purpose: a label row, the figure, one meter answering "how long have I
got", and two actions. It previously stacked two meta lines beside a 14-day
sparkline, which made the card tall, left dead space under the actions, and
rendered the spend history as an unreadable scribble.

The journey trail fills to the first *incomplete* stage rather than the last
complete one. Stages finish out of order — you can fund a wallet before verifying
— and filling to the last tick painted a 100% trail with an unfinished step
sitting inside it.

### Identity documents

Individual verification asks for a passport and a national ID. There is no selfie
or liveness step anywhere in the product — the regulator's requirement is a
document check, and asking someone to photograph their face next to their ID is a
friction and a privacy cost that requirement doesn't justify.

### Status first, forms on demand

`/verification` answers one question — *where do I stand* — with one icon, one
headline, one subtitle and one button. The four stages (not started, in review,
rejected, approved) each supply their own version of those four things, so the
page never shows a form to someone who has nothing to fill in. The actual work
happens in a `FlowDialog`: entity type, then documents, then review and submit.

### Carrier marks

Numbers are resold, so the underlying carrier is a property of the range
(`PhoneNumber.carrier`), not of the workspace. `CarrierAvatar` renders it as a
circular mark with no plate behind it — the logos carry their own colour, and a
tinted disc under them would fight the glass surfaces they sit on. It appears
wherever a number does: the list, the settings panel, the detail hero and its
Carrier fact, marketplace results, and the checkout line items.

The files are local, not hot-linked. Vodafone's CDN returns an HTML bot wall for
direct requests, and a logo that 404s leaves a hole in every row. WE ships as a
square SVG; Vodafone's official file is the full wordmark, so its viewBox is
cropped to the leading speechmark; Etisalat is a 400px raster re-encoded to WebP
(25 KB → 18 KB). The component still falls back to initials if an image fails, and
renders nothing at all for a missing carrier — a persisted store can predate the
field, which is also why the persist version was bumped to force a reseed.

### Zoie — infrastructure leading to intelligence

Zoetel is the infrastructure; [Zoie](src/lib/zoie.ts) is the intelligence layer on
a separate domain. It is never presented here as a banner, a popup, a marketplace
app or a promotional card, and the product never asks "do you want to use Zoie?".
It asks *how should this number work* — and Zoie is one of the answers, rendered
as a peer of SIP, webhooks and forwarding with no badge or accent the others
don't get.

- **`DestinationPicker`** is that question, reused wherever a channel needs an
  owner. The four real answers are an AI agent (Zoie), your own PBX over SIP,
  your application over a webhook, and plain forwarding to another number;
  `isRouted()` in `lib/types.ts` is the single predicate for "this number has
  somewhere to send a call", so all four count as routed everywhere it's asked.
  Saving a destination clears the others, so a number can never claim two.
  Used on the number's Routing tab, the guided setup's first step, the
  post-purchase success screen, and the SIP page's empty state: an unrouted number's routing tab, the post-purchase success screen, and
  the SIP page's empty state (which asks how you want to receive calls *before*
  handing anyone a trunk form).
- **`ZoieHandoff`** is what picking the AI destination reveals. Choosing an
  option shouldn't fling a tab open at you, so selection surfaces a panel that
  says plainly what is about to happen and what is already carried over, and
  leaves the crossing to a deliberate "Continue in Zoie". It only ever appears
  *after* the customer chose that destination, which is what keeps it a handoff
  rather than an advert.
- **`zoieUrl` / `openZoie`** deep-link into the specific screen the customer was
  already heading for — `us.zoie.ai/agents/voice/new`, never Zoie's homepage — in
  a new tab, because the infrastructure work here isn't finished; they're stepping
  sideways in the same job.
- **`useZoieContext`** carries what we already know so nothing is typed twice:
  workspace, business, country, timezone, currency, plan, language, customer,
  account type, verification status, owned numbers, channels, plus the specific
  number in focus. Deliberately no credentials, balance or documents. In
  production this would be a signed single-use handover token; the payload is the
  same either way.
- The **journey** gains an `agent` stage after go-live, so the dashboard's
  progress rail reads Account → Identity → Wallet → Number → Routing → Go live →
  **Add intelligence** → Monitor. It survives past `setupComplete` while that step
  is open, and settles once `zoieHandoffAt` is recorded — we can't see whether an
  agent was built over there, but we can stop re-asking someone who has crossed.

### Progressive configuration

Nothing asks for a decision before it is needed.

- Buying a number is *only* buying: country, digits, type. Region, city and
  capability filters stay folded behind **Refine**.
- After checkout, `/numbers/:id/setup` asks three questions on three screens —
  routing, then caller ID, then emergency address — in the order that actually
  matters. Caller ID shows a live preview of what the recipient will see.
- Clicking a row in **Phone numbers** or **SIP connections** opens that record's
  settings in a `SidePanel` rather than navigating away: the list stays on the
  left, yields horizontal room to the panel, and highlights the open row. Escape
  or the close button dismisses it; pointer-down outside is ignored, because
  "outside" is usually the next row you want to open. The open record lives in the
  URL (`?n=` / `?c=`), so a panel is linkable and Back closes it.
- **Forwarding is its own tab on every number**, not just a routing choice. As a
  destination ("Another phone number") it replaces your routing; as a setting it
  can also sit *behind* a trunk, webhook or AI agent — forward only when nobody
  answers, or only when the destination is unreachable. That's why it isn't
  folded into Routing: a safety net and a primary destination are different
  things. `forwardWhen` carries the distinction, and `isRouted()` only counts
  forwarding as a primary destination when it's set to `'always'`, so adding a
  fallback never makes an unrouted number look routed.
- Within a panel or a detail page, settings are `ConfigTabs` — pick a heading and
  its form is already there. No row-to-drawer round trip, and no wall of forms
  either. Each section saves independently; toggles that are safe to flip apply
  immediately and draw no Save button at all.

---

## Accessibility

- Full keyboard operation; Radix primitives handle focus trapping and roving focus.
- One consistent focus treatment (`:focus-visible`) across every interactive element.
- `⌘K` command palette, `B` to buy a number, `Esc` to dismiss any overlay.
- ARIA labels on icon-only controls, `role="alert"` on error states, labelled form fields
  with programmatically associated descriptions and errors.
- Charts carry `role="img"` and a text label describing what they plot.
- Contrast verified at AA or better for all text, in both themes.

---

## Responsive strategy

Desktop-first, but layouts degrade deliberately rather than scrolling sideways.
Each table column declares the breakpoint below which it disappears
(`hideBelow`), and the columns that matter most fold into the primary cell — on a
phone, a number row shows the number, its label and its status stacked, with the
actions menu still reachable. The hero bleed is clipped with `overflow-x-clip`
rather than `hidden`, so atmosphere can escape the content column without
creating a scroll container that would break sticky chrome. Verified at 375, 768,
1280 and 1440 by an automated sweep that asserts no page or table overflows
horizontally.

## States

Every surface ships its full set: loading (skeletons shaped like the content,
never a bare spinner), empty (explains what the thing is and why you'd want one),
error (cause, recovery action, retry), warning, success, and permission-gated.
Empty states are editorial and educational — "Nothing here yet — and that's the
fun part" for numbers, and an explanation of what SIP actually is before asking
you to create a connection.

---

## Notes for reviewers

- Compliance copy is specific on purpose: telecom regulators hold the licensed carrier
  responsible for who uses a number, which is why KYC gates certain ranges. The UI explains
  this at the moment it becomes relevant instead of burying it in a help centre.
- Regulated ranges are labelled in the marketplace, so nothing is a surprise at checkout,
  and held numbers aren't billed until they activate.
- `Simulate approval` on the verification page (visible while a submission is in review) is
  a demo affordance for walking through the approved state without a backend.
