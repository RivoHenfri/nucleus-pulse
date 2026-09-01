// Two languages, chosen before the first screen and honoured everywhere after:
// scene copy, the mailbox itself, the recorded narration, and the Pulse's answer.
//
// The Indonesian is written, not machine-translated: the ritual lines keep their
// weight, and the mailbox reads like a real Indonesian work inbox.

export type Lang = 'en' | 'id';

export const LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'id', label: 'Indonesian', native: 'Bahasa Indonesia' },
];

export interface Copy {
  enter: { lines: string[]; ready: string; cta: string };
  pulse: {
    instruction: [string, string, string];
    selected: (n: number, max: number) => string;
    inbox: string;
    updating: string;
    updated: string;
    search: string;
    focused: string;
    other: string;
    allMail: string;
    archive: string;
    sortedBy: string;
    decisionChip: string;
    typing: string;
    justNow: string;
    minAgo: (n: number) => string;
    mail: string;
    message: string;
    reminder: string;
    now: string;
  };
  lock: { locked: string; chose: string; butWhat: string; cta: string };
  peel: {
    title: string;
    subtitle: string;
    nothing: string;
    tap: string;
    meanwhile: string;
    noAlarms: string;
    cta: string;
  };
  gravity: {
    title: string;
    loudNotImportant: [string, string, string];
    forces: string;
    compete: string;
    attention: string;
    cta: string;
  };
  reveal: {
    changed: string;
    notInfo: string;
    theWay: [string, string, string];
    round1: string;
    round2: string;
    nothing: string;
    signalfall: string;
    notDisappear: string;
    buried: [string, string];
    notHidden: string;
    onlyChanged: string;
    cta: string;
  };
  human: {
    you: string;
    compete: string;
    notEqual: string;
    question: [string, string, string];
    cta: string;
  };
  pulseback: {
    title: string;
    think: string;
    question: [string, string, string];
    placeholder: string;
    send: string;
    reading: string;
    received: string;
    signalFound: string;
    answers: string;
    reflection: string;
    lived: string;
    round1Bar: string;
    round2Bar: string;
    signalWord: string;
    noiseWord: string;
    buriedTitle: string;
    cohortRuns: (n: number) => string;
    cohortBody: (noisePct: number, zeroPct: number, a1: number, a2: number) => string;
    better: (n: number) => string;
    zero: string;
    steady: (a: number, b: number) => string;
    summonCta: string;
    shareLead: string;
    shareSub: string;
    namePlaceholder: string;
    tagPlaceholder: string;
    preview: string;
    writing: string;
    shareWa: string;
    copy: string;
    copied: string;
    skip: string;
    found: string;
    nextPulse: string;
    truth: string;
    trust: string;
    again: string;
  };
}

