// ============================================================================
// SITE CONTENT — edit everything here. No need to touch the page components.
// ============================================================================

export const site = {
  name: 'BTS RE:TURN PH',
  tagline: 'STREAM | VOTE | CELEBRATE',
  mission:
    'This is where passion meets purpose — built by ARMYs, for ARMYs. A collective effort by PH ARMYs, with no single organizer or central team.',
}

// --- Navigation (drives the navbar) ---------------------------------------
export const nav = [
  { label: 'About', to: '/about' },
  {
    label: 'Comeback Initiative',
    children: [
      { label: 'Projects', to: '/projects' },
      { label: 'Streaming', to: '/streaming' },
      { label: 'Donations', to: '/donations' },
      { label: 'Donors', to: '/donors' },
      { label: 'Voting', to: '/voting' },
    ],
  },
  {
    label: 'Concert Initiative',
    children: [
      { label: 'BTS in Manila', to: '/concert' },
      { label: 'Communities', to: '/communities' },
      { label: 'Fanchant Guide', to: '/fanchant' },
      { label: 'BANGTANdahan', to: '/bangtandahan' },
    ],
  },
  { label: 'Shop', to: '/shop' },
]

// --- Social links ----------------------------------------------------------
export const socials = [
  { label: 'Threads', href: 'https://www.threads.net/@btsreturnph' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@btsreturnph' },
  { label: 'Instagram', href: 'https://www.instagram.com/btsreturnph' },
  { label: 'Facebook', href: 'https://www.facebook.com/btsreturnph' },
  { label: 'X', href: 'https://x.com/btsreturnph' },
]

// --- The four RE: sub-projects --------------------------------------------
export const subProjects = [
  {
    code: 'RE:PLAY',
    title: 'Streaming',
    color: 'spring-sky',
    to: '/streaming',
    blurb:
      'Coordinated streaming guidance so every play counts toward the charts.',
  },
  {
    code: 'RE:CLAIM',
    title: 'Voting',
    color: 'spring-pink',
    to: '/voting',
    blurb: 'Voter education across every app so BTS gets the awards they earned.',
  },
  {
    code: 'RE:LIVE',
    title: 'Events',
    color: 'spring-mint',
    to: '/concert',
    blurb: 'Planning nationwide celebrations and fan projects for the comeback.',
  },
  {
    code: 'RE:BUILD',
    title: 'Fundraising',
    color: 'spring-lemon',
    to: '/donations',
    blurb: 'Pooling resources to fund premium streaming and digital sales.',
  },
]

// --- Donation channels -----------------------------------------------------
export const donationChannels = [
  { method: 'G-Cash', detail: '0909 737 3306', name: 'Andrea Batiduan' },
  { method: 'Maya', detail: '0909 737 3306', name: 'Andrea Batiduan' },
  { method: 'PayPal', detail: 'btsphborahae@gmail.com', name: '' },
]

// Replace these with the real portal / tracker links.
export const donationLinks = {
  donateNow: '#',
  tracker: '#',
}

// --- Voting platforms ------------------------------------------------------
export const votingPlatforms = [
  {
    app: 'Mnet Plus',
    items: ['Mcountdown Pre-vote', 'Mcountdown Live Vote', 'MAMA Voting'],
  },
  { app: 'Mubeat', items: ['Music Core Pre-vote', 'Music Live Vote (Top 3)'] },
  {
    app: 'Fannstar',
    items: ['The Fact Music Awards — Best Music', 'Best Fan Choice'],
  },
  { app: 'Idol Champ', items: ['Show Champion Pre-vote'] },
  { app: 'Linc', items: ['Inkigayo Pre-vote'] },
  { app: 'Whosfan', items: ['Hanteo Music Awards', 'Whosfandom'] },
]

// --- Concert fan-project targets ------------------------------------------
export const concertProjects = [
  { name: 'Freebie Bag', target: '10,000 – 50,000' },
  { name: 'Bus Wrap', target: '2 – 8' },
  { name: 'Hand Banners (Team Loob)', target: '10,000 – 50,000' },
  { name: 'Lamp Post Banners', target: '20 – 60' },
  { name: 'Lighting Events', target: 'Manila → Nationwide' },
]
