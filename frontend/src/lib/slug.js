// lib/slug.js  ← put this in your lib/ folder and import wherever needed
// ─────────────────────────────────────────────────────────────────────────────
// Converts a vendor's serviceCategory into a URL-safe slug.
//
// Examples:
//   "AC Repair & Service"       → "ac-repair--service"   (& removed, spaces → -)
//   "Cockroach / Ant Control"   → "cockroach--ant-control"
//   "Plumber"                   → "plumber"
//   "Home Cleaning"             → "home-cleaning"
//
// Use this EVERYWHERE you build or match a service route so the logic is consistent.

export function toSlug(str = "") {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // strip &, /, etc.
    .trim()
    .replace(/\s+/g, "-");          // spaces → hyphens
}

// ─── Usage examples ───────────────────────────────────────────────────────────

// 1. In your services listing page (wherever you show category cards),
//    use toSlug(category) to build the href:
//
//    import { toSlug } from "@/lib/slug";
//    <Link href={`/services/${toSlug(category.name)}`}>
//      {category.name}
//    </Link>

// 2. In the vendor cards on the homepage / browse page:
//
//    import { toSlug } from "@/lib/slug";
//    router.push(`/services/${toSlug(vendor.serviceCategory)}`);

// 3. The [slug] page already uses toSlug() to match vendors — no changes needed there.

// ─── IMPORTANT: backend search note ─────────────────────────────────────────
// The [slug]/page.jsx sends slug.replace(/-/g, " ") as the search query.
// This means your backend /api/vendors/search?query=... must do a case-insensitive
// LIKE/ilike match on service_category.
// Example (Express + Sequelize):
//
//   where: {
//     service_category: { [Op.iLike]: `%${query}%` },
//     is_approved: true,
//   }
//
// The client then does an EXACT slug match as a second filter so only the right
// category shows up even if the LIKE returns broader results.