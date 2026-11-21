require('../server/src/config/loadEnv');
const path = require('node:path');
const mongoose = require('mongoose');
const { DatabaseSync } = require('node:sqlite');

async function migrate() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    throw new Error('Set MONGO_URI in .env before importing the local SQLite database.');
  }
  const sqlitePath = path.resolve(process.env.LEGACY_DB_PATH || path.join(__dirname, '../data/portfolio.db'));
  const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });
  const baseName = process.env.MONGO_DB_NAME || 'portfolio';
  const portfolioConnection = await mongoose.createConnection(uri, {
    dbName: `${baseName}_portfolio`, serverSelectionTimeoutMS: 8000
  }).asPromise();
  const contactConnection = await mongoose.createConnection(uri, {
    dbName: `${baseName}_contact`, serverSelectionTimeoutMS: 8000
  }).asPromise();

  const Project = portfolioConnection.model('Project', require('../services/portfolio/src/models/Project').schema);
  const Blog = portfolioConnection.model('Blog', require('../services/portfolio/src/models/Blog').schema);
  const Stat = portfolioConnection.model('Stat', require('../services/portfolio/src/models/Stat').schema);
  const Inquiry = contactConnection.model('Inquiry', require('../services/contact/src/models/Inquiry').schema);

  const projects = sqlite.prepare('SELECT * FROM projects').all();
  const blogs = sqlite.prepare('SELECT * FROM blogs').all();
  const stats = sqlite.prepare('SELECT key, value FROM stats').all();
  const inquiries = sqlite.prepare('SELECT * FROM inquiries').all();

  if (projects.length) await Project.bulkWrite(projects.map((row) => {
    const { id, ...data } = row;
    return { updateOne: { filter: { legacy_id: String(id) }, update: { $set: { ...data, legacy_id: String(id) } }, upsert: true } };
  }));
  if (blogs.length) await Blog.bulkWrite(blogs.map(({ id, ...data }) => ({
    updateOne: { filter: { slug: data.slug }, update: { $set: data }, upsert: true }
  })));
  if (stats.length) await Stat.bulkWrite(stats.map(({ key, value }) => ({
    updateOne: { filter: { key }, update: { $set: { value: String(value) } }, upsert: true }
  })));
  if (inquiries.length) await Inquiry.bulkWrite(inquiries.map((row) => {
    const { id, ...data } = row;
    return { updateOne: { filter: { legacy_id: String(id) }, update: { $set: { ...data, legacy_id: String(id) } }, upsert: true } };
  }));

  console.log(`Imported ${projects.length} projects, ${blogs.length} articles, ${stats.length} stats, and ${inquiries.length} inquiries.`);
  sqlite.close();
  await Promise.all([portfolioConnection.close(), contactConnection.close()]);
}

migrate().catch((error) => {
  console.error(`SQLite import failed: ${error.message}`);
  process.exitCode = 1;
}).finally(async () => mongoose.disconnect());
