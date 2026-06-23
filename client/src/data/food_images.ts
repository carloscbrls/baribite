// Food images mapped by item id (generated from source + index + name).
// Using free Unsplash stock food photos. All URLs are direct image links.
// Each chain gets representative images for its key items.

const FOOD_IMAGES: Record<string, string> = {
  // ── Chick-fil-A ──────────────────────────────────────────────────────────
  "chick-fil-a-0-grilled-nuggets-8-ct": "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
  "chick-fil-a-1-grilled-nuggets-12-ct": "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
  "chick-fil-a-2-grilled-chicken-sandwich": "https://images.unsplash.com/photo-1606755962773-d324e0a13030?w=400&h=300&fit=crop",
  "chick-fil-a-3-grilled-chicken-cool-wrap": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop",
  "chick-fil-a-4-side-salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  "chick-fil-a-5-fruit-cup": "https://images.unsplash.com/photo-1567306301408-9f7472a0b2b2?w=400&h=300&fit=crop",
  "chick-fil-a-6-grilled-chicken-noodle-soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
  "chick-fil-a-7-egg-white-grill": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop",

  // ── Starbucks ────────────────────────────────────────────────────────────
  "starbucks-0-grilled-chicken-and-hummus-protein-box": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
  "starbucks-1-egg-white-and-roasted-red-pepper-sous-vide-egg-bites": "https://images.unsplash.com/photo-1604467794349-1936e3c2b7ba?w=400&h=300&fit=crop",
  "starbucks-2-rolled-oats-and-seed-oatmeal": "https://images.unsplash.com/photo-1633964913295-ceb65926a1b7?w=400&h=300&fit=crop",
  "starbucks-3-greek-yogurt-with-strawberries": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
  "starbucks-4-cold-brew": "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=300&fit=crop",
  "starbucks-5-hot-tea": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",

  // ── Jamba ────────────────────────────────────────────────────────────────
  "jamba-0-protein-berry-workout-smoothie": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop",
  "jamba-1-berry-burst-smoothie": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop",
  "jamba-2-mango-passion-smoothie": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop",

  // ── McDonald's ───────────────────────────────────────────────────────────
  "mcdonald's-0-artisan-grilled-chicken-sandwich": "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop",
  "mcdonald's-1-egg-mcmuffin": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop",
  "mcdonald's-2-fruit-and-maple-oatmeal": "https://images.unsplash.com/photo-1633964913295-ceb65926a1b7?w=400&h=300&fit=crop",
  "mcdonald's-3-side-salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  "mcdonald's-4-apple-slices": "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=300&fit=crop",

  // ── Wendy's ───────────────────────────────────────────────────────────────
  "wendy's-0-grilled-chicken-sandwich": "https://images.unsplash.com/photo-1606755962773-d324e0a13030?w=400&h=300&fit=crop",
  "wendy's-1-chili": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
  "wendy's-2-side-salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  "wendy's-3-baked-potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
  "wendy's-4-frosty": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",

  // ── Taco Bell ─────────────────────────────────────────────────────────────
  "taco-bell-0-soft-chicken-taco": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
  "taco-bell-1-chicken-quesadilla": "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400&h=300&fit=crop",
  "taco-bell-2-black-beans": "https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?w=400&h=300&fit=crop",
  "taco-bell-3-guacamole": "https://images.unsplash.com/photo-1600335895229-6bf68b87e1e6?w=400&h=300&fit=crop",

  // ── Subway ───────────────────────────────────────────────────────────────
  "subway-0-oven-roasted-chicken": "https://images.unsplash.com/photo-1528995429539-5e1a9c8a0b3b?w=400&h=300&fit=crop",
  "subway-1-roast-beef": "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=400&h=300&fit=crop",
  "subway-2-turkey-breast": "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=400&h=300&fit=crop",
  "subway-3-veggie-delite": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  "subway-4-black-forest-ham": "https://images.unsplash.com/photo-1550507992-eb63ffee0847?w=400&h=300&fit=crop",

  // ── Sprouts ──────────────────────────────────────────────────────────────
  "sprouts-0-rotisserie-chicken": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
  "sprouts-1-greek-yogurt": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop",
  "sprouts-2-cottage-cheese": "https://images.unsplash.com/photo-1559561853-2d0b0e4e7c8a?w=400&h=300&fit=crop",
  "sprouts-3-eggs": "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&h=300&fit=crop",
  "sprouts-4-canned-tuna": "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400&h=300&fit=crop",
  "sprouts-5-frozen-berries": "https://images.unsplash.com/photo-1563746096251-35aef1c9b3f8?w=400&h=300&fit=crop",
  "sprouts-6-avocado": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop",
  "sprouts-7-sugar-free-jell-o": "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop",

  // ── Target ───────────────────────────────────────────────────────────────
  "target-0-fairlife-protein-shake": "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop",
  "target-1-premier-protein-shake": "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=300&fit=crop",
  "target-2-quest-protein-bars": "https://images.unsplash.com/photo-1622484211146-7fbb1b3c0b0a?w=400&h=300&fit=crop",
  "target-3-bone-broth": "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&h=300&fit=crop",

  // ── Mexican ──────────────────────────────────────────────────────────────
  "mexican-0-grilled-chicken-fajita": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop",
  "mexican-1-guacamole": "https://images.unsplash.com/photo-1600335895229-6bf68b87e1e6?w=400&h=300&fit=crop",
  "mexican-2-black-bean-soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
  "mexican-3-ceviche": "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=300&fit=crop",

  // ── Italian ──────────────────────────────────────────────────────────────
  "italian-0-grilled-chicken": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop",
  "italian-1-minestrone": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
  "italian-2-ricotta": "https://images.unsplash.com/photo-1559561853-2d0b0e4e7c8a?w=400&h=300&fit=crop",
  "italian-3-grilled-vegetables": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
  "italian-4-broth": "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&h=300&fit=crop",
};

export function getFoodImage(id: string): string | undefined {
  return FOOD_IMAGES[id];
}
