interface PhotoEntry {
  label: string
  id: string
}

interface PhotoCategory {
  category: string
  entries: PhotoEntry[]
}

/**
 * Curated, hand-verified Unsplash photo IDs, grouped by business domain.
 *
 * Every ID here has been verified to resolve (HTTP 200) and visually
 * spot-checked against its label. This is the single source of truth:
 * the generate prompt embeds it (see photoLibraryPromptBlock) and the
 * parser uses VERIFIED_PHOTO_IDS to replace any ID the model invents
 * (invented IDs 404). If you add entries, curl-verify the ID first.
 */
export const PHOTO_LIBRARY: PhotoCategory[] = [
  {
    category: 'Restaurant & food',
    entries: [
      { label: 'dining-table-with-plates', id: 'photo-1414235077428-338989a2e8c0' },
      { label: 'restaurant-interior-warm', id: 'photo-1517248135467-4c7edcad34c4' },
      { label: 'restaurant-tables', id: 'photo-1555396273-367ea4eb4db5' },
      { label: 'fine-dining-room', id: 'photo-1466978913421-dad2ebd01d17' },
      { label: 'plated-dish', id: 'photo-1504674900247-0877df9cc836' },
      { label: 'dark-moody-salad-bowl', id: 'photo-1540189549336-e6e99c3679fe' },
      { label: 'healthy-bowl', id: 'photo-1546069901-ba9599a7e63c' },
      { label: 'chef-hands-preparing', id: 'photo-1551218808-94e220e084d2' },
      { label: 'chef-portrait', id: 'photo-1577219491135-ce391730fb2c' },
      { label: 'professional-kitchen', id: 'photo-1556910103-1c02745aae4d' },
    ],
  },
  {
    category: 'Architecture & real estate',
    entries: [
      { label: 'modern-house-exterior', id: 'photo-1600585154340-be6161a56a0c' },
      { label: 'luxury-villa-pool', id: 'photo-1600596542815-ffad4c1539a9' },
      { label: 'luxury-home-dusk', id: 'photo-1512917774080-9991f1c4c750' },
      { label: 'suburban-house', id: 'photo-1564013799919-ab600027ffc6' },
      { label: 'modern-living-room', id: 'photo-1600607687939-ce8a6c25118c' },
      { label: 'apartment-interior', id: 'photo-1493809842364-78817add7ffb' },
      { label: 'styled-living-room', id: 'photo-1522708323590-d24dbb6b0267' },
      { label: 'cozy-living-room', id: 'photo-1502672260266-1c1ef2d93688' },
      { label: 'serene-bedroom', id: 'photo-1505691938895-1758d7feb511' },
      { label: 'corporate-towers', id: 'photo-1486406146926-c627a92ad1ab' },
    ],
  },
  {
    category: 'Office & teams',
    entries: [
      { label: 'bright-office', id: 'photo-1497366216548-37526070297c' },
      { label: 'office-lounge', id: 'photo-1497366811353-6870744d04b2' },
      { label: 'team-at-table', id: 'photo-1521737604893-d14cc237f11d' },
      { label: 'team-collaborating', id: 'photo-1522071820081-009f0129c71c' },
      { label: 'office-presentation', id: 'photo-1556761175-5973dc0f32e7' },
    ],
  },
  {
    category: 'Tech',
    entries: [
      { label: 'code-on-screen', id: 'photo-1461749280684-dccba630e2f6' },
      { label: 'laptop-with-code', id: 'photo-1498050108023-c5249f4df085' },
      { label: 'developers-pairing', id: 'photo-1551434678-e076c223a692' },
      { label: 'analytics-dashboard-laptop', id: 'photo-1460925895917-afdab827c52f' },
      { label: 'minimal-workspace', id: 'photo-1504384308090-c894fdcc538d' },
    ],
  },
  {
    category: 'Retail & fashion',
    entries: [
      { label: 'boutique-store', id: 'photo-1441986300917-64674bd600d8' },
      { label: 'clothing-rack-neutral', id: 'photo-1490481651871-ab68de25d43d' },
      { label: 'shopper-with-bags', id: 'photo-1483985988355-763728e1935b' },
      { label: 'fashion-storefront', id: 'photo-1469334031218-e382a71b716b' },
      { label: 'garment-detail', id: 'photo-1445205170230-053b83016050' },
    ],
  },
  {
    category: 'Fitness & wellness',
    entries: [
      { label: 'gym-equipment', id: 'photo-1571902943202-507ec2618e8f' },
      { label: 'dumbbell-rack', id: 'photo-1534438327276-14e5300c3a48' },
      { label: 'runner-outdoors', id: 'photo-1517836357463-d25dfeac3438' },
      { label: 'weights-training', id: 'photo-1571019613454-1cb2f99b2d8b' },
      { label: 'sunset-yoga-silhouette', id: 'photo-1544367567-0f2fcb009e0b' },
      { label: 'beach-yoga-group', id: 'photo-1545205597-3d9d02c29597' },
      { label: 'spa-products', id: 'photo-1540555700478-4be289fbecef' },
    ],
  },
  {
    category: 'Hotel & travel',
    entries: [
      { label: 'hotel-room-luxury', id: 'photo-1571896349842-33c89424de2d' },
      { label: 'resort-aerial-pools', id: 'photo-1566073771259-6a8506099945' },
      { label: 'resort-room-windows', id: 'photo-1582719478250-c89cae4dc85b' },
      { label: 'hotel-bedroom-modern', id: 'photo-1611892440504-42a792e24d32' },
      { label: 'resort-pool-dusk', id: 'photo-1551882547-ff40c63fe5fa' },
    ],
  },
  {
    category: 'Cafe & coffee',
    entries: [
      { label: 'coffee-pour', id: 'photo-1495474472287-4d71bcdd2085' },
      { label: 'coffee-bar', id: 'photo-1501339847302-ac426a4a7cbb' },
      { label: 'cafe-counter', id: 'photo-1554118811-1e0d58224f24' },
      { label: 'cafe-interior', id: 'photo-1559925393-8be0ec4767c8' },
      { label: 'roasted-beans-texture', id: 'photo-1447933601403-0c6688de566e' },
      { label: 'espresso-portafilters-latte-art', id: 'photo-1511920170033-f8396924c348' },
      { label: 'black-coffee-cup-topdown', id: 'photo-1514432324607-a09d9b4aefdd' },
      { label: 'coffee-beans-burlap-sack', id: 'photo-1524350876685-274059332603' },
      { label: 'pourover-brewing', id: 'photo-1442512595331-e89e73853f31' },
      { label: 'minimal-coffee-glass', id: 'photo-1521302080334-4bebac2763a6' },
    ],
  },
]

