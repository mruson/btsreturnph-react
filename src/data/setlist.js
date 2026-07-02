// ============================================================================
// ARIRANG SETLIST — songs for the Fanchant Guide.
//
// Each song has a YouTube video ID and a list of lyric lines. Each line has:
//   t     → start time in SECONDS (when the line begins in the video)
//   text  → the lyric line
//   chant → the fanchant for that line (optional; shown under the lyric)
//
// Record the `t` values with the hidden authoring tool (visit /fanchant?edit=1,
// switch to Timestamp mode, tap M on each line, then Copy JSON back here).
//
// ⚠️ REPLACE each `youtubeId` with the real one. From a YouTube URL like
//    https://www.youtube.com/watch?v=ABC123  →  the ID is "ABC123".
// ============================================================================

export const setlist = [
  {
    id: 'swim',
    title: 'SWIM',
    note: '',
    youtubeId: 'b4iVv91Z6lY',
    // Times below are approximate — interpolated from a rough transcript.
    // Refine any line with /fanchant?edit=1 (Timestamp mode).
    lyrics: [
      { t: 31, text: 'Swim, swim', chant: '' },
      { t: 34, text: 'Water falling off your skin', chant: '' },
      { t: 37, text: 'Swim, swim', chant: '' },
      { t: 39, text: 'I could spend a lifetime watching you', chant: '' },
      { t: 42, text: 'Swim, swim', chant: '' },
      { t: 44, text: 'This is how it all begins', chant: '' },
      { t: 47, text: 'Swim, swim', chant: '' },
      { t: 49, text: 'I just wanna dive, I just wanna dive', chant: '' },

      { t: 51, text: "Bad world, gone away and I still wake up in this mad world", chant: '' },
      { t: 55, text: "Name a place that I could breathe on this map, world", chant: '' },
      { t: 58, text: "Lookin' like a goody, goody in this bad world, bad world", chant: '' },
      { t: 61, text: "Don't know how to act, girl", chant: '' },
      { t: 62, text: "I'm in the deep, tell me where the hell you at, girl?", chant: '' },
      { t: 65, text: "Oh, you ain't even gotta love me bad, girl", chant: '' },
      { t: 68, text: "You know that I'm never holdin' back, girl", chant: '' },
      { t: 71, text: 'Yeah', chant: '' },

      { t: 72, text: "So easy, don't make it so hard", chant: '' },
      { t: 74, text: 'Nights like these, I just wanna get lost', chant: '' },
      { t: 76, text: 'Right here with the moon and the sharks', chant: '' },
      { t: 78, text: "I ain't gotta think 'bout a thing, baby, I just", chant: '' },

      { t: 82, text: 'Swim, swim', chant: '' },
      { t: 85, text: 'Water falling off your skin', chant: '' },
      { t: 89, text: 'Swim, swim', chant: '' },
      { t: 92, text: 'I could spend a lifetime watching you', chant: '' },
      { t: 95, text: 'Swim (Swim), swim (Swim)', chant: '' },
      { t: 97, text: 'This is how it all begins', chant: '' },
      { t: 98, text: 'Swim, swim', chant: '' },
      { t: 99, text: 'I just wanna dive, I just wanna dive', chant: '' },

      { t: 100, text: 'Water, water so deep, water so deep', chant: '' },
      { t: 103, text: "Take it off the ground, I ain't never gettin' cold feet", chant: '' },
      { t: 106, text: 'Yeah, you know me, yeah, you know me', chant: '' },
      { t: 109, text: "Sittin' on the shore, now I'm ready for the whole sea", chant: '' },
      { t: 112, text: "I can feel the high waves comin' (Yeah)", chant: '' },
      { t: 114, text: 'Why you run away? You can run in (Yeah)', chant: '' },
      { t: 117, text: "Salt on my tongue, she's stunnin' (Oh)", chant: '' },
      { t: 119, text: "You're the only place that I wanna be, yeah", chant: '' },

      { t: 134, text: 'Swim, swim', chant: '' },
      { t: 136, text: 'Water falling off your skin', chant: '' },
      { t: 138, text: 'Swim, swim', chant: '' },
      { t: 140, text: 'I could spend a lifetime watching you', chant: '' },
      { t: 142, text: 'Swim (Swim), swim (Swim)', chant: '' },
      { t: 144, text: 'This is how it all begins', chant: '' },
      { t: 146, text: 'Swim, swim', chant: '' },
      { t: 148, text: 'I just wanna dive, I just wanna dive', chant: '' },

      { t: 150, text: 'Splash (Splash), drift (Drift)', chant: '' },
      { t: 153, text: 'I make waves with my two fins (Two fins)', chant: '' },
      { t: 157, text: 'Splash (Woo), drip (Drip)', chant: '' },
      { t: 161, text: 'I just wanna take it across the line', chant: '' },
      { t: 163, text: "Under here, we don't chase the time", chant: '' },
      { t: 165, text: "Baby, everything can't be so sad (So sad)", chant: '' },
      { t: 167, text: 'Turn my face from the land', chant: '' },
      { t: 169, text: 'I just wanna dive, I just wanna dive', chant: '' },

      { t: 172, text: 'Swim, swim', chant: '' },
      { t: 175, text: 'Water falling off your skin', chant: '' },
      { t: 177, text: 'Swim, swim', chant: '' },
      { t: 180, text: 'I could spend a lifetime watching you', chant: '' },
      { t: 185, text: 'Swim (Swim), swim (Swim)', chant: '' },
      { t: 187, text: 'Let it all begin', chant: '' },
      { t: 189, text: 'Swim, swim', chant: '' },
      { t: 191, text: 'I just wanna dive, I just wanna dive', chant: '' },
    ],
  },
  {
    id: '2-0',
    title: '2.0',
    note: '',
    youtubeId: '_gyultVTesk',
    lyrics: [
      { t: 0, text: 'Add the first lyric line here…', chant: '' },
    ],
  },
  {
    id: 'hooligan',
    title: 'Hooligan',
    note: '',
    youtubeId: 'diBO0gMuTXo',
    lyrics: [
      { t: 0, text: 'Add the first lyric line here…', chant: '' },
    ],
  },
]
