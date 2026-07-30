// ============================================================================
// ARIRANG SETLIST — songs for the Fanchant Guide.
//
// Each song has a YouTube video ID and a list of lyric lines. Each line has:
//   t     → start time in SECONDS (when the line begins in the video)
//   text  → the lyric line
//   chant → a separate call-and-response note (optional; shown under the lyric)
//
// SING-ALONG WORDS: wrap the words ARMY sings along to in [[ ]] inside `text`.
// They render bold blue, but the line stays a full-size lyric. Examples:
//   text: 'No, [[not today]]'      → only "not today" is blue
//   text: '[[(Ha-ha-ha) Hooligan]]' → whole line blue, still full-size lyric
//
// CUSTOM ARMY CHANTS: words the crowd adds that aren't in the vocal. Wrap in
// {{ }} — they render bold purple. Example:
//   text: 'Mian jom neujeotji {{(ani)}}'  → only "(ani)" is purple
//
// REPLACED LYRICS: when the chant is sung INSTEAD of the words, strike the
// words with ~~ ~~ — they render muted + struck through. Example:
//   text: 'You know how I ~~do do do~~ [[(BTS! BTS! BTS!)]]'
//
// FAN PROJECTS: the part of a song where an ARMY fan project happens. Wrap in
// << >> — renders orange, and adds an "Orange: Fan Project" legend entry to
// that song only. Example:
//   text: '<<lift your banners here>>'
//
// CLIP A SECTION: add `start` / `end` (SECONDS) to a song to play only part of
// the video — e.g. `start: 66, end: 109` plays 1:06 → 1:49 and stops.
//
// SECTION NOTE: `{ divider: true, text: '…' }` shows a centered, muted note in
// the lyric list (not a lyric — never highlights, not clickable, needs no `t`).
//
// CROWD-ONLY SHOUTS: lines the members DON'T sing (member roll-calls, "BTS!
// BTS! BTS!"). Add `chantOnly: true` — renders small + de-emphasized with a
// "Chant" badge, so it doesn't compete with the lyrics you actually sing.
//   { t: 126, text: '[[BTS! BTS! BTS!]]', chant: '', chantOnly: true }
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
    lyrics: [
      { t: 31, text: '[[Swim, swim]]', chant: '' },
      { t: 34, text: 'Water falling off your skin', chant: '' },
      { t: 36, text: '[[Swim, swim]]', chant: '' },
      { t: 39, text: 'I could spend a lifetime watching you', chant: '' },

      { t: 42, text: '[[Swim, swim]]', chant: '' },
      { t: 44, text: 'This is how it all begins', chant: '' },
      { t: 47, text: '[[Swim, swim]] {{(B! T! S!)}}', chant: '' },
      { t: 49, text: 'I just wanna dive', chant: '' },
      { t: 50, text: 'I just wanna dive', chant: '' },

      { t: 51, text: 'Bad world', chant: '' },
      { t: 52, text: 'Gone away and I still wake up in this [[mad world]]', chant: '' },
      { t: 55, text: 'Name a place that I could breathe on this [[map, world]]', chant: '' },
      { t: 57, text: "Lookin’ like a goody goody in this [[bad world, bad world]]", chant: '' },
      { t: 61, text: "Don’t know how to [[act, girl]]", chant: '' },
      { t: 62, text: "I’m in the deep, tell me where the hell you [[at, girl?]]", chant: '' },
      { t: 65, text: "Oh you ain’t even gotta love me [[bad, girl]]", chant: '' },
      { t: 68, text: "You know that I’m never holdin’ [[back, girl]]", chant: '' },

      { t: 72, text: 'So easy', chant: '' },
      { t: 73, text: "Don’t make it so hard", chant: '' },
      { t: 74, text: 'Nights like these', chant: '' },
      { t: 75, text: 'I just wanna get lost', chant: '' },
      { t: 77, text: 'Right here with the moon and the sharks', chant: '' },
      { t: 79, text: "I ain’t gotta think ’bout a thing, baby, I just", chant: '' },

      { t: 82.5, text: '[[Swim, swim]]', chant: '' },
      { t: 84.5, text: 'Water falling off your skin', chant: '' },
      { t: 87.5, text: '[[Swim, swim]]', chant: '' },
      { t: 90.5, text: 'I could spend a lifetime watching you', chant: '' },

      { t: 93, text: '[[Swim, swim]]', chant: '' },
      { t: 95.5, text: 'This is how it all begins', chant: '' },
      { t: 98, text: '[[Swim, swim]]', chant: '' },
      { t: 100, text: 'I just wanna dive', chant: '' },
      { t: 101, text: 'I just wanna dive', chant: '' },

      { t: 102.5, text: 'Water water so deep', chant: '' },
      { t: 104, text: '[[Water so deep]]', chant: '' },

      { t: 105, text: 'Take it off the ground', chant: '' },
      { t: 106, text: "I ain’t never gettin’ cold feet", chant: '' },

      { t: 108, text: 'Yeah, you know me', chant: '' },
      { t: 109, text: '[[Yeah, you know me]]', chant: '' },
      { t: 110, text: "Sittin’ on the shore", chant: '' },
      { t: 111, text: "Now I’m ready for the whole sea", chant: '' },

      { t: 113, text: "I can feel the high waves comin’ {{(comin’)}}", chant: '' },
      { t: 115, text: 'Why you run away, you can run in {{(run in)}}', chant: '' },
      { t: 117.5, text: "Salt on my tongue, she’s stunnin’", chant: '' },
      { t: 120, text: "You’re the only place that I wanna be, yeah", chant: '' },

      { t: 132, text: '[[Swim, swim]]', chant: '' },
      { t: 135, text: 'Water falling off your skin', chant: '' },
      { t: 137.5, text: '[[Swim, swim]]', chant: '' },
      { t: 140, text: 'I could spend a lifetime watching you', chant: '' },

      { t: 143, text: '[[Swim, swim]]', chant: '' },
      { t: 145.5, text: 'This is how it all begins', chant: '' },
      { t: 147.5, text: '[[Swim, swim]]', chant: '' },
      { t: 150, text: 'I just wanna dive', chant: '' },
      { t: 151, text: 'I just wanna dive', chant: '' },

      { t: 153, text: 'Splash [[(Splash)]], drift [[(drift)]]', chant: '' },
      { t: 155, text: 'I make waves with my two fins', chant: '' },
      { t: 158, text: 'Splash, [[(Splash)]] drip [[(drip)]]', chant: '' },
      { t: 161, text: 'I just wanna take it across the line', chant: '' },
      { t: 163, text: "Under here we don’t chase the time", chant: '' },
      { t: 166, text: "Baby, everything can’t be so sad", chant: '' },
      { t: 168.5, text: 'Turn my face from the land', chant: '' },
      { t: 170, text: 'I just wanna dive', chant: '' },
      { t: 171, text: 'I just wanna dive', chant: '' },

      { t: 173, text: '[[Swim, swim]]', chant: '' },
      { t: 176, text: 'Water falling off your skin', chant: '' },
      { t: 178.5, text: '[[Swim, swim]]', chant: '' },
      { t: 181, text: 'I could spend a lifetime watching you', chant: '' },

      { t: 183, text: '[[Swim, swim]]', chant: '' },
      { t: 187, text: 'Let it all begin', chant: '' },
      { t: 189.5, text: '[[Swim, swim]]', chant: '' },
      { t: 191, text: 'I just wanna dive', chant: '' },
      { t: 192, text: 'I just wanna dive', chant: '' },
    ],
  },
  {
    id: '2-0',
    title: '2.0',
    note: '',
    youtubeId: '_gyultVTesk',
    lyrics: [
      { t: 52, text: 'Geurae bangtancheoreom geuge mareun swipji', chant: '' },
      { t: 56, text: 'Urin ttwimteul nuga maennal ttwieoneomni', chant: '' },
      { t: 59, text: 'Utgigineun hande sasil an utgiji', chant: '' },
      { t: 63, text: 'Simnyeoneun mallya eorim ban puneochi', chant: '' },

      { t: 66, text: '[[Stop, ride]]', chant: '' },

      { t: 69.3, text: '[[Yuh yuh yuh yuh, yeah]]', chant: '' },
      { t: 71.5, text: 'Pull up at your block', chant: '' },
      { t: 72.5, text: 'We gon’ [[knock knock knock knock, yeah]]', chant: '' },
      { t: 75.3, text: 'Had your little fun, fella?', chant: '' },
      { t: 77, text: '[[Pop pop pop pop, yeah]]', chant: '' },
      { t: 79, text: 'Came back for what’s mine, we don’t', chant: '' },

      { t: 81, text: '[[Stop, ride]]', chant: '' },

      { t: 83.3, text: 'You know how I [[do do do do do do]]', chant: '' },
      { t: 87, text: 'You know how I [[do do do do do]]', chant: '' },
      { t: 90, text: 'Bureul butyeo [[brand new]]', chant: '' },
      { t: 93, text: 'Butyeo [[brand new]]', chant: '' },
      { t: 94, text: 'Yeah we on that [[brand new]]', chant: '' },
      { t: 96, text: 'You know how we do', chant: '' },

      { t: 97, text: '[[Ay ay ay]]', chant: '' },

      { t: 99, text: 'Geurae, gibun machi brand new', chant: '' },
      { t: 100, text: 'Spec dareun step, ttwiji anneun step two', chant: '' },
      { t: 102, text: 'Two, two point, oh, updatedoen hu', chant: '' },
      { t: 104, text: 'Yeogijeogi tto han beon illaenne', chant: '' },
      { t: 105, text: '[[10 out of 10, 10]]', chant: '' },
      { t: 106, text: 'Ijen beoryeo, mot sseul pyepum', chant: '' },
      { t: 108, text: 'Sugeohareo ga', chant: '' },
      { t: 109, text: 'Yeoyu itge dasi sugohareo', chant: '' },

      { t: 110, text: '[[Stop, ride]]', chant: '' },

      { t: 114, text: '[[Yuh yuh yuh yuh, yeah]]', chant: '' },
      { t: 115.5, text: 'Pull up at your block', chant: '' },
      { t: 117, text: 'We gon’ [[knock knock knock knock, yeah]]', chant: '' },
      { t: 119.5, text: 'Had your little fun, fella?', chant: '' },
      { t: 121, text: '[[Pop pop pop pop, yeah]]', chant: '' },
      { t: 123, text: 'Came back for what’s mine, we don’t', chant: '' },

      { t: 125, text: '[[Stop, ride]]', chant: '' },

      { t: 128, text: 'You know how I [[do do do do do do]]', chant: '' },
      { t: 131.3, text: 'You know how I [[do do do do do]]', chant: '' },
      { t: 134.5, text: 'Bureul butyeo [[brand new]]', chant: '' },
      { t: 137, text: 'Butyeo [[brand new]]', chant: '' },
      { t: 138.5, text: 'Yeah we on that [[brand new]]', chant: '' },
      { t: 140.5, text: 'You know how we do', chant: '' },

      { t: 159, text: '[[Pop pop pop pop pop pop pop pop pop pop]]', chant: '' },
      { t: 163, text: 'Baby gettin’ too lit [[rah rah rah rah rah rah]]', chant: '' },
      { t: 167, text: 'Hit ’em up like pop {{(pop!)}}', chant: '' },
      { t: 168.5, text: 'Hit ’em with the truth like rah {{(rah!)}}', chant: '' },
      { t: 170.5, text: 'Time to pay your debt', chant: '' },
      { t: 172, text: 'Fear me or fear me not', chant: '' },
      { t: 173.5, text: 'Let it be', chant: '' },
      { t: 174.5, text: 'Let it bleed', chant: '' },
      { t: 175.5, text: 'Hit a lick', chant: '' },
      { t: 176.5, text: 'In a split', chant: '' },

      { t: 177, text: '[[Stop, ride]]', chant: '' },

      { t: 180.3, text: '[[Yuh yuh yuh yuh, yeah]]', chant: '' },
      { t: 182.3, text: 'Pull up at your block', chant: '' },
      { t: 183.5, text: 'We gon’ [[knock knock knock knock, yeah]]', chant: '' },
      { t: 186, text: 'Had your little fun, fella?', chant: '' },
      { t: 188, text: '[[Pop pop pop pop, yeah]]', chant: '' },
      { t: 189.5, text: 'Came back for what’s mine, we don’t', chant: '' },

      { t: 191.5, text: '[[Stop, ride]]', chant: '' },

      { t: 194.5, text: 'You know how I [[do do do do do do]]', chant: '' },
      { t: 198, text: 'You know how I [[do do do do do]]', chant: '' },
      { t: 201, text: 'Bureul butyeo [[brand new]]', chant: '' },
      { t: 203, text: 'Butyeo brand new', chant: '' },
      { t: 205, text: 'Yeah we on that [[brand new]]', chant: '' },
      { t: 207, text: 'You know how we do', chant: '' },

      { t: 209, text: 'You know how I ~~do do do do do do~~ [[(BTS! BTS! BTS!)]]', chant: '' },
      { t: 212.5, text: 'You know how I ~~do do do do do~~ [[(BTS! BTS! BTS!)]]', chant: '' },
      { t: 216, text: 'Bureul butyeo brand new', chant: '' },
      { t: 218, text: 'Butyeo brand new', chant: '' },
      { t: 219.5, text: 'Yeah we on that brand new', chant: '' },
      { t: 222.5, text: 'You know how we do', chant: '' },
    ],
  },
  {
    id: 'hooligan',
    title: 'Hooligan',
    note: '',
    youtubeId: 'Yv5ejF95E_A',
    lyrics: [
      { t: 77, text: '[[Kim Namjoon! Kim Seokjin! Min Yoongi! Jeong Hoseok! Park Jimin! Kim Taehyung! Jeon Jung kook! BTS!]]', chant: '', chantOnly: true },

      { t: 88, text: "Watch this, watch this beat goin' [[hooligan]]", chant: '' },
      { t: 91, text: "We pop out, we actin' a [[fool again]]", chant: '' },
      { t: 95, text: '[[(Ha-ha-ha-ha-ha-ha-ha-ha-ha-ha) Hooligan]]', chant: '' },
      { t: 99, text: "[[Watch this, watch this beat goin' hooligan]]", chant: '' },

      { t: 102, text: "Why this bassline slappin' so rude", chant: '' },
      { t: 106, text: 'Drop it lower than chopped and screwed', chant: '' },
      { t: 109, text: '[[(Ha-ha-ha-ha-ha-ha-ha-ha-ha-ha) Hooligan]]', chant: '' },
      { t: 113, text: "[[Watch this, watch this beat goin' hooligan]]", chant: '' },

      { t: 116, text: "Man, I'm 'bout to blow a fuse", chant: '' },
      { t: 118, text: 'Tongjebulleung, meori chum', chant: '' },
      { t: 119, text: 'Ttwieo michinnomin deut', chant: '' },
      { t: 121, text: 'Me everywhere, [[eolssu]]', chant: '' },
      { t: 123, text: 'Somebody move', chant: '' },
      { t: 124, text: 'Somebody move', chant: '' },
      { t: 125, text: 'Dadeul moyeo hana dul', chant: '' },
      { t: 126, text: 'I can never ever choose', chant: '' },
      { t: 128, text: "Every one o' you a muse", chant: '' },

      { t: 130, text: "Crowd lookin' like a campus", chant: '' },
      { t: 132, text: "Beat drop urin dancin'", chant: '' },

      { t: 134, text: "Watch this, watch this beat goin' [[hooligan]]", chant: '' },

      { t: 137, text: "We pop out, we actin' a [[fool again]]", chant: '' },
      { t: 141, text: '[[(Ha-ha-ha-ha-ha-ha-ha-ha-ha-ha) Hooligan]]', chant: '' },
      { t: 145, text: "[[Watch this, watch this beat goin' hooligan]]", chant: '' },

      { t: 148, text: "Why this bassline slappin' so rude", chant: '' },
      { t: 151, text: 'Drop it lower than chopped and screwed', chant: '' },
      { t: 155, text: '[[(Ha-ha-ha-ha-ha-ha-ha-ha-ha-ha) Hooligan]]', chant: '' },
      { t: 159, text: "[[Watch this, watch this beat goin' hooligan]]", chant: '' },

      { t: 162, text: 'I go cuckoo crazy loco save me', chant: '' },
      { t: 165, text: 'Like El Cucuy Guji mal an haedo aljana, woo', chant: '' },
      { t: 169, text: '[[Hooligan, like hooligan]]', chant: '' },
      { t: 171, text: '[[ttaeryeo buswo]] like hooligan', chant: '' },
      { t: 173, text: 'Sigan dwaesseuni jom bikyeo jom', chant: '' },
      { t: 174, text: 'All clear [[isang mu]]', chant: '' },

      { t: 176, text: 'Take you out', chant: '' },
      { t: 178, text: 'Take you out', chant: '' },
      { t: 180, text: "What's the future?", chant: '' },
      { t: 181, text: "Where's the now?", chant: '' },
      { t: 183, text: 'This is international', chant: '' },
      { t: 186, text: 'Make it unforgettable', chant: '' },

      { t: 191, text: "Watch this, watch this beat goin' [[hooligan]]", chant: '' },
      { t: 194, text: "We pop out, we actin' a [[fool again]]", chant: '' },
      { t: 198, text: '[[(Ha-ha-ha-ha-ha-ha-ha-ha-ha-ha) Hooligan]]', chant: '' },
      { t: 201, text: "[[Watch this, watch this beat goin' hooligan]]", chant: '' },

      { t: 205, text: 'We the mess, gonna get a bigger mop here {{(mop here)}}', chant: '' },
      { t: 209, text: 'This that K, gotta get a better pop here {{(pop here)}}', chant: '' },
      { t: 213, text: "You gon' hear this one playin' round the clock, yeah", chant: '' },
      { t: 216, text: 'Round the [[clock clock clock clock]]', chant: '' },

      { t: 219, text: "Why this bassline slappin' so rude", chant: '' },
      { t: 223, text: 'Drop it lower than chopped and screwed', chant: '' },
      { t: 226, text: '[[(Ha-ha-ha-ha-ha-ha-ha-ha-ha-ha) Hooligan]]', chant: '' },
      { t: 230, text: "[[Watch this, watch this beat goin' hooligan]]", chant: '' },

      { t: 233, text: "Why this bassline slappin' so rude", chant: '' },
      { t: 237, text: 'Drop it lower than chopped and screwed', chant: '' },
      { t: 241, text: '(Ha-ha-ha-ha-ha-ha-ha-ha-ha-ha) Hooligan', chant: '' },
      { t: 244, text: "Watch this, watch this beat goin' hooligan", chant: '' },
    ],
  },
  {
    id: 'dynamite',
    title: 'Dynamite',
    note: '',
    youtubeId: 'gdZLi9oWNZg',
    lyrics: [
      { t: 23, text: 'Cos ah ah I’m in the stars tonight {{(BTS)}}', chant: '' },
      { t: 27.5, text: 'So watch me bring the fire and set the night alight {{(BTS)}}', chant: '' },

      { t: 32.5, text: 'Shoes on get up in the morn', chant: '' },
      { t: 34.5, text: 'Cup of milk let’s rock and roll', chant: '' },
      { t: 37, text: '[[King Kong]] kick the drum rolling on like a rolling stone', chant: '' },
      { t: 41, text: '[[Sing song]] when I’m walking home', chant: '' },
      { t: 43, text: 'Jump up to the top LeBron', chant: '' },
      { t: 45, text: '[[Ding dong]] call me on my phone', chant: '' },
      { t: 47, text: 'Ice tea and a game of ping pong', chant: '' },

      { t: 49, text: 'This is getting heavy', chant: '' },
      { t: 51, text: 'Can you hear the bass boom, I’m ready [[(whoo-hoo)]]', chant: '' },
      { t: 53.5, text: 'Life is sweet as honey', chant: '' },
      { t: 55, text: 'Yeah this beat cha ching like money', chant: '' },

      { t: 57.5, text: '[[Disco overload]] I’m into that I’m good to go', chant: '' },
      { t: 61.5, text: '[[I’m diamond]] you know I glow up', chant: '' },
      { t: 64, text: 'Hey, so let’s go', chant: '' },

      { t: 65.7, text: 'Cos ah ah I’m in the stars tonight {{(BTS)}}', chant: '' },
      { t: 70, text: 'So watch me bring the fire and set the night alight {{(BTS)}}', chant: '' },
      { t: 74, text: 'Shining through the city with a little funk and soul', chant: '' },
      { t: 78, text: 'So I’mma light it up [[like dynamite]], woah', chant: '' },

      { t: 83, text: 'Bring a friend join the crowd', chant: '' },
      { t: 85, text: 'Whoever wanna come along', chant: '' },
      { t: 87, text: 'Word up talk the talk just move like we off the wall', chant: '' },
      { t: 91, text: 'Day or night the sky’s alight', chant: '' },
      { t: 93, text: 'So we dance to the break of dawn', chant: '' },
      { t: 96, text: 'Ladies and gentlemen,', chant: '' },
      { t: 97, text: 'I got the medicine so you should keep ya eyes on the ball, huh', chant: '' },

      { t: 100, text: 'This is getting heavy', chant: '' },
      { t: 101, text: 'Can you hear the bass boom, I’m ready [[(whoo-hoo)]]', chant: '' },
      { t: 104, text: 'Life is sweet as honey', chant: '' },
      { t: 106, text: 'Yeah this beat cha ching like money', chant: '' },

      { t: 108, text: '[[Disco overload]] I’m into that I’m good to go', chant: '' },
      { t: 112, text: '[[I’m diamond]] you know I glow up', chant: '' },
      { t: 115, text: 'Let’s go', chant: '' },

      { t: 116, text: 'Cos ah ah I’m in the stars tonight {{(BTS)]]', chant: '' },
      { t: 120, text: 'So watch me bring the fire and set the night alight {{(BTS)}}', chant: '' },
      { t: 125, text: 'Shining through the city with a little funk and soul', chant: '' },
      { t: 129, text: 'So I’mma light it up [[like dynamite]], woah', chant: '' },

      { t: 133.5, text: '[[Dynnnnnanana]], life is dynamite', chant: '' },
      { t: 137.5, text: '[[Dynnnnnanana]], life is dynamite', chant: '' },
      { t: 141.5, text: 'Shining through the city with a little funk and soul', chant: '' },
      { t: 146, text: 'So I’mma light it up [[like dynamite]], woah', chant: '' },

      { t: 150, text: '[[Dynnnnnanana eh]]', chant: '' },
      { t: 152.5, text: '[[Dynnnnnanana eh]]', chant: '' },
      { t: 154.3, text: '[[Dynnnnnanana eh]]', chant: '' },
      { t: 157, text: 'Light it up like dynamite', chant: '' },
      { t: 159, text: '[[Dynnnnnanana eh]]', chant: '' },
      { t: 161, text: '[[Dynnnnnanana eh]]', chant: '' },
      { t: 163, text: '[[Dynnnnnanana eh]]', chant: '' },
      { t: 165, text: 'Light it up like dynamite', chant: '' },

      { t: 167, text: 'Cos ah ah I’m in the stars tonight {{(BTS)}}', chant: '' },
      { t: 170, text: 'So watch me bring the fire and set the night alight {{(BTS)}}', chant: '' },
      { t: 175, text: 'Shining through the city with a little funk and soul', chant: '' },
      { t: 179, text: 'So I’mma light it up [[like dynamite]]', chant: '' },

      { t: 184, text: 'Cos ah ah I’m in the stars tonight {{(BTS)}}', chant: '' },
      { t: 188, text: 'So watch me bring the fire and set the night alight {{(BTS)}}', chant: '' },
      { t: 192, text: 'Shining through the city with a little funk and soul', chant: '' },
      { t: 196, text: 'So I’mma light it up [[like dynamite, woah]]', chant: '' },

      { t: 200.5, text: '[[Dynnnnnanana]], life is dynamite', chant: '' },
      { t: 205, text: '[[Dynnnnnanana]], life is dynamite', chant: '' },
      { t: 209, text: 'Shining through the city with a little funk and soul', chant: '' },
      { t: 213, text: 'So I’mma light it up [[like dynamite, woah]]', chant: '' },
    ],
  },
  {
    id: 'butter',
    title: 'Butter',
    note: '',
    youtubeId: 'WMweEpGlu_U',
    lyrics: [
      { t: 10, text: 'Smooth like butter', chant: '' },
      { t: 12, text: 'Like a criminal undercover', chant: '' },
      { t: 14, text: 'Gon’ pop like trouble', chant: '' },
      { t: 16, text: 'Breakin’ into your heart like that {{(BTS!)}}', chant: '' },

      { t: 19, text: 'Cool shade [[stunner]]', chant: '' },
      { t: 21, text: 'Yeah I owe it all to my mother', chant: '' },
      { t: 23, text: 'Hot like [[summer]]', chant: '' },
      { t: 25, text: 'Yeah I’m makin’ you sweat like that', chant: '' },

      { t: 27, text: 'Break it down', chant: '' },

      { t: 28, text: 'Oh when I look in the mirror', chant: '' },
      { t: 30, text: 'I’ll melt your heart into two', chant: '' },
      { t: 32.5, text: 'I got that superstar glow so', chant: '' },

      { t: 36, text: 'Do the boogie like', chant: '' },

      { t: 36.7, text: 'Side step right left to my beat {{(BTS! BTS!)}}', chant: '' },
      { t: 41, text: 'High like the moon rock with me baby', chant: '' },
      { t: 45, text: 'Know that I got that heat', chant: '' },
      { t: 47, text: 'Let me show you ‘cause talk is cheap', chant: '' },
      { t: 49.5, text: 'Side step right left to my beat', chant: '' },

      { t: 52, text: 'Get it, let it roll', chant: '' },

      { t: 54, text: 'Smooth like [[butter]]', chant: '' },
      { t: 56, text: 'Pull you in like no other', chant: '' },
      { t: 58, text: 'Don’t need no [[Usher]]', chant: '' },
      { t: 60, text: 'To remind me you got it bad', chant: '' },

      { t: 63, text: 'Ain’t no [[other]]', chant: '' },
      { t: 65, text: 'That can sweep you up like a robber', chant: '' },
      { t: 67, text: 'Straight up, [[I got ya]]', chant: '' },
      { t: 69, text: 'Makin’ you fall like that', chant: '' },

      { t: 71, text: 'Break it down', chant: '' },

      { t: 72, text: 'Oh when I look in the mirror', chant: '' },
      { t: 74, text: 'I’ll melt your heart into two', chant: '' },
      { t: 76, text: 'I got that superstar glow so', chant: '' },

      { t: 79, text: 'Do the boogie like', chant: '' },

      { t: 80, text: 'Side step right left to my beat {{(BTS! BTS!)}}', chant: '' },
      { t: 84.5, text: 'High like the moon rock with me baby', chant: '' },
      { t: 88.5, text: 'Know that I got that heat', chant: '' },
      { t: 90, text: 'Let me show you ‘cause talk is cheap', chant: '' },
      { t: 93, text: 'Side step right left to my beat {{(BTS! BTS!)}}', chant: '' },

      { t: 96, text: 'Get it, let it roll', chant: '' },
      { t: 97.5, text: '[[BTS! Kim Namjoon! BTS! Kim Seokjin! BTS! Min Yoongi! BTS! Jung Hoseok!]]', chant: '', chantOnly: true },
      { t: 105, text: 'Get it, let it roll', chant: '' },
      { t: 106.5, text: '[[BTS! Park Jimin! BTS! Kim Taehyung! BTS! Jeon Jungkook! BTS!]]', chant: '', chantOnly: true },
      { t: 113, text: 'Get it, let it roll', chant: '' },

      { t: 115, text: 'No ice on my wrist', chant: '' },
      { t: 116, text: 'I’m that n-ice guy', chant: '' },
      { t: 118, text: 'Got that right body and that right mind', chant: '' },
      { t: 120, text: 'Rollin’ up to party got the right vibe', chant: '' },
      { t: 122, text: 'Smooth like [[butter]]', chant: '' },
      { t: 123, text: 'Hate us [[love us]]', chant: '' },

      { t: 124, text: 'Fresh boy pull up and we lay low', chant: '' },
      { t: 126, text: 'All the playas get to movin’ when the bass low', chant: '' },
      { t: 128, text: 'Got ARMY right behind us when we say so {{(BTS!)}}', chant: '' },

      { t: 131.5, text: '[[Let’s go]]', chant: '' },

      { t: 132.5, text: 'Side step right left to my beat {{(BTS! BTS!)}}', chant: '' },
      { t: 137, text: 'High like the moon rock with me baby', chant: '' },
      { t: 141, text: 'Know that I got that heat', chant: '' },
      { t: 143, text: 'Let me show you ‘cause talk is cheap', chant: '' },
      { t: 145, text: 'Side step right left to my beat', chant: '' },

      { t: 148, text: 'Get it, let it roll', chant: '' },

      { t: 150, text: 'Smooth like [[(butter)]]', chant: '' },
      { t: 151, text: 'Cool shade [[(stunner)]]', chant: '' },
      { t: 152, text: 'And you know [[we don’t stop]]', chant: '' },
      { t: 154, text: 'Hot like [[(summer)]]', chant: '' },
      { t: 155.5, text: 'Ain’t no [[(bummer)]]', chant: '' },
      { t: 156.5, text: 'You be like [[oh my god]]', chant: '' },

      { t: 158.5, text: 'We gon’ make you rock and you say [[(yeah)]]', chant: '' },
      { t: 160.5, text: 'We gon’ make you bounce and you say [[(yeah)]]', chant: '' },
      { t: 163, text: 'Hotter?', chant: '' },
      { t: 163.5, text: 'Sweeter!', chant: '' },
      { t: 164, text: 'Cooler?', chant: '' },
      { t: 164.5, text: 'Butter! {{(BTS!)}}', chant: '' },
      { t: 166, text: 'Get it, [[let it roll]]', chant: '' },
    ],
  },
  {
    id: 'not-today',
    title: 'Not Today',
    note: '',
    youtubeId: '9DwzBICPhdM',
    lyrics: [
      { t: 74, text: 'No, [[not today]]', chant: '' },
      { t: 75, text: 'Eonjenga kkocheun jigetji', chant: '' },
      { t: 78, text: 'But no. [[Not today]]', chant: '' },
      { t: 80, text: 'Geu ttaega oneureun aniji', chant: '' },
      { t: 82, text: 'No no [[not today]]', chant: '' },
      { t: 84, text: 'Ajigeun jukgien', chant: '' },
      { t: 85, text: 'Too good day', chant: '' },
      { t: 87, text: 'No no [[not today]]', chant: '' },
      { t: 88, text: '[[No no no]] not today', chant: '' },

      { t: 91, text: 'Geurae urineun extra', chant: '' },
      { t: 93, text: 'But still part of this world', chant: '' },
      { t: 96, text: 'Extra + Ordinary', chant: '' },
      { t: 97, text: 'Geugeotto byeol geo anyeo', chant: '' },
      { t: 100, text: 'Oneureun jeoldae [[jukji mara]]', chant: '' },
      { t: 102, text: 'Bicheun eodumeul [[ttulko naga]]', chant: '' },
      { t: 104, text: 'Sae sesang neodo wonhae', chant: '' },
      { t: 106, text: 'Oh baby yes I want it', chant: '' },

      { t: 109, text: 'Naragal su eopseum ttwieo', chant: '' },
      { t: 111, text: 'Today we will survive', chant: '' },
      { t: 113, text: 'Ttwieogal su eopseum georeo', chant: '' },
      { t: 116, text: 'Today we will survive', chant: '' },
      { t: 118, text: 'Georeogal su eopseum gieo', chant: '' },
      { t: 120, text: 'Gieoseorado [[gear up]]', chant: '' },
      { t: 123, text: 'Gyeonwo chong! jojun! balsa!', chant: '' },
      { t: 126, text: '[[BTS! BTS! BTS!]]', chant: '', chantOnly: true },
      { t: 129, text: 'Not not today!', chant: '' },
      { t: 130.5, text: '[[BTS! BTS! BTS!]]', chant: '', chantOnly: true },
      { t: 133, text: 'Not not today!', chant: '' },
      { t: 135, text: '[[Hey]]', chant: '' },
      { t: 136, text: 'Baepsaedeura da [[hands up]]', chant: '' },
      { t: 137, text: '[[Hey]]', chant: '' },
      { t: 138, text: 'Chingudeura da [[hands up]]', chant: '' },
      { t: 139, text: '[[Hey]]', chant: '' },
      { t: 140, text: 'Nareul mitneundamyeon [[hands up]]', chant: '' },

      { t: 141, text: 'Chong! jojun! balsa!', chant: '' },

      { t: 143, text: 'Jukji ana mutji mara sori jilleo', chant: '' },
      { t: 146, text: '[[Not not today]]', chant: '' },
      { t: 148, text: 'Kkulchi mara ulji ana soneul deureo', chant: '' },
      { t: 151, text: '[[Not not today]]', chant: '' },
      { t: 152.5, text: 'Hey', chant: '' },
      { t: 153.5, text: '[[Not not today]]', chant: '' },
      { t: 154.5, text: 'Hey', chant: '' },
      { t: 155.5, text: '[[Not not today]]', chant: '' },
      { t: 156.5, text: 'Hey', chant: '' },
      { t: 157.5, text: '[[Not not today]]', chant: '' },

      { t: 159, text: 'Chong! jojun! balsa!', chant: '' },

      { t: 161, text: '[[Too hot]] seonggongeul doublin’', chant: '' },
      { t: 163, text: '[[Too hot]] chateureul deombeulling', chant: '' },
      { t: 165, text: '[[Too high]], we on trampoline', chant: '' },
      { t: 167, text: '[[Too high]] nuga jom meomchugil', chant: '' },

      { t: 169, text: 'Urin hal suga eopseotdanda shilpae', chant: '' },
      { t: 172, text: 'Seoroga seorol jeonbu mideotgie', chant: '' },
      { t: 174, text: 'What you say yeah [[(say yeah)]]', chant: '' },
      { t: 175, text: 'Not today yeah [[(day yeah)]]', chant: '' },
      { t: 176, text: 'Oneureun an jugeo [[jeoldae yeah]]', chant: '' },

      { t: 179, text: 'Neoye gyeote nareul mideo', chant: '' },
      { t: 181, text: 'Together we won’t die', chant: '' },
      { t: 183.5, text: 'Naye gyeote neoreul mideo', chant: '' },
      { t: 186, text: 'Together we won’t die', chant: '' },
      { t: 188, text: 'Hamkkeraneun mareul mideo', chant: '' },
      { t: 190, text: 'Bangtaniran geol mideo (mideo)', chant: '' },

      { t: 193, text: 'Gyeonwo chong! jojun! balsa!', chant: '' },
      { t: 196, text: '[[BTS! BTS! BTS!]]', chant: '', chantOnly: true },
      { t: 199, text: 'Not not today!', chant: '' },
      { t: 200.5, text: '[[BTS! BTS! BTS!]]', chant: '', chantOnly: true },
      { t: 203, text: 'Not not today!', chant: '' },
      { t: 205, text: '[[Hey]]', chant: '' },
      { t: 206, text: 'Baepsaedeura da [[hands up]]', chant: '' },
      { t: 207, text: '[[Hey]]', chant: '' },
      { t: 208, text: 'Chingudeura da [[hands up]]', chant: '' },
      { t: 209, text: '[[Hey]]', chant: '' },
      { t: 210, text: 'Nareul mitneundamyeon [[hands up]]', chant: '' },

      { t: 211, text: 'Chong! jojun! balsa!', chant: '' },

      { t: 213, text: 'Jukji ana mutji mara sori jilleo', chant: '' },
      { t: 216, text: '[[Not not today]]', chant: '' },
      { t: 218, text: 'Kkulchi mara ulji ana soneul deureo', chant: '' },
      { t: 221, text: '[[Not not today]]', chant: '' },
      { t: 222, text: 'Hey', chant: '' },
      { t: 223, text: '[[Not not today]]', chant: '' },
      { t: 224.5, text: 'Hey', chant: '' },
      { t: 225.5, text: '[[Not not today]]', chant: '' },
      { t: 226.5, text: 'Hey', chant: '' },
      { t: 227.5, text: '[[Not not today]]', chant: '' },

      { t: 228.5, text: 'Chong! jojun! balsa!', chant: '' },

      { t: 231, text: 'Throw it up! Throw it up!', chant: '' },
      { t: 232, text: 'Ni nun soge duryeoum ttawineun beoryeo', chant: '' },
      { t: 235.5, text: 'Break it up! Break it up!', chant: '' },
      { t: 236.5, text: 'Neol gaduneun yuricheonjang ttawin buswo', chant: '' },
      { t: 239.5, text: 'Turn it up! [[(turn it up!)]]', chant: '' },
      { t: 240.5, text: 'Burn it up! [[(burn it up!)]]', chant: '' },
      { t: 241.5, text: 'Seungniye nalkkaji [[(fight!)]]', chant: '' },
      { t: 244, text: 'Mureup [[kkulchi ma]] muneojijima', chant: '' },
      { t: 246, text: 'That’s (do) not today!', chant: '' },
      { t: 248, text: '[[BTS! BTS! BTS!]]', chant: '', chantOnly: true },
      { t: 251, text: 'Not not today!', chant: '' },
      { t: 252.5, text: '[[BTS! BTS! BTS!]]', chant: '', chantOnly: true },
      { t: 255.5, text: 'Not not today!', chant: '' },
      { t: 257, text: '[[Hey]]', chant: '' },
      { t: 258, text: 'Baepsaedeura da [[hands up]]', chant: '' },
      { t: 259.3, text: '[[Hey]]', chant: '' },
      { t: 260, text: 'Chingudeura da [[hands up]]', chant: '' },
      { t: 261.3, text: '[[Hey]]', chant: '' },
      { t: 262, text: 'Nareul mitneundamyeon [[hands up]]', chant: '' },

      { t: 263.5, text: 'Chong! jojun! balsa!', chant: '' },

      { t: 265.5, text: 'Jukji ana mutji mara sori jilleo', chant: '' },
      { t: 269, text: '[[Not not today]]', chant: '' },
      { t: 270, text: 'Kkulchi mara ulji ana soneul deureo', chant: '' },
      { t: 273, text: '[[Not not today]]', chant: '' },
      { t: 274.5, text: 'Hey', chant: '' },
      { t: 275.5, text: '[[Not not today]]', chant: '' },
      { t: 276.5, text: 'Hey', chant: '' },
      { t: 277.5, text: '[[Not not today]]', chant: '' },
      { t: 278.7, text: 'Hey', chant: '' },
      { t: 279.7, text: '[[Not not today]]', chant: '' },

      { t: 281, text: 'Chong! jojun! balsa!', chant: '' },
    ],
  },
  {
    id: 'mic-drop',
    title: 'Mic Drop',
    note: '(ARIRANG Live version only uses one set of the name fanchant instead of two)',
    youtubeId: '8umu4kqe9ek',
    lyrics: [
      { t: 4, text: '[[Kim Namjoon! Kim Seokjin! Min Yoongi! Jeong Hoseok!]]', chant: '', chantOnly: true },
      { t: 8, text: '[[Park Jimin! Kim Taehyung! Jeon Jung kook! BTS!]]', chant: '', chantOnly: true },
      { t: 15, text: '[[Kim Namjoon! Kim Seokjin! Min Yoongi! Jeong Hoseok!]]', chant: '', chantOnly: true },
      { t: 19, text: '[[Park Jimin! Kim Taehyung! Jeon Jung kook! BTS!]]', chant: '', chantOnly: true },

      { t: 27, text: 'Yeah, nuga nae sujeo deoreobdae', chant: '' },
      { t: 29, text: 'I don\u2019t care maikeu jabeum', chant: '' },
      { t: 31, text: 'Geumsujeo yeoreos pae', chant: '' },
      { t: 32, text: 'Beoreoghae jal mos igeun geosdeul', chant: '' },
      { t: 34, text: 'Seutekki yeoreo gae', chant: '' },
      { t: 35, text: 'Geodeubhaeseo ssibeojulge seutaui jeonyeoge', chant: '' },
      { t: 38, text: 'World Business [[bang bang]] haegsim', chant: '' },
      { t: 41, text: 'Seoboe ilsunwi [[clap clap]] maejin', chant: '' },
      { t: 44, text: 'Manhji anhji i class gachil mankkig', chant: '' },
      { t: 46, text: 'Joheun hyanggie agchwin banchig', chant: '' },
      { t: 48, text: 'Mic mic bungee', chant: '' },

      { t: 49, text: 'Mic mic [[bungee]]', chant: '' },
      { t: 51, text: 'Bright light [[jeonjin]]', chant: '' },
      { t: 52, text: 'Manghal geo gatassgessjiman I\u2019m fine sorry', chant: '' },
      { t: 55, text: 'Mianhae [[Billboard]]', chant: '' },
      { t: 56, text: 'Mianhae [[worldwide]]', chant: '' },
      { t: 58, text: 'Adeuri neom jalnagaseo [[mianhae eomma]]', chant: '' },
      { t: 60, text: 'Daesinhaejwo niga moshan hyodo', chant: '' },
      { t: 63, text: 'Uri konseoteu jeoldae eobseo podo', chant: '' },
      { t: 66, text: '[[I do it I do it]] neon maseobsneun rattattui', chant: '' },
      { t: 69, text: 'Hog baega apeudamyeon gosohae', chant: '' },
      { t: 71, text: '[[Sue it]]', chant: '' },

      { t: 72, text: 'Did you see my bag [[(bag)]]', chant: '' },
      { t: 73, text: 'Did you see my bag [[(bag)]]', chant: '' },
      { t: 75, text: 'Teuropideullo baegi gadeughae [[(gadeughae)]]', chant: '' },
      { t: 77, text: 'How you think bout that [[(that)]]', chant: '' },
      { t: 79, text: 'How you think bout that [[(that)]]', chant: '' },
      { t: 80, text: 'Haterdeureun beolsseo hageul tte [[(hageul tte)]]', chant: '' },

      { t: 83, text: 'Imi hwanggeumbich hwanggeumbich naui seonggong [[(seonggong)]]', chant: '' },
      { t: 85, text: 'I\u2019m so firin\u2019 firin\u2019 seonghwabongsong (bongsong)', chant: '' },
      { t: 88, text: 'Neoneun hwanggeubhi hwanggeubhi domang syongsyong [[(syongsyong)]]', chant: '' },
      { t: 91, text: 'How you dare', chant: '' },
      { t: 92, text: 'How you dare', chant: '' },
      { t: 93, text: 'How you dare', chant: '' },

      { t: 94, text: 'Nae sone teuropi a neomu manha', chant: '' },
      { t: 97, text: 'Neomu heavy nae du soni mojalla', chant: '' },
      { t: 100, text: '[[MIC Drop]]', chant: '' },
      { t: 101, text: '[[MIC Drop]]', chant: '' },
      { t: 103, text: '[[Bal bal]] josim', chant: '' },
      { t: 104, text: 'Neone [[mal mal]] josim', chant: '' },

      { t: 105, text: 'Lodi dodi a neomu bappa', chant: '' },
      { t: 108, text: 'Neomu busy nae onmomi mojalla', chant: '' },
      { t: 111, text: '[[MIC Drop]]', chant: '' },
      { t: 113, text: '[[MIC Drop]]', chant: '' },
      { t: 114, text: '[[Bal bal]] josim', chant: '' },
      { t: 115, text: 'Neone [[mal mal]] josim', chant: '' },

      { t: 117, text: 'Igeo wanjeon ne geulja [[ja]]', chant: '' },
      { t: 118, text: 'Sapilgwijeong ah [[ah]]', chant: '' },
      { t: 120, text: 'Once upon a time', chant: '' },
      { t: 121, text: 'Isobuhwa fly', chant: '' },
      { t: 122, text: 'Ni hyeonsireul bwara [[ssae ssaemtong]]', chant: '' },
      { t: 125, text: 'Jigeum jugeodo nan gae[[haengbog]]', chant: '' },
      { t: 129, text: 'Ibeonen eoneu nara ga', chant: '' },
      { t: 132, text: 'Bihaenggi myeoch siganeul ta', chant: '' },
      { t: 134, text: 'Yeah I\u2019m on the mountain', chant: '' },
      { t: 135, text: 'Yeah I\u2019m on the bay', chant: '' },
      { t: 137, text: 'Mudaeeseo taljin', chant: '' },
      { t: 138, text: '[[MIC Drop baam]]', chant: '' },

      { t: 140, text: 'Did you see my bag [[(bag)]]', chant: '' },
      { t: 141, text: 'Did you see my bag [[(bag)]]', chant: '' },
      { t: 142, text: 'Teuropideullo baegi gadeughae [[(gadeughae)]]', chant: '' },
      { t: 145, text: 'How you think bout that [[(that)]]', chant: '' },
      { t: 147, text: 'How you think bout that [[(that)]]', chant: '' },
      { t: 148, text: 'Haterdeureun beolsseo hageul tte [[(hageul tte)]]', chant: '' },

      { t: 151, text: 'Imi hwanggeumbich hwanggeumbich naui seonggong [[(seonggong)]]', chant: '' },
      { t: 153, text: 'I\u2019m so firin\u2019 firin\u2019 seonghwabongsong (bongsong)', chant: '' },
      { t: 156, text: 'Neoneun hwanggeubhi hwanggeubhi domang syongsyong [[(syongsyong)]]', chant: '' },
      { t: 159, text: 'How you dare', chant: '' },
      { t: 160, text: 'How you dare', chant: '' },
      { t: 161, text: 'How you dare', chant: '' },

      { t: 162, text: 'Nae sone teuropi a neomu manha', chant: '' },
      { t: 164, text: 'Neomu heavy nae du soni mojalla', chant: '' },
      { t: 168, text: '[[MIC Drop]]', chant: '' },
      { t: 169, text: '[[MIC Drop]]', chant: '' },
      { t: 170, text: '[[Bal bal]] josim', chant: '' },
      { t: 171, text: 'Neone [[mal mal]] josim', chant: '' },

      { t: 173, text: 'Lodi dodi a neomu bappa', chant: '' },
      { t: 176, text: 'Neomu busy nae onmomi mojalla', chant: '' },
      { t: 179, text: '[[MIC Drop]]', chant: '' },
      { t: 180, text: '[[MIC Drop]]', chant: '' },
      { t: 182, text: '[[Bal bal]] josim', chant: '' },
      { t: 183, text: 'Neone [[mal mal]] josim', chant: '' },

      { t: 186, text: 'Haters gon\u2019 hate', chant: '' },
      { t: 189, text: 'Players gon\u2019 play', chant: '' },
      { t: 192, text: 'Live a life man', chant: '' },
      { t: 195, text: 'Good luck', chant: '' },

      { t: 196, text: 'Deo bol il eobseo [[majimag insaya]]', chant: '' },
      { t: 202, text: 'Hal maldo eobseo [[sagwado haji ma]]', chant: '' },
      { t: 207, text: 'Deo bol il eobseo [[majimag insaya]]', chant: '' },
      { t: 213, text: 'Hal maldo eobseo [[sagwado haji ma]]', chant: '' },

      { t: 218, text: '[[Jal bwa]] neon geu kkol naji', chant: '' },
      { t: 221, text: 'Urin [[tag sswa]] machi kollaji', chant: '' },
      { t: 224, text: 'Neoui [[gagmag]] kkamjjag nollaji', chant: '' },
      { t: 227, text: 'Kkwae kkwae [[pomnaji]] po po [[pomnaji]]', chant: '' },
    ],
  },
  {
    id: 'normal',
    title: 'NORMAL',
    note: '',
    youtubeId: '6mguUpAdBbg',
    lyrics: [
      { t: 5, text: '[[Kim Namjoon! Kim Seokjin! Min Yoongi! Jeong Hoseok! Park Jimin! Kim Taehyung! Jeon Jung kook! BTS!]]', chant: '', chantOnly: true },
      { t: 17, text: 'Kerosene, dopamine, chemical induced', chant: '' },
      { t: 20, text: 'Fantasy and fame, yeah the things we choose', chant: '' },
      { t: 24, text: 'Show me hate, show me love, [[make me bulletproof]]', chant: '' },
      { t: 27, text: 'Yeah, we call this shit normal', chant: '' },

      { t: 30, text: "Run away, out of sight, don't know what I want", chant: '' },
      { t: 34, text: 'Wish I had a minute just to turn me off', chant: '' },
      { t: 37, text: 'Kerosene, dopamine, what I gotta do?', chant: '' },
      { t: 39, text: 'Yeah, we call this shit normal', chant: '' },

      { t: 43, text: "Heavy is the head when you chasin' true", chant: '' },
      { t: 46, text: 'Will you color me red?', chant: '' },
      { t: 48, text: 'Will you color me blue?', chant: '' },
      { t: 49, text: "Two sides of a coin, and they both ain't true", chant: '' },
      { t: 52, text: 'Is it different for me?', chant: '' },
      { t: 54, text: 'Is it different for you?', chant: '' },

      { t: 57, text: "Got me feelin' things unusual, and I live them all", chant: '' },
      { t: 63, text: 'Got me and my feelings up on this wall', chant: '' },
      { t: 66, text: 'And my knees', chant: '' },

      { t: 69, text: 'Kerosene, dopamine, chemical induced', chant: '' },
      { t: 72, text: 'Fantasy and fame, yeah the things we choose', chant: '' },
      { t: 75, text: 'Show me hate, show me love, [[make me bulletproof]]', chant: '' },

      { t: 78, text: 'Yeah, we call this shit normal', chant: '' },

      { t: 81, text: "Run away, out of sight, don't know what I want", chant: '' },
      { t: 85, text: 'Wish I had a minute just to turn me off', chant: '' },
      { t: 88, text: 'Kerosene, dopamine, what I gotta do?', chant: '' },
      { t: 90.5, text: 'Yeah, we call this shit normal', chant: '' },

      { t: 94, text: "How I'm 'posed to feel?", chant: '' },
      { t: 96, text: 'Used to think that I was built with a heart made of steel', chant: '' },
      { t: 99, text: "Now I understand the truth, some pain don't heal", chant: '' },
      { t: 102, text: "If everything's just happy, that ain't real", chant: '' },

      { t: 106.5, text: 'I breathe everything out like a thousand times', chant: '' },
      { t: 109.5, text: 'Normal and special, they are just some lines', chant: '' },
      { t: 112.5, text: 'One deep sigh, then it slips away, fades away', chant: '' },
      { t: 116.3, text: 'What I try to keep never want to stay', chant: '' },

      { t: 119, text: "Runaway, pushin' me, pullin' me", chant: '' },
      { t: 121.5, text: 'Said you wanted all of me', chant: '' },
      { t: 123, text: 'But what is even all of me?', chant: '' },
      { t: 125.5, text: "Suddenly, part of me is hauntin' me", chant: '' },
      { t: 128, text: "Heard the things they callin' me", chant: '' },
      { t: 129, text: 'What the hell you want from me?', chant: '' },

      { t: 133, text: "Got me feelin' things unusual, and I live them all", chant: '' },
      { t: 140, text: 'Got me and my feelings up on this wall', chant: '' },

      { t: 143, text: 'And my knees', chant: '' },

      { t: 145.5, text: 'Kerosene, dopamine, chemical induced', chant: '' },
      { t: 148.5, text: 'Fantasy and fame, yeah the things we choose', chant: '' },
      { t: 151.5, text: 'Show me hate, show me love, [[make me bulletproof]]', chant: '' },
      { t: 155, text: 'Yeah, we call this shit normal', chant: '' },

      { t: 158, text: "Run away, out of sight, don't know what I want", chant: '' },
      { t: 161, text: 'Wish I had a minute just to turn me off', chant: '' },
      { t: 165, text: 'Kerosene, dopamine, what I gotta do?', chant: '' },
      { t: 167, text: 'Yeah, we call this shit normal', chant: '' },

      { t: 171, text: 'No we, no we, no we call this shit normal', chant: '' },
      { t: 174, text: 'No we, no we, no we call this shit normal, yeah', chant: '' },
      { t: 178, text: 'No we, no we, no we call this shit normal', chant: '' },
    ],
  },
  {
    id: 'fya',
    title: 'FYA',
    note: '',
    youtubeId: 'QWDayFgPDjQ',
    lyrics: [
      { t: 7, text: '[[Kim Namjoon! Kim Seokjin! Min Yoongi! Jeong Hoseok! Park Jimin! Kim Taehyung! Jeon Jung kook! BTS!]]', chant: '', chantOnly: true },

      { t: 15, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 17, text: "Everything big it's fire {{(fire)}}", chant: '' },
      { t: 19, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 21, text: "Everything big it's fire {{(fire)}}", chant: '' },
      { t: 22.5, text: 'She wanna dance on fire {{(fire)}}', chant: '' },
      { t: 24.5, text: 'Everything gas its fire', chant: '' },

      { t: 30, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 32, text: "Everything big it's fire {{(fire)}}", chant: '' },
      { t: 34, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 35.5, text: "Everything big it's fire {{(fire)}}", chant: '' },
      { t: 37.5, text: 'She wanna dance on fire {{(fire)}}', chant: '' },
      { t: 39.5, text: 'Everything gas its fire {{(fire)}}', chant: '' },
      { t: 41, text: "Don't stand too close, too close to fire", chant: '' },

      { t: 45, text: 'Gimme that gasoline', chant: '' },
      { t: 46.5, text: 'Gimmie that make me fiend', chant: '' },
      { t: 48.5, text: 'Gimmie that make me sweat', chant: '' },
      { t: 50.5, text: "Somethin' I can't forget", chant: '' },

      { t: 52, text: "Burnin' out with my slime", chant: '' },
      { t: 54, text: 'We in a flame, go wild', chant: '' },
      { t: 56, text: "It's 200 degrees", chant: '' },

      { t: 59, text: 'Club go psycho', chant: '' },
      { t: 61, text: 'Might take you viral', chant: '' },
      { t: 63, text: 'I go full thriller tonight', chant: '' },

      { t: 67, text: 'Club go crazy', chant: '' },
      { t: 68, text: 'Like Britney, baby', chant: '' },
      { t: 70, text: 'Hit me with it one more time', chant: '' },

      { t: 75, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 76, text: "Everything big it's fire {{(fire)}}", chant: '' },
      { t: 78, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 80, text: "Everything big it's fire {{(fire)}}", chant: '' },
      { t: 82, text: 'She wanna dance on fire {{(fire)}}', chant: '' },
      { t: 84, text: 'Everything gas its fire {{(fire)}}', chant: '' },
      { t: 85.5, text: "Don't stand too close, too close to fire", chant: '' },

      { t: 97, text: "[[Tteugeowo, tteugeowo]] vibin' [[wanjeon hattteu tteugeowo]]", chant: '' },
      { t: 100.5, text: '[[Museowo, museowo]] hangyeouredo eongtteu pillyo eopseo', chant: '' },
      { t: 104, text: "We ragin', hwak dora chumeul chwo,", chant: '' },
      { t: 105.5, text: 'jjuppyeotjjuppyeoseun goerowo', chant: '' },
      { t: 107.5, text: 'Mwol gominhae? gyang kkieodeureo beonji ttwieodeureo', chant: '' },

      { t: 109.5, text: '(We go right now)', chant: '' },

      { t: 111.5, text: 'Club go psycho', chant: '' },
      { t: 113, text: 'Might take you viral', chant: '' },
      { t: 115, text: 'I go full thriller tonight', chant: '' },

      { t: 119, text: 'Club go crazy', chant: '' },
      { t: 120.5, text: 'Like Britney, baby', chant: '' },
      { t: 122.5, text: 'Hit me with it one more time', chant: '' },

      { t: 127, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 129, text: "Everything big it's fire {{(fire)}}", chant: '' },
      { t: 130.5, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 132.5, text: "Everything big it's fire {{(fire)}}", chant: '' },
      { t: 134, text: 'She wanna dance on fire {{(fire)}}', chant: '' },
      { t: 136, text: 'Everything gas its fire {{(fire)}}', chant: '' },
      { t: 137.5, text: "Don't stand too close, too close to fire", chant: '' },

      { t: 156, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 158, text: "Everything big it's fire {{(fire)}}", chant: '' },
      { t: 160, text: "Everything lit it's fire {{(fire)}}", chant: '' },
      { t: 162, text: "Everything big it's fire {{(fire)}}", chant: '' },

      { t: 164, text: 'She wanna dance on fire {{(fire)}}', chant: '' },
      { t: 166, text: 'Everything gas its fire {{(fire)}}', chant: '' },
      { t: 167, text: "Don't stand too close, too close to fire", chant: '' },
    ],
  },
  {
    id: 'into-the-sun',
    title: 'Into the Sun',
    note: '',
    youtubeId: 'N_Id6KNQtLw',
    lyrics: [
      { t: 10, text: 'Baby, you remind me', chant: '' },
      { t: 15, text: 'I want someone like you', chant: '' },
      { t: 20, text: 'Fires are never dying', chant: '' },
      { t: 25, text: 'I want someone like you', chant: '' },

      { t: 29, text: 'Nobody knows me, honey', chant: '' },
      { t: 34, text: 'No one like you', chant: '' },
      { t: 39.5, text: 'If you wanna go there', chant: '' },
      { t: 44.5, text: "I'm ready to be with you", chant: '' },

      { t: 49, text: '[[You call]]', chant: '' },
      { t: 51.5, text: '[[I run]]', chant: '' },
      { t: 54, text: '[[Dark days]]', chant: '' },
      { t: 56.5, text: '[[And find the sun]]', chant: '' },

      { t: 59, text: "[[I don't care]]", chant: '' },
      { t: 61.5, text: '[[How far]]', chant: '' },
      { t: 64, text: '[[Just wait]]', chant: '' },

      { t: 67.5, text: '[[Dawn]]', chant: '' },

      { t: 69, text: 'Baby, what you want', chant: '' },
      { t: 70, text: 'Baby, what you need', chant: '' },
      { t: 71, text: 'Tell me how you feel', chant: '' },
      { t: 71.7, text: "Every night I'm thinkin' of", chant: '' },
      { t: 73.5, text: 'Hae jil ttaeui baram', chant: '' },
      { t: 74.5, text: 'Hae tteul ttaeui ondo', chant: '' },
      { t: 76, text: 'Nega neukkyeoya hal', chant: '' },
      { t: 77, text: 'Jeonyeokbuteo achimui byeot', chant: '' },
      { t: 78, text: 'Ileun neoui geot jom ireun eodumui munteok', chant: '' },
      { t: 82, text: 'Dongi teul ttaekkaji nan', chant: '' },
      { t: 84.5, text: 'Neol jikimyeo into the sun', chant: '' },

      { t: 87.5, text: '24, 24/7 feel like 24', chant: '' },
      { t: 92.5, text: 'Taeyangeul hyanghae ttwieodo', chant: '' },
      { t: 94.5, text: 'Gakkawojijin anado', chant: '' },
      { t: 97.5, text: "Don't be afraid gieokae", chant: '' },
      { t: 99, text: 'Geujeo jamsippunin geol', chant: '' },
      { t: 101, text: 'Eoduun bameul jina', chant: '' },
      { t: 102, text: 'Achimi oneun geol majeumyeo', chant: '' },
      { t: 103, text: 'Nuneul tteo into the sun', chant: '' },

      { t: 107.5, text: '[[You call]]', chant: '' },
      { t: 110, text: '[[I run]]', chant: '' },
      { t: 112.5, text: '[[Dark days]]', chant: '' },
      { t: 114.5, text: '[[And find the sun]]', chant: '' },

      { t: 117, text: "[[I don't care]]", chant: '' },
      { t: 119, text: '[[How far]]', chant: '' },
      { t: 122, text: '[[Just wait]]', chant: '' },

      { t: 126, text: '[[Dawn]]', chant: '' },

      { t: 128, text: 'Gaewa neukdaeui sigan', chant: '' },
      { t: 130, text: 'Buseojin jimseungdeurui nachimban', chant: '' },
      { t: 132, text: 'Urideurui pinan', chant: '' },
      { t: 134, text: 'Sorandeulgwa miryeon ap', chant: '' },
      { t: 135, text: 'Sum swimyeo banhanghaneun ingan', chant: '' },
      { t: 137, text: '[[Nan jibe gagopa]]', chant: '' },
      { t: 139, text: 'Nega inneun got', chant: '' },
      { t: 140, text: 'Puri tteugo', chant: '' },
      { t: 141, text: 'Byeol jineun got', chant: '' },
      { t: 142, text: 'Bureul geonnejwo i gireum sok', chant: '' },
      { t: 145, text: 'Neoneun meotjigo', chant: '' },
      { t: 146, text: 'Dareun ama tteuji aneul geoya oneul', chant: '' },

      { t: 149, text: 'And if we run out of time', chant: '' },
      { t: 152, text: "I'll chase the feeling", chant: '' },
      { t: 155, text: 'Never too far behind', chant: '' },

      { t: 158.5, text: '[[You call]]', chant: '' },
      { t: 161.5, text: '[[I run]] (Never behind)', chant: '' },
      { t: 163.5, text: '[[Dark days]]', chant: '' },
      { t: 165.5, text: '[[And find the sun]] (Never behind)', chant: '' },

      { t: 167.5, text: "[[I don't care]]", chant: '' },
      { t: 170.5, text: '[[How far]] (Never behind)', chant: '' },
      { t: 173.5, text: '[[Just wait]]', chant: '' },

      { t: 177, text: '[[Dawn]]', chant: '' },

      { t: 180, text: "[[I'll follow you]]", chant: '' },
      { t: 182.5, text: '[[Into the sun]]', chant: '' },
      { t: 185.5, text: '[[Into the sun]]', chant: '' },
      { t: 187.5, text: '[[Into the sun]]', chant: '' },

      { t: 189, text: "[[I'll follow you]]", chant: '' },
      { t: 192.5, text: '[[Into the sun]]', chant: '' },
      { t: 194.5, text: '[[Into the sun]]', chant: '' },
      { t: 197.5, text: '[[Into the sun]]', chant: '' },

      { t: 199, text: "[[I'll follow you]]", chant: '' },
      { t: 202.5, text: '[[Into the sun]] (Ah~)', chant: '' },
      { t: 204.5, text: '[[Into the sun]]', chant: '' },
      { t: 207.5, text: '[[Into the sun]]', chant: '' },

      { t: 209, text: "[[I'll follow you]] (Into the sun)", chant: '' },
      { t: 212.5, text: '[[Into the sun]]', chant: '' },
      { t: 214.5, text: '[[Into the sun]]', chant: '' },
      { t: 216.5, text: '[[Into the sun]]', chant: '' },
    ],
  },
  {
    id: 'please',
    title: 'Please',
    note: '',
    youtubeId: '3N1k6ir55-Y',
    lyrics: [
      { t: 5, text: 'If you wanna, if you wanna', chant: '' },
      { t: 7, text: "I'll do that thing for ya", chant: '' },
      { t: 8, text: 'If you wanna, if you wanna', chant: '' },

      { t: 10, text: '[[Baby, oh please]]', chant: '' },
      { t: 12, text: 'Sesangi uril gallanoeul ttae', chant: '' },
      { t: 15, text: '[[Baby, oh please]]', chant: '' },
      { t: 18, text: 'Han georeum deo dagaseolge', chant: '' },

      { t: 21, text: "I'm on my knees", chant: '' },
      { t: 24, text: 'Hamkkehae jwo naui worst day', chant: '' },
      { t: 26, text: 'Neol deo sege aneulge right now', chant: '' },
      { t: 29, text: "Even hell, I'm down", chant: '' },
      { t: 30, text: 'All I want is you', chant: '' },

      { t: 33, text: 'Nega inneun gosiramyeon na ttaragari', chant: '' },
      { t: 36, text: 'Gasibatgiljjeumeun na swipge jeuryeobalji', chant: '' },
      { t: 39, text: 'Sesangeun mallya hangsang uri saireul makji', chant: '' },
      { t: 42, text: 'Gyeolgugen urin dolgo doraseo jejari', chant: '' },

      { t: 44, text: 'You and me just all day, all night', chant: '' },
      { t: 47, text: 'Hug me from the front, back, left, right', chant: '' },
      { t: 50, text: 'I need you like oh me, oh my', chant: '' },
      { t: 53, text: 'Oh you got me', chant: '' },
      { t: 54, text: 'Oh you got me like', chant: '' },

      { t: 55, text: '[[Baby, oh please]]', chant: '' },
      { t: 58, text: 'Sesangi uril gallanoeul ttae', chant: '' },
      { t: 61, text: '[[Baby, oh please]]', chant: '' },
      { t: 63, text: 'Han georeum deo dagaseolge', chant: '' },

      { t: 66, text: "I'm on my knees", chant: '' },
      { t: 69, text: 'Hamkkehae jwo naui worst day', chant: '' },
      { t: 72, text: 'Neol deo sege aneulge right now', chant: '' },
      { t: 74, text: "Even hell, I'm down", chant: '' },
      { t: 76, text: 'All I want is you', chant: '' },

      { t: 79, text: '[[If you wanna, if you wanna]]', chant: '' },
      { t: 80.5, text: "I'll do that thing for ya", chant: '' },

      { t: 81.5, text: '[[If you wanna, if you wanna]]', chant: '' },
      { t: 83.5, text: "I'll do a thing for ya", chant: '' },

      { t: 84.5, text: '[[If you wanna, if you wanna]]', chant: '' },
      { t: 86, text: "I'll do that thing for ya", chant: '' },

      { t: 87, text: '[[If you wanna, if you wanna]]', chant: '' },
      { t: 89, text: "I'll do a thing", chant: '' },

      { t: 90, text: 'Na, gippeumeul neukkyeotdamyeon neoege ojik', chant: '' },
      { t: 92.5, text: 'Bwa, nae jani neomchini Come and get a sip', chant: '' },
      { t: 95.5, text: 'Yeah yeomwonhamyeo yeongwonhi', chant: '' },
      { t: 97, text: 'Seoroui yeonghoni', chant: '' },
      { t: 98.5, text: 'Geudae ane gidaellae', chant: '' },
      { t: 99.5, text: 'Baby, baby, please', chant: '' },

      { t: 101, text: 'You and me just all day, all night', chant: '' },
      { t: 103.5, text: 'Hug me from the front, back, left, right', chant: '' },
      { t: 106.5, text: 'I need you like oh me, oh my', chant: '' },
      { t: 110, text: 'Oh you got me', chant: '' },
      { t: 111, text: 'Oh you got me like', chant: '' },

      { t: 112, text: '[[Baby, oh please]]', chant: '' },
      { t: 114, text: 'Sesangi uril gallanoeul ttae', chant: '' },
      { t: 117, text: '[[Baby, oh please]]', chant: '' },
      { t: 120, text: 'Han georeum deo dagaseolge', chant: '' },

      { t: 123, text: "I'm on my knees", chant: '' },
      { t: 125.5, text: 'Hamkkehae jwo naui worst day', chant: '' },
      { t: 128.5, text: 'Neol deo sege aneulge right now', chant: '' },
      { t: 130.5, text: "Even hell, I'm down", chant: '' },
      { t: 132, text: 'All I want is you', chant: '' },

      { t: 135, text: '[[If you wanna, if you wanna]]', chant: '' },
      { t: 136.5, text: "I'll do that thing for ya", chant: '' },

      { t: 138, text: '[[If you wanna, if you wanna]]', chant: '' },
      { t: 139.5, text: "I'll do a thing for ya", chant: '' },

      { t: 141, text: '[[If you wanna, if you wanna]]', chant: '' },
      { t: 142.5, text: "I'll do that thing for ya", chant: '' },

      { t: 144, text: '[[If you wanna, if you wanna]]', chant: '' },

      { t: 145.5, text: '[[Baby, oh please]]', chant: '' },
      { t: 148, text: 'Sesangi uril gallanoeul ttae', chant: '' },
      { t: 151, text: '[[Baby, oh please]]', chant: '' },
      { t: 153.7, text: 'Han georeum deo dagaseolge', chant: '' },

      { t: 157, text: "I'm on my knees", chant: '' },
      { t: 159.5, text: 'Hamkkehae jwo naui worst day', chant: '' },
      { t: 162.5, text: 'Neol deo sege aneulge right now', chant: '' },
      { t: 164.5, text: "Even hell, I'm down", chant: '' },
      { t: 166, text: 'All I want is you', chant: '' },
    ],
  },
  {
    id: 'come-over',
    title: 'Come Over',
    note: '',
    youtubeId: 'MEoxtFRfPoc',
    lyrics: [
      { t: 1, text: 'Teong bin deuthan bami omyeon', chant: '' },
      { t: 3, text: 'Ireoke tto neoreul bulleo', chant: '' },
      { t: 6, text: "[[Yeah I'm lost, can I come over]]", chant: '' },
      { t: 8, text: "[[Yeah I'm lost, can I come over]]", chant: '' },

      { t: 11, text: "I just wanna say I'm sorry", chant: '' },
      { t: 13, text: 'Ireon naega neomu sileo', chant: '' },
      { t: 16, text: "[[Yeah I'm lost, can I come over]]", chant: '' },
      { t: 18, text: "[[Yeah I'm lost, can I come over]]", chant: '' },

      { t: 22, text: "Baby, don't do me like that", chant: '' },
      { t: 24, text: 'Beolsseo sigani mani jinanne', chant: '' },
      { t: 27, text: 'Uri meoreojin geunal dwie', chant: '' },
      { t: 29, text: 'Gakja iyagin mudeo dulkka', chant: '' },
      { t: 31, text: 'Mian jom neujeotji {{(ani!)}}', chant: '' },
      { t: 34, text: 'Geudongan byeoril eopsi [[jal jinaetji]]', chant: '' },
      { t: 37, text: 'Dasi sijakaneun uri', chant: '' },
      { t: 39, text: 'Du beon dasin heeojiji ma', chant: '' },

      { t: 41, text: 'Teong bin deuthan bami omyeon', chant: '' },
      { t: 44, text: 'Ireoke tto neoreul bulleo', chant: '' },
      { t: 46, text: "[[Yeah I'm lost, can I come over]]", chant: '' },
      { t: 49, text: "[[Yeah I'm lost, can I come over]]", chant: '' },

      { t: 51, text: "I just wanna say I'm sorry", chant: '' },
      { t: 53.5, text: 'Ireon naega neomu sileo', chant: '' },
      { t: 56, text: "[[Yeah I'm lost, can I come over]]", chant: '' },
      { t: 59, text: "[[Yeah I'm lost, can I come over]]", chant: '' },

      { t: 68, text: "You'll never love me like the way you did before", chant: '' },
      { t: 77, text: 'But would you open up if I knocked on your door', chant: '' },

      { t: 87, text: '~~Knock knock~~ {{B! T! S!}}', chant: '' },
      { t: 88, text: "Knockin' on your door", chant: '' },
      { t: 91, text: 'My blood on the floor', chant: '' },
      { t: 93, text: "Just checkin' on your door", chant: '' },
      { t: 95, text: "(What the hell am I doin' this for?)", chant: '' },
      { t: 97, text: 'You act like', chant: '' },
      { t: 98, text: 'Done with past life', chant: '' },
      { t: 100, text: 'Then you pass like', chant: '' },
      { t: 101, text: 'Dust in a flashlight', chant: '' },
      { t: 102, text: 'Smoke in black night', chant: '' },

      { t: 103, text: 'We so dead, right?', chant: '' },
      { t: 105, text: 'But I hate metaphors', chant: '' },

      { t: 107, text: 'Teong bin deuthan bami omyeon', chant: '' },
      { t: 109, text: 'Ireoke tto neoreul bulleo', chant: '' },
      { t: 111, text: "[[Yeah I'm lost, can I come over]]", chant: '' },
      { t: 114, text: "[[Yeah I'm lost, can I come over]]", chant: '' },

      { t: 117, text: "I just wanna say I'm sorry", chant: '' },
      { t: 119, text: 'Ireon naega neomu sileo', chant: '' },
      { t: 122, text: "[[Yeah I'm lost, can I come over]]", chant: '' },
      { t: 124, text: "[[Yeah I'm lost, can I come over]]", chant: '' },

      { t: 133, text: "You'll never love me like the way you did before", chant: '' },
      { t: 143, text: 'But would you open up if I knocked on your door', chant: '' },

      { t: 153, text: 'Ne simjangeul dudeuryeo boran deusi right now', chant: '' },
      { t: 155, text: 'Apdwiga eomneun sal geujeo byeorang kkeut geu ap, ap', chant: '' },
      { t: 158, text: 'Apeugo tto ulgo sanggwaneopseo can I, I?', chant: '' },
      { t: 160, text: 'Neoramyeon da gaeuichineun ana my savior', chant: '' },
      { t: 163, text: 'Nalkarowo tto beyeodo geugeotdo naui page', chant: '' },
      { t: 165, text: "I'm past the pain maeil nawa ssaun iyuinji", chant: '' },
      { t: 170, text: 'Geurae dabeul chajeun rover, nan no jeoeo', chant: '' },
      { t: 172, text: 'Can I come over, o-over', chant: '' },
      { t: 174, text: "'Cause it's not over", chant: '' },
    ],
  },
  {
    id: 'fake-love',
    title: 'FAKE LOVE',
    note: '',
    youtubeId: 'B8T0VmrX4g0',
    lyrics: [
      { t: 1, text: 'Neol wihaeseoramyeon nan seulpeodo gippeun cheok hal suga isseosseo', chant: '' },
      { t: 7, text: 'Neol wihaeseoramyeon nan apado ganghan cheok hal suga isseosseo', chant: '' },

      { t: 13, text: 'Sarangi sarangmaneuro wanbyeokhagil', chant: '' },
      { t: 16, text: 'Nae modeun yakjeomdeureun da sumgyeojigil', chant: '' },
      { t: 19, text: 'Irwojiji anhneun kkumsogeseo piul su eopsneun kkocheul kiwosseo', chant: '' },

      { t: 25, text: 'I’m so sick of this', chant: '' },
      { t: 26, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 28, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 29, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 31, text: 'I’m so sorry but it’s', chant: '' },
      { t: 32.5, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 34, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 36, text: 'Fake Love {{(Fake Love)}}', chant: '' },

      { t: 38, text: 'I wanna be a good man', chant: '' },
      { t: 39.5, text: '[[just for you]]', chant: '' },
      { t: 41, text: 'Sesangeul jwotne', chant: '' },
      { t: 43, text: '[[just for you]]', chant: '' },
      { t: 44, text: 'Jeonbu bakkwosseo', chant: '' },
      { t: 46, text: '[[just for you]]', chant: '' },
      { t: 47, text: 'Now I dunno me', chant: '' },
      { t: 49, text: '[[who are you?]]', chant: '' },

      { t: 51, text: 'Urimanui sup [[(sup)]]', chant: '' },
      { t: 52, text: 'Neoneun eopseosseo', chant: '' },
      { t: 54, text: 'Naega wassdeon Route [[(route)]]', chant: '' },
      { t: 56, text: 'Ijeobeoryeosseo', chant: '' },

      { t: 57, text: 'Nado naega nuguyeossneunjido jal moreuge dwaesseo', chant: '' },
      { t: 60, text: 'Geoureda jikkeoryeobwa neoneun daeche nuguni', chant: '' },

      { t: 63, text: 'Neol wihaeseoramyeon nan seulpeodo gippeun cheok hal suga isseosseo', chant: '' },
      { t: 69, text: 'Neol wihaeseoramyeon nan apado ganghan cheok hal suga isseosseo', chant: '' },

      { t: 75, text: 'Sarangi sarangmaneuro wanbyeokhagil', chant: '' },
      { t: 78, text: 'Nae modeun yakjeomdeureun da sumgyeojigil', chant: '' },
      { t: 81, text: 'Irwojiji anhneun kkumsogeseo piul su eopsneun kkocheul kiwosseo', chant: '' },

      { t: 87, text: '[[Love you so bad Love you so bad]]', chant: '' },
      { t: 90.5, text: 'Neol wihae yeppeun geojiseul bijeonae', chant: '' },
      { t: 93.5, text: '[[Love you so mad Love you so mad]]', chant: '' },
      { t: 96.5, text: 'Nal jiwo neoui inhyeongi doeryeo hae', chant: '' },
      { t: 99.5, text: '[[Love you so bad Love you so bad]]', chant: '' },
      { t: 102.5, text: 'Neol wihae yeppeun geojiseul bijeonae', chant: '' },
      { t: 106., text: '[[Love you so mad Love you so mad]]', chant: '' },
      { t: 109., text: 'Nal jiwo neoui inhyeongi doeryeo hae', chant: '' },

      { t: 112, text: 'I’m so sick of this', chant: '' },
      { t: 113, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 114.5, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 116, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 118, text: 'I’m so sorry but it’s', chant: '' },
      { t: 119, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 120.5, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 122, text: 'Fake Love {{(Fake Love)}}', chant: '' },

      { t: 126, text: '[[Why you sad?]]', chant: '' },
      { t: 127, text: '[[I don’t know nan molla]]', chant: '' },
      { t: 129, text: '[[Useobwa]]', chant: '' },
      { t: 130, text: 'Saranghae malhaebwa', chant: '' },
      { t: 132, text: '[[Nareul bwa]]', chant: '' },
      { t: 133, text: 'Najochado beorin', chant: '' },
      { t: 135, text: '[[Neojocha]]', chant: '' },
      { t: 136, text: 'Ihaehal su eopsneun na', chant: '' },

      { t: 138, text: 'Nachseolda hane niga johahadeon naro byeonhan naega', chant: '' },
      { t: 141, text: 'Anira hane yejeone niga jal algo issdeon naega', chant: '' },

      { t: 144, text: '[[Anigin mwoga anya]]', chant: '' },
      { t: 146, text: 'Nan nun meoreosseo', chant: '' },
      { t: 147, text: '[[Sarangeun mwoga sarang]]', chant: '' },
      { t: 149, text: 'It’s all fake love', chant: '' },

      { t: 150, text: '(Woo) I dunno I dunno I dunno why', chant: '' },
      { t: 156, text: 'Woo nado nal nado nal moreugesseo', chant: '' },
      { t: 162, text: '(Woo) I just know I just know I just know why', chant: '' },
      { t: 168, text: 'Cuz its all', chant: '' },
      { t: 169, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 170.5, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 172, text: 'Fake Love {{(Fake Love)}}', chant: '' },

      { t: 174, text: '[[Love you so bad Love you so bad]]', chant: '' },
      { t: 177, text: 'Neol wihae yeppeun geojiseul bijeonae', chant: '' },
      { t: 180, text: '[[Love you so mad Love you so mad]]', chant: '' },
      { t: 183, text: 'Nal jiwo neoui inhyeongi doeryeo hae', chant: '' },
      { t: 186, text: '[[Love you so bad Love you so bad]]', chant: '' },
      { t: 189, text: 'Neol wihae yeppeun geojiseul bijeonae', chant: '' },
      { t: 192, text: '[[Love you so mad Love you so mad]]', chant: '' },
      { t: 195, text: 'Nal jiwo neoui inhyeongi doeryeo hae', chant: '' },

      { t: 198.5, text: 'I’m so sick of this', chant: '' },
      { t: 199.5, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 201, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 202.5, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 204.5, text: 'I’m so sorry but it’s', chant: '' },
      { t: 205.5, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 207, text: 'Fake Love {{(Fake Love)}}', chant: '' },
      { t: 209, text: 'Fake Love {{(Fake Love)}}', chant: '' },

      { t: 211, text: 'Neol wihaeseoramyeon nan seulpeodo gippeun cheok hal suga isseosseo', chant: '' },
      { t: 218, text: 'Neol wihaeseoramyeon nan apado ganghan cheok hal suga isseosseo', chant: '' },

      { t: 223, text: 'Sarangi sarangmaneuro wanbyeokhagil', chant: '' },
      { t: 227, text: 'Nae modeun yakjeomdeureun da sumgyeojigil', chant: '' },
      { t: 230, text: 'Irwojiji anhneun kkumsogeseo piul su eopsneun kkocheul kiwosseo', chant: '' },
    ],
  },
  {
    id: 'body-to-body',
    title: 'Body to Body',
    note: '',
    youtubeId: 'RBaSiVjtKR4',
    lyrics: [
      { t: 10, text: '[[Kim Namjoon! Kim Seokjin! Min Yoongi! Jeong Hoseok! Park Jimin! Kim Taehyung! Jeon Jung kook! BTS!]]', chant: '', chantOnly: true },

      { t: 18, text: 'I need the whole stadium to jump', chant: '' },
      { t: 20, text: 'Put your phone down, let’s get all the fun', chant: '' },
      { t: 22, text: 'I got my eyes on the row in the front', chant: '' },
      { t: 24, text: 'The vibe is high, if we bein’ blunt', chant: '' },
      { t: 26, text: 'The vibe is high, let the building {{(Hey!)}}', chant: '' },

      { t: 29, text: '[[B-T-uh]], from everywhere to Korea', chant: '' },
      { t: 32, text: 'Chong kal kibodeu da jom chiwo', chant: '' },
      { t: 34, text: 'Insaengeun jjalba jeungoneun biwo', chant: '' },
      { t: 36, text: 'It’s big in real life', chant: '' },
      { t: 38, text: 'Mwol chemyeon ttajyeo naeryeonwa, ya inma', chant: '' },
      { t: 41, text: '[[Hop in]]', chant: '' },
      { t: 42, text: 'Jom deo gakkai wa [[skin to skin]]', chant: '' },

      { t: 44, text: 'I need some body to body', chant: '' },
      { t: 48, text: 'All of your body beside me', chant: '' },
      { t: 51, text: 'Jeogi jeo dare dake sone son', chant: '' },
      { t: 54, text: 'neowa na we on and on', chant: '' },
      { t: 56, text: 'Sunrise, but we don’t go home', chant: '' },

      { t: 58.5, text: 'Somebody like you {{(Somebody like you)}}', chant: '' },
      { t: 62.5, text: 'Somebody like you {{(Somebody like you)}}', chant: '' },
      { t: 66.5, text: 'Somebody like you {{(Somebody like you)}}', chant: '' },
      { t: 70.5, text: 'Somebody like you', chant: '' },

      { t: 72.5, text: 'Somebody like', chant: '' },
      { t: 74.5, text: 'Errbody like you', chant: '' },

      { t: 80.5, text: 'It’s so tight', chant: '' },
      { t: 82, text: '[[I mean]], neowaui sai', chant: '' },
      { t: 84, text: '[[I mean]], urimanui geu style', chant: '' },
      { t: 86, text: '[[I mean]], we livin’ the life', chant: '' },
      { t: 88, text: 'Du nuneul gamji aneul i bam, uh', chant: '' },
      { t: 90, text: 'Sotguchineun gyeoreui maeum, mm', chant: '' },
      { t: 92, text: 'Be about it, be about it, be about it', chant: '' },
      { t: 94, text: 'You could see about it', chant: '' },
      { t: 95, text: 'Or you read about it', chant: '' },

      { t: 96.7, text: 'I need some body to body', chant: '' },
      { t: 100.5, text: 'All of your body beside me', chant: '' },
      { t: 103, text: 'Jeogi jeo dare dake [[sone son]]', chant: '' },
      { t: 106, text: 'neowa na we [[on and on]]', chant: '' },
      { t: 108, text: 'Sunrise, but we don’t go home', chant: '' },

      { t: 110.5, text: 'Somebody like you {{(Somebody like you)}}', chant: '' },
      { t: 114.5, text: 'Somebody like you {{(Somebody like you)}}', chant: '' },
      { t: 118.5, text: 'Somebody like you {{(Somebody like you)}}', chant: '' },
      { t: 122.5, text: 'Somebody like you', chant: '' },
      { t: 124.5, text: 'Somebody like', chant: '' },
      { t: 126.5, text: 'Errbody like you', chant: '' },

      { t: 130.5, text: 'Somebody like you {{(Somebody like you)}}', chant: '' },
      { t: 134.5, text: 'Somebody like you {{(Somebody like you)}}', chant: '' },
      { t: 138.5, text: 'Somebody like you', chant: '' },
      { t: 140.5, text: 'Somebody like', chant: '' },
      { t: 142.5, text: 'Errbody like you', chant: '' },

      { t: 144, text: '<<A-ri-rang, a-ri-rang, a-ra-ri-yo>>', chant: '' },
      { t: 152, text: '<<A-ri-rang go-gae-ro neo-meo-ganda>>', chant: '' },
      { t: 160, text: '<<Na-reul beo-ri-go ga-si-neun ni-meun>>', chant: '' },
      { t: 168, text: '<<Sim-ni-do mot-ga-seo bal-byeong-nanda>>', chant: '' },

      { t: 176, text: 'I need the whole stadium to jump {{(BTS!)}}', chant: '' },
      { t: 180, text: 'Put your phone down, let’s get all the fun {{(BTS!)}}', chant: '' },
      { t: 184, text: 'You at the side, at the back, at the front', chant: '' },
    ],
  },
  {
    id: 'aliens',
    title: 'Aliens',
    note: '',
    youtubeId: 'EC9_h_elSAY',
    lyrics: [
      { t: 3.5, text: 'This gon’ be the jam of the year', chant: '' },
      { t: 6, text: 'Jiruhago ttabunhae modeun ge (modeun ge)', chant: '' },
      { t: 8.7, text: 'Siganeun cham ppalla [[tick-tock]] stadiumeuro [[jipap]]', chant: '' },
      { t: 11.2, text: 'Dodaeche mwol deo gominhae? (gominhae)', chant: '' },

      { t: 13.5, text: 'Taesaengbuteo dareun [[seven aliens]]', chant: '' },
      { t: 16, text: 'Uril bureowohane jeo civilians', chant: '' },
      { t: 18.5, text: 'Guji seolmyeonghagi ip apa, stadiumeuro [[jipap]]', chant: '' },
      { t: 21, text: 'Dodaeche mwol deo gominhae? (gominhae)', chant: '' },

      { t: 23, text: 'Hello this your, hello this your new honey', chant: '' },
      { t: 25.5, text: 'Baksu chyeo, heundeureo, jungmori', chant: '' },
      { t: 28, text: 'Oh my god, do I look too funny?', chant: '' },
      { t: 30, text: 'Mwo eojjeollae? just [[move for me]]', chant: '' },
      { t: 32.5, text: 'Yeah, [[move for me]]', chant: '' },

      { t: 35, text: 'From the gana to the ha, uri bogo baewonwa', chant: '' },
      { t: 37.5, text: 'Yeah we aliens', chant: '' },
      { t: 39.7, text: 'If you wanna hit my house sinbareun beoseonwa', chant: '' },
      { t: 42.5, text: 'Yeah we aliens', chant: '' },

      { t: 44, text: 'Eojjeom geurae? shameless', chant: '' },
      { t: 46, text: 'Yeuireul charyeo, we aliens', chant: '' },
      { t: 48.5, text: 'Haeneun dongjjogeseo risin’', chant: '' },
      { t: 51, text: '[[Aliens, aliens]]', chant: '' },

      { t: 53, text: 'Every night every day', chant: '' },
      { t: 55, text: 'Mwodeun deo ppareuge', chant: '' },
      { t: 57, text: 'Maeil bamsaewodae', chant: '' },
      { t: 60, text: 'Yeah we livin’ that', chant: '' },

      { t: 61, text: '[[Aliens, aliens]]', chant: '' },

      { t: 63, text: 'Every night every day', chant: '' },
      { t: 65, text: 'Mwodeun deo ppareuge', chant: '' },
      { t: 67, text: 'Sidaega uril wonhae', chant: '' },
      { t: 69.7, text: 'Yeah we livin’ that', chant: '' },

      { t: 71, text: '[[Aliens, aliens]]', chant: '' },

      { t: 73, text: 'It goes, let me, honey, talk about the business', chant: '' },
      { t: 75.5, text: 'Everybody know now where the K is', chant: '' },
      { t: 78, text: 'Eodikkaji gani [[ireon jegil]]', chant: '' },
      { t: 80, text: 'Jeojuhani ajik? [[hyungjeukdaegil]]', chant: '' },

      { t: 83, text: 'Pardon gimgu seonsaengnim tell me how you feel', chant: '' },
      { t: 85, text: 'Yeongeoneun tto nabakke mot hae but that is how we kill', chant: '' },
      { t: 87.5, text: 'Nunman tto heobeollage keun neohuiga malhagil', chant: '' },
      { t: 90, text: 'Are they for real? for real?', chant: '' },

      { t: 92, text: 'Hello this your, hello this your new honey', chant: '' },
      { t: 94, text: 'Baksu chyeo, heundeureo, jungmori', chant: '' },
      { t: 96.5, text: 'Oh my god, do I look too funny', chant: '' },
      { t: 99, text: 'Mwo eojjeollae? just [[move for me]]', chant: '' },
      { t: 101, text: 'Yeah, [[move for me]]', chant: '' },

      { t: 103.5, text: 'From the gana to the ha uri bogo baewonwa', chant: '' },
      { t: 106, text: 'Yeah we aliens', chant: '' },
      { t: 108.5, text: 'If you wanna hit my house sinbareun beoseonwa', chant: '' },
      { t: 111, text: 'Yeah we aliens', chant: '' },

      { t: 112, text: 'Eojjeom geurae shameless', chant: '' },
      { t: 115, text: 'Yeuireul charyeo, we aliens', chant: '' },
      { t: 117, text: 'Haeneun dongjjogeseo risin’', chant: '' },

      { t: 119.5, text: '[[Aliens, aliens]]', chant: '' },

      { t: 121.5, text: 'Every night every day', chant: '' },
      { t: 123.5, text: 'Mwodeun deo ppareuge', chant: '' },
      { t: 126, text: 'Maeil bamsaewodae', chant: '' },
      { t: 128.5, text: 'Yeah we livin’ that', chant: '' },

      { t: 129.5, text: '[[Aliens, aliens]]', chant: '' },

      { t: 131.5, text: 'Every night every day', chant: '' },
      { t: 133.5, text: 'Mwodeun deo ppareuge', chant: '' },
      { t: 136.3, text: 'Sidaega uril wonhae', chant: '' },
      { t: 138.5, text: 'Yeah we livin’ that', chant: '' },

      { t: 139.5, text: '[[Aliens, aliens]]', chant: '' },

      { t: 141, text: '[[(heot dul!)]] Yeah we land on it', chant: '' },
      { t: 143.5, text: '[[(heot dul!)]] And stand on it', chant: '' },
      { t: 146, text: '[[(heot dul!)]] jjigeo! Put that stamp on it', chant: '' },
      { t: 149, text: 'Stamp on it, stamp on it', chant: '' },

      { t: 151, text: '[[(heot dul!)]] Yeah we land on it', chant: '' },
      { t: 153.5, text: '[[(heot dul!)]] And stand on it', chant: '' },
      { t: 156, text: '[[(heot dul!)]] jjigeo! Put that stamp on it', chant: '' },
      { t: 159, text: '~~Stamp on it, stamp on it~~ {{(B! T! S!)}}', chant: '' },
    ],
  },
  {
    id: 'they-dont-know',
    title: "They Don't Know 'Bout Us",
    note: '',
    youtubeId: 'Dt2P9jRa7w0',
    lyrics: [
      { t: 13, text: 'I can show you love, I can show you', chant: '' },
      { t: 16, text: 'If you wanna know me, what can I do for you?', chant: '' },
      { t: 19, text: 'Daeche mwoga dallannyago jakku mureo', chant: '' },
      { t: 22, text: 'Naneun daedapae, nado molla', chant: '' },

      { t: 26, text: 'Everybody hear the story that they wanna', chant: '' },
      { t: 29, text: 'Jyaenen igeo ttaeme tteosseo, naega majeo', chant: '' },
      { t: 33, text: 'We just big boys a.k.a chonnom', chant: '' },
      { t: 36, text: 'Geunyang mwo giseji, just shut up, just shut up', chant: '' },

      { t: 41, text: 'Hold up, chill and take a bubble bath, bae', chant: '' },
      { t: 44, text: 'Do the math, and go, just say what you say', chant: '' },
      { t: 48, text: 'Oh it’s hard and that we cannot explain', chant: '' },
      { t: 51, text: 'Every time we tryna tryna explain, we find', chant: '' },

      { t: 55, text: '[[They don’t know ‘bout us, They don’t know ‘bout us]]', chant: '' },
      { t: 58, text: '[[They don’t know ‘bout us, They don’t know ‘bout us]]', chant: '' },
      { t: 62, text: '[[They don’t know ‘bout us, They don’t know ‘bout us]]', chant: '' },
      { t: 65, text: '[[They don’t know ‘bout us, They don’t know ‘bout us]]', chant: '' },

      { t: 68, text: 'Yeah damn ooo damn right ooo damn right', chant: '' },
      { t: 72, text: 'Yeah damn ooo damn right ooo damn right', chant: '' },

      { t: 75, text: 'Yeah damn ooo damn right ooo damn right', chant: '' },
      { t: 78, text: 'Yeah damn ooo damn right ooo damn right', chant: '' },

      { t: 82, text: 'I can show you love, I can show you', chant: '' },
      { t: 85, text: 'If you wanna know me, what can I do for you?', chant: '' },
      { t: 88, text: 'Daeche mwoga dallannyago jakku mureo', chant: '' },
      { t: 92, text: 'Naneun daedapae, nado molla', chant: '' },

      { t: 96, text: 'Hangsang swiun gilman chatgi bappa gwaensiri (Ayy)', chant: '' },
      { t: 100, text: 'Ojirapdeureun taepyeongyangjjeum ppaenjiri (Uh)', chant: '' },
      { t: 103, text: 'Algi swipge seolmyeonghae julkka, baby', chant: '' },
      { t: 107, text: 'Mollado dwae mwol tto guji allyeo hani? Uh', chant: '' },

      { t: 110, text: '“gyaenen teukbyeolhae (hae)', chant: '' },
      { t: 112.3, text: 'Asian junge”', chant: '' },
      { t: 114, text: '“yeongungseureoun jonjae (jae),', chant: '' },
      { t: 115, text: 'Too hard to break”', chant: '' },
      { t: 117, text: 'We can’t relate,', chant: '' },
      { t: 119, text: 'Geunyang saram ilgobinde', chant: '' },
      { t: 120, text: 'You said we changed?', chant: '' },
      { t: 122, text: 'We feel the same, shit', chant: '' },

      { t: 124, text: '[[They don’t know ‘bout us, They don’t know ‘bout us]]', chant: '' },
      { t: 128, text: '[[They don’t know ‘bout us, They don’t know ‘bout us]]', chant: '' },
      { t: 131, text: '[[They don’t know ‘bout us, They don’t know ‘bout us]]', chant: '' },
      { t: 134, text: '[[They don’t know ‘bout us, They don’t know ‘bout us]]', chant: '' },

      { t: 138, text: 'Yeah damn ooo damn right ooo damn right', chant: '' },
      { t: 141, text: 'Yeah damn ooo damn right ooo damn right', chant: '' },
      { t: 145, text: 'Yeah damn ooo damn right ooo damn right', chant: '' },
      { t: 148, text: 'Yeah damn ooo damn right ooo damn right', chant: '' },
    ],
  },
  {
    id: 'like-animals',
    title: 'Like Animals',
    note: '',
    youtubeId: '1BiWkZDiY7s',
    lyrics: [
      { t: 12.5, text: 'Take me into your deep', chant: '' },
      { t: 15.5, text: 'I wanna lay in your world', chant: '' },
      { t: 19.5, text: 'So what, your shadow’s a mess', chant: '' },
      { t: 21.5, text: 'I’m walkin’ with my own dirt', chant: '' },

      { t: 24.5, text: 'We can go all night', chant: '' },
      { t: 27.5, text: 'Don’t you close your eyes', chant: '' },

      { t: 30.5, text: 'Don’t you fear the light', chant: '' },
      { t: 34.5, text: 'All night', chant: '' },

      { t: 36.5, text: '[[If you wanna be animals]]', chant: '' },
      { t: 42.5, text: '[[Baby we can be animals]]', chant: '' },

      { t: 48.5, text: 'Eat this life ‘til your heart is full', chant: '' },
      { t: 54.5, text: 'If you want, you can have it all', chant: '' },

      { t: 61.5, text: 'Six feet down in the sand', chant: '' },
      { t: 64.5, text: 'There’s creatures that made a hole', chant: '' },
      { t: 68.5, text: 'Do speak, I’m beggin’ you, please', chant: '' },
      { t: 70.5, text: 'There’s beauty outside control', chant: '' },

      { t: 73.5, text: 'Oh we can go all night', chant: '' },
      { t: 76.5, text: 'We can go all night', chant: '' },
      { t: 79.5, text: 'Yeah we should go all night', chant: '' },
      { t: 83.5, text: 'All night', chant: '' },

      { t: 85.5, text: '[[If you wanna be animals]]', chant: '' },
      { t: 91.5, text: '[[Baby we can be animals]]', chant: '' },

      { t: 97.5, text: 'Eat this life ‘til your heart is full', chant: '' },
      { t: 103.5, text: 'If you want, you can have it all', chant: '' },

      { t: 110.5, text: 'Got you in the wild', chant: '' },
      { t: 112.5, text: 'Somewhere so far', chant: '' },
      { t: 114.5, text: 'With your claws sharp', chant: '' },
      { t: 115.5, text: 'And them fangs out', chant: '' },
      { t: 116.5, text: 'Now you see a whole land full of animals', chant: '' },
      { t: 119.5, text: 'None of us are tameable', chant: '' },
      { t: 120.5, text: 'None of us are tameable', chant: '' },

      { t: 121.5, text: '(Oh-oh-oh) Heart (Oh-oh-oh) untameable', chant: '' },
      { t: 127.5, text: '(Oh-oh-oh) [[Go]] (take it all)', chant: '' },
      { t: 132.5, text: '[[and take it all]]', chant: '' },

      { t: 133.5, text: '[[If you wanna be animals]]', chant: '' },
      { t: 139.5, text: '[[Baby we can be animals]]', chant: '' },

      { t: 145.5, text: 'Eat this life ’til your heart is full', chant: '' },
      { t: 147.5, text: '(Heart untameable)', chant: '' },
      { t: 151.5, text: 'If you want, you can have it all', chant: '' },
      { t: 153.5, text: '(Go and take it all)', chant: '' },
    ],
  },
  {
    id: 'merry-go-round',
    title: 'Merry Go Round',
    note: '',
    youtubeId: 'Iy0SpSLW8wo',
    lyrics: [
      { t: 10, text: 'I wish that I could tell you that it’s over', chant: '' },
      { t: 16, text: 'I wish that I could walk away from pain', chant: '' },

      { t: 22, text: 'My life is like a broken roller coaster', chant: '' },
      { t: 28, text: 'But maybe I’m the only one to blame', chant: '' },

      { t: 35, text: 'I can’t get off, this merry go round', chant: '' },
      { t: 40, text: 'It spins me around', chant: '' },

      { t: 46, text: 'I do my best, but I can’t slow down', chant: '' },
      { t: 52, text: 'This merry go round', chant: '' },

      { t: 56, text: '[[And I]], I can’t get off of this ride', chant: '' },

      { t: 63, text: '(I can’t get off of this ride)', chant: '' },

      { t: 67, text: '[[I try]], this happens every time', chant: '' },

      { t: 74, text: '(I can’t get off of this ride)', chant: '' },

      { t: 79, text: 'Eoreuni doen geot gateun gibunijiman', chant: '' },
      { t: 82, text: 'Gomineun mwo yeojeonhaji', chant: '' },
      { t: 85, text: 'Maeil gateun ilsang sok hoejeonmongmana', chant: '' },
      { t: 88, text: 'Chetbakwina maehangaji (maehangaji)', chant: '' },
      { t: 91, text: 'Oh, dabi eomneun jilmun', chant: '' },
      { t: 95, text: 'Migung sogeseoui jilju', chant: '' },
      { t: 98, text: 'Dadeul gwaenchaneun cheokamyeo', chant: '' },
      { t: 100, text: 'Utgo itji modu [[da, da, da, da]]', chant: '' },

      { t: 102, text: 'I wish that I could tell you that it’s over', chant: '' },
      { t: 108, text: 'I wish that I could walk away from pain', chant: '' },

      { t: 113, text: 'My life is like a broken roller coaster', chant: '' },
      { t: 119, text: 'But maybe I’m the only one to blame', chant: '' },

      { t: 126, text: 'I can’t get off, this merry go round', chant: '' },
      { t: 132, text: 'It spins me around', chant: '' },

      { t: 138, text: 'I do my best, but I can’t slow down', chant: '' },
      { t: 143, text: 'This merry go round', chant: '' },

      { t: 147, text: '[[And I]], I can’t get off of this ride', chant: '' },
      { t: 154, text: '(I can’t get off of this ride)', chant: '' },
      { t: 159, text: '[[I try]], this happens every time', chant: '' },
      { t: 165, text: '(I can’t get off of this ride)', chant: '' },

      { t: 170, text: 'Spinnin’ up down', chant: '' },
      { t: 173, text: 'Just round ’n’ round', chant: '' },
      { t: 176, text: 'I’m fallin’ apart', chant: '' },
      { t: 179, text: 'Still bound to ground', chant: '' },

      { t: 182, text: 'Meomchul su eomneun gulle sok', chant: '' },
      { t: 184, text: 'Nae dongsimi sorichijana (Yeah, yeah, yeah, yeah)', chant: '' },
      { t: 188, text: 'Na won eopsi talmankeum tasseuni', chant: '' },
      { t: 190, text: 'Please take me out, ma', chant: '' },
      { t: 193, text: 'Chimdaeneun naui gwan, my bed is my coffin', chant: '' },
      { t: 196, text: 'Eojjeom nae sesangeun, geodaehan caffeine', chant: '' },
      { t: 199, text: 'Maeil neol jugeureo ga, kkumeul kkeul sun eomna?', chant: '' },
      { t: 202, text: 'Meomchul su eomneun chumeul chugo itjana', chant: '' },
      { t: 205, text: 'Tto saenggage, saenggage, saenggage saenggak', chant: '' },
      { t: 208, text: 'Saenggakaji maljan saenggageul hae nan', chant: '' },
      { t: 211, text: 'Binggeul tto binggeul haengbokani?', chant: '' },
      { t: 214, text: 'Useojwo kkeutkkaji', chant: '' },
    ],
  },
  {
    id: 'run-bts',
    title: 'Run BTS',
    note: '',
    youtubeId: 'Cb70gcTVvYI',
    lyrics: [
      { t: 10.7, text: 'Nonhyeon, 100m, uri jari', chant: '' },
      { t: 13.7, text: 'Hakgyo kkeunnamyeon hoesa calling (Ye, ye)', chant: '' },
      { t: 17.7, text: 'Ayy, jigeum baro ttak galgeyo', chant: '' },
      { t: 20.7, text: 'Jebal jiben bonaeji maseyo', chant: '' },
      { t: 23.7, text: '(Oh) Gakkeum geunarui kkum kkwo (Kkum kkwo)', chant: '' },
      { t: 26.7, text: '(Oh) Momseorichida nun tteo (Nun tteo)', chant: '' },
      { t: 29.7, text: 'I don’t wanna go, go back again', chant: '' },
      { t: 32.7, text: 'Let’s go, let’s go, let’s go', chant: '' },

      { t: 34.7, text: 'Simnyeoneul wait, wait', chant: '' },
      { t: 36.7, text: 'We from the bottom', chant: '' },
      { t: 37.7, text: 'I caught you bae, bae', chant: '' },
      { t: 39.7, text: 'Urin jom ppareum', chant: '' },
      { t: 40.7, text: 'We seven mate, mates', chant: '' },
      { t: 42.7, text: 'Jal bwa, we got us', chant: '' },
      { t: 43.7, text: 'Tell me what you wanna', chant: '' },
      { t: 45.7, text: 'Tell me what you wanna, woah', chant: '' },
      { t: 47.7, text: 'If we live fast, let us die young', chant: '' },

      { t: 49.7, text: 'Honeul ssok ppaenochi', chant: '' },
      { t: 51.7, text: 'Make it move, left and right', chant: '' },
      { t: 53.7, text: 'Geuge nugudeunji', chant: '' },
      { t: 55.7, text: 'Make it move, left and right', chant: '' },
      { t: 56.7, text: 'Du maenbari uri gasollin, yeah, yeah', chant: '' },
      { t: 59.7, text: 'Ije gaja, are you ready? Yeah, yeah, yeah', chant: '' },
      { t: 61.7, text: 'Okay, let’s go!', chant: '' },

      { t: 63.7, text: 'Run bulletproof, run, yeah, you gotta run (Run, run)', chant: '' },
      { t: 66.7, text: 'Run bulletproof, run, yeah, you gotta run (Run, run)', chant: '' },
      { t: 69.7, text: 'Run bulletproof, run, yeah, you gotta run (Run, run)', chant: '' },
      { t: 72.7, text: 'Run bulletproof, run', chant: '' },

      { t: 74.7, text: 'Okay, okay, let’s go', chant: '' },
      { t: 76.7, text: 'Naega majasseo Nonhyeon-dong-ui biga saedeon jageopsireseo', chant: '' },
      { t: 78.7, text: 'Kkangsojureul kkamyeo sinsetaryeongina hamyeo', chant: '' },
      { t: 79.7, text: 'Dajimhaetdeon geu mal seonggonghamyeon dadeul dwijyeosseo', chant: '' },
      { t: 81.7, text: 'Bangtan-ui seonggong iyu? Nado molla geuttan ge eodisseo', chant: '' },
      { t: 84.7, text: 'Urideuri modu saeppajige dallin geoji', chant: '' },
      { t: 85.7, text: 'Mwora hadeun dallin geoji', chant: '' },
      { t: 86.7, text: 'Dabeun yeogi isseo, ha-ha-ha', chant: '' },

      { t: 87.7, text: '(Okay)', chant: '' },
      { t: 88.7, text: 'Wiro, got them (Got them)', chant: '' },
      { t: 89.7, text: 'Jijo, got them (Got them)', chant: '' },
      { t: 91.7, text: 'Good music, got them (Got them)', chant: '' },
      { t: 92.7, text: 'Good team? Goddamn! (Oh, yeah)', chant: '' },
      { t: 94.7, text: 'You said you hot (You hot)', chant: '' },
      { t: 95.7, text: 'Oh man, you not (You not)', chant: '' },
      { t: 96.7, text: 'Ttwineun nom wie naneun nom wie', chant: '' },
      { t: 98.7, text: 'Dallineun Bangtan, let’s go', chant: '' },

      { t: 100.7, text: 'Simnyeoneul wait, wait', chant: '' },
      { t: 101.7, text: 'We from the bottom', chant: '' },
      { t: 103.7, text: 'I caught you bae, bae', chant: '' },
      { t: 104.7, text: 'Urin jom ppareum', chant: '' },
      { t: 106.7, text: 'We seven mate, mates', chant: '' },
      { t: 107.7, text: 'Jal bwa we got us', chant: '' },
      { t: 109.7, text: 'Tell me what you wanna', chant: '' },
      { t: 111.7, text: 'Tell me what you wanna, woah', chant: '' },
      { t: 113.7, text: 'If we live fast, let us die young', chant: '' },

      { t: 115.7, text: 'Honeul ssok ppaenochi', chant: '' },
      { t: 117.7, text: 'Make it move, left and right', chant: '' },
      { t: 119.7, text: 'Geuge nugudeunji', chant: '' },
      { t: 120.7, text: 'Make it move, left and right', chant: '' },
      { t: 122.7, text: 'Du maenbari uri gasollin, yeah, yeah', chant: '' },
      { t: 125.7, text: 'Ije gaja, are you ready? Yeah, yeah, yeah', chant: '' },
      { t: 127.7, text: 'Let’s go!', chant: '' },

      { t: 128.7, text: 'Run bulletproof, run, yeah, you gotta run (Run, run)', chant: '' },
      { t: 132.7, text: 'Run bulletproof, run, yeah, you gotta run (Run, run)', chant: '' },
      { t: 135.7, text: 'Run bulletproof, run, yeah, you gotta run (Run, run)', chant: '' },
      { t: 138.7, text: 'Run bulletproof, run (Run, run)', chant: '' },

      { t: 146.7, text: 'Skrrt', chant: '' },
      { t: 147.7, text: 'Musikan mideumeuro', chant: '' },
      { t: 149.7, text: 'Gyang dallyeo, du dariro', chant: '' },
      { t: 150.7, text: 'That’s how we do it all (Ayy, ayy)', chant: '' },
      { t: 154.7, text: 'Geureoke jeungmyeonghaesseo', chant: '' },
      { t: 155.7, text: 'Ilgop chowonideul', chant: '' },
      { t: 157.7, text: 'Baengman buljjariro (Ayy, ayy)', chant: '' },
      { t: 159.7, text: 'Jimini, Bwi, gosaengs', chant: '' },
      { t: 161.7, text: 'Namjooni, Hop, gosaengs', chant: '' },
      { t: 163.7, text: 'Yoongi hyung, Jjin, gosaengs', chant: '' },
      { t: 165.7, text: 'Jeonggugi, modu so thanks', chant: '' },
      { t: 166.7, text: 'Get ready, get ready, get ready, get ready, get ready, apeuro deo', chant: '' },
      { t: 169.7, text: 'Go get it, go get it, go get it, go get it, go get it, dallija run', chant: '' },
      { t: 172.7, text: 'If we live fast, let us die young', chant: '' },

      { t: 175.7, text: 'Honeul ssok ppaenochi', chant: '' },
      { t: 176.7, text: 'Make it move, left and right', chant: '' },
      { t: 178.7, text: 'Geuge nugudeunji', chant: '' },
      { t: 179.7, text: 'Make it move, left and right', chant: '' },
      { t: 181.7, text: 'Du maenbari uri gasollin, yeah, yeah', chant: '' },
      { t: 184.7, text: 'Ije gaja, are you ready? Yeah, yeah, yeah', chant: '' },
      { t: 186.7, text: 'Yeah (Yeah)', chant: '' },

      { t: 188.7, text: 'Run beautiful, run, yeah you gotta run (Run)', chant: '' },
      { t: 191.7, text: 'Run beautiful, run, yeah you gotta run (Run)', chant: '' },
      { t: 194.7, text: 'Run beautiful, run, yeah you gotta run (Run)', chant: '' },
      { t: 197.7, text: 'Run beautiful, run', chant: '' },
    ],
  },
  {
    id: 'idol',
    title: 'IDOL',
    note: '',
    youtubeId: 'MXFkjMNXfpY',
    lyrics: [
      { t: 33, text: 'You can call me artist (Artist)', chant: '' },
      { t: 34, text: 'You can call me idol (Idol)', chant: '' },
      { t: 36, text: 'Anim eotteon dareun (Dareun) mwora haedo', chant: '' },
      { t: 39, text: 'I don’t care', chant: '' },
      { t: 41, text: 'I’m proud of it (Proud of it)', chant: '' },
      { t: 43, text: 'Nan jayurobne (Jayurobne)', chant: '' },
      { t: 44, text: 'No more irony (Irony)', chant: '' },
      { t: 46, text: 'Naneun hangsang nayeossgie', chant: '' },

      { t: 48, text: 'Songaragjil hae (Oh yeah, yeah, yeah),', chant: '' },
      { t: 50, text: 'naneun jeonhyeo singyeong sseuji anhne', chant: '' },
      { t: 52, text: 'Nareul yoghaneun (Woah!) neoui geu iyuga mwodeun gane', chant: '' },
      { t: 56, text: 'I know what I am (I know what I am)', chant: '' },
      { t: 57, text: 'I know what I want (I know what I want)', chant: '' },
      { t: 59, text: 'I never gon’ change (I ain’t never gonna change)', chant: '' },
      { t: 61, text: 'I never gon’ trade (Trade off, uh uh)', chant: '' },

      { t: 64, text: 'Mwol eojjeogo jeojjeogo tteodeureodaesyeo', chant: '' },
      { t: 68, text: '(Talk it, talk it, talk it)', chant: '' },
      { t: 71, text: 'I do what I do, geunikka neon neona jalhasyeo (Nah, nah)', chant: '' },
      { t: 76, text: 'You can’t stop me lovin’ myself', chant: '' },

      { t: 80, text: '(Hoo hoo) Eolssu johda', chant: '' },
      { t: 84, text: 'You can’t stop me lovin’ myself', chant: '' },
      { t: 88, text: '(Hoo hoo) Jihwaja johda', chant: '' },
      { t: 91.5, text: 'You can’t stop me lovin’ myself', chant: '' },

      { t: 94, text: 'Oh-oh-owoah (Hey!)', chant: '' },
      { t: 96, text: 'Oh-oh-owoah-owoah', chant: '' },
      { t: 98, text: 'Oh-oh-owoah', chant: '' },
      { t: 100, text: 'Deonggideok kungdeoreoreo (Eolssu)', chant: '' },
      { t: 101.7, text: 'Oh-oh-owoah (Hey!)', chant: '' },
      { t: 103.5, text: 'Oh-oh-owoah-owoah', chant: '' },
      { t: 105.5, text: 'Oh-oh-owoah', chant: '' },
      { t: 107, text: 'Deonggideok kungdeoreoreo (Eolssu)', chant: '' },

      { t: 109.5, text: 'Face off machi ousam, ayy', chant: '' },
      { t: 111, text: 'Top star with that spotlight, ayy', chant: '' },
      { t: 113, text: 'Ttaeron syupeohieoroga dwae', chant: '' },
      { t: 115, text: 'Dollyeodae neoui Anpanman', chant: '' },
      { t: 117, text: 'Woah, i sipsa sigani jeogji', chant: '' },
      { t: 119, text: 'Hesgallim, naegen sachi (Woah!)', chant: '' },
      { t: 121, text: 'I do my thang (I do my thang)', chant: '' },
      { t: 123.5, text: 'I love myself (I love myself)', chant: '' },

      { t: 125.5, text: 'I love myself, I love my fans', chant: '' },
      { t: 127.3, text: 'Love my dance and my what', chant: '' },
      { t: 128, text: 'Nae soganen', chant: '' },
      { t: 130, text: 'myeoch sib myeoch baegmyeongui naega isseo', chant: '' },
      { t: 131.5, text: 'Oneul tto dareun nal majihae', chant: '' },
      { t: 133.5, text: 'Eochapi jeonbu da naigie', chant: '' },
      { t: 135.5, text: 'Gominbodaneun gyang dalline', chant: '' },
      { t: 137.5, text: 'Runnin’ man, runnin’ man, Runnin’ man, run!', chant: '' },

      { t: 140, text: 'Mwol eojjeogo jeojjeogo tteodeureodaesyeo', chant: '' },
      { t: 144, text: '(Talk it, talk it, talk it)', chant: '' },
      { t: 147, text: 'I do what I do, geunikka neon neona jalhasyeo', chant: '' },
      { t: 153, text: 'You can’t stop me lovin’ myself', chant: '' },

      { t: 156, text: '(Hoo hoo) Eolssu johda', chant: '' },
      { t: 160, text: 'You can’t stop me lovin’ myself', chant: '' },
      { t: 164, text: '(Hoo hoo) Jihwaja johda', chant: '' },
      { t: 168, text: 'You can’t stop me lovin’ myself', chant: '' },

      { t: 170, text: 'Oh-oh-owoah (Hey!)', chant: '' },
      { t: 172, text: 'Oh-oh-owoah-owoah', chant: '' },
      { t: 174, text: 'Oh-oh-owoah', chant: '' },
      { t: 176, text: 'Deonggideok kungdeoreoreo (Eolssu)', chant: '' },
      { t: 178, text: 'Oh-oh-owoah (Hey!)', chant: '' },
      { t: 180, text: 'Oh-oh-owoah-owoah', chant: '' },
      { t: 182, text: 'Oh-oh-owoah', chant: '' },
      { t: 184, text: 'Deonggideok kungdeoreoreo (Eolssu)', chant: '' },

      { t: 186, text: 'I’m so fine wherever I go (I go, I go, I go, I go)', chant: '' },
      { t: 189, text: 'Gakkeum meolli doragado (oh)', chant: '' },
      { t: 193, text: 'It’s okay, I’m in love with my-my myself', chant: '' },
      { t: 196, text: 'It’s okay, nan i sungan haengbokhae!', chant: '' },

      { t: 202, text: '(Hoo hoo) Eolssu johda', chant: '' },
      { t: 206, text: 'You can’t stop me lovin’ myself', chant: '' },
      { t: 210, text: '(Hoo hoo) Jihwaja johda', chant: '' },
      { t: 214, text: 'You can’t stop me lovin’ myself', chant: '' },

      { t: 216, text: 'Oh-oh-owoah (Hey!)', chant: '' },
      { t: 218, text: 'Oh-oh-owoah-owoah', chant: '' },
      { t: 220, text: 'Oh-oh-owoah', chant: '' },
      { t: 222, text: 'Deonggideok kungdeoreoreo (Eolssu)', chant: '' },
      { t: 223.5, text: 'Oh-oh-owoah (Hey!)', chant: '' },
      { t: 225.5, text: 'Oh-oh-owoah-owoah', chant: '' },
      { t: 227.5, text: 'Oh-oh-owoah', chant: '' },
      { t: 229, text: 'Deonggideok kungdeoreoreo (Eolssu)', chant: '' },
    ],
  },
  {
    id: 'fire',
    title: 'Fire',
    note: '',
    youtubeId: 'lYC67_STvLI',
    lyrics: [
      { t: 30, text: 'Bultaoreune', chant: '' },

      { t: 34, text: '[[Fire]]', chant: '' },
      { t: 39, text: '[[Fire]]', chant: '' },
      { t: 44, text: '[[Fire]]', chant: '' },
      { t: 49, text: '[[Fire]]', chant: '' },

      { t: 52, text: 'When I wake up in my room {{(room)}}', chant: '' },
      { t: 55, text: 'Nan mwotdo eopji', chant: '' },
      { t: 57, text: 'Haega jigo nan hu {{(hu)}}', chant: '' },
      { t: 59, text: 'Biteuldaemyeo geotji', chant: '' },

      { t: 61, text: 'Da mansinchangiro chwihaesseo [[chwihaesseo]]', chant: '' },
      { t: 64, text: 'Mak yokae gireseo [[gireseo]]', chant: '' },
      { t: 67, text: 'Na masi gatji michinnom gatji', chant: '' },
      { t: 69, text: 'Da eongmangjinchang livin’ like [[ppii]]', chant: '' },

      { t: 72, text: 'Ni meotdaero sareo {{(sareo)}}', chant: '' },
      { t: 74, text: 'Eochapi ni kkeoya {{(ni kkeoya)}}', chant: '' },
      { t: 76, text: 'Aesseuji jom mareo {{(mareo)}}', chant: '' },
      { t: 79, text: 'Jyeodo gwaenchana {{(gwaenchana)}}', chant: '' },

      { t: 81, text: 'Errbody say La la la la la {{(La la la la la)}}', chant: '' },
      { t: 84, text: 'Say La la la la la {{(La la la la la)}}', chant: '' },
      { t: 87, text: 'Soneul deureo sorijilleo Burn it up', chant: '' },

      { t: 90, text: 'Bultaoreune', chant: '' },

      { t: 92, text: '{{(BTS! BTS!)}} ayy-oh ayy-oh! Ssak da bultaewora [[Bow wow wow]]', chant: '' },
      { t: 102, text: '{{(BTS! BTS!)}} ayy-oh ayy-oh! Ssak da bultaewora [[Bow wow wow]]', chant: '' },

      { t: 111, text: 'Hey burn it up {{(burn it up)}}', chant: '' },
      { t: 113, text: 'Jeonbu da taeul geot gachi', chant: '' },
      { t: 115, text: 'Hey turn it up {{(turn it up)}}', chant: '' },
      { t: 117, text: 'Saebyeogi da gal ttaekkaji', chant: '' },
      { t: 120, text: 'Geunyang sarado dwae', chant: '' },
      { t: 121, text: '[[Urin jeolgie]]', chant: '' },
      { t: 123, text: 'Geu malhaneun neon', chant: '' },
      { t: 124, text: '[[Mwon sujeogillae]]', chant: '' },
      { t: 125, text: 'Sujeosujeo georyeo nan saraminde {{(hamseong)}}', chant: '' },
      { t: 127, text: 'So what', chant: '' },

      { t: 129, text: 'Ni meotdaero sareo {{(sareo)}}', chant: '' },
      { t: 131, text: 'Eochapi ni kkeoya {{(ni kkeoya)}}', chant: '' },
      { t: 134, text: 'Aesseuji jom mareo {{(mareo)}}', chant: '' },
      { t: 136, text: 'Jyeodo gwaenchana {{(gwaenchana)}}', chant: '' },

      { t: 139, text: 'Errbody say La la la la la {{(La la la la la)}}', chant: '' },
      { t: 142, text: 'Say La la la la la {{(La la la la la)}}', chant: '' },
      { t: 144, text: 'Soneul deureo sorijilleo Burn it up', chant: '' },

      { t: 148, text: 'Bultaoreune', chant: '' },

      { t: 150, text: '{{(BTS! BTS!)}} ayy-oh ayy-oh! Ssak da bultaewora [[Bow wow wow]]', chant: '' },
      { t: 159, text: '{{(BTS! BTS!)}} ayy-oh ayy-oh! Ssak da bultaewora [[Bow wow wow]]', chant: '' },

      { t: 168, text: '[[Fire]] geop maneun jayeo yeogiro', chant: '' },
      { t: 171, text: '[[Fire]] goeroun jayeo yeogiro', chant: '' },
      { t: 173, text: '[[Fire]] maenjumeogeul deulgo All night long', chant: '' },
      { t: 178, text: '[[Fire]] jingunhaneun balgeoreumeuro', chant: '' },
      { t: 180, text: '[[Fire]] ttwieobwa', chant: '' },
      { t: 185, text: 'Michyeobeoryeo da…', chant: '' },
      { divider: true, text: '(——————— FIRE + FYA Ending Remix starts ———————)' },
    ],
  },
  /* --- TEMPORARILY REMOVED: 2!3! (ARMY Time / Bonus). Uncomment to restore. ---
  {
    id: '2-3',
    title: '2!3!',
    note: 'We will sing this during the start of ARMY Time on Day 1',
    youtubeId: 'E30APZxHh4c',
    // Only this section is performed during ARMY Time.
    start: 66,
    end: 122,
    lyrics: [
      { t: 67, text: '<<Gwaenchanha>>', chant: '' },
      { t: 69, text: '<<ja hana dul set hamyeon ijeo>>', chant: '' },
      { t: 71.5, text: '<<Seulpeun gieok modu jiwo>>', chant: '' },
      { t: 75, text: '<<Nae soneul japgo useo>>', chant: '' },
      { t: 78, text: '<<Gwaenchanha>>', chant: '' },
      { t: 80, text: '<<ja hana dul set hamyeon ijeo>>', chant: '' },
      { t: 83, text: '<<Seulpeun gieok modu jiwo>>', chant: '' },
      { t: 86, text: '<<Seoro soneul japgo useo>>', chant: '' },

      { t: 89, text: '<<Geuraedo joheun nari apeuro manhgireul>>', chant: '' },
      { t: 94, text: '<<Nae mareul mitneundamyeon hana dul set>>', chant: '' },
      { t: 98, text: '<<Mitneundamyeon hana dul set>>', chant: '' },
      { t: 100, text: '<<Geuraedo joheun nari hwolssin deo manhgireul>>', chant: '' },
      { t: 106, text: '<<Nae mareul mitneundamyeon hana dul set>>', chant: '' },
      { t: 109, text: '<<Mitneundamyeon hana dul set>>', chant: '' },
    ],
  },
  --- end 2!3! --- */
]

