// Two languages, chosen on the first screen and honoured everywhere after.
//
// Nucleus terminology stays in English in both: NUCLEUS, PULSE, SIGNAL,
// SIGNALFALL — and nothing else. Everything around it is
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
    // it is the room the experiment happens in, and without it the seven
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
    stats: ['30 seconds', '7 pieces of information', '2 choices'],
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
  pulseback: {
    title: 'PULSEBACK',
    noticed: 'YOU NOTICED',
    mattered: 'WHAT MATTERED TO YOU',
    withContext: 'WITH MORE CONTEXT',
    quietLabel: 'STILL WAITING',
    quietLead: (name: string, mins: number) =>
      `${name} needed a decision. It had been waiting ${mins} minutes, and it never became one of your two.`,
    quietName: 'SIGNALFALL',
    quietNone: 'Everything that needed a decision this morning ended up in one of your rounds.',
    quietNote: 'Not a mistake. Two choices, seven things — something waits.',
    closingA: 'Someone else may have chosen differently.',
    closingB: 'And they may have had a good reason.',
    cta: 'CONTINUE',
  },
  end: {
    complete: 'PULSE 01 COMPLETE',
    signal: 'SIGNAL',
    signalLine: 'Information that changes what needs to happen next.',
    but: "But noticing something doesn't make it true.",
    next: 'NEXT PULSE',
    truth: 'TRUTH',
    question: 'What do you trust?',
    restart: 'Start again',
    nucleus: 'NUCLEUS',
    experiment: 'An experiment in how we see, think, and decide at work.',
    // The challenge. It shares the participant's own mirror — first look,
    // then with context — in their own words, and nothing else. No score, no
    // ratio, no "signal 60%": the spec bans that outright, and in a group chat
    // a number becomes a leaderboard inside a minute. What spreads instead is
    // the question the whole thing opened with.
    share: 'Challenge the group',
    shareText: (first: string, second: string, changed: string) =>
      `*NUCLEUS PULSE 01 — SIGNAL*

30 seconds. 7 messages. 2 choices.

👀 What pulled me first → ${first}
🔍 With context → ${second}
🔄 ${changed}

What gets *your* attention?
Try it:\n`,
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
    inbox: 'Inbox',
    account: 'kamu@company.co.id',
    updating: 'Memperbarui…',
    updated: 'Baru diperbarui',
    search: 'Cari email',
    focused: 'Fokus',
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
    stats: ['30 detik', '7 pesan', '2 pilihan'],
    question: 'Tadi perhatianmu ke mana?',
    yours: 'Yang kamu pilih',
    cta: 'LANJUT',
  },
  reflection: {
    title: 'Tadi apa yang paling kamu pertimbangkan?',
    hint: 'Pilih paling banyak 2.',
    options: {
      role: 'Peran saya',
      experience: 'Pengalaman saya',
      urgency: 'Urgensi',
      impact: 'Dampaknya',
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
    title: 'Informasi yang sama, sekarang dengan apa yang ada di baliknya.',
    owner: 'PIC',
    decision: 'KEPUTUSAN',
    status: 'STATUS',
    by: 'DEADLINE',
    consequence: 'DAMPAK',
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
    both: 'Setelah konteksnya lengkap, yang menurutmu perlu ditangani duluan jadi berubah.',
    one: 'Satu pilihanmu bertahan. Satu lagi berubah setelah konteksnya lengkap.',
    none: 'Konteks tambahan justru menguatkan pilihan awalmu.',
    closingA: 'Yang berubah bukan pengalamanmu.',
    closingB: 'Tapi informasi yang kamu punya.',
    cta: 'LANJUT',
  },
  pulseback: {
    title: 'PULSEBACK',
    noticed: 'YANG KAMU PERHATIKAN',
    mattered: 'YANG KAMU PERTIMBANGKAN',
    withContext: 'SETELAH ADA KONTEKS TAMBAHAN',
    quietLabel: 'MASIH MENUNGGU',
    quietLead: (name: string, mins: number) =>
      `${name} butuh keputusan. Sudah menunggu ${mins} menit, dan tidak pernah masuk ke pilihanmu.`,
    quietName: 'SIGNALFALL',
    quietNone: 'Semua yang butuh keputusan pagi ini masuk ke salah satu pilihanmu.',
    quietNote: 'Bukan kesalahan. Dua pilihan, tujuh hal — pasti ada yang menunggu.',
    closingA: 'Orang lain mungkin memilih yang berbeda.',
    closingB: 'Dan alasannya bisa jadi masuk akal juga.',
    cta: 'LANJUT',
  },
  end: {
    complete: 'PULSE 01 SELESAI',
    signal: 'SIGNAL',
    signalLine: 'Informasi yang mengubah apa yang harus kamu lakukan berikutnya.',
    but: 'Tapi memperhatikan sesuatu tidak otomatis membuatnya benar.',
    next: 'PULSE BERIKUTNYA',
    truth: 'TRUTH',
    question: 'Apa yang kamu percaya?',
    restart: 'Mulai lagi',
    nucleus: 'NUCLEUS',
    experiment:
      'Eksperimen tentang cara kita melihat, berpikir, dan mengambil keputusan di tempat kerja.',
    share: 'Tantang grup',
    shareText: (first: string, second: string, changed: string) =>
      `*NUCLEUS PULSE 01 — SIGNAL*

30 detik. 7 pesan. 2 pilihan.

👀 Yang narik perhatianku duluan → ${first}
🔍 Setelah tahu konteksnya → ${second}
🔄 ${changed}

Kalau *kamu*, yang mana?
Coba sendiri:\n`,
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
// The seven situations, in both languages. Same facts, same owners, same
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
      'Batch VP-114 · 6 invoice · menunggu persetujuanmu sebelum cut-off bank.',
    headline: 'Pembayaran kontraktor menunggu persetujuan',
    line: '"Batch pembayaran tertunda."',
    owner: 'Finance',
    decision: 'Perlu kamu setujui',
    by: '14:00',
    consequence: 'Kalau lewat cut-off bank, kiriman material penting bisa telat.',
  },
  people: {
    label: 'PEOPLE',
    sender: 'Tim People',
    preview:
      'Dia menanyakan kabarnya pagi ini. Tolong kabari kalau sudah ada keputusan.',
    headline: 'Kandidat final menunggu kabar',
    line: '"Kandidat menunggu kabar."',
    owner: 'People',
    status: 'Sedang dikoordinasikan tim People',
    note: 'Kandidatnya sedang memegang tawaran dari tempat lain. Waktunya tergantung masukan hiring manager.',
  },
  engineering: {
    label: 'ENGINEERING',
    sender: 'Studio',
    preview:
      'Rev.07 terlampir. Instalasi kami tahan sampai ada konfirmasi. Tidak buru-buru.',
    headline: 'MEP Rev.07 menunggu konfirmasi',
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
    headline: 'Kendala akses — Zona B',
    line: '"Tim lapangan menunggu kabar."',
    owner: 'Operations / Civil',
    status: 'Sedang ditangani',
    note: 'Belum sampai perlu dieskalasi.',
  },
  hospitality: {
    label: 'HOSPITALITY',
    sender: 'Front Office',
    preview:
      'Villa 7 tamu tiba 19:30 nanti malam — persiapannya belum selesai.',
    headline: 'Kendala kedatangan tamu malam ini',
    line: '"Persiapan kedatangan perlu perhatian."',
    owner: 'Hospitality / Operations',
    decision: 'Mungkin perlu ada yang turun tangan',
    by: 'Sebelum tamu tiba',
    consequence: 'Bisa berdampak ke pengalaman tamu.',
  },
  governance: {
    label: 'GOVERNANCE',
    sender: 'Corporate Affairs',
    preview:
      'Izin 447/IMB — berkas perpanjangan ada di notaris, bukti terimanya terlampir.',
    headline: 'Izin akan segera berakhir',
    line: '"Status perpanjangan menunggu."',
    owner: 'Corporate Affairs / Governance',
    status: 'Perpanjangan sudah jalan dan sudah ada yang pegang',
    note: 'Hari ini belum perlu dieskalasi.',
  },
};

export const SITUATION_COPY: Record<Lang, Record<SituationId, SituationCopy>> = {
  en: SIT_EN,
  id: SIT_ID,
};

/** Short names used in the Mirror. Deliberately identical in
 *  both languages — these are the names people actually say out loud at work. */
export const SHORT_NAME: Record<SituationId, string> = {
  client: 'Client',
  finance: 'Payment',
  people: 'Candidate',
  engineering: 'Engineering',
  operations: 'Operations',
  hospitality: 'Hospitality',
  governance: 'Governance',
};
