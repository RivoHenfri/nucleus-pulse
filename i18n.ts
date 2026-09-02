// Two languages, chosen on the first screen and honoured everywhere after.
//
// Nucleus terminology stays in English in both: NUCLEUS, PULSE, SIGNAL,
// PULSEBACK, NOISE GRAVITY, SIGNALFALL, LENS LOCK. Everything around it is
// translated — written, not machine-translated, so the Indonesian carries the
// same weight and the morning reads like a real Indonesian work morning.

import type { InfluenceId, SituationCopy, SituationId } from './types';

export type Lang = 'en' | 'id';

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
];

const EN = {
  enter: {
    // "Nucleus" on its own is the name of the WhatsApp group these people are
    // already in, so the opening has to say the product's whole name or it
    // reads as a message from the group rather than a thing to enter.
    brand: 'NUCLEUS PULSE',
    pulse: '01 — SIGNAL',
    question: 'What gets your attention?',
    cta: 'ENTER',
  },
  morning: {
    clock: '09:07 AM',
    title: 'Your morning is already moving.',
    seconds: (n: number) => `You have ${n} seconds.`,
    instruction: 'Choose the 2 things you would deal with first.',
    selected: (n: number) => `${n} of 2 chosen`,
    locked: 'Locked in.',
    // The mail client around the morning. None of this is the experiment —
    // it is the room the experiment happens in, and without it the eight
    // situations read as a quiz instead of a Tuesday.
    inbox: 'Inbox',
    account: 'you@company.co.id',
    updating: 'Updating…',
    updated: 'Updated just now',
    search: 'Search mail',
    focused: 'Focused',
    other: 'Other',
    typing: 'typing…',
    justNow: 'just now',
    minAgo: (n: number) => `${n}m ago`,
    mail: 'MAIL',
    message: 'MESSAGE',
    assistant: 'ASSISTANT',
    now: 'now',
  },
  freeze: {
    stats: ['30 seconds', '8 pieces of information', '2 choices'],
    question: 'Where did your attention go?',
    yours: 'You chose',
    cta: 'CONTINUE',
  },
  reflection: {
    title: 'What mattered to you here?',
    hint: 'Choose up to 2.',
    options: {
      role: 'My role',
      experience: 'Past experience',
      urgency: 'Urgency',
      impact: 'Potential impact',
      needed: 'Someone needed me',
      information: 'Available information',
      instinct: 'Instinct',
    } as Record<InfluenceId, string>,
    cta: 'CONTINUE',
  },
  transition: {
    first: 'You made a choice with the context you had.',
    second: "Now let's add what you couldn't see.",
  },
  context: {
    eyebrow: 'THE SAME MORNING',
    title: 'The same information, with what sat underneath it.',
    owner: 'OWNER',
    decision: 'DECISION',
    status: 'STATUS',
    by: 'BY',
    consequence: 'CONSEQUENCE',
    cta: 'CONTINUE',
  },
  ai: {
    eyebrow: 'AI PRIORITY',
    recommended: "Where I'd start",
    candidate: 'Candidate Decision',
    confidence: "I'm fairly sure about this one.",
    sources: 'SOURCES AVAILABLE',
    sourcesValue: '6 / 8',
    missing: 'MISSING',
    high: 'High confidence.',
    incomplete: 'Incomplete context.',
    quote: 'AI can only reason from what it can see.',
    cta: 'CONTINUE',
  },
  second: {
    same: 'Same morning.',
    more: 'More context.',
    instruction: 'Choose 2 again.',
  },
  mirror: {
    first: 'FIRST LOOK',
    withContext: 'WITH MORE CONTEXT',
    both: 'More context changed what deserved your attention.',
    one: 'Some instincts held. One changed with context.',
    none: 'More context reinforced your first judgment.',
    closingA: "Your experience didn't change.",
    closingB: 'The information available to you did.',
    cta: 'CONTINUE',
  },
  signal: {
    word: 'SIGNAL',
    definition: 'Information that changes what needs to happen next.',
    concepts: ['DECISION', 'ACTION', 'RISK', 'OUTCOME'],
    closing: 'Something can be important without requiring your attention right now.',
    cta: 'CONTINUE',
  },
  noise: {
    line: "More information doesn't always create more clarity.",
    hero: 'HIGH ACTIVITY ≠ HIGH SIGNAL',
    cta: 'CONTINUE',
  },
  lens: {
    yours: 'WHAT MATTERED TO YOU',
    helps: 'A lens helps us see.',
    boundary: 'But every lens has a boundary.',
    lenses: ['ROLE', 'EXPERIENCE', 'EXPERTISE', 'AI'],
    lockTitle: 'LENS LOCK',
    lockLine: 'When one useful perspective becomes the only perspective.',
    heroA: 'BRING YOUR EXPERIENCE.',
    heroB: "DON'T MISTAKE IT FOR THE WHOLE PICTURE.",
    cta: 'CONTINUE',
  },
  system: {
    oneMore: 'One more thing.',
    fragments: {
      urgent: 'URGENT',
      sound: 'a sound, and one underneath it',
      unread: '4 unread',
      countdown: '00:07',
      order: 'arrived first',
      confidence: 'it sounded sure',
      position: 'top of the screen',
    },
    influence: 'There was one more influence.',
    thisScreen: 'THIS SCREEN.',
    lines: ['Some things were louder.', 'Some appeared first.', 'Some looked more certain.'],
    closingA: 'The information was part of the experience.',
    closingB: 'So was the way it reached you.',
    cta: 'CONTINUE',
  },
  phenomena: {
    gravityTitle: 'NOISE GRAVITY',
    gravityLine: "When what's loud pulls attention.",
    fallTitle: 'SIGNALFALL',
    fallLine: 'When what matters gets buried.',
    hero: 'EVERY SYSTEM HAS GRAVITY.',
    closingA: 'Design influences what becomes easy to notice.',
    closingB: 'Human judgment decides what deserves attention.',
    cta: 'CONTINUE',
  },
  pulseback: {
    title: 'PULSEBACK',
    noticed: 'YOU NOTICED',
    mattered: 'WHAT MATTERED TO YOU',
    withContext: 'WITH MORE CONTEXT',
    closingA: 'Someone else may have chosen differently.',
    closingB: 'And they may have had a good reason.',
    cta: 'CONTINUE',
  },
  final: {
    notAbout: "This wasn't about finding the right two messages.",
    wasAbout: 'It was about noticing what makes something feel important.',
    forces: ['Your role.', 'Your experience.', 'The context available.', 'The system around you.'],
    notSame: "We don't all notice the same things.",
    notProblem: "That's not always a problem.",
    problem: 'The problem begins when we assume everyone sees what we see.',
    hero: 'REALITY IS LARGER THAN ANY ONE LENS.',
    reflection: 'What might you be seeing clearly — but only through your own lens?',
    small: 'No need to answer. Just notice it.',
    nucleus: 'NUCLEUS',
    experiment: 'An experiment in how we see, think, and decide at work.',
    cta: 'CONTINUE',
  },
  end: {
    complete: 'PULSE 01 COMPLETE',
    signal: 'SIGNAL',
    but: "But noticing something doesn't make it true.",
    next: 'NEXT PULSE',
    truth: 'TRUTH',
    question: 'What do you trust?',
    restart: 'Start again',
  },
  common: {
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    // Said before the language is chosen, because after that it is too late
    // to go and find headphones.
    soundHint: 'This experience is carried by sound. Headphones if you have them.',
    soundBlocked: 'Sound is off. Tap to turn it on.',
    soundSilent: 'No sound is coming through. Check the silent switch or the volume.',
  },
};

