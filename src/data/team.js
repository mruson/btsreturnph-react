// ============================================================================
// CORE TEAM ORG CHART
// ----------------------------------------------------------------------------
// Live data comes from the "Team" tab of the site Google Sheet:
//   dept | fanbase | logo | link | active
//
//   dept    — must be one of the DEPARTMENTS keys below (use the sheet dropdown)
//   fanbase — display name shown under the logo
//   logo    — Google Drive share link, or a local path like /about/logos/x.png
//   link    — the fanbase's social page; makes the logo clickable. Leave blank
//             for no link. Only http(s) URLs are honoured.
//   active  — checkbox; uncheck to hide a row without deleting it
//
// Rows render in sheet order — drag a row up to move it up its column.
//
// The rows below are only a fallback for when the sheet is unreachable, so the
// page still renders something sensible. Edit the sheet, not this list.
// ============================================================================

// Column order of the chart, and the label drawn on each department box.
// The keys must match the `dept` values in the sheet exactly (case-insensitive).
export const DEPARTMENTS = [
  { key: 'FINANCE', label: 'Finance' },
  { key: 'MARKETING & SPONSORSHIPS', label: 'Marketing & Sponsorships' },
  { key: 'CREATIVES', label: 'Creatives' },
  { key: 'LOGISTICS', label: 'Logistics' },
  { key: 'VOLUNTEERS', label: 'Volunteers' },
]

// Rendered above the departments, at the top of the chart.
export const PM_DEPT = 'PM'

// Social media partners live in their own "media_partners" tab — no org chart,
// no departments, just a flat grid:
//   partner | logo | link | active
//
// Left empty on purpose: the block renders straight from the sheet, and showing
// nothing beats showing a stale hardcoded roster if the fetch fails.
export const mediaPartnersFallback = []

export const teamFallback = [
  { dept: 'PM', fanbase: 'BTS Streamers', logo: 'https://drive.google.com/open?id=1sjU8RQdqVZCBl_iiIt2VCIO1ysVijZNF', link: '', active: 'TRUE' },
  { dept: 'PM', fanbase: 'The Purple Initiative Manila', logo: 'https://drive.google.com/open?id=1lVHwx-cG6TzY3zhJEjxKSRygMtdn4qYy', link: '', active: 'TRUE' },
  { dept: 'FINANCE', fanbase: 'BTS Streamers', logo: 'https://drive.google.com/open?id=1sjU8RQdqVZCBl_iiIt2VCIO1ysVijZNF', link: '', active: 'TRUE' },
  { dept: 'FINANCE', fanbase: 'MKLT Fam', logo: 'https://drive.google.com/open?id=1vn16LH-KvJqWg9HQ97_eZz4woPKiknIp', link: '', active: 'TRUE' },
  { dept: 'MARKETING & SPONSORSHIPS', fanbase: 'The ARMY Pulse PH', logo: 'https://drive.google.com/open?id=1LCrtiwzfuT90xG_VtrWKUPua4HSB6eJi', link: '', active: 'TRUE' },
  { dept: 'MARKETING & SPONSORSHIPS', fanbase: 'BTS ARMY Tuguegarao', logo: 'https://drive.google.com/open?id=1keZ9DJT19O8DOEB9WgoxbT96hftaKtFA', link: '', active: 'TRUE' },
  { dept: 'CREATIVES', fanbase: 'BTS ARMY Bicol', logo: 'https://drive.google.com/open?id=1wVdO7b6JQO65xot5NtGLk0K8sDpRBZFt', link: '', active: 'TRUE' },
  { dept: 'CREATIVES', fanbase: 'luvmajze', logo: 'https://drive.google.com/open?id=1NZRvQ_aqlxlC5TVb43KcBNKB9RSBQcWc', link: '', active: 'TRUE' },
  { dept: 'LOGISTICS', fanbase: 'Bangtan Hwaiting', logo: 'https://drive.google.com/open?id=1XqhVDxdYTGFZP6qOZC6AJgwANknUkc9o', link: '', active: 'TRUE' },
  { dept: 'LOGISTICS', fanbase: 'Boraecija', logo: 'https://drive.google.com/open?id=1LmltZCkk-SjXnps0bsEEU5Lbukbbv3I6', link: '', active: 'TRUE' },
  { dept: 'VOLUNTEERS', fanbase: 'BTS Purple Fam', logo: 'https://drive.google.com/open?id=1sfDf3QV43uvPOBB1zWivf1gPoDZckwGC', link: '', active: 'TRUE' },
  { dept: 'VOLUNTEERS', fanbase: 'EYE Purple U', logo: 'https://drive.google.com/open?id=1NroFAz7Me3gbWc6-j-GHehbm80UgsxL3', link: '', active: 'TRUE' },
]
