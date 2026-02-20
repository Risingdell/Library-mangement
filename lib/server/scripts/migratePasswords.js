const db = require('../db');
const { hashPassword } = require('../utils/password');

/**
 * One-time script to migrate existing passwords to hashed format
 * Run once after deploying JWT system
 * Usage: node scripts/migratePasswords.js
 */
async function migratePasswords() {
  console.log('🔄 Starting password migration...\n');

  try {
    // Migrate user passwords
    db.query('SELECT id, password FROM users WHERE password_hash IS NULL', async (err, users) => {
      if (err) {
        console.error('❌ Error fetching users:', err);
        return;
      }

      if (!users || users.length === 0) {
        console.log('✅ No users to migrate');
      } else {
        console.log(`📊 Found ${users.length} users to migrate`);
        let migrated = 0;
        let failed = 0;

        for (const user of users) {
          try {
            if (!user.password) {
              console.log(`⏭️  User ${user.id}: No password, skipping`);
              continue;
            }

            const hashedPassword = await hashPassword(user.password);

            db.query(
              'UPDATE users SET password_hash = ? WHERE id = ?',
              [hashedPassword, user.id],
              (err) => {
                if (err) {
                  console.error(`❌ Failed to migrate user ${user.id}:`, err.message);
                  failed++;
                } else {
                  migrated++;
                  console.log(`✅ Migrated user ${user.id}`);
                }
              }
            );
          } catch (err) {
            console.error(`❌ Error hashing password for user ${user.id}:`, err.message);
            failed++;
          }
        }

        // Wait for all migrations to complete
        setTimeout(() => {
          console.log(`\n📈 Users migration complete: ${migrated} successful, ${failed} failed\n`);
          migrateAdminPasswords();
        }, users.length * 100);
      }
    });
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

function migrateAdminPasswords() {
  db.query('SELECT id, password FROM admins WHERE password_hash IS NULL', async (err, admins) => {
    if (err) {
      console.error('❌ Error fetching admins:', err);
      process.exit(1);
    }

    if (!admins || admins.length === 0) {
      console.log('✅ No admins to migrate');
      console.log('\n✅ Password migration complete!');
      process.exit(0);
    }

    console.log(`📊 Found ${admins.length} admins to migrate`);
    let migrated = 0;
    let failed = 0;

    for (const admin of admins) {
      try {
        if (!admin.password) {
          console.log(`⏭️  Admin ${admin.id}: No password, skipping`);
          continue;
        }

        const hashedPassword = await hashPassword(admin.password);

        db.query(
          'UPDATE admins SET password_hash = ? WHERE id = ?',
          [hashedPassword, admin.id],
          (err) => {
            if (err) {
              console.error(`❌ Failed to migrate admin ${admin.id}:`, err.message);
              failed++;
            } else {
              migrated++;
              console.log(`✅ Migrated admin ${admin.id}`);
            }
          }
        );
      } catch (err) {
        console.error(`❌ Error hashing password for admin ${admin.id}:`, err.message);
        failed++;
      }
    }

    // Wait for all migrations to complete
    setTimeout(() => {
      console.log(`\n📈 Admins migration complete: ${migrated} successful, ${failed} failed`);
      console.log('\n✅ All password migration complete!');
      process.exit(0);
    }, admins.length * 100);
  });
}

// Run migration
migratePasswords();
