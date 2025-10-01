require('dotenv').config();
const { Pool } = require('pg');

async function checkBlogs() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const res = await pool.query(`
      SELECT id, title, slug, status, published_at, created_at 
      FROM blogs 
      ORDER BY created_at DESC
    `);

    console.log('\n📝 Blogs in database:');
    console.log('═══════════════════════════════════════\n');

    if (res.rows.length === 0) {
      console.log('❌ No blogs found in database.');
      console.log('\nTo create a blog:');
      console.log('1. Login as admin');
      console.log('2. Go to /admin/blogs');
      console.log('3. Click "New Blog Post"');
      console.log('4. Fill in the details');
      console.log('5. Set Status to "Published"');
      console.log('6. Click "Create Blog Post"');
    } else {
      res.rows.forEach((blog, index) => {
        console.log(`${index + 1}. ${blog.title}`);
        console.log(`   Status: ${blog.status}`);
        console.log(`   Published: ${blog.published_at || 'Not published'}`);
        console.log(`   Slug: ${blog.slug}`);
        console.log(`   Created: ${new Date(blog.created_at).toLocaleString()}`);
        console.log('');
      });

      const publishedCount = res.rows.filter(b => b.status === 'published').length;
      const draftCount = res.rows.filter(b => b.status === 'draft').length;

      console.log(`\n📊 Summary:`);
      console.log(`   Total: ${res.rows.length} blog(s)`);
      console.log(`   ✅ Published: ${publishedCount}`);
      console.log(`   📝 Draft: ${draftCount}`);

      if (draftCount > 0) {
        console.log(`\n⚠️  Note: Draft blogs won't appear on the public /blogs page or landing page.`);
        console.log(`   To make them visible, edit the blog and change status to "Published".`);
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkBlogs(); 