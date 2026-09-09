---
name: walaplus-frontend
description: Use before writing or reviewing ANY code in a WalaPlus/walaone React frontend — adding a page, a hook, an API call, a store, a form, a table, a chart or a test; choosing a package; or reviewing a diff for clean code and performance. Carries the layered architecture, the data flow, what each dependency is actually for, the toolchain constraints that fail the build, and the performance decisions that were measured rather than assumed. Pair it with `walaone-design`, which covers how the result should look.
---

# WalaPlus frontend engineering

How a WalaPlus React admin is built: the layers, the flow through them, the
packages, and the rules that keep it from rotting. **`walaone-design` is the
other half** — it covers what a screen should look like and why. This one covers
what the code should look like.

Reference implementation: `apps/portal` in `walaone-platform`, with its own
`CLAUDE.md` and `docs/ARCHITECTURE.md`. When a rule here and that code disagree,
the code is wrong — say so.

---

## 0. Before anything else

- **Read the project's own `CLAUDE.md` first.** These are house standards, not a
  licence to ignore a project's stated conventions.
- **Say _why_, not _what_, in a comment.** The code already says what. Every
  comment worth keeping in this codebase names the failure it prevents — that is
  what makes it survive a refactor.
- **Never weaken a test to reach green.** If a change breaks one, work out which
  of the two is wrong and say so.

---

## 1. The stack, and what each package is actually for

React 19 · TypeScript 6 · Vite 8 (rolldown) · Tailwind v4 · Vitest 4.

| Concern      | Package                                 | Why this one                                                                                                                                                       |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Server cache | `@tanstack/react-query`                 | Owns loading/error/stale state, so no component invents an `isLoading` boolean                                                                                     |
| Client state | `zustand`                               | Selector subscriptions re-render only on the slice that changed, and `getState()` works **outside React** — which route guards and the axios interceptor both need |
| Routing      | `@tanstack/react-router`                | The `Register` declaration gives `Link`/`useNavigate` full inference over the real route tree, so a typo'd path is a compile error                                 |
| Tables       | `@tanstack/react-table`                 | Headless, used in `manual` mode: the server pages and sorts, the table only renders                                                                                |
| HTTP         | `axios`                                 | Interceptors are the reason it is here rather than `fetch` — bearer injection, envelope unwrapping and single-flight refresh in one place                          |
| Forms        | `react-hook-form`                       | Uncontrolled-first, so typing does not re-render the page                                                                                                          |
| Schemas      | `zod` v4                                | Also the source of the TS types via `z.infer`, so the runtime check and the compile-time type cannot disagree                                                      |
| Primitives   | `radix-ui` + shadcn                     | Focus traps, roving tabindex and ARIA wiring already correct; shadcn wrappers are **vendored** into `components/ui/` so they can be edited rather than overridden  |
| Styling      | `tailwindcss` v4 + `cva` + `cn()`       | Configured in CSS (`@theme`), typed style variants, and `tailwind-merge` so a later utility wins instead of both landing in `class`                                |
| Toasts       | `sonner`                                | Wrapped by `showToast` so call sites pass i18n keys, not prose                                                                                                     |
| i18n         | `i18next` / `react-i18next`             | Namespaces + interpolation; resources bundled, not fetched                                                                                                         |
| Mocking      | `msw`                                   | Intercepts at the **network** layer, so the real axios instance, interceptors, refresh flow and schema validation all stay in the path — the mock is not a bypass  |
| Rich text    | `@tiptap/react` + `@tiptap/starter-kit` | The house rich-text field. Schema-based, so the document model is a value you can re-use — see §7                                                                  |
| Lint         | `oxlint`                                | Rust-based, replaces ESLint; `import/no-cycle` is on and fails the build                                                                                           |

**Audit the declared-but-unused before assuming a dependency is load-bearing.**
The portal ships `next-themes` and `i18next-browser-languagedetector` that
nothing reads — theme comes from `themeStore`, language from `languageStore`.

---

