/**
 * Renders the email templates to firebase/functions/preview/*.html
 * Usage: npm run preview:emails   (compiles first)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import notification from '../lib/templates/notificationEmail.js';
import confirmation from '../lib/templates/confirmationEmail.js';
import models from '../lib/models.js';

const { buildNotificationEmail } = notification;
const { buildConfirmationEmail } = confirmation;
const formConfigs = models.default ?? models;

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'preview');
mkdirSync(outDir, { recursive: true });

const config = formConfigs.contact;
const sample = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '555-0100',
  message: 'Hello!\nThis is a sample message.',
};

writeFileSync(join(outDir, 'notification.html'), buildNotificationEmail(config, sample).html);
writeFileSync(join(outDir, 'confirmation.html'), buildConfirmationEmail(config).html);
console.log(`Wrote previews to ${outDir}`);
