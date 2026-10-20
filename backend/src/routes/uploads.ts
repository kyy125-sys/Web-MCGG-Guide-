import { Router } from 'express';
import { upload } from '../middleware/upload';
import { prisma } from '../lib/prisma';

export const uploadRoutes = Router();

// POST /api/upload/:type - type = heroes | commanders | synergies | misc
uploadRoutes.post('/:type', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { type } = req.params;
    const { entityId, entityType } = req.body;
    const relativePath = `/uploads/${type}/${req.file.filename}`;
    const imageUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}${relativePath}`;

    // Update entity imageUrl if provided
    if (entityId && entityType) {
      if (entityType === 'hero') await prisma.hero.update({ where: { id: entityId }, data: { imageUrl } });
      else if (entityType === 'commander') await prisma.commander.update({ where: { id: entityId }, data: { imageUrl } });
      else if (entityType === 'synergy') await prisma.synergy.update({ where: { id: entityId }, data: { iconUrl: imageUrl } });
    }
    res.json({ imageUrl, filename: req.file.filename, path: relativePath });
  } catch (e) { next(e); }
});