export type Copy = typeof EN;

const ID: Copy = {
  enter: {
    brand: 'NUCLEUS PULSE',
    pulse: '01 — SIGNAL',
    question: 'Apa yang menarik perhatianmu?',
    cta: 'MULAI',
  },
  morning: {
    clock: '09:07',
    title: 'Pagimu sudah jalan duluan.',
    seconds: (n: number) => `Kamu punya ${n} detik.`,
    instruction: 'Pilih 2 yang mau kamu tangani duluan.',
    selected: (n: number) => `${n} dari 2 dipilih`,
    locked: 'Terkunci.',
    inbox: 'Kotak Masuk',
    account: 'kamu@company.co.id',
    updating: 'Memperbarui…',
    updated: 'Baru diperbarui',
    search: 'Cari email',
    focused: 'Utama',
    other: 'Lainnya',
    typing: 'sedang mengetik…',
    justNow: 'baru saja',
    minAgo: (n: number) => `${n} mnt lalu`,
    mail: 'EMAIL',
    message: 'PESAN',
    assistant: 'ASSISTANT',
    now: 'sekarang',
  },
  freeze: {
    stats: ['30 detik', '8 informasi', '2 pilihan'],
    question: 'Tadi perhatianmu ke mana?',
    yours: 'Yang kamu pilih',
    cta: 'LANJUT',
  },
  reflection: {
    title: 'Tadi kamu paling mikirin apa?',
    hint: 'Pilih paling banyak 2.',
    options: {
      role: 'Peran saya',
      experience: 'Pengalaman saya',
      urgency: 'Urgensi',
      impact: 'Dampaknya nanti',
      needed: 'Ada yang butuh saya',
      information: 'Informasi yang ada',
      instinct: 'Insting',
    },
    cta: 'LANJUT',
  },
  transition: {
    first: 'Kamu memilih dengan konteks yang kamu punya waktu itu.',
    second: 'Sekarang, kita tambahkan yang tadi belum kelihatan.',
  },
  context: {
    eyebrow: 'PAGI YANG SAMA',
    title: 'Informasi yang sama, plus apa yang ada di baliknya.',
    owner: 'PEMILIK',
    decision: 'KEPUTUSAN',
    status: 'STATUS',
    by: 'BATAS WAKTU',
    consequence: 'KONSEKUENSI',
    cta: 'LANJUT',
  },
  ai: {
    eyebrow: 'AI PRIORITY',
    recommended: 'Aku mulai dari sini',
    candidate: 'Keputusan Kandidat',
    confidence: 'Aku cukup yakin soal yang ini.',
    sources: 'SUMBER TERSEDIA',
    sourcesValue: '6 / 8',
    missing: 'TIDAK TERBACA',
    high: 'Keyakinan tinggi.',
    incomplete: 'Konteks belum lengkap.',
    quote: 'AI cuma bisa berpikir dari apa yang bisa dia lihat.',
    cta: 'LANJUT',
  },
  second: {
    same: 'Pagi yang sama.',
    more: 'Konteksnya lebih lengkap.',
    instruction: 'Pilih 2 lagi.',
  },
  mirror: {
    first: 'PILIHAN PERTAMA',
    withContext: 'SETELAH ADA KONTEKS',
    both: 'Setelah konteksnya lebih lengkap, yang menurutmu perlu diperhatikan jadi berubah.',
    one: 'Sebagian pilihanmu bertahan. Satu berubah setelah konteksnya lebih lengkap.',
    none: 'Konteks tambahan justru menguatkan pilihan awalmu.',
    closingA: 'Yang berubah bukan pengalamanmu.',
    closingB: 'Tapi informasi yang kamu punya.',
    cta: 'LANJUT',
  },
  signal: {
    word: 'SIGNAL',
    definition: 'Informasi yang mengubah apa yang harus kamu lakukan berikutnya.',
    concepts: ['KEPUTUSAN', 'TINDAKAN', 'RISIKO', 'HASIL'],
    closing: 'Sesuatu bisa saja penting, tanpa harus kamu urus sekarang.',
    cta: 'LANJUT',
  },
  noise: {
    line: 'Informasi yang lebih banyak belum tentu bikin lebih jelas.',
    hero: 'AKTIVITAS TINGGI ≠ SIGNAL TINGGI',
    cta: 'LANJUT',
  },
  lens: {
    yours: 'YANG KAMU PERTIMBANGKAN',
    helps: 'Sudut pandang bikin kita bisa melihat.',
    boundary: 'Tapi setiap sudut pandang punya batasnya.',
    lenses: ['PERAN', 'PENGALAMAN', 'KEAHLIAN', 'AI'],
    lockTitle: 'LENS LOCK',
    lockLine: 'Waktu satu sudut pandang yang berguna berubah jadi satu-satunya yang kamu pakai.',
    heroA: 'BAWA PENGALAMANMU.',
    heroB: 'TAPI JANGAN KIRA ITU SELURUH GAMBARANNYA.',
    cta: 'LANJUT',
  },
  system: {
    oneMore: 'Satu hal lagi.',
    fragments: {
      urgent: 'URGENT',
      sound: 'sebuah bunyi, dan satu lagi di bawahnya',
      unread: '4 belum dibaca',
      countdown: '00:07',
      order: 'muncul lebih dulu',
      confidence: 'terdengar yakin',
      position: 'paling atas layar',
    },
    influence: 'Ada satu hal lagi yang ikut memengaruhi.',
    thisScreen: 'LAYAR INI.',
    lines: [
      'Ada yang terasa lebih mendesak.',
      'Ada yang muncul lebih dulu.',
      'Ada yang terlihat lebih meyakinkan.',
    ],
    closingA: 'Informasinya bagian dari pengalaman ini.',
    closingB: 'Begitu juga cara informasi itu sampai ke kamu.',
    cta: 'LANJUT',
  },
  phenomena: {
    gravityTitle: 'NOISE GRAVITY',
    gravityLine: 'Waktu yang paling berisik yang menarik perhatian.',
    fallTitle: 'SIGNALFALL',
    fallLine: 'Waktu yang penting tenggelam di antara yang lain.',
    hero: 'SETIAP SISTEM PUNYA GRAVITASI.',
    closingA: 'Desain menentukan apa yang lebih gampang terlihat.',
    closingB: 'Manusia yang menentukan apa yang layak diperhatikan.',
    cta: 'LANJUT',
  },
  pulseback: {
    title: 'PULSEBACK',
    noticed: 'YANG KAMU PERHATIKAN',
    mattered: 'YANG KAMU PERTIMBANGKAN',
    withContext: 'SETELAH ADA KONTEKS TAMBAHAN',
    closingA: 'Orang lain mungkin memilih yang berbeda.',
    closingB: 'Dan alasannya bisa jadi masuk akal juga.',
    cta: 'LANJUT',
  },
  final: {
    notAbout: 'Ini bukan soal menemukan dua pesan yang paling benar.',
    wasAbout: 'Ini soal menyadari apa yang bikin sesuatu terasa penting.',
    forces: ['Peranmu.', 'Pengalamanmu.', 'Konteks yang tersedia.', 'Sistem di sekitarmu.'],
    notSame: 'Kita memang tidak selalu memperhatikan hal yang sama.',
    notProblem: 'Dan itu tidak selalu jadi masalah.',
    problem: 'Masalahnya baru mulai waktu kita mengira semua orang melihat apa yang kita lihat.',
    hero: 'REALITAS LEBIH BESAR DARI SATU SUDUT PANDANG.',
    reflection: 'Apa yang sekarang terasa jelas sekali buatmu — tapi mungkin cuma dari sudut pandangmu?',
    small: 'Tidak perlu dijawab. Cukup disadari.',
    nucleus: 'NUCLEUS',
    experiment:
      'Eksperimen tentang cara kita melihat, berpikir, dan mengambil keputusan di tempat kerja.',
    cta: 'LANJUT',
  },
  end: {
    complete: 'PULSE 01 SELESAI',
    signal: 'SIGNAL',
    but: 'Tapi memperhatikan sesuatu tidak otomatis bikin hal itu benar.',
    next: 'PULSE BERIKUTNYA',
    truth: 'TRUTH',
    question: 'Apa yang kamu percaya?',
    restart: 'Mulai lagi',
  },
  common: {
    soundOn: 'Suara hidup',
    soundOff: 'Suara mati',
    soundHint: 'Pengalaman ini pakai suara. Kalau ada headphone, pakai ya.',
    soundBlocked: 'Suara belum menyala. Ketuk untuk menyalakan.',
    soundSilent: 'Suara tidak terdengar. Cek tombol senyap atau volume perangkatmu.',
  },
};