// ============================================================================
// CORE SETLIST — the full concert running order, grouped by act.
//
// This is the complete list shown at the top of the Fanchant page. Songs whose
// `id` matches an entry in `setlist` above are "ready" (tap to open the guide);
// the rest show a "Soon" badge until their lyrics are added.
//
// To mark a song ready: add its lyrics to `setlist` above with a matching `id`,
// then set that same `id` here.
// ============================================================================
export const coreSetlist = [
  {
    act: 'Act 1',
    songs: [
      { n: 1, title: 'Hooligan', id: 'hooligan' },
      { n: 2, title: 'Aliens', id: 'aliens' },
      { n: 3, title: 'Run BTS', id: 'run-bts' },
      { n: 4, title: "They Don't Know 'Bout Us", id: 'they-dont-know' },
      { n: 5, title: 'Like Animals', id: 'like-animals' },
      { n: 6, title: 'FAKE LOVE', id: 'fake-love' },
      { n: 7, title: 'SWIM', id: 'swim' },
      { n: 8, title: 'Merry Go Round', id: 'merry-go-round' },
    ],
  },
  {
    act: 'Act 2',
    songs: [
      { n: 9, title: '2.0', id: '2-0' },
      { n: 10, title: 'NORMAL', id: 'normal' },
      { n: 11, title: 'Not Today', id: 'not-today' },
      { n: 12, title: 'MIC Drop', id: 'mic-drop' },
      { n: 13, title: 'FYA', id: 'fya' },
      { n: 14, title: 'Fire', id: 'fire' },
      { n: 15, title: 'Body to Body', id: 'body-to-body' /* , fanProject: true */ },
      { n: 16, title: 'IDOL', id: 'idol' },
    ],
  },
  {
    act: 'Encore',
    songs: [
      { n: 17, title: 'Come Over', id: 'come-over' /* , fanProject: true */ },
      { n: 18, title: 'Butter', id: 'butter' },
      { n: 19, title: 'Dynamite', id: 'dynamite' },
      { n: 20, title: '(Surprise Song 1)', surprise: true },
      { n: 21, title: '(Surprise Song 2)', surprise: true },
      { n: 22, title: 'Please', id: 'please' },
      { n: 23, title: 'Into the Sun', id: 'into-the-sun' },
      // Not part of the setlist proper — sung during ARMY Time, so it shows a
      // label instead of a running-order number. TEMPORARILY REMOVED:
      // { label: 'Bonus', title: '2!3!', id: '2-3', fanProject: true },
    ],
  },
]
