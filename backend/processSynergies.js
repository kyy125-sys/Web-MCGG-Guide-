const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const synergy1 = 'F:/foto sinergi mcgg/Cuplikan layar 2026-10-16 160944.png';
const synergy2 = 'F:/foto sinergi mcgg/Cuplikan layar 2026-10-16 160955.png';
const uploadDir = path.join(__dirname, 'uploads', 'synergies');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 10 Factions (top header in synergy1)
const factions = [
  { name: 'Shadeweaver', slug: 'shadeweaver', left: 552, top: 133 },
  { name: 'Astro Power', slug: 'astro-power', left: 680, top: 133 },
  { name: 'Echomancer', slug: 'echomancer', left: 808, top: 133 },
  { name: 'Dragon Altar', slug: 'dragon-altar', left: 936, top: 133 },
  { name: 'SPECTRE', slug: 'spectre', left: 1064, top: 133 },
  { name: 'Dragoncaller', slug: 'dragoncaller', left: 1192, top: 133 },
  { name: 'Starbelle', slug: 'starbelle', left: 1320, top: 133 },
  { name: 'Kishin', slug: 'kishin', left: 1448, top: 133 },
  { name: 'Enchanted Tales', slug: 'enchanted-tales', left: 1576, top: 133 },
  { name: 'Mistbender', slug: 'mistbender', left: 1704, top: 133 },
];

// Roles 1 to 6 (from synergy1)
const roles1 = [
  { name: 'Bruiser', slug: 'bruiser', left: 403, top: 268 },
  { name: 'Defender', slug: 'defender', left: 403, top: 383 },
  { name: 'Dauntless', slug: 'dauntless', left: 403, top: 498 },
  { name: 'Weapon Master', slug: 'weapon-master', left: 403, top: 612 },
  { name: 'Marksman', slug: 'marksman', left: 403, top: 727 },
  { name: 'Stargazer', slug: 'stargazer', left: 403, top: 842 },
];

// Roles 7 to 10 (from synergy2)
const roles2 = [
  { name: 'Swiftblade', slug: 'swiftblade', left: 403, top: 503 },
  { name: 'Mage', slug: 'mage', left: 403, top: 618 },
  { name: 'Phasewarper', slug: 'phasewarper', left: 403, top: 733 },
  { name: 'Scavenger', slug: 'scavenger', left: 403, top: 847 },
];

async function run() {
  for (const f of factions) {
    await sharp(synergy1)
      .extract({ left: f.left, top: f.top, width: 66, height: 66 })
      .webp({ quality: 90 })
      .toFile(path.join(uploadDir, `${f.slug}.webp`));
  }

  for (const r of roles1) {
    await sharp(synergy1)
      .extract({ left: r.left, top: r.top, width: 66, height: 66 })
      .webp({ quality: 90 })
      .toFile(path.join(uploadDir, `${r.slug}.webp`));
  }

  for (const r of roles2) {
    await sharp(synergy2)
      .extract({ left: r.left, top: r.top, width: 66, height: 66 })
      .webp({ quality: 90 })
      .toFile(path.join(uploadDir, `${r.slug}.webp`));
  }

  console.log('✅ Centered 20 synergy icons generated perfectly!');
}

run();