## 2. Four layers, and the one boundary that matters

| Layer           | Lives in                            | Knows about                | Never does                    |
| --------------- | ----------------------------------- | -------------------------- | ----------------------------- |
| **View**        | `pages/*/index.tsx`, `_components/` | Hooks, components          | Fetch, cache, business logic  |
| **Hook**        | `pages/*/_hooks/`, `hooks/`         | Query keys, data functions | Touch axios, hold server data |
| **Data access** | `pages/*/_apis/`, `apis/`           | HTTP, models               | Import React                  |
| **Transport**   | `config/axios.ts`                   | Tokens, envelopes, errors  | Know about any page           |

**The third boundary is the trust boundary.** `_apis/` is the only place that
knows a network exists, and every response is parsed against a zod schema there
— so nothing unvalidated reaches a hook, a cache or a component.

### The read path

```
routes.tsx              beforeLoad: requireAuth · loader: prefetch (not awaited)
  └─ pages/x/index.tsx  thin: composes, no business logic
       └─ _components   useServerTable() → params (from the URL)
            └─ _hooks   useQuery({ queryKey: QUERY_KEYS.x.list(params), queryFn })
                 └─ _apis   getX(params) → unwrap(response, xPageSchema)   ← validated
                      └─ config/axios   bearer + language header + cookie
                                        401 → single-flight refresh → retry
                                        else → normalise into ApiError
```

### The write path

```
submit → zodResolver(schema)      messages are i18n KEYS, never English
  └─ _hooks/useCreateX            useMutation({ mutationFn: createX })
       └─ _apis/x.api             createX(payload) → X
  onSuccess: queryClient.invalidateQueries({ queryKey: QUERY_KEYS.x.all() })
             showToast.success('x:created')
```

**Mutations invalidate; they never patch the cache.** Keys are hierarchical, so
invalidating `all()` covers every list and detail beneath it. Hand-patching a
cache entry is how a list and a detail view drift apart.

---

## 3. Three kinds of state, never mixed

| Kind             | Home                                          | Rule                                                                                                                                        |
| ---------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Server data**  | TanStack Query cache                          | Only `_hooks/` put it there. **Never copy it into a store** — the copy is stale the moment the cache refetches                              |
| **List state**   | The **URL** (`validateSearch` + a zod schema) | Page, size, sort, search and every filter. This is what makes a filtered view survive a reload, work with Back, and paste into Slack intact |
| **Client state** | zustand                                       | App-wide in `stores/`; page-scoped in `_stores/` for genuinely transient UI. Wrap in `persist` only when it should survive a reload         |

- **A page-scoped store must never hold server data or list filters.** If a
  `_stores/` folder is empty, that is the rule working, not a leftover.
- **Anything persisted outlives the code that wrote it.** A session stored by an
  older build rehydrates into a newer one — so adding a field to a persisted
  shape means bumping a store version and extending its migration, and optional
  capabilities migrate to _off_. Read a persisted nested field with `?.`: an
  unguarded `user.capabilities.x` on an old session is a render crash.
- **Name the owners of `<html>` and let nothing else write to it.** In the
  portal: theme (the `.dark` class), language (`lang`/`dir`), brand (the two
  colour custom properties).

---

## 4. Response contracts

- **`unwrap` takes a schema and it is not optional**:
  `unwrap(await api.get(...), usersPageSchema)`.
- **Types come from the schema**, never hand-written:
  `type User = z.infer<typeof userSchema>`. Adding a field means editing one
  schema and the type follows.
- A response that fails becomes an `ApiError` with a `RESPONSE_CONTRACT` code and
  renders through the normal error paths.
- **Cross-cutting schemas live in one file** — `paginatedSchema(item)`,
  `tableSearchSchema`, `paginationParamsSchema`. A page's schema _extends_ those
  rather than restating them.
- **A mock must honour the contract too.** Returning a bare `[]` where the
  endpoint promises `{ items, page, pageSize, totalItems, totalPages }` is not an
  empty list — it is a validation failure, the query errors, and the screen shows
  something else entirely. That has cost real debugging time.

