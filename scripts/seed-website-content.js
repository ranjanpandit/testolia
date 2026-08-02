const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) process.env[key] = value;
  }
}

async function ensureWebsiteTables(db) {
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

async function main() {
  loadEnv();

  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "testolia",
    port: Number(process.env.DB_PORT || 3306),
  });

  await ensureWebsiteTables(db);

  await db.query(
    `INSERT INTO website_settings
      (id, schoolName, tagline, phone, email, address, about, facebookUrl, instagramUrl, youtubeUrl)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      schoolName = VALUES(schoolName),
      tagline = VALUES(tagline),
      phone = VALUES(phone),
      email = VALUES(email),
      address = VALUES(address),
      about = VALUES(about),
      facebookUrl = VALUES(facebookUrl),
      instagramUrl = VALUES(instagramUrl),
      youtubeUrl = VALUES(youtubeUrl)`,
    [
      "Bright Path Public School & Coaching",
      "CBSE schooling, foundation batches, and competitive exam preparation",
      "+91 98765 43210",
      "admissions@brightpath.edu.in",
      "Near City Library, Main Road, Bhopal, Madhya Pradesh",
      "Bright Path is a school and coaching campus focused on strong classroom teaching, personal mentoring, weekly assessments, and parent communication.",
      "https://facebook.com/brightpathschool",
      "https://instagram.com/brightpathschool",
      "https://youtube.com/@brightpathschool",
    ]
  );

  await db.query("TRUNCATE TABLE website_sections");
  await db.query("TRUNCATE TABLE website_banners");
  await db.query("TRUNCATE TABLE website_notifications");
  await db.query("TRUNCATE TABLE website_important_links");

  await db.query(
    `INSERT INTO website_sections (title, slug, content, sortOrder, status) VALUES ?`,
    [
      [
        [
          "About Bright Path",
          "about",
          "Bright Path Public School & Coaching provides academic support from middle school to senior secondary levels. Our teaching model combines concept classes, practice sessions, doubt counters, and regular performance review.",
          1,
          "active",
        ],
        [
          "Courses Offered",
          "courses",
          "CBSE classes 6 to 12, IIT-JEE foundation, NEET foundation, spoken English, Olympiad preparation, board exam crash courses, and weekly test series are available for enrolled students.",
          2,
          "active",
        ],
        [
          "Why Choose Us",
          "why-choose-us",
          "Small batch size, experienced faculty, chapter-wise tests, parent progress reports, digital attendance, printed assignments, and structured revision plans help students stay consistent.",
          3,
          "active",
        ],
        [
          "Admissions 2026",
          "admissions",
          "Admissions are open for classes 6 to 12 and foundation coaching batches. Students can visit campus for counselling, scholarship test details, fee structure, and demo class booking.",
          4,
          "active",
        ],
        [
          "Facilities",
          "facilities",
          "The campus includes smart classrooms, science lab access, reading room, computer-enabled testing, counselling desk, safe drinking water, CCTV-monitored corridors, and transport assistance.",
          5,
          "active",
        ],
      ],
    ]
  );

  await db.query(
    `INSERT INTO website_banners (title, subtitle, imageUrl, linkUrl, sortOrder, status) VALUES ?`,
    [
      [
        [
          "Admissions Open for 2026 Academic Session",
          "Apply for CBSE classes, foundation batches, and board exam preparation with scholarship test options.",
          "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=80",
          "/#admissions",
          1,
          "active",
        ],
        [
          "Foundation Coaching for JEE, NEET and Olympiads",
          "Concept-first learning, weekly tests, doubt classes, and performance tracking for serious learners.",
          "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1800&q=80",
          "/#courses",
          2,
          "active",
        ],
        [
          "Smart Classrooms and Personal Mentoring",
          "A focused campus environment built for school excellence and competitive exam confidence.",
          "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1800&q=80",
          "/#facilities",
          3,
          "active",
        ],
      ],
    ]
  );

  await db.query(
    `INSERT INTO website_notifications (title, message, linkUrl, publishDate, status) VALUES ?`,
    [
      [
        [
          "Scholarship Test Registration Started",
          "Students from classes 6 to 12 can register for the admission scholarship test at the school office.",
          "/#admissions",
          "2026-08-02",
          "active",
        ],
        [
          "New Foundation Batch Begins on 12 August",
          "JEE and NEET foundation orientation will be conducted for students and parents.",
          "/#courses",
          "2026-08-01",
          "active",
        ],
        [
          "Unit Test Schedule Published",
          "The first monthly unit test schedule is available at the academic counter.",
          "/#notifications",
          "2026-07-30",
          "active",
        ],
        [
          "Parent Teacher Meeting This Sunday",
          "Parents are requested to meet class mentors between 10:00 AM and 1:00 PM.",
          "/#notifications",
          "2026-07-28",
          "active",
        ],
      ],
    ]
  );

  await db.query(
    `INSERT INTO website_important_links (title, url, sortOrder, status) VALUES ?`,
    [
      [
        ["Admission Enquiry Form", "/#admissions", 1, "active"],
        ["Download Fee Structure", "/#admissions", 2, "active"],
        ["Scholarship Test Details", "/#notifications", 3, "active"],
        ["Student Login Portal", "http://localhost:3000/login", 4, "active"],
        ["Contact School Office", "mailto:admissions@brightpath.edu.in", 5, "active"],
      ],
    ]
  );

  await db.end();
  console.log("Website demo content seeded successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