const EN: Copy = {
  enter: {
    lines: ['09:07 AM', 'Your day has started.', 'Things are already moving.', 'You have limited attention.'],
    ready: 'Ready?',
    cta: 'ENTER THE SIGNAL',
  },
  pulse: {
    instruction: ['Open the ', 'THREE', ' you would check first.'],
    selected: (n, max) => `${n}/${max}`,
    inbox: 'Inbox',
    updating: 'Updating…',
    updated: 'Updated just now',
    search: 'Search mail',
    focused: 'Focused',
    other: 'Other',
    allMail: 'All mail',
    archive: 'Archive',
    sortedBy: 'sorted by: decision needed',
    decisionChip: 'DECISION REQUIRED',
    typing: 'typing…',
    justNow: 'Just now',
    minAgo: n => `${n} min ago`,
    mail: 'Mail',
    message: 'Message',
    reminder: 'Reminder',
    now: 'now',
  },
  lock: {
    locked: 'LOCKED.',
    chose: 'You chose what to look at.',
    butWhat: 'But what chose you?',
    cta: 'LOOK BENEATH',
  },
  peel: {
    title: 'PEEL THE NOISE',
    subtitle: 'Tap what you chose. Look underneath.',
    nothing: 'You chose nothing. The noise won by default.',
    tap: 'TAP',
    meanwhile: 'MEANWHILE, BURIED IN THE FEED —',
    noAlarms: 'No alarms. No red badges. Just consequences.',
    cta: 'WHY DID THIS HAPPEN?',
  },
  gravity: {
    title: 'NOISE GRAVITY',
    loudNotImportant: ['Some information pulls attention because it is ', 'loud', ', not because it is important.'],
    forces: 'Urgency. Volume. Position. People.',
    compete: 'They all compete for the same thing:',
    attention: 'YOUR ATTENTION.',
    cta: 'AGAIN?',
  },
  reveal: {
    changed: 'Something changed.',
    notInfo: "But it wasn't the information.",
    theWay: ['It was the way the information ', 'reached', ' you.'],
    round1: 'ROUND 01',
    round2: 'ROUND 02',
    nothing: '— nothing —',
    signalfall: 'SIGNALFALL',
    notDisappear: "Important information doesn't have to disappear.",
    buried: ['Sometimes it simply gets ', 'buried.'],
    notHidden: 'Nothing was hidden from you.',
    onlyChanged: 'We only changed what was easier to notice.',
    cta: 'ONE LAST THING',
  },
  human: {
    you: 'YOU',
    compete: 'Every day, hundreds of things compete for your attention.',
    notEqual: 'Not everything deserves the same amount of it.',
    question: ['Before reacting, what makes something ', 'worth', ' your attention?'],
    cta: 'SEND YOUR PULSEBACK',
  },
  pulseback: {
    title: 'PULSEBACK',
    think: 'Think about your work right now.',
    question: ['What is one important ', 'signal', ' that might be buried under noise?'],
    placeholder: 'One sentence is enough…',
    send: 'SEND ⚡',
    reading: 'THE PULSE IS READING YOUR SIGNAL…',
    received: 'PULSEBACK RECEIVED ⚡',
    signalFound: 'Signal found.',
    answers: 'THE PULSE ANSWERS —',
    reflection: 'YOUR PULSE · REFLECTION',
    lived: 'WHAT YOU JUST LIVED THROUGH',
    round1Bar: 'ROUND 1 · LOUD FEED',
    round2Bar: 'ROUND 2 · SAME REALITY',
    signalWord: 'signal',
    noiseWord: 'noise',
    buriedTitle: 'BURIED IN ROUND 1',
    cohortRuns: n => `${n} RUNS ON THIS DEVICE`,
    cohortBody: (noisePct, zeroPct, a1, a2) =>
      `of all Round-1 picks here landed on noise — ${zeroPct}% of runs caught none. Average ${a1} → ${a2} once the presentation flipped.`,
    better: n => `You caught ${n} more in Round 2 — with the exact same eight items. Only the ease of noticing changed.`,
    zero: 'Round 1: zero signals. Three real decisions passed you, buried under red badges and buzzes.',
    steady: (a, b) => `Steady at ${a}→${b}. The question is not your speed — it is what you missed twice.`,
    summonCta: 'SUMMON THE NEXT ONES ⚡',
    shareLead: 'Do not send them the answer. Send them the dare.',
    shareSub: 'Nobody learns Signal by reading about it.',
    namePlaceholder: 'Your name (e.g., Tole)',
    tagPlaceholder: 'Tag next (Rivo, Henfri)',
    preview: 'PREVIEW · WHAT THE GROUP GETS',
    writing: 'THE PULSE IS WRITING THE SUMMONS…',
    shareWa: 'Summon on WhatsApp 🔗',
    copy: 'Copy Text',
    copied: 'Copied! ✨',
    skip: 'SKIP — FINISH MY PULSE →',
    found: 'SIGNAL FOUND.',
    nextPulse: 'NEXT PULSE',
    truth: 'TRUTH',
    trust: 'What do you trust?',
    again: 'RUN IT AGAIN',
  },
};