---

## 5. Transport and auth

- **The access token is memory-only; the refresh token is an httpOnly cookie**
  JavaScript cannot read. Persist the user and `isAuthenticated` and _nothing
  secret_ — a token in `partialize` hands any XSS a credential.
- **The refresh call sends no body.** The cookie is the credential, and the token
  schema deliberately has no `refreshToken` field, so a server returning one
  fails validation.
- **Single-flight refresh**: N concurrent 401s await one memoised promise and
  produce one refresh call, then N retries. The refresh itself uses a
  **separate, interceptor-free client**, or a 401 from the refresh endpoint
  re-enters the refresh flow.
- **`skipAuthRefresh: true`** on requests where a 401 means bad credentials —
  login, logout.
- Route guards run in `beforeLoad` and read the store with `getState()`, because
  `beforeLoad` runs outside React. **A guard decides what to render; the server
  still has to enforce it.**
- **Restore the token on boot.** A reload leaves a believed-in session with no
  access token: the shell paints, the first query 401s, and everything refetches.
  Reuse the same single-flight refresh so a boot restore and a concurrent 401
  still make one call.
- **Where sign-in is two steps, only the second yields a session.** The password
  buys a short-lived challenge and nothing else; hold it in memory only, so a
  reload restarts the sign-in rather than resuming half of one, and call
  `setSession` from exactly one place.
- **Report errors through a seam, not `console`** — one `setErrorReporter` call
  wires Sentry or anything else, and no module imports a vendor SDK.

---

## 6. Performance — the decisions that were measured

**Loading**

- Pages are **lazy by route**; vendor code is split by path prefix. Vite 8 builds
  with rolldown, which accepts only the **function** form of `manualChunks`.
- **Route loaders prefetch and do not await.** `ensureQueryData` is fired, so
  `defaultPreload: 'intent'` warms the cache on hover while navigation stays
  instant and the component's own `useQuery` still owns loading and error states.
  Awaiting would remove the first-load skeleton but block every paging and
  filtering change behind a round trip.
- **One `queryOptions` factory, shared by the loader and the hook.** A loader and
  a component that disagree about a key do not break — they just fetch twice,
  silently.
- **Mocks are behind a dynamic import**, so the folder is not in the production
  bundle.
- **Self-host fonts, `unicode-range`-scoped.** An English session then downloads
  no Arabic weights. It is also a privacy and reliability decision: no request
  for a font should leave the page, and a partner behind a corporate proxy would
  otherwise silently get a fallback face.

**Fetching**

- `staleTime: 60s`, `refetchOnWindowFocus: false`, and **no retry on 4xx** —
  retrying one just delays the error the user needs to see.
- **`placeholderData: (previous) => previous`** on any paged or filtered list, so
  turning a page keeps the rows on screen instead of flashing skeletons.
- **A poll must switch itself off.** `refetchInterval` returns `false` once every
  row has settled; an unconditional interval polls forever.
- **`isLoading` and `isFetching` deserve opposite treatment.** Skeletons mean "no
  data yet"; a refetch with rows on screen dims and announces itself. A polling
  list driven off `isFetching` throws itself back into placeholders every two
  seconds.

**Rendering**

- **Selector subscriptions**: `useStore((s) => s.slice)`, never the whole store.
- **Uncontrolled forms** via react-hook-form, so a keystroke does not re-render
  the page.
- **Debounce typing into the URL, and `replace` it** — pushing per keystroke
  buries the previous page under a dozen history entries.
- **Memoise column definitions** (`useMemo` over `t` and the formatters) and hoist
  constant objects to module scope. TanStack Table compares identity; a literal
  declared inline is a new object every render.
- **Size off the component, not the viewport** (`@container`). The same card sits
  seven-up on a desktop and two-up on a phone.
- **Cache `Intl` formatters** by (locale, options). A 50-row table formatting two
  date columns otherwise builds 100 of them per render.