export const COPY: Record<Lang, Copy> = { en: EN, id: ID };

// ---------------------------------------------------------------------------
// The eight situations, in both languages. Same facts, same owners, same
// deadlines, same consequences — only the language moves.
// ---------------------------------------------------------------------------

const SIT_EN: Record<SituationId, SituationCopy> = {
  client: {
    label: 'URGENT',
    sender: 'Villa Owner',
    preview:
      'RE: RE: FW: Owner is asking again — can someone confirm before the call?',
    contextLabel: 'CLIENT',
    headline: 'Villa owner requesting confirmation',
    line: '"Can we confirm this ASAP?"',
    owner: 'Client Relationship',
    status: 'Already acknowledged',
    note: 'No decision required from you right now.',
  },
  finance: {
    label: 'PAYMENT',
    sender: 'Finance — Approvals',
    preview:
      'Batch VP-114 · 6 invoices · your approval needed before the bank cut-off.',
    headline: 'Contractor payment awaiting approval',
    line: '"Payment batch pending."',
    owner: 'Finance',
    decision: 'Approval required',
    by: '14:00',
    consequence: 'Missing the bank cut-off may delay critical material delivery.',
  },
  people: {
    label: 'PEOPLE',
    sender: 'People Team',
    preview:
      'She asked for an update this morning. Let us know when you can.',
    headline: 'Final candidate awaiting confirmation',
    line: '"Candidate waiting for feedback."',
    owner: 'People',
    status: 'People team coordinating',
    note: 'Candidate has another offer. Timing depends on required hiring-manager input.',
  },
  engineering: {
    label: 'ENGINEERING',
    sender: 'Studio',
    preview:
      'Rev.07 attached. We hold installation until you confirm. No rush from us.',
    headline: 'MEP Rev.07 awaiting confirmation',
    line: '"Latest revision received."',
    owner: 'Engineering',
    decision: 'Confirmation required',
    by: 'Today',
    consequence: 'Installation may move by approximately 2 days.',
  },
  operations: {
    label: 'OPERATIONS',
    sender: 'Site Team — Zone B',
    preview:
      'Budi: sudah kami cek · Rina: nanti saya kirim fotonya · Budi: 👍',
    headline: 'Access issue reported — Zone B',
    line: '"Site team requesting update."',
    owner: 'Operations / Civil',
    status: 'Already being handled',
    note: 'Escalation threshold not reached.',
  },
  hospitality: {
    label: 'HOSPITALITY',
    sender: 'Front Office',
    preview:
      'Villa 7 arrival 19:30 tonight — preparation still not closed.',
    headline: 'Guest arrival issue tonight',
    line: '"Arrival preparation needs attention."',
    owner: 'Hospitality / Operations',
    decision: 'Operational action may be required',
    by: 'Before guest arrival',
    consequence: 'Potential guest-experience impact.',
  },
  governance: {
    label: 'GOVERNANCE',
    sender: 'Corporate Affairs',
    preview:
      'Permit 447/IMB — renewal file is with the notary, tracking attached.',
    headline: 'Permit approaching expiry',
    line: '"Renewal status pending."',
    owner: 'Corporate Affairs / Governance',
    status: 'Renewal already assigned and underway',
    note: 'No escalation required today.',
  },
  ai: {
    label: 'AI PRIORITY',
    sender: 'Nucleus Assistant',
    preview:
      'Based on 6 signals from your morning.',
    contextLabel: 'AI',
    headline: "I'd start with the candidate decision",
    line: "Fairly sure about this one.",
    owner: 'Nucleus Assistant',
    status: 'Recommendation only',
    note: 'Sources available 6 / 8. Missing: Operations Update — 08:52.',
  },
};

