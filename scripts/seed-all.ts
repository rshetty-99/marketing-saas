/**
 * MASTER SEED SCRIPT — Aura.ai
 *
 * Single command to wipe and rebuild ALL data:
 *   npx tsx scripts/seed-all.ts
 *
 * Steps:
 *   0. Wipe Clerk (orgs + users) + Firestore (all collections)
 *   1. Seed Clerk users/orgs + Firestore workspaces + entity_profiles + flat clients
 *   2. Seed RBAC roles + permissions (flat collections)
 *   3. Seed entity profiles + flat clients + member/platform enrichment
 *   4. Create E2E test user
 *
 * Replaces the old 3-script workflow:
 *   - seed-all-data.ts → step 0+1
 *   - seed-roles-permissions.ts → step 2
 *   - seed-entity-profiles.ts → step 3
 */

import { execFileSync } from 'child_process';
import { resolve } from 'path';

const scriptsDir = resolve(__dirname);
const projectDir = resolve(scriptsDir, '..');

function run(script: string): void {
  process.stdout.write(`\n${'='.repeat(60)}\n`);
  process.stdout.write(`  Running: ${script}\n`);
  process.stdout.write(`${'='.repeat(60)}\n\n`);

  execFileSync('npx', ['tsx', resolve(scriptsDir, script)], {
    stdio: 'inherit',
    cwd: projectDir,
    shell: true,
  });
}

function main(): void {
  process.stdout.write('\n');
  process.stdout.write('  AURA.AI — Master Seed (all-in-one)\n\n');

  // Step 0+1: cleanup + Clerk users + Firestore workspaces + platform team + E2E user
  run('seed-all-data.ts');

  // Step 2: RBAC roles + permissions (flat collections)
  run('seed-roles-permissions.ts');

  // Step 3: Entity profiles + flat clients + member/platform enrichment
  run('seed-entity-profiles.ts');

  process.stdout.write('\n');
  process.stdout.write('  ALL DONE — Full seed complete\n\n');
  process.stdout.write('  Collections: workspaces, entity_profiles, clients,\n');
  process.stdout.write('    platform_users, workspace_roles, platform_roles,\n');
  process.stdout.write('    workspace_permissions, platform_permissions\n\n');
  process.stdout.write('  Password for all users: AuraTest2026!\n\n');
}

main();
