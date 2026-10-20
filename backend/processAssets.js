const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const commanderDir = 'F:/foto comander mcgg';
const uploadDir = path.join(__dirname, 'uploads', 'commanders');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const commanderList = [
  { file: 'Cuplikan layar 2026-10-16 161221.png', name: 'Lunox', slug: 'lunox' },
  { file: 'Cuplikan layar 2026-10-16 161239.png', name: 'Chou', slug: 'chou' },
  { file: 'Cuplikan layar 2026-10-16 161258.png', name: 'Alucard', slug: 'alucard' },
  { file: 'Cuplikan layar 2026-10-16 161314.png', name: 'Yu Zhong', slug: 'yu-zhong' },
  { file: 'Cuplikan layar 2026-10-16 161326.png', name: 'Layla', slug: 'layla' },
  { file: 'Cuplikan layar 2026-10-16 161339.png', name: 'Fanny', slug: 'fanny' },
  { file: 'Cuplikan layar 2026-10-16 161353.png', name: 'Angela', slug: 'angela' },
  { file: 'Cuplikan layar 2026-10-16 161403.png', name: 'Franco', slug: 'franco' },
  { file: 'Cuplikan layar 2026-10-16 161415.png', name: 'Lancelot', slug: 'lancelot' },
  { file: 'Cuplikan layar 2026-10-16 161425.png', name: 'Alice', slug: 'alice' },
  { file: 'Cuplikan layar 2026-10-16 161434.png', name: 'Diggie', slug: 'diggie' },
  { file: 'Cuplikan layar 2026-10-16 161452.png', name: 'Harley', slug: 'harley' },
  { file: 'Cuplikan layar 2026-10-16 161505.png', name: 'Popol & Kupa', slug: 'popol-kupa' },
  { file: 'Cuplikan layar 2026-10-16 161517.png', name: 'Luo Yi', slug: 'luo-yi' },
  { file: 'Cuplikan layar 2026-10-16 161527.png', name: 'Vexana', slug: 'vexana' },
  { file: 'Cuplikan layar 2026-10-16 161539.png', name: 'Ruby', slug: 'ruby' },
  { file: 'Cuplikan layar 2026-10-16 161548.png', name: 'Minotaur', slug: 'minotaur' },
  { file: 'Cuplikan layar 2026-10-16 161600.png', name: 'Kagura', slug: 'kagura' },
  { file: 'Cuplikan layar 2026-10-16 161613.png', name: 'Johnson', slug: 'johnson' },
  { file: 'Cuplikan layar 2026-10-16 161623.png', name: 'Lylia', slug: 'lylia' },
  { file: 'Cuplikan layar 2026-10-16 161632.png', name: 'Aamon', slug: 'aamon' },
  { file: 'Cuplikan layar 2026-10-16 161643.png', name: 'Kalea', slug: 'kalea' },
  { file: 'Cuplikan layar 2026-10-16 161656.png', name: 'Cyclops', slug: 'cyclops' },
  { file: 'Cuplikan layar 2026-10-16 161707.png', name: 'Wanwan', slug: 'wanwan' },
  { file: 'Cuplikan layar 2026-10-16 161716.png', name: 'Nana', slug: 'nana' },
  { file: 'Cuplikan layar 2026-10-16 161730.png', name: 'Ling', slug: 'ling' },
  { file: 'Cuplikan layar 2026-10-16 161741.png', name: 'Vale', slug: 'vale' },
  { file: 'Cuplikan layar 2026-10-16 161757.png', name: 'Zilong', slug: 'zilong' },
  { file: 'Cuplikan layar 2026-10-16 161809.png', name: 'Moskov', slug: 'moskov' },
  { file: 'Cuplikan layar 2026-10-16 161822.png', name: 'Guinevere', slug: 'guinevere' },
  { file: 'Cuplikan layar 2026-10-16 161832.png', name: 'Lukas', slug: 'lukas' },
  { file: 'Cuplikan layar 2026-10-16 161841.png', name: 'Miya', slug: 'miya' },
  { file: 'Cuplikan layar 2026-10-16 161853.png', name: 'Aurora', slug: 'aurora' },
  { file: 'Cuplikan layar 2026-10-16 161903.png', name: 'Karina', slug: 'karina' },
  { file: 'Cuplikan layar 2026-10-16 161914.png', name: 'Valir', slug: 'valir' },
  { file: 'Cuplikan layar 2026-10-16 161924.png', name: 'Dyrroth', slug: 'dyrroth' },
  { file: 'Cuplikan layar 2026-10-16 161935.png', name: 'Paquito', slug: 'paquito' },
  { file: 'Cuplikan layar 2026-10-16 161949.png', name: 'Gusion', slug: 'gusion' },
  { file: 'Cuplikan layar 2026-10-16 162008.png', name: 'Freya', slug: 'freya' },
  { file: 'Cuplikan layar 2026-10-16 162028.png', name: 'Brody', slug: 'brody' },
];

async function run() {
  console.log(`Processing ${commanderList.length} commanders...`);
  for (const c of commanderList) {
    const srcPath = path.join(commanderDir, c.file);
    const destPath = path.join(uploadDir, `${c.slug}.webp`);
    if (fs.existsSync(srcPath)) {
      try {
        await sharp(srcPath)
          .extract({ left: 185, top: 512, width: 245, height: 320 })
          .webp({ quality: 85 })
          .toFile(destPath);
        console.log(`✅ Cropped ${c.name} -> ${c.slug}.webp`);
      } catch (err) {
        console.error(`❌ Error cropping ${c.name}:`, err.message);
      }
    } else {
      console.warn(`⚠️ Source file not found: ${srcPath}`);
    }
  }
  console.log('Done!');
}

run();
