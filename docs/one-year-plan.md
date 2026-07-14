# USPSA Trainer — One-Year Plan to a $1M/Year Business

**Period:** July 2026 – June 2027
**Starting point:** Working Next.js prototype (skill graph, BLE timer via Web Bluetooth, session recording, PractiScore import, recommendations engine). No auth, no payments, no deployment, no git repo, zero users.
**Goal:** $1M annual run-rate. This plan is honest about the math — see below.

---

## 1. The Revenue Math (read this first)

$1M/year ≈ **$83.3k MRR**. At the spec's pricing, realistic blended ARPU is ~$8–10/mo
(mix of $79.99/yr Competitor, $149.99/yr Pro, $39.99/mo Instructor). That means:

> **~8,500–10,000 paying subscribers**, or a smaller number plus meaningful non-subscription revenue.

The brutal constraint: **USPSA has ~35k members, maybe 20–25k active competitors.** Hitting $1M on USPSA competitors alone requires ~40% penetration of the entire sport in 12 months. That does not happen. Therefore $1M requires one of two shapes:

**Shape A — Niche domination + market expansion (the plan below):**

| Segment | Addressable | Realistic Yr-1 paid | ARPU/yr | Revenue |
|---|---|---|---|---|
| USPSA competitors | ~25k active | 2,500 (10%) | $95 | $237k |
| IDPA / Steel Challenge / 3-Gun | ~40k | 1,200 | $95 | $114k |
| IPSC international (Phase 2, EN-only) | ~150k+ | 1,500 | $95 | $142k |
| Dry-fire / defensive pistol enthusiasts (no match req'd) | 500k+ | 3,000 | $80 | $240k |
| Instructors (Pro/Instructor tier) | ~2k | 400 | $360 | $144k |
| Hardware referral (AMG/Garmin timer bundles) + drill packs | — | — | — | $120k |
| **Total** | | **~8,600 paid** | | **~$997k** |

**Shape B — Fail gracefully:** If dry-fire expansion underperforms, the honest year-1 base case is **$250–400k ARR** with $1M run-rate landing in year 2. The plan is built so every quarter's work compounds toward Shape A without betting the company on it.

**The single most important strategic move:** the diagnostic engine ("Math Academy for shooting") must work **without a match booklet and without live fire** — dry fire with a timer's par mode is a first-class citizen from day one. The dry-fire market (everyone who bought a MantisX, a laser cartridge, or Stoeger's books) is 10–20× the USPSA competitor market and trains at home 5 nights a week. That's where the subscriber volume lives; USPSA competitors are the credibility beachhead.

---

## 2. Product Roadmap by Quarter

### Q1 (Jul–Sep 2026) — "Chargeable product exists"
**Milestone: a stranger can sign up, pay, and train at the range.**