const SIT_ID: Record<SituationId, SituationCopy> = {
  client: {
    label: 'URGENT',
    sender: 'Villa Owner',
    preview:
      'RE: RE: FW: Pemiliknya menanyakan lagi — ada yang bisa konfirmasi sebelum call?',
    contextLabel: 'CLIENT',
    headline: 'Pemilik villa minta konfirmasi',
    line: '"Bisa dikonfirmasi secepatnya?"',
    owner: 'Client Relationship',
    status: 'Sudah ditanggapi',
    note: 'Belum ada yang perlu kamu putuskan.',
  },
  finance: {
    label: 'PAYMENT',
    sender: 'Finance — Approvals',
    preview:
      'Batch VP-114 · 6 invoice · menunggu persetujuanmu sebelum batas waktu bank.',
    headline: 'Pembayaran kontraktor nunggu disetujui',
    line: '"Batch pembayaran tertunda."',
    owner: 'Finance',
    decision: 'Perlu kamu setujui',
    by: '14:00',
    consequence: 'Kalau lewat jam bank, kiriman material penting bisa telat.',
  },
  people: {
    label: 'PEOPLE',
    sender: 'Tim People',
    preview:
      'Dia menanyakan kabarnya pagi ini. Tolong kabari kalau sudah ada keputusan.',
    headline: 'Kandidat final nunggu kabar',
    line: '"Kandidat menunggu kabar."',
    owner: 'People',
    status: 'Lagi dikoordinasikan tim People',
    note: 'Kandidatnya lagi pegang tawaran lain. Waktunya tergantung masukan hiring manager.',
  },
  engineering: {
    label: 'ENGINEERING',
    sender: 'Studio',
    preview:
      'Rev.07 terlampir. Instalasi kami tahan sampai ada konfirmasi. Tidak buru-buru.',
    headline: 'MEP Rev.07 nunggu dikonfirmasi',
    line: '"Revisi terbaru sudah diterima."',
    owner: 'Engineering',
    decision: 'Perlu kamu konfirmasi',
    by: 'Hari ini',
    consequence: 'Instalasinya bisa mundur sekitar 2 hari.',
  },
  operations: {
    label: 'OPERATIONS',
    sender: 'Tim Lapangan — Zona B',
    preview:
      'Budi: sudah kami cek · Rina: nanti saya kirim fotonya · Budi: 👍',
    headline: 'Ada kendala akses — Zona B',
    line: '"Tim lapangan menunggu kabar."',
    owner: 'Operations / Civil',
    status: 'Lagi ditangani',
    note: 'Belum sampai perlu dieskalasi.',
  },
  hospitality: {
    label: 'HOSPITALITY',
    sender: 'Front Office',
    preview:
      'Villa 7 tamu tiba 19:30 nanti malam — persiapannya belum selesai.',
    headline: 'Ada kendala kedatangan tamu malam ini',
    line: '"Persiapan kedatangan perlu perhatian."',
    owner: 'Hospitality / Operations',
    decision: 'Mungkin perlu ada yang turun tangan',
    by: 'Sebelum tamu tiba',
    consequence: 'Bisa kena ke pengalaman tamunya.',
  },
  governance: {
    label: 'GOVERNANCE',
    sender: 'Corporate Affairs',
    preview:
      'Izin 447/IMB — berkas perpanjangan ada di notaris, bukti terimanya terlampir.',
    headline: 'Izin sebentar lagi habis',
    line: '"Status perpanjangan menunggu."',
    owner: 'Corporate Affairs / Governance',
    status: 'Perpanjangannya sudah jalan, sudah ada yang pegang',
    note: 'Hari ini belum perlu dieskalasi.',
  },
  ai: {
    label: 'AI PRIORITY',
    sender: 'Nucleus Assistant',
    preview:
      'Berdasarkan 6 sinyal pagi ini.',
    contextLabel: 'AI',
    headline: 'Kayaknya keputusan kandidat duluan',
    line: 'Cukup yakin soal yang ini.',
    owner: 'Nucleus Assistant',
    status: 'Sekadar rekomendasi',
    note: 'Sumber yang kebaca 6 dari 8. Yang kelewat: Operations Update — 08:52.',
  },
};

export const SITUATION_COPY: Record<Lang, Record<SituationId, SituationCopy>> = {
  en: SIT_EN,
  id: SIT_ID,
};

/** Short names used in the Mirror and in PULSEBACK. Deliberately identical in
 *  both languages — these are the names people actually say out loud at work. */
export const SHORT_NAME: Record<SituationId, string> = {
  client: 'Client',
  finance: 'Payment',
  people: 'Candidate',
  engineering: 'Engineering',
  operations: 'Operations',
  hospitality: 'Hospitality',
  governance: 'Governance',
  ai: 'AI',
};

/** The source the AI could not see. Quoted in Scene 07. */
export const MISSING_SOURCE = 'Operations Update — 08:52';
