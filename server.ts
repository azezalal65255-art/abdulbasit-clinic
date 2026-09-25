import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { db } from './server/db';
import { reconcileMediaSystem } from './server/mediaReconciliation';
import { syncDatabaseFromSupabase } from './server/supabaseService';
import {
  ensureDirectories,
  DATA_UPLOADS_DIR,
  UPLOADS_DIR,
  DIST_UPLOADS_DIR,
  getFallbackPlaceholderSvg,
} from './server/storageUtils';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Initialize and synchronize upload directories
  ensureDirectories();

  // Run media reconciliation on startup to discover all persistent files and restore links
  try {
    const report = reconcileMediaSystem(db.get());
    db.save();
    console.log(`[Storage Reconciled] Discovered: ${report.orphanedFilesDiscovered}, Total media: ${report.totalMediaInDb}, Physical files: ${report.totalPhysicalFiles}`);
  } catch (reconcileErr) {
    console.error('Error during media reconciliation:', reconcileErr);
  }

  // Guaranteed Source-of-Truth Sync: pull all latest models from Supabase PostgreSQL on startup
  try {
    console.log('[Supabase Source-of-Truth] Synchronizing latest records on boot...');
    const syncRes = await syncDatabaseFromSupabase();
    if (syncRes.synced) {
      console.log(`[Supabase Source-of-Truth] Successfully pulled latest content from tables: ${syncRes.tables.join(', ')}`);
    } else {
      console.log('[Supabase Source-of-Truth] Remote tables pending or using persistent database.');
    }
  } catch (supaBootErr) {
    console.warn('[Supabase Source-of-Truth Warning]: Boot sync skipped due to:', supaBootErr);
  }

  // Statically serve uploads folder directly from persistent storage and public/dist
  app.use('/uploads', express.static(DATA_UPLOADS_DIR, { maxAge: '1d' }));
  app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '1d' }));
  app.use('/uploads', express.static(DIST_UPLOADS_DIR, { maxAge: '1d' }));

  // Fallback handler for /uploads: checks all 3 directories, and if file is missing, serves an elegant SVG placeholder
  app.get('/uploads/:filename', (req, res) => {
    const filename = path.basename(req.params.filename);
    const dataPath = path.join(DATA_UPLOADS_DIR, filename);
    const publicPath = path.join(UPLOADS_DIR, filename);
    const distPath = path.join(DIST_UPLOADS_DIR, filename);

    if (fs.existsSync(dataPath) && fs.statSync(dataPath).isFile()) {
      return res.sendFile(dataPath);
    }
    if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
      return res.sendFile(publicPath);
    }
    if (fs.existsSync(distPath) && fs.statSync(distPath).isFile()) {
      return res.sendFile(distPath);
    }

    // Graceful placeholder fallback: prevents broken image icons across the website!
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).send(getFallbackPlaceholderSvg('صورة طبية معتمدة'));
  });

  // Body parsers with generous limits for JSON and image uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API routes MUST COME FIRST
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
