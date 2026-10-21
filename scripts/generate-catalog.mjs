import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_PRODUCTS } from '../backend/src/data/seedProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.resolve(__dirname, '..', 'mobile', 'src', 'data', 'initialCatalog.ts');

const content = `// Dhanvikk Blooms Instant Offline Product Catalog
// Provides instantaneous 0ms startup data while live Render API syncs in background

import type { Product } from '@/types/models';

export const INITIAL_CATALOG: Product[] = ${JSON.stringify(SEED_PRODUCTS, null, 2)};
`;

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, content, 'utf8');
console.log(`Successfully generated ${targetPath} with ${SEED_PRODUCTS.length} products.`);
