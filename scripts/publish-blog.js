require('dotenv').config();
const { Pool } = require('pg');

async function publishBlog() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Update all draft blogs to published
    const res = await pool.query(`
      UPDATE blogs 
      SET status = 'published', 
          published_at = NOW() 
      WHERE status = 'draft'
      RETURNING title, slug
    `);

    if (res.rows.length > 0) {
      console.log('\n✅ Successfully published the following blogs:');
      res.rows.forEach(blog => {
        console.log(`   - ${blog.title} (${blog.slug})`);
      });
      console.log('\n🎉 Refresh your browser to see the blogs!');
    } else {
      console.log('\n📝 No draft blogs found to publish.');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

publishBlog(); 