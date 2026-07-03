import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../../config/db';

const TOTAL_USERS = 10000;
const TOTAL_CATEGORIES = 50;
const TOTAL_POSTS = 20000;
const FOLLOWS_PER_USER = 5000;
const SAVES_PER_USER = 1000;
const LIKES_PER_POST = 15000;
const COMMENTS_PER_POST = 10000;
const CHUNK_SIZE = 500; // Reduced batch insert size to prevent ER_NET_PACKET_TOO_LARGE

export async function runScalableSeed() {
  console.log('--- STARTING SCALABLE SEEDER ---');
  console.log(`WARNING: Generating extreme volumes of data...`);

  try {
    await sequelize.authenticate();

    // Disable foreign key checks for faster inserts
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    const hashedPassword = await bcrypt.hash('password123', 10);
    const dateStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

    console.log(`[1/7] Seeding ${TOTAL_USERS} Users...`);
    let usersData = [];
    for (let i = 1; i <= TOTAL_USERS; i++) {
      usersData.push(`('${uuidv4()}', 'User ${i}', 'user_${i}_${Date.now()}', 'user${i}_${Date.now()}@studygram.com', '${hashedPassword}', 'active', 'user', 1, '${dateStr}', '${dateStr}')`);

      if (usersData.length >= CHUNK_SIZE || i === TOTAL_USERS) {
        await sequelize.query(`INSERT INTO users (uuid, name, username, email, password, status, role, email_verified, created_at, updated_at) VALUES ${usersData.join(',')}`);
        usersData = [];
        console.log(`      ...inserted ${i} users`);
      }
    }

    console.log(`[2/7] Seeding ${TOTAL_CATEGORIES} Categories...`);
    let catData = [];
    for (let i = 1; i <= TOTAL_CATEGORIES; i++) {
      catData.push(`('Category ${i}', 'category-${i}', 'active', '${dateStr}', '${dateStr}')`);
    }
    await sequelize.query(`INSERT INTO categories (name, slug, status, created_at, updated_at) VALUES ${catData.join(',')}`);
    console.log(`      ...inserted categories`);

    console.log(`[3/7] Seeding ${TOTAL_POSTS} Posts...`);
    let postsData = [];
    for (let i = 1; i <= TOTAL_POSTS; i++) {
      const userId = (i % TOTAL_USERS) + 1;
      const catId = (i % TOTAL_CATEGORIES) + 1;
      postsData.push(`(${userId}, ${catId}, 'Post ${i}', 'Description ${i}', 'image', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', 0, 0, 'public', '${dateStr}', '${dateStr}')`);

      if (postsData.length >= CHUNK_SIZE || i === TOTAL_POSTS) {
        await sequelize.query(`INSERT INTO posts (user_id, category_id, title, description, content_type, media_url, likes_count, comments_count, visibility, created_at, updated_at) VALUES ${postsData.join(',')}`);
        postsData = [];
        console.log(`      ...inserted ${i} posts`);
      }
    }

    console.log(`[4/7] Seeding Followers (${TOTAL_USERS * FOLLOWS_PER_USER} records)...`);
    // NOTE: Generating 50 million records can crash the process or take hours. We do it in chunks.
    for (let i = 1; i <= TOTAL_USERS; i++) {
      let followsData = [];
      // Pick random users to follow. For simplicity and speed, just follow users in a sequence.
      for (let j = 1; j <= FOLLOWS_PER_USER; j++) {
        let followingId = ((i + j) % TOTAL_USERS) + 1;
        followsData.push(`(${i}, ${followingId}, '${dateStr}', '${dateStr}')`);

        if (followsData.length >= CHUNK_SIZE || j === FOLLOWS_PER_USER) {
          await sequelize.query(`INSERT IGNORE INTO followers (follower_id, following_id, created_at, updated_at) VALUES ${followsData.join(',')}`);
          followsData = [];
        }
      }
      if (i % 100 === 0) console.log(`      ...processed follows for ${i} users`);
    }

    console.log(`[5/7] Seeding Saved Posts (${TOTAL_USERS * SAVES_PER_USER} records)...`);
    for (let i = 1; i <= TOTAL_USERS; i++) {
      let savesData = [];
      for (let j = 1; j <= SAVES_PER_USER; j++) {
        let postId = ((i + j) % TOTAL_POSTS) + 1;
        savesData.push(`(${i}, ${postId}, '${dateStr}', '${dateStr}')`);

        if (savesData.length >= CHUNK_SIZE || j === SAVES_PER_USER) {
          await sequelize.query(`INSERT IGNORE INTO saved_posts (user_id, post_id, created_at, updated_at) VALUES ${savesData.join(',')}`);
          savesData = [];
        }
      }
      if (i % 1000 === 0) console.log(`      ...processed saves for ${i} users`);
    }

    console.log(`[6/7] Seeding Likes (${TOTAL_POSTS * LIKES_PER_POST} records)...`);
    for (let i = 1; i <= TOTAL_POSTS; i++) {
      let likesData = [];
      for (let j = 1; j <= LIKES_PER_POST; j++) {
        let userId = (j % TOTAL_USERS) + 1;
        likesData.push(`(${userId}, ${i}, '${dateStr}', '${dateStr}')`);

        if (likesData.length >= CHUNK_SIZE || j === LIKES_PER_POST) {
          await sequelize.query(`INSERT IGNORE INTO likes (user_id, post_id, created_at, updated_at) VALUES ${likesData.join(',')}`);
          likesData = [];
        }
      }
      if (i % 1000 === 0) console.log(`      ...processed likes for ${i} posts`);
    }

    console.log(`[7/7] Seeding Comments (${TOTAL_POSTS * COMMENTS_PER_POST} records)...`);
    for (let i = 1; i <= TOTAL_POSTS; i++) {
      let commentsData = [];
      for (let j = 1; j <= COMMENTS_PER_POST; j++) {
        let userId = (j % TOTAL_USERS) + 1;
        commentsData.push(`(${userId}, ${i}, 'This is comment ${j} on post ${i}', '${dateStr}', '${dateStr}')`);

        if (commentsData.length >= CHUNK_SIZE || j === COMMENTS_PER_POST) {
          await sequelize.query(`INSERT INTO comments (user_id, post_id, content, created_at, updated_at) VALUES ${commentsData.join(',')}`);
          commentsData = [];
        }
      }
      if (i % 1000 === 0) console.log(`      ...processed comments for ${i} posts`);
    }

    // Re-enable foreign keys
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

    // Finalize counts
    console.log('Updating post counters...');
    await sequelize.query('UPDATE posts SET likes_count = (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id), comments_count = (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id)');

    console.log('--- SEEDING COMPLETE ---');
    process.exit(0);

  } catch (err) {
    console.error('Seeding failed:', err);
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    process.exit(1);
  }
}

runScalableSeed();
