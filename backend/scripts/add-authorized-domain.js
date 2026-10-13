import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function addDomain(domainToAdd) {
  if (!domainToAdd) {
    console.error('Usage: node add-authorized-domain.js <domain-or-ip>');
    process.exit(1);
  }

  const keyPath = path.resolve(__dirname, '../config/firebase-service-account.json');
  const auth = new GoogleAuth({
    keyFile: keyPath,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const projectId = 'auth-checker-diva';
  const getUrl = `https://identitytoolkit.googleapis.com/v2/projects/${projectId}/config`;
  const patchUrl = `${getUrl}?updateMask=authorizedDomains`;

  const getRes = await client.request({ url: getUrl });
  const current = getRes.data.authorizedDomains || [];

  const cleanDomain = domainToAdd.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  if (current.includes(cleanDomain)) {
    console.log(`Domain "${cleanDomain}" is already in authorized domains.`);
    return;
  }

  const updated = [...current, cleanDomain];
  const patchRes = await client.request({
    url: patchUrl,
    method: 'PATCH',
    data: { authorizedDomains: updated }
  });

  console.log(`✅ Successfully added "${cleanDomain}" to Firebase Authorized Domains!`);
  console.log('Current Authorized Domains:', patchRes.data.authorizedDomains);
}

const targetDomain = process.argv[2];
addDomain(targetDomain).catch(err => {
  console.error('Failed to update authorized domains:', err.response?.data || err.message);
  process.exit(1);
});
