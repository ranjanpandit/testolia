import { db } from "@/lib/db";

export async function ensureWebsiteTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS website_settings (
      id INT PRIMARY KEY DEFAULT 1,
      schoolName VARCHAR(255) NOT NULL DEFAULT '',
      tagline VARCHAR(255) NOT NULL DEFAULT '',
      phone VARCHAR(80) NOT NULL DEFAULT '',
      email VARCHAR(255) NOT NULL DEFAULT '',
      address TEXT,
      about TEXT,
      facebookUrl VARCHAR(500) NOT NULL DEFAULT '',
      instagramUrl VARCHAR(500) NOT NULL DEFAULT '',
      youtubeUrl VARCHAR(500) NOT NULL DEFAULT '',
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS website_sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      content TEXT,
      sortOrder INT NOT NULL DEFAULT 0,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS website_banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      subtitle VARCHAR(500) NOT NULL DEFAULT '',
      imageUrl VARCHAR(1000) NOT NULL DEFAULT '',
      linkUrl VARCHAR(1000) NOT NULL DEFAULT '',
      sortOrder INT NOT NULL DEFAULT 0,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS website_notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      linkUrl VARCHAR(1000) NOT NULL DEFAULT '',
      publishDate DATE NULL,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS website_important_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      url VARCHAR(1000) NOT NULL,
      sortOrder INT NOT NULL DEFAULT 0,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

export function toSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
