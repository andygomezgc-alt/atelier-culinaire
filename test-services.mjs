// Simple test to verify services module structure
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const servicesDir = path.join(__dirname, 'src/services')

const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'))
console.log('Service files created:')
files.forEach(f => console.log(`  ✓ ${f}`))

// Verify fetch.ts exists
if (!fs.existsSync(path.join(servicesDir, 'fetch.ts'))) {
  console.error('ERROR: fetch.ts not found')
  process.exit(1)
}

// Verify all required service files
const required = ['recipes.ts', 'menus.ts', 'pantry.ts', 'ideas.ts', 'profile.ts', 'team.ts']
const missing = required.filter(f => !fs.existsSync(path.join(servicesDir, f)))
if (missing.length > 0) {
  console.error('ERROR: Missing files:', missing)
  process.exit(1)
}

console.log('\n✓ All 6 service files + fetch utility created')
