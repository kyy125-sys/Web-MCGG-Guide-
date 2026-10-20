import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: convert JS value to JSON string for SQLite storage
const j = (v: any) => JSON.stringify(v);

async function main() {
  console.log('🌱 Seeding MCGG Guide database with Chrono Echoes Data...');

  // Admin user
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@mcgg.local' },
    update: {},
    create: { email: 'admin@mcgg.local', passwordHash: adminHash, role: 'admin' },
  });
  console.log('✅ Admin user: admin@mcgg.local / admin123');

  // Active Patch: Chrono Echoes
  const patch = await prisma.patch.upsert({
    where: { version: 'Chrono Echoes' },
    update: { isActive: true },
    create: {
      version: 'Chrono Echoes',
      releaseDate: new Date('2026-10-15'),
      isActive: true,
      notes: 'Season Chrono Echoes: 40 Commanders resmi MCGG, 20 Sinergi Faction & Role baru.',
      sources: j(['Magic Chess: Go Go Official In-game Data']),
    },
  });
  console.log(`✅ Patch ${patch.version} active`);

  // Deactivate old patches
  await prisma.patch.updateMany({
    where: { version: { not: 'Chrono Echoes' } },
    data: { isActive: false },
  });

  const FACTION_NAMES = new Set([
    'Shadeweaver', 'Astro Power', 'Echomancer', 'Dragon Altar', 'SPECTRE',
    'Dragoncaller', 'Starbelle', 'Kishin', 'Enchanted Tales', 'Mistbender'
  ]);

  // ====== 20 SYNERGIES (10 FACTIONS + 10 ROLES) ======
  const synergyData = [
    // Factions
    {
      name: 'Shadeweaver',
      iconUrl: '/uploads/synergies/shadeweaver.webp',
      description: 'Hero Shadeweaver menyelimuti arena dengan kegelapan, memberikan True Damage dan efek untargetable di awal pertempuran.',
      thresholds: [
        { count: 2, bonus: 'Semua hero Shadeweaver menjadi untargetable selama 1.5 detik di awal babak dan memperoleh +15% True Damage.' },
        { count: 4, bonus: 'Untargetable selama 2.5 detik, +30% True Damage, dan +25% Critical Damage.' }
      ]
    },
    {
      name: 'Astro Power',
      iconUrl: '/uploads/synergies/astro-power.webp',
      description: 'Menganugerahkan kekuatan kosmik terfokus kepada carry utama Astro Power, meningkatkan damage dan lifesteal drastis.',
      thresholds: [
        { count: 3, bonus: 'Carry Astro Power memperoleh +40% Attack Speed dan +25 Magic Power.' },
        { count: 6, bonus: 'Carry Astro Power memperoleh +85% Attack Speed, +60 Magic Power, dan 25% Lifesteal.' }
      ]
    },
    {
      name: 'Echomancer',
      iconUrl: '/uploads/synergies/echomancer.webp',
      description: 'Hero Echomancer menggemakan mantra dan resonansi sihir, mempercepat perolehan Mana dan kekuatan skill.',
      thresholds: [
        { count: 2, bonus: '+25% Mana Regeneration dan +20 Magic Power untuk semua hero Echomancer.' },
        { count: 4, bonus: '+55% Mana Regeneration dan +50 Magic Power.' },
        { count: 6, bonus: '+100% Mana Regeneration dan kesempatan melancarkan skill ganda (Echo Cast).' }
      ]
    },
    {
      name: 'Dragon Altar',
      iconUrl: '/uploads/synergies/dragon-altar.webp',
      description: 'Setiap kali rekan satu tim tereliminasi, hero Dragon Altar menyerap kekuatannya untuk memperoleh Shield dan Attack Speed.',
      thresholds: [
        { count: 3, bonus: 'Mendapatkan Shield sebesar 12% Max HP dan +15% Attack Speed setiap kali rekan tim gugur (stackable).' },
        { count: 6, bonus: 'Mendapatkan Shield 25% Max HP, +30% Attack Speed, dan 10% Lifesteal setiap rekan tim gugur.' }
      ]
    },
    {
      name: 'SPECTRE',
      iconUrl: '/uploads/synergies/spectre.webp',
      description: 'Kekuatan hantu SPECTRE menghantui musuh di arena, merobek physical dan magic defense seluruh formasi lawan.',
      thresholds: [
        { count: 2, bonus: 'Mengurangi Physical & Magic Defense seluruh lawan sebesar 20.' },
        { count: 4, bonus: 'Mengurangi 45 Defense seluruh lawan dan menimbulkan efek Spectral Burn saat musuh terkena skill.' }
      ]
    },
    {
      name: 'Dragoncaller',
      iconUrl: '/uploads/synergies/dragoncaller.webp',
      description: 'Memanggil berkah naga purba untuk mempertebal HP bar dan meningkatkan daya serang seluruh anggota tim.',
      thresholds: [
        { count: 2, bonus: '+350 Max HP dan +15 Physical/Magic Attack.' },
        { count: 4, bonus: '+800 Max HP dan +35 Physical/Magic Attack.' },
        { count: 6, bonus: '+1600 Max HP, +75 Physical/Magic Attack, dan nafas naga Dragon Breath berkala.' }
      ]
    },
    {
      name: 'Starbelle',
      iconUrl: '/uploads/synergies/starbelle.webp',
      description: 'Pesona peri bintang memberikan perlindungan shield mistis dan regenerasi kesehatan konstan bagi skuad.',
      thresholds: [
        { count: 2, bonus: 'Memberikan Shield 300 HP di awal babak dan +15% efektivitas pemulihan HP & Shield.' },
        { count: 4, bonus: 'Memberikan Shield 750 HP dan regenerasi 5% Max HP per detik saat HP berada di bawah 40%.' }
      ]
    },
    {
      name: 'Kishin',
      iconUrl: '/uploads/synergies/kishin.webp',
      description: 'Amarah iblis bertopeng Kishin melipatgandakan Physical Lifesteal dan memicu Frenzy mematikan.',
      thresholds: [
        { count: 2, bonus: '+18% Physical Lifesteal dan +20 Physical Attack.' },
        { count: 4, bonus: '+40% Physical Lifesteal, +55 Physical Attack, dan memicu Frenzy attack speed di bawah 40% HP.' }
      ]
    },
    {
      name: 'Enchanted Tales',
      iconUrl: '/uploads/synergies/enchanted-tales.webp',
      description: 'Sihir dongeng kuno menenun kutukan crowd control dan perisai magis pemantul serangan.',
      thresholds: [
        { count: 2, bonus: 'Membekukan musuh terdekat selama 1.5 detik saat babak dimulai.' },
        { count: 4, bonus: 'Memberikan Barrier sihir 600 HP dan memantulkan 25% damage sihir kembali ke penyerang.' }
      ]
    },
    {
      name: 'Mistbender',
      iconUrl: '/uploads/synergies/mistbender.webp',
      description: 'Kabut mistis menyelimuti arena, membuat hero memiliki peluang tinggi untuk menghindari serangan musuh.',
      thresholds: [
        { count: 2, bonus: '+20% Peluang Menghindar (Dodge) dan +15 Kecepatan Gerak.' },
        { count: 4, bonus: '+40% Peluang Menghindar (Dodge) dan melancarkan Mist Strike balasan saat berhasil menghindar.' }
      ]
    },

    // Roles
    {
      name: 'Bruiser',
      iconUrl: '/uploads/synergies/bruiser.webp',
      description: 'Petarung garis depan yang kuat, memperoleh peningkatan Max HP masif dan Physical Attack.',
      thresholds: [
        { count: 2, bonus: '+350 Max HP dan +20 Physical ATK.' },
        { count: 4, bonus: '+850 Max HP dan +50 Physical ATK.' },
        { count: 6, bonus: '+1600 Max HP, +100 Physical ATK, serta kekebalan terhadap kontrol massa berkala.' }
      ]
    },
    {
      name: 'Defender',
      iconUrl: '/uploads/synergies/defender.webp',
      description: 'Benteng kokoh pertahanan yang menerima peningkatan pertahanan fisik dan sihir luar biasa tebal.',
      thresholds: [
        { count: 2, bonus: '+30 Physical DEF dan +30 Magic DEF.' },
        { count: 4, bonus: '+75 Physical DEF dan +75 Magic DEF.' },
        { count: 6, bonus: '+140 Physical DEF, +140 Magic DEF, dan mengejek lawan sekitar (Taunt).' }
      ]
    },
    {
      name: 'Dauntless',
      iconUrl: '/uploads/synergies/dauntless.webp',
      description: 'Ksatria tak kenal gentar yang mengurangi kerusakan masuk secara persentase dan memantulkan serangan musuh.',
      thresholds: [
        { count: 2, bonus: '18% Pengurangan Damage (Damage Reduction).' },
        { count: 4, bonus: '35% Pengurangan Damage dan memantulkan 20% True Damage.' },
        { count: 6, bonus: '50% Pengurangan Damage dan memantulkan 40% True Damage.' }
      ]
    },
    {
      name: 'Weapon Master',
      iconUrl: '/uploads/synergies/weapon-master.webp',
      description: 'Master persenjataan yang menyalurkan Physical Lifesteal kepada seluruh rekan tim di medan perang.',
      thresholds: [
        { count: 3, bonus: 'Seluruh rekan tim memulihkan HP sebesar 25% dari Physical Damage yang diberikan.' },
        { count: 6, bonus: 'Seluruh rekan tim memulihkan HP sebesar 55% Physical DMG dan menerima Shield jika HP penuh.' }
      ]
    },
    {
      name: 'Marksman',
      iconUrl: '/uploads/synergies/marksman.webp',
      description: 'Penembak jitu yang menghasilkan burst damage tinggi dengan peningkatan Attack Speed dan Critical Chance.',
      thresholds: [
        { count: 2, bonus: '+25% Attack Speed dan +15% Critical Chance.' },
        { count: 4, bonus: '+55% Attack Speed, +30% Critical Chance, dan +25% Critical Damage.' },
        { count: 6, bonus: '+100% Attack Speed, +50% Critical Chance, serta serangan menembus armor lawan.' }
      ]
    },
    {
      name: 'Stargazer',
      iconUrl: '/uploads/synergies/stargazer.webp',
      description: 'Penyelaras bintang yang mempercepat perolehan Mana di awal pertarungan untuk peluncuran skill instan.',
      thresholds: [
        { count: 2, bonus: 'Memulai pertempuran dengan 25% Mana maksimum.' },
        { count: 4, bonus: 'Memulai pertempuran dengan 50% Mana maksimum dan memperoleh +20% Spell Vamp.' },
        { count: 6, bonus: 'Memulai pertempuran dengan 80% Mana maksimum dan mereset cooldown skill setelah kill.' }
      ]
    },
    {
      name: 'Swiftblade',
      iconUrl: '/uploads/synergies/swiftblade.webp',
      description: 'Pembunuh bayangan lincah yang melompat ke garis belakang musuh dengan tebasan kritikal berkecepatan tinggi.',
      thresholds: [
        { count: 2, bonus: '+20% Critical Chance dan +35% Critical Damage.' },
        { count: 4, bonus: '+40% Critical Chance dan +75% Critical Damage.' },
        { count: 6, bonus: '+60% Critical Chance, +120% Critical Damage, dan kebal dari serangan musuh pertama.' }
      ]
    },
    {
      name: 'Mage',
      iconUrl: '/uploads/synergies/mage.webp',
      description: 'Penguasa sihir yang meningkatkan Magic Power secara global untuk seluruh pasukan tempur.',
      thresholds: [
        { count: 2, bonus: '+30 Magic Power untuk seluruh rekan satu tim.' },
        { count: 4, bonus: '+75 Magic Power untuk seluruh rekan satu tim.' },
        { count: 6, bonus: '+135 Magic Power dan 20% Magic Penetration.' }
      ]
    },
    {
      name: 'Phasewarper',
      iconUrl: '/uploads/synergies/phasewarper.webp',
      description: 'Pembengkok ruang dan dimensi yang dapat berteleportasi saat sekarat untuk mengecoh musuh.',
      thresholds: [
        { count: 2, bonus: 'Berteleportasi saat HP di bawah 40%, menjadi kebal selama 1 detik dan memulihkan 20% HP.' },
        { count: 4, bonus: 'Teleportasi menciptakan ledakan dimensional 500 Magic DMG dan me-refresh Mana.' }
      ]
    },
    {
      name: 'Scavenger',
      iconUrl: '/uploads/synergies/scavenger.webp',
      description: 'Pencari harta karun yang menghasilkan pendapatan Gold tambahan dan jarahan berharga setiap babak.',
      thresholds: [
        { count: 2, bonus: 'Mendapatkan 1-3 Gold tambahan di setiap akhir babak.' },
        { count: 4, bonus: 'Mendapatkan 2-6 Gold tambahan serta peluang tinggi memperoleh peti equipment.' }
      ]
    },
  ];

  const synergies: Record<string, any> = {};
  for (const s of synergyData) {
    const existing = await prisma.synergy.findFirst({ where: { name: s.name } });
    if (existing) {
      synergies[s.name] = await prisma.synergy.update({
        where: { id: existing.id },
        data: {
          iconUrl: s.iconUrl,
          description: s.description,
          thresholds: j(s.thresholds),
          isActive: true,
          patchId: patch.id,
        },
      });
    } else {
      synergies[s.name] = await prisma.synergy.create({
        data: {
          name: s.name,
          iconUrl: s.iconUrl,
          description: s.description,
          thresholds: j(s.thresholds),
          isActive: true,
          patchId: patch.id,
          dataSource: 'mcgg_chrono_echoes',
        },
      });
    }
  }
  console.log(`✅ ${Object.keys(synergies).length} synergies seeded`);

  // ====== 40 REAL MCGG COMMANDERS ======
  const commanderData = [
    {
      name: 'Lunox',
      playstyle: 'Twilight Goddess',
      imageUrl: '/uploads/commanders/lunox.webp',
      description: 'Dewi Twilight yang menguasai keseimbangan Chaos dan Order. Memberikan Blessing instan dan pasukan hero acak.',
      skill: 'Power of Chaos (Aktif): Bisa digunakan setelah Fase I-2. Lunox memilih 1 Hero tanpa Blessing untuk memberikannya 1 Blessing acak (+1 Sinergi). Bisa digunakan 1 kali.',
      skillLevels: [
        { level: 1, name: 'Power of Chaos', type: 'Aktif', effect: 'Bisa digunakan setelah Fase I-2. Memilih 1 Hero tanpa Blessing untuk memberikannya 1 Blessing acak (+1 Sinergi Role atau Faction). Digunakan 1 kali.' },
        { level: 2, name: 'Power of Order', type: 'Pasif', effect: 'Setelah Lunox menggunakan skill, mendapatkan 3 Hero acak dari Sinergi yang diberikan skill-nya dan 6 Gold.' }
      ],
      strengths: ['Memberikan Blessing instan (+1 sinergi fleksibel)', 'Bonus 3 Hero acak dan 6 Gold ekonomi'],
      weaknesses: ['Hanya bisa digunakan 1 kali per pertandingan', 'Pilihan blessing acak']
    },
    {
      name: 'Chou',
      playstyle: 'Kung Fu Boy',
      imageUrl: '/uploads/commanders/chou.webp',
      description: 'Master beladiri jalanan yang memberikan kestabilan ekonomi emas baik saat menang maupun kalah dalam pertempuran.',
      skill: "Warrior's Honor (Pasif): Mendapatkan 2 Gold setelah memenangkan babak.",
      skillLevels: [
        { level: 1, name: "Warrior's Honor", type: 'Pasif', effect: 'Mendapatkan 2 Gold setelah memenangkan babak.' },
        { level: 2, name: 'Win or Lose', type: 'Pasif', effect: 'Selain itu, mendapatkan 3 Gold setelah kalah dalam babak.' }
      ],
      strengths: ['Ekonomi super konsisten di win streak maupun lose streak', 'Akumulasi total 2-3 Gold per babak'],
      weaknesses: ['Tidak memberikan efek tempur/combat langsung di papan']
    },
    {
      name: 'Alucard',
      playstyle: 'Harper',
      imageUrl: '/uploads/commanders/alucard.webp',
      description: 'Membangun altar persembahan Demonic Altar untuk mengundi berbagai peti hadiah legendaris.',
      skill: 'Demonic Altar (Aktif): Memanggil Demonic Altar di samping chessboard (berisi 6 hadiah). Aktifkan sekali pada Babak I-3 dan II-3 untuk mengeliminasi 1 hadiah dan mengambil 1 hadiah acak.',
      skillLevels: [
        { level: 1, name: 'Demonic Altar', type: 'Aktif', effect: 'Altar berisi 6 Hadiah di babak I-3 dan II-3. Setiap aktivasi membuang 1 hadiah dan memberi 1 hadiah acak dari sisa hadiah.' },
        { level: 2, name: 'Plunder Expansion', type: 'Pasif', effect: 'Mendapatkan 1 pengaktifan tambahan pada Babak III-3.' }
      ],
      strengths: ['Hadiah bernilai tinggi (Gold, Item, Hero)', 'Total 3 kesempatan panen hadiah'],
      weaknesses: ['Hadiah yang didapat diundi secara acak']
    },
    {
      name: 'Yu Zhong',
      playstyle: 'Black Dragon',
      imageUrl: '/uploads/commanders/yu-zhong.webp',
      description: 'Sang Naga Hitam yang meningkatkan tingkatan kualitas Go Go Card serta memberikan harta karun Black Dragon Treasure.',
      skill: 'Soul Grip (Pasif): Kualitas Go Go Card pada awal Babak II-3 meningkat 1 level. Dapatkan Black Dragon Treasure jika kualitas sudah maksimal.',
      skillLevels: [
        { level: 1, name: 'Soul Grip', type: 'Pasif', effect: 'Kualitas Go Go Card awal Babak II-3 naik 1 level. Jika max, beri Black Dragon Treasure (Crystal / Item+5G / 4 Hero / 13 Gold).' },
        { level: 2, name: 'Cursing Touch', type: 'Pasif', effect: 'Peningkatan kualitas juga berlaku di Babak III-3. Dapatkan 1 Black Dragon Treasure tambahan saat memilih Go Go Card di I-2.' }
      ],
      strengths: ['Kualitas Go Go Card jauh lebih tinggi', 'Black Dragon Treasure memberikan item/gold masif'],
      weaknesses: ['Sangat bergantung pada sinergi Go Go Card yang keluar']
    },
    {
      name: 'Layla',
      playstyle: 'Plasma Gunner (Bonus DMG)',
      imageUrl: '/uploads/commanders/layla.webp',
      description: 'Penembak plasma yang memproyeksikan hologram laser penembus formasi musuh dan memanggil hero dari akumulasi damage.',
      skill: 'Hologram: Destruction Rush (Pasif): Layla menciptakan hologram yang menembakkan laser menembus lawan (340 Physical DMG) dan menambah 3% ATK Speed setiap babak.',
      skillLevels: [
        { level: 1, name: 'Hologram: Destruction Rush', type: 'Pasif', effect: 'Laser hologram menembus lawan (340 Physical DMG) dan meningkatkan 3% ATK Speed setiap babak.' },
        { level: 2, name: 'Hologram: Synergy Freedom', type: 'Pasif', effect: 'Mendapatkan Hero dari Sinergi dengan jumlah terbanyak pada babak berikutnya setiap kali memberikan 8000 DMG.' }
      ],
      strengths: ['Serangan laser piercing berulang', 'Hero gratis dari akumulasi damage'],
      weaknesses: ['Efektivitas laser bergantung pada susunan baris lawan']
    },
    {
      name: 'Fanny',
      playstyle: 'Blade Dancer',
      imageUrl: '/uploads/commanders/fanny.webp',
      description: 'Penenun kabel bayangan yang membangun Hero Launcher untuk menerjunkan unit klon ke pertempuran.',
      skill: 'Blade Dancer (Pasif): Fanny membangun Hero Launcher. Seret Hero ke launcher untuk memanggil Shadow bayangannya bergabung dalam pertarungan.',
      skillLevels: [
        { level: 1, name: 'Blade Dancer', type: 'Pasif', effect: 'Membangun Hero Launcher (10 babak, selesai beri 4 Gold). Luncurkan Shadow hero untuk bertarung di board.' },
        { level: 2, name: 'Heart of the Blade', type: 'Pasif', effect: 'Hero Launcher selesai hanya dalam 2 babak, dan Hero yang diluncurkan mendapatkan +20% Hybrid ATK & HP.' }
      ],
      strengths: ['Tambahan 1 unit tempur (Shadow)', 'Unit launcher mendapatkan +20% Hybrid ATK & HP'],
      weaknesses: ['Membutuhkan hero cadangan untuk dimasukkan ke launcher']
    },
    {
      name: 'Angela',
      playstyle: 'Bunny Mocha (Bonus DMG)',
      imageUrl: '/uploads/commanders/angela.webp',
      description: 'Boneka setia yang melindungi sekutu dan mendongkrak kemampuan spam skill hero carry utama.',
      skill: "Love's Protection (Aktif): Pilih rekan untuk dilindungi. Hero yang dipilih mendapatkan 35% Peningkatan DMG Skill dan memulihkan 20% Mana setelah menggunakan skill.",
      skillLevels: [
        { level: 1, name: "Love's Protection", type: 'Aktif', effect: 'Hero rekan yang dipilih memperoleh +35% DMG Skill dan memulihkan 20% Mana setelah mengeluarkan skill.' },
        { level: 2, name: 'Ripples of Love', type: 'Pasif', effect: 'Angela memberikan perlindungan tambahan kepada Hero rekan dengan Power tertinggi (memprioritaskan yang punya Mana).' }
      ],
      strengths: ['Buff +35% DMG Skill dan pemulihan 20% Mana', 'Melindungi 2 hero sekaligus (pilihan & carry tertinggi)'],
      weaknesses: ['Kurang optimal pada tim yang hanya mengandalkan basic attack murni']
    },
    {
      name: 'Franco',
      playstyle: 'Frozen Warrior',
      imageUrl: '/uploads/commanders/franco.webp',
      description: 'Prajurit es yang melemparkan Iron Hook untuk merampas jarahan dari lawan dan memperkuat shield commander.',
      skill: 'Hook Plunder (Aktif): Mulai Babak I-3, melemparkan Iron Hook ke lawan acak untuk mendapatkan Jarahan. Buka interface jarahan untuk mengonversi menjadi Gold secara manual.',
      skillLevels: [
        { level: 1, name: 'Hook Plunder', type: 'Aktif', effect: 'Mulai I-3, Iron Hook menarik jarahan dari lawan acak (maks 3 jarahan). Konversikan jarahan menjadi Gold kapan saja.' },
        { level: 2, name: 'Bountiful Return', type: 'Pasif', effect: 'Mendapatkan 1 Gold dan 1 Shield Commander dari setiap penggabungan Jarahan.' }
      ],
      strengths: ['Sumber penghasilan gold berkala', 'Memberikan Shield Commander untuk pertahanan HP nyawa'],
      weaknesses: ['Kualitas jarahan bergantung pada unit target tarikan']
    },
    {
      name: 'Lancelot',
      playstyle: 'Blade of Fall (Bonus DMG)',
      imageUrl: '/uploads/commanders/lancelot.webp',
      description: 'Ksatria pedang mawar yang menukar bunga interest dengan pemasukan gold flat besar setiap babak.',
      skill: 'Golden Legacy (Pasif): Tidak lagi mendapat Keuntungan interest. Mulai fase I/II/III, mendapatkan 2/3/3 bonus Gold setiap babak. Akhir babak, sisa Gold digunakan untuk memperkuat Lancelot.',
      skillLevels: [
        { level: 1, name: 'Golden Legacy', type: 'Pasif', effect: 'Tidak ada interest bunga. Fase I/II/III dapat 2/3/3 bonus Gold tiap babak. Semua sisa Gold di akhir babak memperkuat Lancelot.' },
        { level: 2, name: 'Golden Blade', type: 'Pasif', effect: 'Mulai Fase I/II/III dan seterusnya, bonus Gold meningkat menjadi 4/5/5.' }
      ],
      strengths: ['Ekonomi stabil tanpa perlu menahan 20 gold (bebas belanja)', 'Lancelot ikut bertarung dengan kekuatan berlipat'],
      weaknesses: ['Tidak ada mekanisme bunga simpanan konvensional']
    },
    {
      name: 'Alice',
      playstyle: 'Queen of Blood',
      imageUrl: '/uploads/commanders/alice.webp',
      description: 'Ratu kegelapan yang memperkuat satu hero pilihan secara eksponensial tanpa perlu peningkatan bintang 3 konvensional.',
      skill: 'Abyssal Gaze (Aktif): Digunakan pada Babak I-1/II-1/III-1. Hero target tidak butuh 3 unit untuk naik bintang; setiap salinan yang didapat meningkatkan atribut hingga 8 kali.',
      skillLevels: [
        { level: 1, name: 'Abyssal Gaze', type: 'Aktif', effect: 'Hero target tidak butuh 3 hero untuk naik bintang. Tiap hero sama memberi +50% atribut B2 (pada B1) atau +8% atribut B3 (pada B2), hingga 8 kali.' },
        { level: 2, name: 'Crimson Grace', type: 'Pasif', effect: 'Gunakan skill untuk mendapat versi B1 hero pilihan. Hero menerima 4 peningkatan tambahan (+10% Hybrid ATK & +10% HP per peningkatan).' }
      ],
      strengths: ['Membuat 1 hero monster dengan stat di luar nalar', 'Mendapatkan salinan Bintang 1 gratis saat skill aktif'],
      weaknesses: ['Kekuatan bertumpu pada hero yang ditargetkan']
    },
    {
      name: 'Diggie',
      playstyle: 'Timekeeper',
      imageUrl: '/uploads/commanders/diggie.webp',
      description: 'Pengendali waktu yang memanggil Peti Alarm untuk mengumpulkan poin dan menghasilkan hadiah bertingkat.',
      skill: 'Peti Alarm (Pasif): Diggie memanggil Peti Alarm di chessboard (15 poin waktu/babak). Setiap 100 poin, peti otomatis terbuka memberi hadiah bertingkat (maks 3 kali).',
      skillLevels: [
        { level: 1, name: 'Peti Alarm', type: 'Pasif', effect: 'Peti Alarm mengumpulkan 15 Poin Waktu tiap babak. Tiap 100 poin membuka hadiah bernilai tinggi (maks 3 kali buka).' },
        { level: 2, name: 'Percepatan Waktu', type: 'Pasif', effect: 'Kemenangan babak memberi +10 Poin Waktu. Kalah babak meningkatkan Max HP Peti Alarm secara permanen sebesar 300.' }
      ],
      strengths: ['3 kali peti hadiah bernilai tinggi di mid/late game', 'Percepatan poin saat menang dan HP tebal saat kalah'],
      weaknesses: ['Butuh waktu beberapa ronde sebelum hadiah pertama terbuka']
    },
    {
      name: 'Harley',
      playstyle: 'Naughty Joker (Bonus DMG)',
      imageUrl: '/uploads/commanders/harley.webp',
      description: 'Pesulap jenius yang menghadirkan Hero 5 Gold ke toko di awal permainan dan memberi pembelian gratis.',
      skill: 'Midas Touch! (Aktif): Bisa digunakan mulai Babak II-2. Me-refresh Toko 1 kali untuk memunculkan 3 Hero 5 Gold dan mendapatkan 1 kesempatan beli Hero gratis.',
      skillLevels: [
        { level: 1, name: 'Midas Touch!', type: 'Aktif', effect: 'Mulai Babak II-2, refresh toko memunculkan 3 Hero 5 Gold dan 1 pembelian gratis babak ini.' },
        { level: 2, name: 'Gold! Gold! Gold!', type: 'Pasif', effect: 'Refresh Toko pada Skill Aktif kini mengisi seluruh toko dengan 5 Hero 5 Gold sekaligus.' }
      ],
      strengths: ['Mengamankan Hero Cost 5 di fase awal babak II-2', 'Hero Cost 5 gratis langsung masuk arena'],
      weaknesses: ['Skill aktif berfokus pada 1 momen power spike']
    },
    {
      name: 'Popol & Kupa',
      playstyle: 'Hunting Pals (Bonus DMG)',
      imageUrl: '/uploads/commanders/popol-kupa.webp',
      description: 'Duo pemburu yang memasang perangkap peniru untuk mencuri dan menyalin hero musuh yang menginjaknya.',
      skill: 'Copy Trap (Pasif): Selama Fase Persiapan, perangkap penyalin muncul di board. Ketika hero lawan menginjak perangkap, dapatkan versi Bintang 1 dari hero tersebut (maks 1 per babak).',
      skillLevels: [
        { level: 1, name: 'Copy Trap', type: 'Pasif', effect: 'Pasang perangkap penyalin di board. Musuh yang menginjak akan disalin versi B1-nya ke bench (maks 1 per babak).' },
        { level: 2, name: "Hunter's Mark", type: 'Pasif', effect: 'Mendapatkan 1 Gold saat berhasil menyalin Hero. Jika tidak ada yang disalin hingga akhir babak, tetap dapat 1 Gold.' }
      ],
      strengths: ['Mencuri dan menyalin hero mahal milik lawan', 'Jaminan 1 Gold setiap babak'],
      weaknesses: ['Memerlukan penempatan perangkap yang tepat di jalur musuh']
    },
    {
      name: 'Luo Yi',
      playstyle: 'Yin-yang Mage (Bonus DMG)',
      imageUrl: '/uploads/commanders/luo-yi.webp',
      description: 'Penyelaras Yin dan Yang yang mengubah hero cadangan menjadi item Equipment Essence Core bertabur buff.',
      skill: 'Duality Transformation (Pasif): Menyeret Hero ke perangkat akan mengubahnya menjadi Equipment Essence Core (mewarisi 40% Hybrid ATK & HP, serta 40% atribut item hero). Reset untuk mengembalikan.',
      skillLevels: [
        { level: 1, name: 'Duality Transformation', type: 'Pasif', effect: 'Mengubah hero bench menjadi item Essence Core berkekuatan 40% ATK, HP, dan item milik hero tersebut.' },
        { level: 2, name: 'Harmony of Essence', type: 'Pasif', effect: 'Berdasarkan Sinergi Role Hero yang diubah, Essence Core mendapatkan efek penguatan tambahan khusus.' }
      ],
      strengths: ['Memanfaatkan hero cadangan menjadi item super kuat', 'Bebas reset dan ganti target kapan saja'],
      weaknesses: ['Hero yang diubah tidak ikut bertarung langsung di board']
    },
    {
      name: 'Vexana',
      playstyle: 'Shimmer of Hope',
      imageUrl: '/uploads/commanders/vexana.webp',
      description: 'Ratu pembawa harapan yang mengambil 2 hadiah sekaligus dari setiap putaran Go Go Box.',
      skill: 'I Want All of Them! (Pasif): Selama 3 babak Go Go Box pertama, setelah semua Commander memilih, pilih satu hadiah tambahan dari pilihan yang tersisa.',
      skillLevels: [
        { level: 1, name: 'I Want All of Them!', type: 'Pasif', effect: 'Memilih 1 hadiah tambahan dari sisa Go Go Box selama 3 putaran kotak pertama (total 2 hadiah per box).' },
        { level: 2, name: 'Unrestricted', type: 'Pasif', effect: 'Pada babak Go Go Box pertama, menyalin item atau Hero pertama yang dipilih dan mendapatkan 13 Gold.' }
      ],
      strengths: ['Total 2 pilihan setiap Go Go Box', 'Duplikasi pilihan pertama + 13 Gold di awal'],
      weaknesses: ['Hadiah kedua merupakan sisa yang belum diambil pemain lain']
    },
    {
      name: 'Ruby',
      playstyle: 'Little Red Hood',
      imageUrl: '/uploads/commanders/ruby.webp',
      description: 'Gadis bertudung merah pembawa sabit dan jubah kutukan yang memicu kebangkitan dan amarah mematikan.',
      skill: "Red Hood's Rage (Pasif): Mendapatkan 2 Equipment: Cloak (Rage Mark + 10% heal saat target mati) dan Scythe (260% Physical DMG ke target bermark tiap 2 detik).",
      skillLevels: [
        { level: 1, name: "Red Hood's Rage", type: 'Pasif', effect: 'Mendapatkan 2 Equipment eksklusif: Cloak dan Scythe yang bersinergi memberi damage dan heal.' },
        { level: 2, name: 'Life from Death', type: 'Pasif', effect: 'Pengguna Cloak hidup kembali dengan 30% HP saat tereliminasi. Pengguna Scythe mendapat +55% Hybrid ATK setelahnya.' }
      ],
      strengths: ['2 Equipment gratis bersinergi tinggi', 'Mekanisme Revive + 55% Hybrid ATK masif'],
      weaknesses: ['Harus dipasang pada 2 hero berbeda agar efek maksimal']
    },
    {
      name: 'Minotaur',
      playstyle: 'Son of Minos',
      imageUrl: '/uploads/commanders/minotaur.webp',
      description: 'Putra Minos perkasa yang menempa dan memperkuat item equipment hingga mencapai potensi maksimal.',
      skill: 'Molten Decree (Aktif): Pilih Equipment untuk memperkuatnya. Bisa digunakan 3 kali.',
      skillLevels: [
        { level: 1, name: 'Molten Decree', type: 'Aktif', effect: 'Pilih dan perkuat stat Equipment hingga 3 kali sepanjang pertandingan.' },
        { level: 2, name: 'Bloodline Resonance', type: 'Pasif', effect: 'Mendapatkan 1 Peti Equipment gratis dan 3 Gold untuk setiap Equipment yang diperkuat oleh skill (total 9 Gold).' }
      ],
      strengths: ['Item yang diperkuat memiliki stat jauh di atas rata-rata', 'Bonus 1 Peti Equipment + cashback 9 Gold'],
      weaknesses: ['Tidak berlaku untuk equipment khusus']
    },
    {
      name: 'Kagura',
      playstyle: 'Blooming Dream (Bonus DMG)',
      imageUrl: '/uploads/commanders/kagura.webp',
      description: 'Penyihir payung Seimei yang melindungi hero carry dengan perisai tebal saat berada dalam bahaya.',
      skill: 'Shield Umbrella (Aktif): Selama Fase Persiapan, pilih Hero untuk mendapatkan Shield 60% Max HP saat HP berada di bawah 50% untuk pertama kali.',
      skillLevels: [
        { level: 1, name: 'Shield Umbrella', type: 'Aktif', effect: 'Hero yang dipilih mendapatkan Shield 60% Max HP saat HP turun di bawah 50%.' },
        { level: 2, name: 'Yin Yang Gathering', type: 'Pasif', effect: 'Nilai Shield ditingkatkan menjadi 125% Max HP.' }
      ],
      strengths: ['Shield raksasa 125% Max HP untuk melindungi core', 'Mencegah hero kunci terkena instan-kill burst'],
      weaknesses: ['Hanya melindungi satu target pilihan']
    },
    {
      name: 'Johnson',
      playstyle: 'Death Chariot',
      imageUrl: '/uploads/commanders/johnson.webp',
      description: 'Chariot lapis baja yang memanggil robot Johnny dengan sinergi fleksibel dan menerjang musuh dengan stun AoE.',
      skill: 'Johnny, Go! (Aktif): Buka toko eksklusif untuk memilih 1 dari 5 Johnny (3 Gold) gratis dengan 2 Sinergi acak dari pool Johnson. Johnny memiliki skill stun AoE.',
      skillLevels: [
        { level: 1, name: 'Johnny, Go!', type: 'Aktif', effect: 'Dapatkan Johnny (3 Gold) gratis dengan 2 sinergi acak. Johnny melempar perkakas yang memberi stun AoE.' },
        { level: 2, name: 'Transform!', type: 'Pasif', effect: 'Saat mulai, Johnny menerjang kerumunan musuh, memberi Magic DMG 10% Max HP dan kebal crowd control saat berubah.' }
      ],
      strengths: ['Unit Johnny gratis yang menyambung 2 sinergi fleksibel', 'Inisiasi tabrakan stun AoE dan immune CC'],
      weaknesses: ['Sinergi Johnny bergantung pada pilihan acak yang tersedia']
    },
    {
      name: 'Lylia',
      playstyle: 'Little Witch',
      imageUrl: '/uploads/commanders/lylia.webp',
      description: 'Penyihir cilik yang memanggil monster Tharz untuk melahap toko dan menyediakan hero board secara instan.',
      skill: "Go, Tharz! (Aktif): Bisa digunakan setelah Kapasitas mencapai 8: Tharz melahap Toko dan menggantinya dengan Little Witch's Shop untuk membeli hero yang telah ditempatkan menggunakan Witch Coin.",
      skillLevels: [
        { level: 1, name: 'Go, Tharz!', type: 'Aktif', effect: 'Di kapasitas 8, ganti toko jadi Little Witch Shop. Beli hero yang sudah ada di board pakai Witch Coin (+7 koin/babak).' },
        { level: 2, name: 'Party Time!', type: 'Pasif', effect: 'Langsung dapat 15 Witch Coin saat toko berganti, dan +5 Witch Coin tambahan setiap menang babak.' }
      ],
      strengths: ['Hampir menjamin hero bintang 3 di late game', 'Pendapatan Witch Coin berlipat saat menang'],
      weaknesses: ['Hanya bisa diaktifkan setelah mencapai kapasitas 8 hero']
    },
    {
      name: 'Aamon',
      playstyle: 'Duke of Shards',
      imageUrl: '/uploads/commanders/aamon.webp',
      description: 'Bangsawan pecahan kristal yang mengumpulkan Shard dari setiap upgrade bintang 2 untuk membuat Mirror Device gratis.',
      skill: 'Blade of Resonance (Pasif): Dapatkan 1 Mirror Device di awal. Saat Hero mencapai Bintang 2, dapatkan 1 Shard. 7 Shard otomatis menjadi 1 Mirror Device (maks 2).',
      skillLevels: [
        { level: 1, name: 'Blade of Resonance', type: 'Pasif', effect: '1 Mirror Device di awal; tiap hero B2 memberi 1 Shard. 7 Shard otomatis jadi Mirror Device (hingga 2 device).' },
        { level: 2, name: 'Skybreaker Blade', type: 'Pasif', effect: 'Mendapatkan 12 Gold tambahan setiap kali Mirror Device dibuat.' }
      ],
      strengths: ['Hingga 3 Mirror Device (klon hero) gratis', 'Bonus 12 Gold setiap kali perangkat klon tercipta'],
      weaknesses: ['Membutuhkan banyak upgrade bintang 2 untuk memicu konversi shard']
    },
    {
      name: 'Kalea',
      playstyle: 'Surging Wave',
      imageUrl: '/uploads/commanders/kalea.webp',
      description: 'Dewi ombak yang mengocok dadu keberuntungan untuk membuka brankas hadiah berlimpah.',
      skill: "Serpent's Favor (Pasif): Memanggil Brankas Harta di babak I-4. Lempar Dadu Keberuntungan tiap babak (1-4 poin, reset jika >8). Aktifkan brankas untuk klaim hadiah berdasarkan poin (maks 2 aktivasi).",
      skillLevels: [
        { level: 1, name: "Serpent's Favor", type: 'Pasif', effect: 'Kocok dadu 1-4 poin tiap babak; klaim hadiah brankas sebelum melebihi angka 8 (maks 2 aktivasi).' },
        { level: 2, name: 'Wave of Fortune', type: 'Pasif', effect: 'Jumlah aktivasi maksimum Brankas Harta ditingkatkan menjadi 3 kali.' }
      ],
      strengths: ['Hadiah jackpot bernilai fantastis jika pintar mengunci angka', 'Hingga 3 kali panen hadiah'],
      weaknesses: ['Poin direset ke 0 jika hasil kocokan dadu melebihi 8']
    },
    {
      name: 'Cyclops',
      playstyle: 'Starsoul Magician',
      imageUrl: '/uploads/commanders/cyclops.webp',
      description: 'Penyihir bintang bermata satu yang memanen warisan gold dan hero dari lawan yang tersingkir.',
      skill: 'Astral Blessing (Pasif): Saat ada Commander lain tereliminasi, Cyclops membuka Tabung Bintang untuk mendapatkan Gold 14% dari nilai lineup tersebut dan 1 Hero acak dengan bintang yang sama.',
      skillLevels: [
        { level: 1, name: 'Astral Blessing', type: 'Pasif', effect: 'Mendapatkan 14% gold dari total nilai lineup musuh yang gugur dan 1 Hero acak dengan level bintang yang sama.' },
        { level: 2, name: 'Astral Resonance', type: 'Pasif', effect: 'Saat HP di bawah 80 untuk pertama kali, mendapatkan 3 Hero sinergi tertinggi saat ini dan 1 Peti Equipment.' }
      ],
      strengths: ['Snowball raksasa saat pemain lain mulai gugur', 'Pemberian paket penyelamat saat HP < 80'],
      weaknesses: ['Kemampuan utama baru aktif saat musuh tereliminasi di mid/late game']
    },
    {
      name: 'Wanwan',
      playstyle: 'Azure Tiger (Bonus DMG)',
      imageUrl: '/uploads/commanders/wanwan.webp',
      description: 'Gadis lincah macan biru yang mengeksekusi musuh sekarat dengan rentetan panah harimau otomatis.',
      skill: 'Tiger Pounce (Pasif): Saat HP Hero lawan di bawah 30% untuk pertama kalinya, Wanwan menyerang lawan dengan HP terendah 20 kali (180/310/430/550 Physical DMG berdasarkan fase).',
      skillLevels: [
        { level: 1, name: 'Tiger Pounce', type: 'Pasif', effect: 'Rentetan 20 panah ke lawan terlemah saat HP di bawah 30% (damage meningkat per fase).' },
        { level: 2, name: 'Reinforcement', type: 'Pasif', effect: 'Mendapatkan 1 Gold saat mengeliminasi Hero lawan, hingga 3 kali setiap babak.' }
      ],
      strengths: ['Finisher otomatis untuk membungkam carry lawan', 'Tambahan hingga 3 Gold setiap babak dari kill'],
      weaknesses: ['Hanya terpicu saat target musuh berada di bawah 30% HP']
    },
    {
      name: 'Nana',
      playstyle: 'Sweet Leonin',
      imageUrl: '/uploads/commanders/nana.webp',
      description: 'Leonin manis yang memiliki perlindungan nyawa ekstra dan kompensasi gold melimpah saat terluka.',
      skill: "Molina's Blessing (Pasif): Nana kebal eliminasi untuk pertama kalinya, dan bertahan dengan 1 HP.",
      skillLevels: [
        { level: 1, name: "Molina's Blessing", type: 'Pasif', effect: 'Kebal eliminasi untuk pertama kalinya, menahan kekalahan dan bertahan dengan 1 HP.' },
        { level: 2, name: "Molina's Gift", type: 'Pasif', effect: 'Mendapatkan 10 Gold setiap kehilangan 10 HP (hingga 3 kali = 30 Gold). Picu 3 kali untuk dapat 1 Peti Equipment tambahan.' }
      ],
      strengths: ['Penyelamat mutlak dari kekalahan mendadak (1 Extra Life)', 'Kompensasi 30 Gold + Peti Equipment saat bermain lose-streak'],
      weaknesses: ['Hanya bisa menyelamatkan nyawa 1 kali']
    },
    {
      name: 'Ling',
      playstyle: 'Cyan Finch',
      imageUrl: '/uploads/commanders/ling.webp',
      description: 'Pendekar finch biru yang menciptakan arena duel 1v1 untuk menculik musuh belakang dan menumpuk Hybrid ATK.',
      skill: 'Showdown (Pasif): Ling menciptakan Ring Duel di chessboard selama 25 detik. Hero rekan di dalam ring menarik lawan terjauh ke dalam ring dan bertarung hanya dengan Basic ATK (+100% ATK Speed).',
      skillLevels: [
        { level: 1, name: 'Showdown', type: 'Pasif', effect: 'Menarik hero lawan terjauh ke dalam ring duel 1v1 dengan bonus 100% Attack Speed.' },
        { level: 2, name: 'Transcendent Stance', type: 'Pasif', effect: 'Setelah memenangkan duel, mendapatkan +6% Hybrid ATK secara permanen (maksimal 11 stack = +66% Hybrid ATK).' }
      ],
      strengths: ['Menculik dan melumpuhkan carry belakang musuh', 'Stacking Hybrid ATK permanen hingga +66%'],
      weaknesses: ['Hero penantang rekan harus kuat memenangkan duel 1 lawan 1']
    },
    {
      name: 'Vale',
      playstyle: 'Windtalker',
      imageUrl: '/uploads/commanders/vale.webp',
      description: 'Pengendali badai pasir yang menyegarkan toko dengan hero bersinergi sama dan memberi hero gratis.',
      skill: 'Updraft (Aktif): Pilih 1 Hero. Refresh Toko menampilkan Hero yang memiliki setidaknya satu Sinergi sama, dan dapat 1 pembelian gratis. Dapat 1 penggunaan setiap Level 6/8/10.',
      skillLevels: [
        { level: 1, name: 'Updraft', type: 'Aktif', effect: 'Refresh toko menampilkan hero bersinergi sama + 1 pembelian gratis di level 6, 8, dan 10.' },
        { level: 2, name: 'Shifting Wind', type: 'Pasif', effect: 'Dapatkan 1 penggunaan skill tambahan setiap kali Commander mencapai Level 5, 7, dan 9 (total 6 penggunaan!).' }
      ],
      strengths: ['Total 6 kali refresh terarah + pembelian hero gratis', 'Sangat mudah menyempurnakan sinergi impian'],
      weaknesses: ['Penggunaan skill terikat pada kenaikan level komander']
    },
    {
      name: 'Zilong',
      playstyle: 'Spear of the Dragon',
      imageUrl: '/uploads/commanders/zilong.webp',
      description: 'Panglima tombak naga yang memperkuat satu hero dengan Great Dragon Spear berdaya multi-strike dan atribut legendaris.',
      skill: 'Great Dragon Spear (Pasif): Dapatkan Great Dragon Spear di awal (20% peluang 2 ATK tambahan). Bisa membeli hingga 1 atribut di Toko untuk memperkuat tombak (Kebal CC/Lifesteal, Curi Gold, atau Shield).',
      skillLevels: [
        { level: 1, name: 'Great Dragon Spear', type: 'Pasif', effect: 'Dapatkan tombak Great Dragon Spear (20% triple strike) dan beli 1 upgrade atribut di toko.' },
        { level: 2, name: "Dragon's Roar", type: 'Pasif', effect: 'Bisa membeli 2 efek tambahan untuk memperkuat Great Dragon Spear (total 3 efek upgrade!).' }
      ],
      strengths: ['Menjadikan 1 carry mesin pembunuh super lengkap (CC Immune, Lifesteal, Curi Gold, Shield)', 'Triple strike multi-hit dahsyat'],
      weaknesses: ['Perlu mengalokasikan gold di toko untuk membeli atribut penguat']
    },
    {
      name: 'Moskov',
      playstyle: 'Spear of Bone Dragon (Bonus DMG)',
      imageUrl: '/uploads/commanders/moskov.webp',
      description: 'Pangeran naga tulang yang menggelar ritual penempatan hero untuk mendulang gold dan klon gratis.',
      skill: 'Power of Shadow (Pasif): Buat Shadow Field. Tempatkan Hero 1, 2, 3, dan 4 Gold satu per satu (+5 Gold tiap penempatan) untuk ritual. Hero di dalamnya mendapat +15% Hybrid ATK & HP.',
      skillLevels: [
        { level: 1, name: 'Power of Shadow', type: 'Pasif', effect: 'Selesaikan ritual hero 1/2/3/4 Gold (+20 Gold total reward); hero ritual mendapat +15% Hybrid ATK & HP.' },
        { level: 2, name: 'Dark Star', type: 'Pasif', effect: 'Membuat dua salinan tambahan Hero Bintang 1 yang sudah ditingkatkan.' }
      ],
      strengths: ['Hadiah ekonomi +20 Gold instan dari ritual', 'Dua salinan hero gratis untuk mempercepat bintang 3'],
      weaknesses: ['Membutuhkan ruang bench untuk menyiapkan hero syarat ritual']
    },
    {
      name: 'Guinevere',
      playstyle: 'Fleur Bleue (Bonus DMG)',
      imageUrl: '/uploads/commanders/guinevere.webp',
      description: 'Putri bangsawan yang memberikan Equipment gratis di awal dan mendatangkan hero gratis di toko.',
      skill: 'Super Magic (Pasif): Mendapatkan 1 Equipment pada awal pertandingan. Berpeluang 14% untuk memunculkan 1 Hero gratis di Toko setelah refresh otomatis.',
      skillLevels: [
        { level: 1, name: 'Super Magic', type: 'Pasif', effect: '1 Equipment gratis di awal dan peluang 14% memunculkan hero gratis saat refresh otomatis.' },
        { level: 2, name: 'Mystic Evolution', type: 'Pasif', effect: 'Peluang memunculkan Hero gratis meningkat menjadi 24% (hampir 1 dari 4 refresh!).' }
      ],
      strengths: ['Equipment gratis dari putaran pertama', 'Banyak hero gratis sepanjang pertandingan'],
      weaknesses: ['Peluang kemunculan hero gratis bersifat probabilitas']
    },
    {
      name: 'Lukas',
      playstyle: 'Beast of Light',
      imageUrl: '/uploads/commanders/lukas.webp',
      description: 'Penyembah cahaya suci yang memanggil Makhluk Suci raksasa dan melipatgandakan gold dari kurban hero.',
      skill: 'Unleash the Beast (Pasif): Memanggil Makhluk Suci ke pertempuran. Setiap 3 babak konsumsi 1 Hero B1 untuk memberi stat dan EXP hingga mencapai Bintang 3.',
      skillLevels: [
        { level: 1, name: 'Unleash the Beast', type: 'Pasif', effect: 'Makhluk Suci bertumbuh hingga Bintang 3 dengan mengonsumsi 1 hero B1 setiap 3 babak (mewarisi 12% stat dasar).' },
        { level: 2, name: 'Sacred Gift', type: 'Pasif', effect: 'Menempatkan Hero ke dalam altar juga memberikan Gold acak sebesar 2 hingga 3 kali lipat dari harga Gold Hero tersebut.' }
      ],
      strengths: ['Tambahan 1 unit Makhluk Suci dengan HP & ATK kolosal', 'Pengganda gold 2x-3x lipat dari hero yang dikorbankan'],
      weaknesses: ['Memerlukan waktu bertahap untuk mencapai Bintang 3']
    },
    {
      name: 'Miya',
      playstyle: 'Burning Bow (Bonus DMG)',
      imageUrl: '/uploads/commanders/miya.webp',
      description: 'Pemanah rembulan yang menembakkan rentetan panah pemusnah persentase Max HP musuh dan mendongkrak ATK Speed rekan.',
      skill: 'Lunar Longbow (Aktif): Pilih 1 Hero rekan. Setelah setiap 6 Basic ATK hero tersebut, Miya menembakkan 5 anak panah cepat (masing-masing 7% Max HP Physical DMG).',
      skillLevels: [
        { level: 1, name: 'Lunar Longbow', type: 'Aktif', effect: 'Tembakkan 5 panah (masing-masing 7% Max HP Physical DMG) setiap 6 basic ATK hero pilihan.' },
        { level: 2, name: 'Moonshade Arrow', type: 'Pasif', effect: 'Miya menembakkan 3 anak panah tambahan (4% Max HP) dan Hero yang dipilih mendapatkan +60% Attack Speed.' }
      ],
      strengths: ['Penghancur tank paling efektif dengan % Max HP damage', 'Buff masif +60% Attack Speed'],
      weaknesses: ['Sangat bergantung pada frekuensi serangan hero yang dipilih']
    },
    {
      name: 'Aurora',
      playstyle: 'Maiden of the Glacier',
      imageUrl: '/uploads/commanders/aurora.webp',
      description: 'Ratu gletser es yang membekukan toko untuk mengumpulkan energi beku dan menghadiahkan peti bernilai 8+ Gold.',
      skill: 'Frost Treasures (Pasif): Aurora membekukan Toko pada awal setiap babak. Jika tidak membeli hero dalam 1 babak, dapat 2 Frost Energy. Buka peti hadiah saat mencapai 6 energi.',
      skillLevels: [
        { level: 1, name: 'Frost Treasures', type: 'Pasif', effect: 'Dapatkan 2 Frost Energy tiap babak tanpa beli hero. Hadiah bernilai minimal 8 Gold saat mencapai 6 Frost Energy.' },
        { level: 2, name: 'Icy Blessing', type: 'Pasif', effect: 'Meningkatkan Frost Energy yang didapatkan menjadi 3 (cukup 2 babak hemat untuk klaim hadiah!).' }
      ],
      strengths: ['Sangat selaras dengan strategi menabung gold / fast level', 'Hadiah minimal 8 Gold setiap 2 putaran hemat'],
      weaknesses: ['Membatasi belanja hero ketika sedang mengumpulkan poin energi']
    },
    {
      name: 'Karina',
      playstyle: 'Shadow Blade',
      imageUrl: '/uploads/commanders/karina.webp',
      description: 'Pembunuh bayangan bersabit kembar yang langsung mengeksekusi musuh sekarat dan menumpuk damage permanen.',
      skill: 'Shadow Twinblades (Pasif): Mendapatkan Shadow Twinblades di awal. Saat musuh bersebelahan dengan pembawa memiliki HP di bawah 18%, Karina mengeliminasi target tersebut seketika.',
      skillLevels: [
        { level: 1, name: 'Shadow Twinblades', type: 'Pasif', effect: 'Eksekusi instan musuh di sekitar pembawa senjata saat HP lawan turun di bawah 18%.' },
        { level: 2, name: 'Twinblades Evolution', type: 'Pasif', effect: 'Setelah eksekusi, hero pengguna mendapatkan +2% DMG tambahan permanen, hingga maksimal 36%.' }
      ],
      strengths: ['Eksekusi instan memutus pertarungan berlarut-larut', 'Peningkatan damage permanen hingga +36%'],
      weaknesses: ['Target harus berada dalam jangkauan melee (bersebelahan)']
    },
    {
      name: 'Valir',
      playstyle: 'Son of Flames',
      imageUrl: '/uploads/commanders/valir.webp',
      description: 'Putra api membara yang melipatgandakan pilihan Go Go Card di babak II-3 dan memacu lonjakan level komander.',
      skill: 'Blazing Inferno (Pasif): Valir bisa memilih Go Go Card dua kali ketika Fase Go Go Card pada Babak II-3.',
      skillLevels: [
        { level: 1, name: 'Blazing Inferno', type: 'Pasif', effect: 'Memilih Go Go Card 2 kali pada Babak II-3 (atau +15 EXP di mode Rune).' },
        { level: 2, name: 'Incinerate', type: 'Pasif', effect: 'Mendapatkan bonus EXP Commander berdasarkan kualitas kartu di II-3: +16 EXP untuk kartu ungu, +26 EXP untuk kartu biru.' }
      ],
      strengths: ['Dua Go Go Card sekaligus membuka sinergi luar biasa kuat', 'Lonjakan level komander instan dari bonus EXP masif'],
      weaknesses: ['Kekuatan terfokus pada fase Babak II-3']
    },
    {
      name: 'Dyrroth',
      playstyle: 'Prince of the Abyss',
      imageUrl: '/uploads/commanders/dyrroth.webp',
      description: 'Pangeran Abyss yang memangsa hero bintang 1 murah untuk menukarnya dengan hero berharga lebih tinggi dan hero gratis.',
      skill: 'Abyssal Devourer (Aktif): Mulai Babak I-3, melahap Hero Bintang 1 setiap 3 babak dan mengembalikannya dengan Hero berharga lebih tinggi (+1 Gold, maks 5 Gold).',
      skillLevels: [
        { level: 1, name: 'Abyssal Devourer', type: 'Aktif', effect: 'Melahap hero B1 tiap 3 babak untuk menukarnya dengan hero acak berharga +1 Gold lebih tinggi.' },
        { level: 2, name: 'Abyssal Favor', type: 'Pasif', effect: 'Dapatkan 3 EXP Commander tiap melahap. Setiap 2 kali melahap, babak berikutnya memberi 2 Hero gratis dari sinergi hero yang dilahap.' }
      ],
      strengths: ['Mengonversi hero murah menjadi hero mahal (bahkan hero 5 Gold)', 'Dua hero gratis dari sinergi terkait + EXP'],
      weaknesses: ['Memerlukan cooldown 3 babak setiap penggunaan']
    },
    {
      name: 'Paquito',
      playstyle: 'The Heavenly Fist',
      imageUrl: '/uploads/commanders/paquito.webp',
      description: 'Petinju legendaris yang memberikan Boxing Glove untuk membuat hero 3-Gold, 4-Gold, dan 5-Gold langsung Bintang 2.',
      skill: 'Fist of Glory (Pasif): Mendapatkan Boxing Glove pada Babak II-1 dan III-1 (untuk hero 3 Gold dan 4 Gold). Gunakan untuk mendapat 2 salinan B1 gratis (langsung Bintang 2!).',
      skillLevels: [
        { level: 1, name: 'Fist of Glory', type: 'Pasif', effect: 'Dapatkan Boxing Glove di Babak II-1 (Hero 3 Gold) dan Babak III-1 (Hero 4 Gold) untuk menjadikannya Bintang 2 instan.' },
        { level: 2, name: 'Champ Stance', type: 'Pasif', effect: 'Mendapatkan Boxing Glove untuk Hero 5 Gold pada Babak IV-1 (langsung Bintang 2 hero Cost 5!).' }
      ],
      strengths: ['Jaminan Bintang 2 instan untuk carry 3-Gold, 4-Gold, dan 5-Gold', 'Power spike tempo permainan sangat konsisten'],
      weaknesses: ['Sarung tinju harus disesuaikan dengan harga hero yang tepat']
    },
    {
      name: 'Gusion',
      playstyle: 'Holy Blade',
      imageUrl: '/uploads/commanders/gusion.webp',
      description: 'Bangsawan pedang cahaya yang memanggil lambang Light Sigil untuk menyematkan Sinergi Role tambahan pada hero.',
      skill: 'Light Sigil (Pasif): Memanggil Light Sigil (1 Sinergi Role acak, 3x refresh). Seret Hero ke Sigil untuk memberikannya sinergi tersebut + dapat 7 Gold.',
      skillLevels: [
        { level: 1, name: 'Light Sigil', type: 'Pasif', effect: 'Menyematkan 1 Sinergi Role ekstra ke Hero pilihan dan mendapatkan 7 Gold (3 kesempatan refresh).' },
        { level: 2, name: 'Sigil Resonance', type: 'Pasif', effect: 'Setelah Fase II, Sigil bisa digunakan 1 kali lagi (total 2 hero mendapat sinergi role baru + 14 Gold).' }
      ],
      strengths: ['Membuka kombinasi sinergi role baru yang mengejutkan', 'Tambahan 14 Gold ekonomi'],
      weaknesses: ['Sinergi role yang muncul bergantung pada kocokan pilihan']
    },
    {
      name: 'Freya',
      playstyle: 'Valkyrie',
      imageUrl: '/uploads/commanders/freya.webp',
      description: 'Dewi perang Valkyrie yang meng-overcharge efektivitas sinergi pilihan dan memberikan hadiah di pencapaian 2/4/6 unit.',
      skill: 'Power of Einherjar (Aktif): Pilih Sinergi untuk memberinya Power of Einherjar yang memperkuat Efek Sinergi tersebut kapan saja.',
      skillLevels: [
        { level: 1, name: 'Power of Einherjar', type: 'Aktif', effect: 'Pilih 1 sinergi untuk memperkuat efeknya secara permanen (bebas diganti kapan saja).' },
        { level: 2, name: 'Contract of Faith', type: 'Aktif', effect: 'Klaim Hadiah bertingkat saat sinergi yang diperkuat mencapai 2 / 4 / 6 unit.' }
      ],
      strengths: ['Memperkuat sinergi favorit menjadi sangat mematikan', '3 peti hadiah bertingkat di threshold 2, 4, dan 6'],
      weaknesses: ['Perlu mengumpulkan banyak hero dari sinergi yang dipilih']
    },
    {
      name: 'Brody',
      playstyle: 'The Lone Star',
      imageUrl: '/uploads/commanders/brody.webp',
      description: 'Penembak bintang terisolasi yang membuka Abyss Domain untuk merekayasa dan menukar hero sejenis.',
      skill: 'Abyssal Call (Pasif): Brody memanggil Abyss Domain. Tempatkan 2 Hero berbeda yang harga Gold atau Sinerginya sama untuk mendapatkan Hero acak dengan kriteria sama setiap 4 babak.',
      skillLevels: [
        { level: 1, name: 'Abyssal Call', type: 'Pasif', effect: 'Tempatkan 2 hero berbeda dengan gold/sinergi sama untuk memproduksi hero baru sejenis setiap 4 babak.' },
        { level: 2, name: 'Abyssal Surge', type: 'Pasif', effect: 'Penggunaan Domain dipercepat menjadi setiap 3 babak dan memberikan 2 EXP Commander.' }
      ],
      strengths: ['Alat ampuh memburu hero kunci yang sulit keluar di toko', 'Bonus EXP commander berkala'],
      weaknesses: ['Perlu menempatkan 2 hero ke dalam domain']
    },
  ];

  for (const c of commanderData) {
    const existing = await prisma.commander.findFirst({ where: { name: c.name } });
    if (existing) {
      await prisma.commander.update({
        where: { id: existing.id },
        data: {
          playstyle: c.playstyle,
          imageUrl: c.imageUrl,
          description: c.description,
          skill: c.skill,
          skillLevels: j(c.skillLevels),
          strengths: j(c.strengths),
          weaknesses: j(c.weaknesses),
          isActive: true,
          patchId: patch.id,
        },
      });
    } else {
      await prisma.commander.create({
        data: {
          name: c.name,
          playstyle: c.playstyle,
          imageUrl: c.imageUrl,
          description: c.description,
          skill: c.skill,
          skillLevels: j(c.skillLevels),
          strengths: j(c.strengths),
          weaknesses: j(c.weaknesses),
          isActive: true,
          patchId: patch.id,
          dataSource: 'mcgg_chrono_echoes',
        },
      });
    }
  }
  console.log(`✅ ${commanderData.length} commanders seeded with official images and skills`);

  // ====== HEROES FROM CHRONO ECHOES MATRIX ======
  const heroesData = [
    // Cost 1
    { name: 'Minotaur', cost: 1, rarity: 'common', role: ['defender'], strengths: ['AoE Stun', 'Durable'], weaknesses: ['Low Damage'], synergyNames: ['Astro Power', 'Defender'] },
    { name: 'Xavier', cost: 1, rarity: 'common', role: ['stargazer', 'mage'], strengths: ['Long Range Beam', 'Fast Mana'], weaknesses: ['Squishy'], synergyNames: ['Dragoncaller', 'Stargazer'] },
    { name: 'Hayabusa', cost: 1, rarity: 'common', role: ['swiftblade'], strengths: ['Shadow Burst', 'Untargetable Ult'], weaknesses: ['Single Target'], synergyNames: ['Dragon Altar', 'Swiftblade'] },
    { name: 'Brody', cost: 1, rarity: 'common', role: ['scavenger', 'marksman'], strengths: ['High Basic ATK', 'Lock-on'], weaknesses: ['Slow ATK Speed'], synergyNames: ['SPECTRE', 'Scavenger'] },
    { name: 'Julian', cost: 1, rarity: 'common', role: ['mage'], strengths: ['Chain Combo', 'Burst Magic'], weaknesses: ['Short Range'], synergyNames: ['Echomancer', 'Mage'] },

    // Cost 2
    { name: 'Uranus', cost: 2, rarity: 'uncommon', role: ['defender'], strengths: ['Infinite HP Regen', 'Shield'], weaknesses: ['No Hard CC'], synergyNames: ['Shadeweaver', 'Defender'] },
    { name: 'Terizla', cost: 2, rarity: 'uncommon', role: ['dauntless'], strengths: ['Zone Control', 'Heavy Hammer'], weaknesses: ['Slow Windup'], synergyNames: ['Dragoncaller', 'Dauntless'] },
    { name: 'Martis', cost: 2, rarity: 'uncommon', role: ['weapon-master'], strengths: ['CC Immunity', 'Decimate Reset'], weaknesses: ['Needs Low HP target'], synergyNames: ['Astro Power', 'Weapon Master'] },
    { name: 'Wanwan', cost: 2, rarity: 'uncommon', role: ['marksman'], strengths: ['Crossbow Ult', 'Untargetable'], weaknesses: ['Squishy'], synergyNames: ['Dragon Altar', 'Marksman'] },
    { name: 'Claude', cost: 2, rarity: 'uncommon', role: ['marksman'], strengths: ['AoE Ult', 'Dexter Assist'], weaknesses: ['Position Dependent'], synergyNames: ['SPECTRE', 'Marksman'] },
    { name: 'Lesley', cost: 2, rarity: 'uncommon', role: ['marksman'], strengths: ['True Damage Snipe', 'Camouflage'], weaknesses: ['Single Target'], synergyNames: ['Starbelle', 'Marksman'] },
    { name: 'Lunox', cost: 2, rarity: 'uncommon', role: ['stargazer'], strengths: ['Cosmic Burst', 'Brilliance Invulnerable'], weaknesses: ['Mana Reliant'], synergyNames: ['Astro Power', 'Stargazer'] },
    { name: 'Luo Yi', cost: 2, rarity: 'uncommon', role: ['stargazer'], strengths: ['Yin Yang Pull', 'Mass CC'], weaknesses: ['Needs Pair Setup'], synergyNames: ['Dragon Altar', 'Stargazer'] },
    { name: 'Fanny', cost: 2, rarity: 'uncommon', role: ['swiftblade'], strengths: ['High Mobility', 'Steel Cable'], weaknesses: ['Vulnerable to CC'], synergyNames: ['Echomancer', 'Swiftblade'] },
    { name: 'Aurora', cost: 2, rarity: 'uncommon', role: ['mage'], strengths: ['Freeze Stun', 'Huge AoE Ult'], weaknesses: ['Immobile'], synergyNames: ['Starbelle', 'Mage'] },
    { name: 'Harley', cost: 2, rarity: 'uncommon', role: ['phasewarper'], strengths: ['Ring Burst', 'High Single Target'], weaknesses: ['Squishy'], synergyNames: ['Echomancer', 'Phasewarper'] },

    // Cost 3
    { name: 'Badang', cost: 3, rarity: 'rare', role: ['bruiser'], strengths: ['Fist Barrage', 'Wall Stun'], weaknesses: ['Needs Tight Space'], synergyNames: ['SPECTRE', 'Bruiser'] },
    { name: 'Yin', cost: 3, rarity: 'rare', role: ['bruiser'], strengths: ['Lieh Domain', 'Isolated 1v1'], weaknesses: ['Can be kited'], synergyNames: ['Mistbender', 'Bruiser'] },
    { name: 'Alucard', cost: 3, rarity: 'rare', role: ['defender'], strengths: ['Omnivamp', 'Leap Cleave'], weaknesses: ['Vulnerable to Anti-heal'], synergyNames: ['Echomancer', 'Defender'] },
    { name: 'Carmilla', cost: 3, rarity: 'rare', role: ['defender'], strengths: ['Curse of Blood', 'Damage Linking'], weaknesses: ['Melee Range'], synergyNames: ['Starbelle', 'Defender'] },
    { name: 'Hilda', cost: 3, rarity: 'rare', role: ['dauntless'], strengths: ['Shield Regen', 'Executioner'], weaknesses: ['Single Target'], synergyNames: ['Astro Power', 'Dauntless'] },
    { name: 'Akai', cost: 3, rarity: 'rare', role: ['dauntless'], strengths: ['Heavy Spin', 'Disruption'], weaknesses: ['Pushes enemies away'], synergyNames: ['Kishin', 'Dauntless'] },
    { name: 'Cici', cost: 3, rarity: 'rare', role: ['weapon-master'], strengths: ['Yo-yo Tether', 'Kiting Sustain'], weaknesses: ['Vulnerable to Bursts'], synergyNames: ['Starbelle', 'Weapon Master'] },
    { name: 'Angela', cost: 3, rarity: 'rare', role: ['stargazer', 'support'], strengths: ['Love Waves', 'Mass Shield & Haste'], weaknesses: ['Low HP'], synergyNames: ['Enchanted Tales', 'Stargazer'] },
    { name: 'Saber', cost: 3, rarity: 'rare', role: ['swiftblade'], strengths: ['Triple Sweep', 'Insta Kill Carry'], weaknesses: ['Squishy'], synergyNames: ['Dragoncaller', 'Swiftblade'] },
    { name: 'Odette', cost: 3, rarity: 'rare', role: ['mage'], strengths: ['Swan Song AoE', 'Massive Magic DMG'], weaknesses: ['Channeling interruptible'], synergyNames: ['Shadeweaver', 'Mage'] },
    { name: 'Tigreal', cost: 3, rarity: 'rare', role: ['phasewarper', 'tank'], strengths: ['Implosion Pull', 'Mass Stun'], weaknesses: ['Low Mobility'], synergyNames: ['Dragoncaller', 'Phasewarper'] },

    // Cost 4
    { name: 'Chou', cost: 4, rarity: 'epic', role: ['bruiser'], strengths: ['Jeet Kune Do', 'The Way of Dragon Kick'], weaknesses: ['Single Target'], synergyNames: ['Dragon Altar', 'Bruiser'] },
    { name: 'Dyrroth', cost: 4, rarity: 'epic', role: ['bruiser'], strengths: ['Armor Shred', 'Abyssal Strike Burst'], weaknesses: ['Kited easily'], synergyNames: ['Kishin', 'Bruiser'] },
    { name: 'Belerick', cost: 4, rarity: 'epic', role: ['defender'], strengths: ['Ancient Seed Taunt', 'Damage Reflection'], weaknesses: ['Slow'], synergyNames: ['Enchanted Tales', 'Defender'] },
    { name: 'Lolita', cost: 4, rarity: 'epic', role: ['dauntless'], strengths: ['Shield Block', 'Giant Stun Hammer'], weaknesses: ['Charge time'], synergyNames: ['Starbelle', 'Dauntless'] },
    { name: 'Zilong', cost: 4, rarity: 'epic', role: ['weapon-master'], strengths: ['Supreme Warrior', 'Spear Flip'], weaknesses: ['Vulnerable to Burst'], synergyNames: ['Dragon Altar', 'Weapon Master'] },
    { name: 'Freya', cost: 4, rarity: 'epic', role: ['weapon-master'], strengths: ['Valkyrie Form', 'Splash Crits'], weaknesses: ['Needs Melee contact'], synergyNames: ['Dragoncaller', 'Weapon Master'] },
    { name: 'Beatrix', cost: 4, rarity: 'epic', role: ['marksman'], strengths: ['Multi-weapon Arsenal', 'Devastating AoE'], weaknesses: ['Skill shot dependent'], synergyNames: ['Shadeweaver', 'Marksman'] },
    { name: 'Miya', cost: 4, rarity: 'epic', role: ['marksman'], strengths: ['Moonlight Shadow', 'Rapid Pierce Arrows'], weaknesses: ['Squishy'], synergyNames: ['Astro Power', 'Marksman'] },
    { name: 'Hanabi', cost: 4, rarity: 'epic', role: ['marksman'], strengths: ['Higanbana Petal Bounce', 'CC Shield'], weaknesses: ['Lacks Dash'], synergyNames: ['Kishin', 'Marksman'] },
    { name: 'Kagura', cost: 4, rarity: 'epic', role: ['stargazer'], strengths: ['Yin Yang Overturn', 'Mass Disruption'], weaknesses: ['Complex mechanics'], synergyNames: ['Kishin', 'Stargazer'] },
    { name: 'Ling', cost: 4, rarity: 'epic', role: ['swiftblade'], strengths: ['Tempest of Blades', 'Untargetable Burst'], weaknesses: ['Needs Sword pick-up'], synergyNames: ['Starbelle', 'Swiftblade'] },
    { name: 'Alice', cost: 4, rarity: 'epic', role: ['mage'], strengths: ['Blood Ode Drain', 'Immense Sustain'], weaknesses: ['Anti-heal weakness'], synergyNames: ['Astro Power', 'Mage'] },
    { name: 'Gord', cost: 4, rarity: 'epic', role: ['mage'], strengths: ['Mystic Gush Beam', 'Pure Damage Shred'], weaknesses: ['Stationary Ult'], synergyNames: ['SPECTRE', 'Mage'] },
    { name: 'Vexana', cost: 4, rarity: 'epic', role: ['mage'], strengths: ['Eternal Guard Golem', 'AoE Knockup'], weaknesses: ['Long Cooldown'], synergyNames: ['Enchanted Tales', 'Mage'] },
    { name: 'Diggie', cost: 4, rarity: 'epic', role: ['scavenger'], strengths: ['Time Journey', 'Team CC Immunity'], weaknesses: ['Low Direct Damage'], synergyNames: ['Echomancer', 'Scavenger'] },
    { name: 'Chang\'e', cost: 4, rarity: 'epic', role: ['scavenger', 'mage'], strengths: ['Meteor Shower', 'Continuous Barrage'], weaknesses: ['Vulnerable from flanks'], synergyNames: ['Kishin', 'Scavenger'] },

    // Cost 5
    { name: 'Minsitthar', cost: 5, rarity: 'legendary', role: ['bruiser'], strengths: ["King's Calling", 'Grounding Field (No Dashes)'], weaknesses: ['High Mana Cost'], synergyNames: ['Dragoncaller', 'Bruiser'] },
    { name: 'Barats', cost: 5, rarity: 'legendary', role: ['bruiser'], strengths: ['Big Guy Stacks', 'Detona Welcome Swallow'], weaknesses: ['Kited easily'], synergyNames: ['Enchanted Tales', 'Bruiser'] },
    { name: 'Baxia', cost: 5, rarity: 'legendary', role: ['defender'], strengths: ['Shield Roll', 'Innate Anti-heal'], weaknesses: ['Magic Damage focus'], synergyNames: ['Dragon Altar', 'Defender'] },
    { name: 'Karina', cost: 5, rarity: 'legendary', role: ['dauntless', 'swiftblade'], strengths: ['Shadowform Miss Chance', 'Elusiveness'], weaknesses: ['True Damage counters'], synergyNames: ['SPECTRE', 'Dauntless'] },
    { name: 'Grock', cost: 5, rarity: 'legendary', role: ['dauntless'], strengths: ['Wild Charge Stun', 'Earthen Wall'], weaknesses: ['Melee range'], synergyNames: ['Mistbender', 'Dauntless'] },
    { name: 'Leomord', cost: 5, rarity: 'legendary', role: ['weapon-master'], strengths: ['Barbiel Steed', 'Critical Slash Cleave'], weaknesses: ['Needs Ult form'], synergyNames: ['Echomancer', 'Weapon Master'] },
    { name: 'Floryn', cost: 5, rarity: 'legendary', role: ['stargazer', 'support'], strengths: ['Bloom Global Heal', 'Dew Free Lantern Item'], weaknesses: ['Squishy'], synergyNames: ['Mistbender', 'Stargazer'] },
    { name: 'Joy', cost: 5, rarity: 'legendary', role: ['swiftblade'], strengths: ['Rhythm Beats', 'Untargetable Electrify Ult'], weaknesses: ['Needs Perfect Rhythm'], synergyNames: ['Kishin', 'Swiftblade'] },
    { name: 'Lancelot', cost: 5, rarity: 'legendary', role: ['phasewarper', 'swiftblade'], strengths: ['Phantom Execution', 'Untargetable Multislash'], weaknesses: ['Squishy'], synergyNames: ['Kishin', 'Phasewarper'] },
  ];

  for (const h of heroesData) {
    const existing = await prisma.hero.findFirst({ where: { name: h.name } });
    const heroFactions = h.synergyNames.filter((s: string) => FACTION_NAMES.has(s));
    if (existing) {
      await prisma.hero.update({
        where: { id: existing.id },
        data: {
          cost: h.cost,
          rarity: h.rarity,
          role: j(h.role),
          faction: j(heroFactions),
          strengths: j(h.strengths),
          weaknesses: j(h.weaknesses),
          patchId: patch.id,
        },
      });

      // Update hero synergies
      await prisma.heroSynergy.deleteMany({ where: { heroId: existing.id } });
      for (const sname of h.synergyNames) {
        if (synergies[sname]) {
          await prisma.heroSynergy.create({
            data: { heroId: existing.id, synergyId: synergies[sname].id },
          });
        }
      }
    } else {
      const hero = await prisma.hero.create({
        data: {
          name: h.name,
          cost: h.cost,
          rarity: h.rarity,
          role: j(h.role),
          faction: j(heroFactions),
          strengths: j(h.strengths),
          weaknesses: j(h.weaknesses),
          isActive: true,
          patchId: patch.id,
          dataSource: 'mcgg_chrono_echoes',
          equipments: j(['Blade of Despair', 'Immortality', 'Demon Hunter Sword']),
          positions: j([{ row: h.cost >= 4 ? 1 : 0, col: 2 }]),
        },
      });

      for (const sname of h.synergyNames) {
        if (synergies[sname]) {
          await prisma.heroSynergy.create({
            data: { heroId: hero.id, synergyId: synergies[sname].id },
          });
        }
      }
    }
  }
  console.log(`✅ ${heroesData.length} heroes seeded from Chrono Echoes matrix`);

  // ====== TIER ENTRIES FOR 40 COMMANDERS ======
  const commanderRatings: Record<string, string> = {
    'Lunox': 'S', 'Paquito': 'S', 'Lylia': 'S', 'Aamon': 'S', 'Yu Zhong': 'S',
    'Chou': 'A', 'Angela': 'A', 'Kagura': 'A', 'Ruby': 'A', 'Johnson': 'A',
    'Ling': 'A', 'Wanwan': 'A', 'Miya': 'A', 'Valir': 'A', 'Freya': 'A',
    'Alucard': 'B', 'Layla': 'B', 'Franco': 'B', 'Lancelot': 'B', 'Alice': 'B',
    'Harley': 'B', 'Luo Yi': 'B', 'Vexana': 'B', 'Minotaur': 'B', 'Kalea': 'B',
    'Cyclops': 'B', 'Vale': 'B', 'Zilong': 'B', 'Moskov': 'B', 'Guinevere': 'B',
    'Lukas': 'B', 'Aurora': 'B', 'Karina': 'B', 'Dyrroth': 'B', 'Gusion': 'B',
    'Diggie': 'C', 'Popol & Kupa': 'C', 'Nana': 'C', 'Brody': 'C',
  };

  const allCommanders = await prisma.commander.findMany({});
  for (const cmd of allCommanders) {
    const tier = commanderRatings[cmd.name] || 'B';
    const existing = await prisma.tierEntry.findFirst({ where: { entityType: 'commander', entityId: cmd.id } });
    if (existing) {
      await prisma.tierEntry.update({
        where: { id: existing.id },
        data: { tier, patchId: patch.id },
      });
    } else {
      await prisma.tierEntry.create({
        data: {
          entityType: 'commander',
          entityId: cmd.id,
          tier,
          basis: 'Chrono Echoes Meta Rating',
          source: 'mcgg_guide',
          patchId: patch.id,
        },
      });
    }
  }
  console.log('✅ Commander tier ratings seeded');

  // Cleanup any legacy entities not in Chrono Echoes
  const officialCommanderNames = commanderData.map((c) => c.name);
  await prisma.commander.deleteMany({
    where: { name: { notIn: officialCommanderNames } },
  });

  const officialSynergyNames = synergyData.map((s) => s.name);
  await prisma.synergy.deleteMany({
    where: { name: { notIn: officialSynergyNames } },
  });

  const officialHeroNames = heroesData.map((h) => h.name);
  await prisma.hero.deleteMany({
    where: { name: { notIn: officialHeroNames } },
  });
  console.log('✅ Legacy non-Chrono Echoes entries cleaned up');

  console.log('\n🎉 Database seeding Chrono Echoes complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
