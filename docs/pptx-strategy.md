# 내 목의 베개 PDP AB Test Strategy

## Source Summary

Source deck: `hellenstein-pdp-redesign-v3.pptx`

The deck argues that the current PDP has enough raw material, but the decision
flow is weak. The rebuild must not show the proposal language to shoppers. It
must translate the proposal into a customer-facing PDP that answers purchase
questions in the right order.

Core diagnosis:

- Keep: deep product content, trust assets, existing product infographics.
- Rebuild: value hierarchy, price justification, social proof placement.
- Fix: missing sticky CTA, missing comparison, weak risk reversal.

Core frameworks:

- PAS: Problem, Agitation, Solution.
- FAB: Feature, Advantage, Benefit.
- Cialdini: social proof and authority.
- Loss aversion: show the cost of a bad fit without medical fearmongering.
- Risk reversal: address adaptation anxiety before purchase.

## Customer-Facing Structure

| Order | PPTX block | PDP purpose | Implementation |
| --- | --- | --- | --- |
| 01 | Hero | State product value in the first viewport: neck fit, 4-step height, review proof. | HTML hero + generated lifestyle image cut with controlled shopper-facing copy |
| 02 | Problem | Make the shopper recognize the pillow-fit problem. | HTML copy + generated lifestyle image cut with controlled shopper-facing copy |
| 03 | Agitation | Show repeated mornings as the cost of a bad fit. | HTML copy + generated visual cut with controlled shopper-facing copy |
| 04 | Solution | Explain why Hellenstein rebuilt the pillow. | HTML section + reused R&D/intro original image |
| 05 | Social Proof Top | Move actual reviews above the long detail stack after the problem/solution framing. | HTML module from existing `#prdReview` DOM |
| 06 | FAB Height | Convert height adjustment into customer benefit. | HTML FAB cards + reused height originals |
| 07 | FAB Structure | Explain the 4-part support structure. | HTML FAB cards + reused structure originals |
| 08 | Comparison | Keep comparison inside the page. | HTML comparison table, not image text |
| 09 | Who Is This For | Create self-identification and gift context. | HTML persona grid + generated persona image cut with controlled shopper-facing copy |
| 10 | Risk Reversal | Reduce adaptation anxiety without claiming live policy as final. | HTML callout; `100일 보장` appears only as proposed policy language in `detail=true` explanation |
| 11 | Authority Stack | Group FITI, safety, durability, and testing proof. | HTML proof grid + reused certification originals |
| 12 | FAQ | Answer final objections. | HTML FAQ, not image text |
| 13 | Final CTA + UGC | End with product memory and action. | HTML CTA + generated final lifestyle image cut with controlled shopper-facing copy |

## Asset Decisions

Reuse these originals:

- `original/09_3_story.webp`: 5-year development story.
- `original/13_4_point2_2.webp`, `original/14_4_point2_3.webp`: height adjustment.
- `original/15_4_point3_1.webp`, `original/16_4_point3_2.webp`, `original/19_4_point4_1.webp`: 4-part/shape logic.
- `original/21_4_point5_2.webp`, `original/23_4_point6_1.webp`, `original/24_4_point6_2.webp`: FITI, safety, durability.
- `original/29_7_guide.webp`, `original/30_7_guide_1.webp`: use guide.
- `original/31_8_q_a.webp`, `original/32_9_careguide.webp`, `original/34_11_spec.webp`, `original/35_12_washing.webp`: supporting bottom information.

Generate or compose these new visual cuts:

- Hero lifestyle: product-first bedroom image.
- Problem lifestyle: shopper waking with neck/shoulder discomfort.
- Agitation visual: repeated morning routine, no scary medical claim.
- Persona/gift lifestyle: office, side sleeping, family gift context.
- Final lifestyle: calm night-to-morning product memory.

Image generation and composition constraints:

- Text is allowed only when it is exact shopper-facing Korean copy controlled by this repo's asset build script.
- No buttons, arrows, CTA-like pills, cursor, navigation, or app UI.
- No proposal/internal strategy copy such as "compare without leaving the page" or "this block explains the PPTX."
- No fake logos or fake official certificates.
- No medical diagnosis visuals or guaranteed cure implication.
- Product should look like a premium white ergonomic pillow, not a random block pillow.

## UI/UX Principles Applied

From `cro`, `copywriting`, `marketing-psychology`, `ab-testing`, and `grain`:

- Make the next action obvious, but keep clickable actions in HTML.
- Reduce decisions before reducing clicks: one primary sticky action, supporting review jump.
- Keep one idea per section.
- Use actual review language where available; do not invent fake testimonials.
- Put proof near claims: review proof near hero, certification proof near authority, comparison near price justification.
- Separate experiment presentation from customer-facing PDP: `detail=true` shows rationale overlays; `detail=false` should feel like a shopper page.
- Track rendered state and CTA clicks through `dataLayer`.

## Detail Mode

`detail=true` is not a shopper page. It is a sales/demo mode for explaining the proposal.

It must:

- Highlight changed regions with Clarity-style tinted overlays and red/orange borders.
- Label each region with block number and PPTX slide reference.
- Explain what changed, why, and which deck claim it maps to.
- Avoid changing the underlying customer-facing content between `detail=false` and `detail=true`.