/** Industry keywords → the library categories whose subjects fit. */
const INDUSTRY_CATEGORY_RULES: Array<{ pattern: RegExp; categories: string[] }> = [
  { pattern: /coffee|cafe|café|roast|barista/i, categories: ['Cafe & coffee'] },
  { pattern: /restaurant|dining|food|culinary|bakery|catering|kitchen/i, categories: ['Restaurant & food'] },
  { pattern: /real estate|property|architect|interior|housing|construction/i, categories: ['Architecture & real estate'] },
  { pattern: /fitness|gym|yoga|wellness|spa|sport/i, categories: ['Fitness & wellness'] },
  { pattern: /hotel|travel|resort|hospitality|tourism/i, categories: ['Hotel & travel'] },
  { pattern: /retail|fashion|apparel|clothing|e-?commerce|store|shop/i, categories: ['Retail & fashion'] },
  { pattern: /tech|software|saas|\bai\b|startup|developer|engineering|data/i, categories: ['Tech'] },
]

const DEFAULT_FALLBACK_CATEGORY = 'Office & teams'

function entriesForIndustry(industryHint: string | undefined): PhotoEntry[] {
  if (industryHint) {
    for (const rule of INDUSTRY_CATEGORY_RULES) {
      if (rule.pattern.test(industryHint)) {
        const pool = PHOTO_LIBRARY.filter((c) => rule.categories.includes(c.category)).flatMap(
          (c) => c.entries
        )
        if (pool.length > 0) return pool
      }
    }
  }
  return (
    PHOTO_LIBRARY.find((c) => c.category === DEFAULT_FALLBACK_CATEGORY)?.entries ?? ALL_ENTRIES
  )
}

const ALL_ENTRIES: PhotoEntry[] = PHOTO_LIBRARY.flatMap((c) => c.entries)

/** Every verified photo ID, for fast membership checks in the parser. */
export const VERIFIED_PHOTO_IDS: ReadonlySet<string> = new Set(
  ALL_ENTRIES.map((e) => e.id)
)

/**
 * Renders the library as the bullet block embedded in the generate prompt.
 */
export function photoLibraryPromptBlock(): string {
  return PHOTO_LIBRARY.map(
    (c) =>
      `  ${c.category}: ` +
      c.entries.map((e) => `${e.label} — ${e.id}`).join(' · ')
  ).join('\n')
}

/**
 * Deterministically maps an arbitrary (invented) photo ID to a verified
 * library entry, so the replacement is stable across re-parses. When an
 * industry hint is given, the replacement is drawn ONLY from the matching
 * category — an invented coffee-bean photo on a coffee site must become
 * a coffee photo, never a salad or a gym (subject relevance > variety).
 */
export function fallbackPhotoId(inventedId: string, industryHint?: string): string {
  const pool = entriesForIndustry(industryHint)
  let hash = 0
  for (let i = 0; i < inventedId.length; i++) {
    hash = (hash * 31 + inventedId.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % pool.length
  return pool[index].id
}