const ID: Copy = {
  enter: {
    lines: ['09:07 PAGI', 'Harimu sudah dimulai.', 'Semuanya sudah bergerak.', 'Perhatianmu terbatas.'],
    ready: 'Siap?',
    cta: 'MASUKI SINYAL',
  },
  pulse: {
    instruction: ['Buka ', 'TIGA', ' yang akan kamu cek duluan.'],
    selected: (n, max) => `${n}/${max}`,
    inbox: 'Kotak Masuk',
    updating: 'Memperbarui…',
    updated: 'Baru diperbarui',
    search: 'Cari email',
    focused: 'Utama',
    other: 'Lainnya',
    allMail: 'Semua email',
    archive: 'Arsip',
    sortedBy: 'urut: butuh keputusan',
    decisionChip: 'BUTUH KEPUTUSAN',
    typing: 'sedang mengetik…',
    justNow: 'Baru saja',
    minAgo: n => `${n} mnt lalu`,
    mail: 'Email',
    message: 'Pesan',
    reminder: 'Pengingat',
    now: 'baru saja',
  },
  lock: {
    locked: 'TERKUNCI.',
    chose: 'Kamu memilih apa yang kamu lihat.',
    butWhat: 'Tapi apa yang memilihmu?',
    cta: 'LIHAT DI BALIKNYA',
  },
  peel: {
    title: 'KUPAS NOISE-NYA',
    subtitle: 'Ketuk pilihanmu. Lihat apa isinya.',
    nothing: 'Kamu tidak memilih apa pun. Noise menang tanpa perlawanan.',
    tap: 'KETUK',
    meanwhile: 'SEMENTARA ITU, TERKUBUR DI FEED —',
    noAlarms: 'Tidak ada alarm. Tidak ada badge merah. Hanya konsekuensi.',
    cta: 'KENAPA INI TERJADI?',
  },
  gravity: {
    title: 'GRAVITASI NOISE',
    loudNotImportant: ['Sebagian informasi menarik perhatian karena ', 'berisik', ', bukan karena penting.'],
    forces: 'Urgensi. Volume. Posisi. Orang.',
    compete: 'Semuanya memperebutkan satu hal yang sama:',
    attention: 'PERHATIANMU.',
    cta: 'SEKALI LAGI?',
  },
  reveal: {
    changed: 'Ada yang berubah.',
    notInfo: 'Tapi bukan informasinya.',
    theWay: ['Yang berubah adalah cara informasi itu ', 'sampai', ' kepadamu.'],
    round1: 'RONDE 01',
    round2: 'RONDE 02',
    nothing: '— tidak ada —',
    signalfall: 'SIGNALFALL',
    notDisappear: 'Informasi penting tidak harus hilang.',
    buried: ['Kadang ia hanya ', 'terkubur.'],
    notHidden: 'Tidak ada yang disembunyikan darimu.',
    onlyChanged: 'Yang kami ubah hanya satu: mana yang lebih mudah terlihat.',
    cta: 'SATU HAL TERAKHIR',
  },
  human: {
    you: 'KAMU',
    compete: 'Setiap hari, ratusan hal memperebutkan perhatianmu.',
    notEqual: 'Tidak semuanya layak mendapat porsi yang sama.',
    question: ['Sebelum bereaksi, apa yang membuat sesuatu ', 'layak', ' atas perhatianmu?'],
    cta: 'KIRIM PULSEBACK-MU',
  },
  pulseback: {
    title: 'PULSEBACK',
    think: 'Pikirkan pekerjaanmu sekarang.',
    question: ['Apa satu ', 'sinyal', ' penting yang mungkin terkubur di bawah noise?'],
    placeholder: 'Satu kalimat sudah cukup…',
    send: 'KIRIM ⚡',
    reading: 'THE PULSE SEDANG MEMBACA SINYALMU…',
    received: 'PULSEBACK DITERIMA ⚡',
    signalFound: 'Sinyal ditemukan.',
    answers: 'THE PULSE MENJAWAB —',
    reflection: 'PULSE-MU · REFLEKSI',
    lived: 'YANG BARU SAJA KAMU ALAMI',
    round1Bar: 'RONDE 1 · FEED BERISIK',
    round2Bar: 'RONDE 2 · REALITAS SAMA',
    signalWord: 'sinyal',
    noiseWord: 'noise',
    buriedTitle: 'YANG TERKUBUR DI RONDE 1',
    cohortRuns: n => `${n} SESI DI PERANGKAT INI`,
    cohortBody: (noisePct, zeroPct, a1, a2) =>
      `dari semua pilihan Ronde 1 di sini jatuh ke noise — ${zeroPct}% sesi bahkan nol sinyal. Rata-rata ${a1} → ${a2} setelah presentasinya dibalik.`,
    better: n =>
      `Di Ronde 2 kamu menangkap ${n} sinyal lebih banyak — padahal isinya delapan item yang sama persis. Yang berubah cuma mana yang lebih gampang dilihat.`,
    zero: 'Ronde 1: nol sinyal. Tiga keputusan nyata lewat di depan mata, tertutup badge merah dan getaran.',
    steady: (a, b) =>
      `Stabil di angka ${a}→${b}. Pertanyaannya bukan seberapa cepat kamu, tapi apa yang tetap kamu lewatkan dua kali.`,
    summonCta: 'PANGGIL YANG BERIKUTNYA ⚡',
    shareLead: 'Jangan kirim jawabannya. Kirim tantangannya.',
    shareSub: 'Tidak ada yang paham Signal dengan cara membacanya.',
    namePlaceholder: 'Namamu (misal: Tole)',
    tagPlaceholder: 'Tandai berikutnya (Rivo, Henfri)',
    preview: 'PRATINJAU · YANG DITERIMA GRUP',
    writing: 'THE PULSE SEDANG MENULIS PANGGILANNYA…',
    shareWa: 'Panggil lewat WhatsApp 🔗',
    copy: 'Salin Teks',
    copied: 'Tersalin! ✨',
    skip: 'LEWATI — SELESAIKAN PULSE-KU →',
    found: 'SINYAL DITEMUKAN.',
    nextPulse: 'PULSE BERIKUTNYA',
    truth: 'TRUTH',
    trust: 'Apa yang kamu percaya?',
    again: 'ULANGI LAGI',
  },
};