- **Animate on `requestAnimationFrame`, not a timer**, so it stops with the tab —
  and read a reduced-motion preference before starting at all.

---

## 7. The rich-text field

**There is one, it is TipTap, and it is copied from
`marketplace-admin-console/src/components/form/RichTextEditor.tsx`.** Any
multi-line field whose content a _member_ reads — a programme description, an
About, a set of Terms — is this component and not a `<textarea>`. A textarea
publishes a wall of unformatted text to a phone; every one of those fields in
the partner portal's App content screen is now rich text.

Porting it is not a copy-paste. Five things bit, in order:

- **`StarterKit` v3 already contains `Underline` and `Link`.** Importing them
  beside it registers each twice — a duplicate-extension warning and two sets of
  keybindings for one mark. Configure them _through_ the kit
  (`StarterKit.configure({ link: {...}, underline: {...} })`), and switch off the
  nodes the target app cannot render (`heading`, `blockquote`, `codeBlock`,
  `code`, `horizontalRule`): offering a heading publishes markup the phone will
  not honour.
- **The editor takes its content once, at construction.** The common way to fill
  a form — `useForm({ defaultValues: EMPTY })` plus a `reset(data)` in an effect,
  or the `values` option, which is also applied in an effect — lands _after_ the
  editor has mounted, and the field stays empty over a form whose `getValues()`
  is full. Plain inputs beside it update normally, which is what makes this look
  like a fault in the editor. **Build the form from its data and mount it once**:
  gate on the query, then render an inner component whose `defaultValues` _are_
  the response.
- **TipTap re-serialises whatever you hand it, and emits that as an update.**
  `<ul><li>x</li></ul>` comes back as `<ul><li><p>x</p></li></ul>`. Let that
  reach `field.onChange` and the form is dirty before the reader has touched
  anything — Save lights up on a form nobody edited, which is exactly what
  "disable Save while nothing is dirty" exists to prevent. Ignore updates until
  `onCreate` has fired, and compare against **the value you last applied**, not
  against `editor.getHTML()`: the raw string and the re-serialised one never
  match, so a naive sync effect pushes the same content back in on every render.
- **`editor.view` is a getter that throws** until ProseMirror has mounted the
  view — it does not return `undefined`, so an optional chain will not save you.
  Anything reaching for `editor.view.dom` (handing `field.ref` to the
  contenteditable, so a failed submit can focus the field) must be gated on
  `isInitialized` _and_ re-run when it becomes true. This one survives a dev
  server and fails in a production build, because a `Suspense` boundary changes
  when the effect runs relative to the mount.
- **Validate the text, not the markup.** `z.string().min(10)` passes on
  `<p>hi</p>`, and an editor emptied by hand can leave `<p></p>` behind to clear
  a required check with nothing in it. Strip the tags before measuring.

**Two integration rules that are not about TipTap at all:**

- **It must not reach the barrel.** TipTap is ~396 kB raw, ~125 kB gzipped. A
  `export * from './RichTextEditor'` in `components/form/index.ts` is a static
  import for every module that touches that folder, and it put a document editor
  on the **sign-in screen** — visible in the built `login` chunk. Keep the
  TipTap-dependent modules out of the barrel, export only the form wrapper, and
  have that wrapper `lazy()` the editor. Then _check the build output_: the
  chunk must not be in `index.html`'s modulepreloads, and a real page load must
  not request it until you open the screen that has a field on it.
- **`Suspense` goes outside the form control, never inside it.** The control is
  a Radix `Slot`: it stamps `id`, `aria-describedby` and `aria-invalid` onto its
  one child, and a boundary in that position takes them — leaving the label
  pointing at nothing.

**Rendering it back is a security decision.** Never hand stored HTML to
`dangerouslySetInnerHTML` as it arrived. Round-trip it through the editor's own
schema (`generateHTML(generateJSON(html, extensions), extensions)`): a node or
mark the document model does not define cannot survive the parse, so a
`<script>`, a `<style>` or an `onclick` is dropped **by construction** rather
than by a denylist somebody has to keep current. Export the extension list from
its own module so the editor and the renderer share exactly one schema — that
shared list is the whole guarantee, and it is also why the list cannot live in a
file that exports components (fast refresh, and the barrel problem above).