- [ ] Git repo + GitHub + CI (this codebase is not even version-controlled yet — week 1)
- [ ] Auth + cloud sync (self-hosted Supabase: auth, Postgres, RLS). Local-first with sync — range Wi-Fi is nonexistent, offline must be flawless
- [ ] **PWA hardening**: installable, full offline mode, Web Bluetooth reliability pass on the 5 most common Android phones. Ship as PWA first — skip app stores in Q1 (faster iteration, no review risk, Web Bluetooth works on Android Chrome)
- [ ] Stripe subscriptions: Free / Competitor $9.99mo–$79.99yr / Pro $19.99mo–$149.99yr. 14-day full-featured trial, no card required
- [ ] Timer coverage beyond AMG: **Garmin Xero C1 support is mandatory** — it's become the dominant timer. Abstraction layer + manual entry + audio shot detection fallback (mic-based, good enough for dry fire)
- [ ] Dry-fire mode as first-class: par-time drills, no scored targets required, diagnostic engine consumes dry-fire data
- [ ] Skill graph v1 fully loaded: Stoeger/Park corpus (~40 drills, benchmarks by classification)
- [ ] Onboarding: classification-based placement (enter your classifier %, get calibrated benchmarks immediately — don't force a 45-minute diagnostic before value)
- **Ship gate:** 20 hand-recruited beta users (local club + r/USPSA) complete 3+ sessions each; fix what they break before charging anyone

### Q2 (Oct–Dec 2026) — "It tells me what to work on" (the moat)
**Milestone: the diagnostic engine visibly works and users say so publicly.**

- [ ] Diagnostic assessment + gap analysis → weekly training plan generator (this is the product; everything else is a drill logger)
- [ ] FIRe-style implicit review credit + memory decay scheduling ("your draws are stale — 10 min today")
- [ ] Cold/warm ownership score (first rep of the day vs. warmed up — no competitor tracks this)
- [ ] PractiScore import → stage skill decomposition → "your match bottleneck is wide transitions, here are 3 drills"
- [ ] Progress artifacts built for sharing: classification progress projection ("on pace for A class by March"), before/after drill charts — every chart has a share button (organic growth engine)
- [ ] League system (weekly XP leagues, classification-segmented) — retention mechanic for C/B class, who are 70% of the market
- [ ] Second content corpus (Anderson dry-fire programs or Charlie Perez) — proves the multi-source architecture, feeds dry-fire market
- **Ship gate:** trial→paid conversion ≥ 8% and month-1 retention ≥ 60% before spending a dollar on marketing

### Q3 (Jan–Mar 2027) — "Coaches and the off-season" (ARPU + distribution)
Timed deliberately: Jan–Mar is dry-fire season in most of the US and peak "new year, new classification" motivation.

- [ ] Instructor tier ($39.99/mo): student dashboards, assign plans, review student sessions. Each instructor drags in 5–30 students — this is a distribution channel disguised as a feature
- [ ] Instructor referral program: 20% recurring rev-share on referred students
- [ ] Premium drill packs from 1–2 named instructors (rev share) — credibility + revenue + their audience
- [ ] iOS answer: Capacitor-wrapped app store build (Web Bluetooth doesn't exist in iOS Safari; native BLE bridge via Capacitor plugin). iOS is ~40% of the market — can't skip it in a $1M plan
- [ ] Match prep mode (pre-match warmup plans, stage-skill checklists)
- [ ] Annual-plan push + winback flows

### Q4 (Apr–Jun 2027) — "Expand the market"
- [ ] IPSC mode (metric targets, minor/major, international classifications) — English-speaking markets first (UK, AUS, ZA, Scandinavia)
- [ ] IDPA / Steel Challenge / Carry Optics-defensive presets — same engine, different benchmarks
- [ ] Team/club licensing (club buys 20 seats, gets club leaderboard)
- [ ] Hardware bundle partnerships live (timer + 12-mo subscription; referral commission both directions)
- [ ] Data flywheel v1: "Shooters at your level average 1.42s draws" — the aggregated benchmark data nobody else has

**Explicitly deferred past month 12:** video analysis, AI target scoring, military/LE, community drill submission, non-English localization. Every one of these is a quarter of work that doesn't move year-1 revenue.

---

## 3. DevOps Plan

Per house rules: **Coolify on Hetzner, self-hosted Supabase, no Vercel/Heroku/Neon.**

### Q1 foundation
- GitHub repo (private) → Actions → GHCR Docker image → Coolify `dockerimage` deploy (never `dockerfile` build pack)
- `trainer.imprevista.com` to start; buy a real domain when the name is settled (see Marketing)
- **Staging from day one** — this app takes real money and prescribes training; it qualifies as user-facing: `staging` branch → `staging.trainer.imprevista.com`, `main` → production
- Supabase: separate schema on the shared self-hosted instance; RLS on every table; migrations via `psql` over SSH per infra runbook
- Uptime Kuma monitor: Tier 3 during beta → **Tier 1 the day Stripe goes live** (paying users + payments = red-alert class)
- Sentry (self-hosted or free tier) for client errors — BLE bugs happen at the range where users can't file reports
- Automated tests in CI from week 1 on the money-adjacent logic: **skill estimation, benchmark scoring, XP, Stripe webhook handling** (house rule: financial/safety-adjacent logic ships with tests, no exceptions)

### Scaling reality check
10k users of a mostly-offline PWA syncing sessions is a trivially small load — the CX43 handles it. Plan for:
- Nightly Postgres dumps to Hetzner Storage Box (off-server). **Backup restore drill once a quarter** — subscriber data loss is a company-ending event at this scale
- Postgres read replica / dedicated instance only if p95 API latency degrades (don't pre-build)
- The real ops risks are not load: they're **Stripe webhook correctness, sync-conflict bugs eating user session data, and BLE regressions per Android/Chrome release**. Budget a recurring monthly "device lab" pass (5 phones, both timers)

### Payments risk (flag now, not later)
Stripe tolerates firearms-adjacent **software/training** but their policy enforcement is inconsistent in this vertical. Mitigations: describe the business accurately at onboarding (sports training software); keep a warm backup on **Paddle or a 2A-tolerant processor**; never let Stripe be a single point of failure once MRR matters. Losing your processor at $40k MRR is the #1 existential ops risk in this niche.

---

## 4. Marketing Plan

Budget assumption: near-zero paid spend until conversion metrics prove out (Q2 gate), then up to ~$3–5k/mo. This market is small, dense, and lives in ~10 identifiable watering holes — earned/community beats paid.

### Positioning
**"Math Academy for practical shooting."** For the shooter audience: *"Know exactly what's keeping you out of the next class — and fix it."* The pitch is the methodology, per house rules: skill graph, classification benchmarks from named sources, cold/warm tracking, closed loop with match data. Never "AI-powered training platform."

### Q1 — Seed (0 → 100 users)
- Recruit 20 beta users personally: local club, r/USPSA, Ben Stoeger's "Practical Shooting Group" on Facebook (240k+ members — the single densest pool)
- Build in public: weekly progress posts in r/USPSA + PSTG. This niche adores homegrown tools and is deeply skeptical of slick marketing
- Charles shoots matches with the app — founder-as-user is the credibility story

### Q2 — Prove & seed content (100 → 1,000 users, first revenue)
- **The share loop is the growth engine**: every classification-projection chart, drill PR, and league result is one tap from Instagram/Reddit. Practical shooters post their timer screens constantly today — give them a better screenshot
- YouTube/IG micro-influencers (10k–100k subs: practical shooting is full of them, they're cheap and hungry): 5–10 seeded accounts + affiliate codes (20% recurring). One honest "this diagnosed my weak transitions" video from a known M/GM shooter outperforms any ad
- Podcast circuit: Firearms Nation, Short Course, Triangle Tactical — hosts interview toolmakers for free
- SEO content: "B to A class training plan," "Bill Drill par times by classification," "Garmin Xero C1 dry fire setup" — low competition, high intent, compounds forever

### Q3 — Instructors as channel (1,000 → 4,000 users)
- Direct outreach to 100 instructors: free Instructor tier for 6 months + rev share. An instructor with 20 active students is worth ~$2k/yr ARR and churns near zero
- 1–2 named-instructor drill packs launch with *their* announcement to *their* audience
- Club night sponsorships: free club leaderboard for clubs that run weekly steel/classifier nights
- Begin paid: retargeting + Meta interest audiences only (CAC ceiling: $40, i.e. <6 months blended payback)

### Q4 — Expand (4,000 → 8,500+ paid)
- IPSC launch via international IPSC Facebook groups + regional influencers (UK/AUS/Nordics)
- Hardware bundles: co-marketing with timer retailers (Shooters Connection, Ben Stoeger Pro Shop) — subscription card in the timer box
- USPSA org relationship: explore official partnership / classifier data integration (long shot, transformative if it lands)
- Referral program: give a month, get a month

### Channel economics target (exit run-rate)
| Channel | % of new paid | Blended CAC |
|---|---|---|
| Organic/community/share-loop | 40% | ~$0 |
| Influencer/affiliate (20% rev share) | 25% | ~$19/yr |
| Instructor channel | 20% | ~$0 + rev share |
| SEO | 10% | ~$0 |
| Paid | 5% | <$40 |

---

## 5. Metrics & Kill/Scale Gates

| Metric | Q1 exit | Q2 exit | Q3 exit | Q4 exit |
|---|---|---|---|---|
| Registered users | 100 | 1,000 | 4,000 | 12,000 |
| Paying subscribers | 0 (beta) | 300 | 2,000 | 8,500 |
| MRR | $0 | $2.5k | $17k | **$83k** |
| Trial → paid | — | ≥8% | ≥10% | ≥12% |
| Month-1 retention (paid) | — | ≥60% | ≥65% | ≥70% |
| Sessions/user/week | ≥1.5 | ≥2 | ≥2 | ≥2.5 |

**Gates (pre-registered, no fudging):**
- **End of Q2:** if trial→paid <5% or M1 retention <45%, stop all growth work and fix product — the diagnostic engine isn't delivering felt value yet
- **End of Q3:** if MRR <$8k, drop the $1M target to a $350k year-1 / $1M year-2 plan and cut burn accordingly (this is the Shape B branch, and it's fine)
- Sessions/week is the leading indicator; MRR is lagging. A user training 2×/week does not churn

---

## 6. Top Risks

1. **Market size ceiling** — mitigated by dry-fire-first design and IPSC/IDPA expansion; this is why dry fire is in Q1, not Q3
2. **Payment processor pulls out** (firearms-adjacent) — backup processor warm from day one
3. **Diagnostics feel like astrology** — if prescriptions don't visibly work, churn is fatal. Mitigate: show the evidence trail for every recommendation ("prescribed because your transition times are 1.3σ below B-class benchmark")
4. **Garmin/AMG BLE breakage** across firmware/Android updates — device lab, manual entry always works
5. **A free competitor** (Mantis adds diagnostics, or a hobbyist clone) — moat is the benchmark dataset + skill graph content, which compounds with users; ship the data flywheel in Q4
6. **Solo-founder bandwidth across 10+ projects** — this plan needs ~15–20 focused hrs/week; if that's not available, the honest move is the Shape B timeline, not a thinner version of Shape A

---

## Synopsis

Ship a paid PWA in Q1, prove the diagnostic engine converts in Q2, use instructors and share-loops for distribution in Q3, expand to dry-fire/IPSC/IDPA in Q4. $1M in 12 months requires the dry-fire market beyond USPSA (~8,500 subs); the base case without it is $250–400k ARR with $1M in year 2 — every quarter's work compounds toward either outcome.
