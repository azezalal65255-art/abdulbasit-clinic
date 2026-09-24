import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { supabase } from '../src/lib/supabase';

const CONVERTED_DB_PATH = path.join(process.cwd(), 'data', 'clinic-database.supabase-ready.json');

async function importAll() {
  if (!fs.existsSync(CONVERTED_DB_PATH)) {
    console.error('Converted database payload not found. Run generate-supabase-schema-and-migration.ts first.');
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(CONVERTED_DB_PATH, 'utf8'));

  console.log('====================================================');
  console.log('🚀 Attempting Data Import into Supabase PostgreSQL');
  console.log('====================================================\n');

  const collections = [
    { table: 'users', data: db.users },
    { table: 'doctor', data: [db.doctor] },
    { table: 'services', data: db.services },
    { table: 'categories', data: db.categories },
    { table: 'conditions', data: db.conditions },
    { table: 'endoscopy', data: db.endoscopy },
    { table: 'articles', data: db.articles },
    { table: 'pages', data: db.pages },
    { table: 'faqs', data: db.faqs },
    { table: 'bookings', data: db.bookings },
    { table: 'messages', data: db.messages },
    { table: 'schedule', data: [db.schedule] },
    { table: 'contact', data: [db.contact] },
    { table: 'media', data: db.media },
    { table: 'seo', data: [db.seo] },
    { table: 'settings', data: [db.settings] },
    { table: 'videos', data: db.videos },
    { table: 'careers', data: db.careers },
    { table: 'job_applications', data: db.jobApplications },
    { table: 'conferences', data: db.conferences },
    { table: 'research', data: db.research },
    { table: 'sliders', data: db.sliders },
    { table: 'notifications', data: db.notifications },
    { table: 'activity_logs', data: db.activityLogs },
    { table: 'analytics', data: [db.analytics] },
    { table: 'recycle_bin', data: db.recycleBin },
  ];

  let successTables = 0;
  let skippedOrPendingTables = 0;
  let totalImported = 0;

  for (const col of collections) {
    if (!col.data || col.data.length === 0) continue;
    process.stdout.write(`Table '${col.table}' (${col.data.length} records): `);

    try {
      const { data, error } = await supabase.from(col.table).upsert(col.data, { onConflict: 'id' });
      if (error) {
        console.log(`⚠️ Pending table creation in SQL Editor (${error.message})`);
        skippedOrPendingTables++;
      } else {
        console.log(`✅ Imported ${col.data.length} records`);
        successTables++;
        totalImported += col.data.length;
      }
    } catch (err: any) {
      console.log(`⚠️ Exception (${err.message})`);
      skippedOrPendingTables++;
    }
  }

  console.log('\n====================================================');
  console.log('📊 IMPORT EXECUTION SUMMARY:');
  console.log(`   - Tables with active schema: ${successTables}`);
  console.log(`   - Tables pending schema execution: ${skippedOrPendingTables}`);
  console.log(`   - Total records imported: ${totalImported}`);
  console.log('====================================================\n');
}

importAll();