---

## 8. Clean code

**Where code goes** — one table, and it decides every placement:

| Kind                                        | Location                                          |
| ------------------------------------------- | ------------------------------------------------- |
| Page                                        | `pages/<page>/index.tsx`                          |
| Component / hook / api used by **one** page | `pages/<page>/_components                         | _hooks | _apis/` |
| Used by **2+** pages                        | `components/<group>/`, `hooks/<group>/`, `apis/`  |
| shadcn primitive                            | `components/ui/`                                  |
| App-wide state                              | `stores/`                                         |
| Type                                        | `models/<page>.model.ts` (always `z.infer`red)    |
| Schema                                      | `validations/<page>.validation.ts`                |
| Enum                                        | `enums/<domain>.enums.ts`                         |
| Query key                                   | `constants/queryKeys.ts` — **never inline a key** |

- **Every folder has an `index.ts` barrel; import through it.** A folder's public
  surface is explicit and its internals stay movable.
- **A page never imports another page's `_*` folder.** If two pages need it,
  promote it. When shell chrome reaches into `pages/x/_hooks` to render itself,
  that is the signal to promote, not to add an import.
- **`index.tsx` stays thin**: compose `_components`, call `_hooks`, no business
  logic. `_apis/` are plain functions — no React, no hooks.
- **Const-object enums**, not TS `enum` (see §10): an `as const` object plus a
  derived union type. Same call sites, literal types preserved.
- **Lookup tables over conditionals** — `TONE_BY_STATUS`, chunk maps, mock
  lookups. Adding a case is a row, not a branch.
- **Safe fallbacks over crashes**: an unmapped status renders its raw token, a
  missing lookup returns `[]`. A new value from the API should render sensibly.
- **i18n keys everywhere, never prose in code** — validation messages
  (`'validation:email.invalid'`), toasts (`showToast.success('settings:saved')`),
  column labels. A third argument carries interpolation values, and a `count`
  among them selects the plural.
- **Never call `.default()` in a form schema.** It splits zod's input and output
  types and forces every `useForm` to be generic over both. Supply the initial
  value through `defaultValues` instead.
- **A router's "active" props concatenate classes; they do not merge them.** So a
  `hover:*` left on a link's base class still fires in the active state with
  nothing to override it — which is how a selected nav item ends up with muted
  grey copy on its own coloured fill. Describe both states explicitly and keep
  every colour off the base class. And when "active" needs to mean something the
  router's prefix matching does not — the _longest_ matching path, so one tab
  does not light up with its own ancestor — compute it yourself rather than
  bending the router's.
- **Reach for a primitive before writing anything.** Add the shadcn component
  rather than hand-rolling it; build your own only when the library genuinely has
  nothing, or when it is a _composition_ that carries house behaviour. A wrapper
  that only renames props is not worth its file.

- **`import.meta.env` is read in exactly one module.** Everything else imports a
  validated `env` object, so a missing or malformed variable fails loudly at
  startup instead of surfacing as `undefined` at a call site. The one allowed
  exception is a bundler guard that must be a compile-time literal for the branch
  to be deleted — comment it as such.

---

## 9. Working against a mock backend

- **Intercept at the network layer, not by stubbing the api modules.** That keeps
  the real client, its interceptors, the refresh flow and schema validation in
  the path — the mock is not a bypass, and there is no second copy of any
  function to drift. Going live then changes no application code.
- **Scope handlers to the API origin, never a bare wildcard.** A pattern like
  `*/users/:id` also matches the dev server's own module URLs — `index.tsx` reads
  as an id — so lazy route modules get answered with a mock 404 and those pages
  silently stop loading.
