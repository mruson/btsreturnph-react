// ============================================================================
// TEAM LOOB FAN PROJECTS — the in-venue surprise projects, per concert day.
// Edit everything here; the page component reads straight from this file.
// ============================================================================
//
// Each day: { id, day, label, date, weekday, projects: [...] }
// Each project:
//   title      — heading on the card
//   what       — what ARMY does
//   when       — the cue during the show
//   materials  — array of strings (one bullet each)
//   need       — optional "what we need" call for volunteers
//   reminder   — optional highlighted warning / reminder
//   songId     — optional `setlist.js` id; adds a "Open fanchant guide" link
//   media      — array of demo items shown in the card's gallery:
//                  { type: 'image',   src: '/concert/loob/xxx.webp', alt: '…' }
//                  { type: 'video',   src: '/concert/loob/xxx.mp4',  poster: '…' }
//                  { type: 'youtube', id: 'dQw4w9WgXcQ', alt: '…' }
//                Leave `media` empty ([]) and a "Stay tuned" card shows instead.
//   stayTunedNote — optional line under that "Stay tuned" card.

export const fanProjectDays = [
  {
    id: 'day-1',
    label: 'Day 1',
    date: 'March 13',
    weekday: 'Saturday',
    projects: [
      {
        title: 'Group Surprise Project',
        what: 'TBA',
        when: 'TBA',
        materials: ['Hand banner provided by BRPH (for the lyrics)'],
        media: [],
        stayTunedNote: 'Hand banner design to be revealed soon.',
        // Confirmed details — restore once announced:
        // what: 'Sing 2!3! (chorus only!)',
        // when: 'Start of ARMY Time',
        // need: 'Bibo leaders who will lead and encourage ARMY in their section to sing.',
        // songId: '2-3',
      },
      {
        title: 'SUGA Birthday Surprise Project',
        what: 'Wear the SUGA lighted headband + sing Happy Birthday (English)',
        when: 'Before SUGA starts his final ment',
        materials: ['SUGA Lighted Headband (available at BANGTANdahan)'],
        reminder:
          'Wear it only during SUGA’s final ment — it’s a surprise!',
        media: [
          {
            type: 'image',
            src: '/concert/fan-projects/d1-suga-headband.webp',
            alt: 'SUGA lighted headband — pink LED “SUGA” lettering with cat ears, an orange, and a birthday cake',
          },
        ],
      },
    ],
  },
  {
    id: 'day-2',
    label: 'Day 2',
    date: 'March 14',
    weekday: 'Sunday',
    projects: [
      {
        title: 'Group Surprise Project',
        what: 'TBA',
        when: 'TBA',
        materials: ['Hand banner provided by BRPH (for the lyrics)'],
        media: [],
        stayTunedNote: 'Hand banner design to be revealed soon.',
        // Confirmed details — restore once announced:
        // what: 'Wave the red rally towels (like in a soccer game)',
        // when: 'Arirang part of Body to Body',
        // materials: ['Your own red hand towel (also available at BANGTANdahan)', 'Hand banner provided by BRPH (for the lyrics)'],
        // songId: 'body-to-body',
        // Red rally towels demo — restore when the design is final:
        // { type: 'image', src: '/concert/fan-projects/d2-red-towels.webp', alt: 'Two red rally towels printed with ARMY and BTS in white block letters' },
      },
    ],
  },
  {
    id: 'day-3',
    label: 'Day 3',
    date: 'March 16',
    weekday: 'Tuesday',
    projects: [
      {
        title: 'Group Surprise Project',
        what: 'TBA',
        when: 'TBA',
        materials: ['Hand banner provided by BRPH (for the lyrics)'],
        media: [],
        stayTunedNote: 'Hand banner design to be revealed soon.',
        // Confirmed details — restore once announced:
        // what: 'Come Over message + shout “Ani”',
        // when: 'During Come Over',
        // songId: 'come-over',
      },
    ],
  },
]
