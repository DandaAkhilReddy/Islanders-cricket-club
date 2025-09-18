import archiver from 'archiver';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { env } from '../env';

const createBackup = async () => {
  try {
    console.log('📦 Starting backup process...');

    const backupDir = join(process.cwd(), '..', 'backups');
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] +
                     '-' + new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];

    const backupFileName = `islanders-backup-${timestamp}.zip`;
    const backupPath = join(backupDir, backupFileName);

    const output = createWriteStream(backupPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    return new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
        console.log(`✅ Backup created successfully!`);
        console.log(`📁 File: ${backupFileName}`);
        console.log(`📊 Size: ${sizeMB} MB`);
        console.log(`📍 Location: ${backupPath}`);
        resolve();
      });

      archive.on('error', (err) => {
        console.error('❌ Backup failed:', err);
        reject(err);
      });

      archive.pipe(output);

      const dbPath = env.SQLITE_PATH;
      const uploadsPath = env.UPLOAD_DIR;

      if (existsSync(dbPath)) {
        archive.file(dbPath, { name: 'islanders.db' });
        console.log('📄 Database added to backup');
      } else {
        console.log('⚠️ Database file not found');
      }

      if (existsSync(uploadsPath)) {
        archive.directory(uploadsPath, 'uploads');
        console.log('📸 Upload directory added to backup');
      } else {
        console.log('⚠️ Uploads directory not found');
      }

      const packageJsonPath = join(process.cwd(), 'package.json');
      if (existsSync(packageJsonPath)) {
        archive.file(packageJsonPath, { name: 'package.json' });
      }

      const envExamplePath = join(process.cwd(), '..', '.env.example');
      if (existsSync(envExamplePath)) {
        archive.file(envExamplePath, { name: '.env.example' });
      }

      const readmePath = join(process.cwd(), '..', 'README.md');
      if (existsSync(readmePath)) {
        archive.file(readmePath, { name: 'README.md' });
      }

      archive.finalize();
    });

  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  createBackup().then(() => {
    process.exit(0);
  });
}

export default createBackup;