- **A worker resolving is not the same as the worker _controlling_ the page.** A
  page loaded before it activated is not controlled by it, so every mock looks
  wired up and every request still escapes to the real API — which surfaces as
  unexplained CORS errors on a machine where nothing is wrong. Check for a
  controller and reload **once**, flagged, so a worker that genuinely cannot take
  control fails loudly instead of looping. If CORS appears in dev, suspect a
  service worker left behind by another project on the same origin.
- **A mock's seeded clock is the real clock in the browser, pinned only in
  tests.** A fixture pinned to a past date makes every relative filter preset
  select a window the seeded data does not cover.
- **Let the mock be permissive where a real check adds nothing.** Accepting any
  six digits for a one-time code keeps the screen a step rather than a puzzle,
  when there is no mail server behind it. Test the _rejection_ path with a
  handler override instead — that keeps the test about how the form handles a
  refusal rather than about the mock's opinion.

---

## 10. Constraints the toolchain enforces

These fail the build, so know them before you write:

- **`erasableSyntaxOnly`** — no `enum`, no constructor parameter properties, no
  namespaces. Nothing that emits runtime code from a type position.
- **`verbatimModuleSyntax`** — type-only imports must say `import type { X }`.
- **TypeScript 6 removed `baseUrl`** — path aliases are `paths` alone, resolved
  relative to the tsconfig, and mirrored in the bundler config.
- **`import/no-cycle`** — a runtime import cycle fails lint. Type-only edges are
  erased and do not count, which is exactly the distinction that matters: a
  chain like `constants → models → validations → constants` is fine when two of
  its three hops vanish at compile time, and the rule catches the day someone
  turns one into a value import.
- **`noUnusedLocals` / `noUnusedParameters`** — dead code does not compile.
- **i18n key parity** — a test fails when the two locales diverge.

---

## 11. Testing

- **One test file per folder, named after the folder**, covering everything in it.
- **Use the project's `render`**, not RTL's raw one — it wraps i18n, a fresh
  query client, direction and the toaster. Use the router-aware variants for
  anything that reads search params or renders a `Link`; the URL is the
  assertion.
- **MSW serves every suite**, so tests exercise the real axios instance,
  interceptors and schema validation. Override one case with `server.use(...)`.
- **Seed what the suite asserts on**, in its own `beforeEach`. Relying on
  module-load order means depending on nothing else having mutated the fixture —
  and something will.
- **Pin the clock and the timezone.** `TZ: 'UTC'` in the runner, and a settable
  "now" for fixtures: a developer already in the displayed zone cannot tell a
  formatter that converts from one that does not.
- **A mounted toaster cuts both ways.** A text query for an error message passes
  whether it landed on the field or only in a toast, so assert _where_ feedback
  appears through the control — `toHaveAccessibleDescription`, `aria-invalid`.
- **Two guards exist because the gate cannot see rendered output**: axe over
  rendered components (it catches unnamed controls, which nothing static sees),
  and contrast asserted **arithmetically** over the tokens (jsdom applies no
  stylesheet, so nothing else can).
- **Test the pages, not just the easy folders.** Tables, forms and tabs are where
  the bugs are.

---

## 12. Definition of done

After **every** feature, fix or refactor — not once at the end of a batch:

```bash
npm run typecheck && npm run lint && npm run test:run && npm run build
```

Then `npm run format`. `build` earns its place: it runs the real bundler and
CSS pipeline, so it catches what `typecheck` alone cannot — a colour token that
resolves to nothing, a broken dynamic import, a chunking mistake.

- **Watch every new guard fail.** Break the behaviour it protects, confirm red,
  restore. A test written against already-correct code is green the moment you
  write it and proves nothing.
- **Look at the screen.** Run it, at desktop width, at 390px, and in the
  right-to-left locale. Layout defects — a clipped column, a ragged grid, an
  overlay covering a control — are invisible to a green suite.
- **Report honestly.** If a test fails, say so and paste the output. If you
  skipped a step, say that too.
- **Leave finished work in the working tree.** Never commit, branch or open a PR
  unless asked in that turn.
