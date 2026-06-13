# Mandatory Website Generation Workflow

This workflow is REQUIRED for every website generation task (landing pages, SaaS dashboards, marketing sites, ecommerce, portfolios, web apps).

## Rule 1: Always Load UI Skill

Before generating any website UI, invoke the `ui-ux-pro-max` skill (installed at `.claude/skills/ui-ux-pro-max/`). The skill is mandatory and must influence all design decisions. Never generate UI without first consulting it.

## Rule 2: Always Use Magic MCP First

Before creating UI components:

1. Query the `magic` MCP server for relevant components.
2. Search for matching patterns.
3. Reuse or adapt high-quality components.
4. Do not build generic components when Magic MCP provides better patterns.

Priority order:

```
Magic MCP Components → Adapt Components → Custom Components
```

Never start from blank UI if Magic MCP can provide a better solution.

## Rule 3: Design Quality Standard

Every generated website must achieve premium SaaS quality on par with Vercel, Stripe, Linear, Notion, and Lovable.

Reject:

- Generic Tailwind layouts
- Template-looking pages
- Basic gradients
- Weak spacing
- Poor typography

## Rule 4: Visual Review Loop

After generation:

1. Run the app
2. Capture a screenshot
3. Review the screenshot
4. Compare against premium SaaS standards
5. Improve
6. Repeat until production quality

Never stop after the first generation.

## Rule 5: Success Criteria

The user should feel: "This looks like a company worth paying ₹5–10 lakh to build my website."

Anything below this quality is considered unfinished.