export const COPY: Record<Lang, Copy> = { en: EN, id: ID };

// ---------------------------------------------------------------------------
// The mailbox itself. Sender names stay as they are — people do not translate.
// ---------------------------------------------------------------------------

export interface ItemCopy {
  source: string;
  headline: string;
  preview: string;
  reveal: string[];
  consequence?: string;
}

export const ITEM_COPY: Record<Lang, Record<string, ItemCopy>> = {
  en: {},  // the English copy already lives in data.ts
  id: {
    'urgent-client': {
      source: 'URGENT',
      headline: 'Klien minta update sekarang.',
      preview: 'RE: RE: FW: Klien menanyakan status — ada yang bisa balas sebelum call?',
      reveal: ['Sudah ditangani.', 'Tidak ada keputusan yang dibutuhkan darimu.'],
    },
    'project-group': {
      source: 'GRUP PROYEK',
      headline: '17 pesan belum dibaca.',
      preview: 'Rina: haha ok · Budi: 👍 · Rina: nanti aku kirim fotonya ya',
      reveal: ['14 obrolan', '2 FYI', '1 emoji 👍', 'Tidak ada keputusan yang dibutuhkan.'],
    },
    calendar: {
      source: 'KALENDER',
      headline: 'Meeting mulai 10 menit lagi.',
      preview: '09:30 – 10:30 · Ruang Meeting 2 · 11 peserta · Kehadiranmu opsional',
      reveal: ['Agenda terlampir. Kamu opsional.', 'Tidak ada keputusan yang dibutuhkan sekarang.'],
    },
    dm: {
      source: 'PESAN LANGSUNG',
      headline: '"Bisa tolong cek ini sebentar?"',
      preview: 'Bisa tolong cek ini sebentar? 🙏 maaf ganggu',
      reveal: ['Tidak menghambat siapa pun.', 'Jawaban "ya" bisa menunggu sampai makan siang.', 'Tidak ada keputusan yang dibutuhkan.'],
    },
    dashboard: {
      source: 'DASHBOARD PROYEK',
      headline: '92% — SESUAI RENCANA 🟢',
      preview: 'Ringkasan progres mingguan · 92% selesai · status hijau · tidak ada action item',
      reveal: ['Hanya informasi.', 'Tidak ada keputusan yang dibutuhkan.'],
    },
    permit: {
      source: 'IZIN',
      headline: 'Habis dalam 12 hari.',
      preview: 'IMB no. 447 habis dalam 12 hari. Perpanjangan butuh persetujuanmu.',
      reveal: ['Keputusan perpanjangan dibutuhkan minggu ini.'],
      consequence: 'Izin yang lewat bisa menghentikan pekerjaan di lapangan sepenuhnya.',
    },
    drawing: {
      source: 'GAMBAR KERJA',
      headline: 'Revisi terbaru menunggu konfirmasi.',
      preview: 'Rev C terlampir. Fabrikasi kami tahan sampai kamu konfirmasi. Santai saja dari kami.',
      reveal: ['Konfirmasimu yang melepas fabrikasi.'],
      consequence: 'Menunggu dalam diam memakan 3 hari di jalur kritis.',
    },
    variation: {
      source: 'VARIASI',
      headline: 'Potensi dampak +Rp 480 jt setelah Jumat.',
      preview: 'Harga VO-19 dikunci sampai Jumat. Setelah itu kontraktor menghargai ulang sesuai pasar.',
      reveal: ['Keputusan dibutuhkan sebelum Jumat.'],
      consequence: 'Penundaan bisa menciptakan eksposur tambahan Rp 480 juta.',
    },
  },
};
