import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const DB_PATH = path.resolve(process.cwd(), "college_events.db");

export const db = new Database(DB_PATH);

// Enforce foreign keys and enable WAL mode for concurrent reads
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'Attendee'
        CHECK (role IN ('Admin', 'Organizer', 'Attendee')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS departments (
      department_id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS event_categories (
      category_id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS events (
      event_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      event_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      event_type TEXT NOT NULL
        CHECK (event_type IN ('College-wide', 'Department-specific')),
      status TEXT NOT NULL DEFAULT 'Upcoming'
        CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled', 'Postponed')),
      registration_url TEXT NOT NULL,
      poster_url TEXT NULL,
      organizer_id INTEGER NOT NULL,
      department_id INTEGER NULL,
      category_id INTEGER NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organizer_id) REFERENCES users (user_id) ON DELETE RESTRICT,
      FOREIGN KEY (department_id) REFERENCES departments (department_id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES event_categories (category_id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS ix_events_event_date ON events (event_date);
    CREATE INDEX IF NOT EXISTS ix_events_status ON events (status);
    CREATE INDEX IF NOT EXISTS ix_events_event_type ON events (event_type);
    CREATE INDEX IF NOT EXISTS ix_events_organizer_id ON events (organizer_id);
    CREATE INDEX IF NOT EXISTS ix_events_department_id ON events (department_id);

    CREATE TABLE IF NOT EXISTS department_access (
      access_id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      access_code_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (event_id, department_id),
      FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments (department_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS announcements (
      announcement_id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events (event_id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE RESTRICT
    );
  `);

  seedInitialData();
}

function seedInitialData(): void {
  const existingEvents = db
    .prepare("SELECT COUNT(*) as cnt FROM events")
    .get() as { cnt: number };

  if (existingEvents.cnt > 0) {
    return;
  }

  const insertDept = db.prepare(
    "INSERT OR IGNORE INTO departments (department_name) VALUES (?)"
  );
  const deptNames = [
    "Computer Science & Engineering",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Business Administration",
  ];
  for (const name of deptNames) {
    insertDept.run(name);
  }

  const insertCat = db.prepare(
    "INSERT OR IGNORE INTO event_categories (category_name) VALUES (?)"
  );
  const catNames = ["Technical", "Workshop", "Cultural", "Seminar", "Sports"];
  for (const name of catNames) {
    insertCat.run(name);
  }

  const insertUser = db.prepare(
    "INSERT OR IGNORE INTO users (google_id, name, email, role) VALUES (?, ?, ?, ?)"
  );
  insertUser.run("seed-google-admin-001", "Dr. Ananya Nair", "admin@college.edu", "Admin");
  insertUser.run(
    "seed-google-org-001",
    "Priya Sharma",
    "organizer.cse@college.edu",
    "Organizer"
  );
  insertUser.run("seed-google-att-001", "Rohan Verma", "student@college.edu", "Attendee");

  const organizer = db
    .prepare("SELECT user_id FROM users WHERE email = ?")
    .get("organizer.cse@college.edu") as { user_id: number };

  const cse = db
    .prepare("SELECT department_id FROM departments WHERE department_name = ?")
    .get("Computer Science & Engineering") as { department_id: number };
  const ece = db
    .prepare("SELECT department_id FROM departments WHERE department_name = ?")
    .get("Electronics & Communication") as { department_id: number };

  const tech = db
    .prepare("SELECT category_id FROM event_categories WHERE category_name = ?")
    .get("Technical") as { category_id: number };
  const workshop = db
    .prepare("SELECT category_id FROM event_categories WHERE category_name = ?")
    .get("Workshop") as { category_id: number };
  const cultural = db
    .prepare("SELECT category_id FROM event_categories WHERE category_name = ?")
    .get("Cultural") as { category_id: number };
  const seminar = db
    .prepare("SELECT category_id FROM event_categories WHERE category_name = ?")
    .get("Seminar") as { category_id: number };

  const insertEvent = db.prepare(`
    INSERT INTO events (
      title, description, event_date, start_time, end_time, venue,
      event_type, status, registration_url, poster_url,
      organizer_id, department_id, category_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const ev1 = insertEvent.run(
    "Annual Tech Symposium 2026",
    "Flagship college-wide engineering symposium featuring competitive programming, hardware exhibitions, and keynote sessions from industry engineers. Open to students across every department.",
    "2026-12-05",
    "09:30",
    "17:00",
    "Main Auditorium",
    "College-wide",
    "Upcoming",
    "https://docs.google.com/forms/d/e/1FAIpQLSfSampleTechSymposium2026/viewform",
    "/src/assets/images/poster_tech_symposium_1794562917520.jpg",
    organizer.user_id,
    null,
    tech.category_id
  );

  insertEvent.run(
    "Campus Cultural Night",
    "An evening showcase of acoustic bands, classical ensembles, and student theatre performances at the university amphitheatre.",
    "2026-12-12",
    "18:00",
    "21:30",
    "Open Air Amphitheatre",
    "College-wide",
    "Upcoming",
    "https://docs.google.com/forms/d/e/1FAIpQLSfSampleCulturalNight2026/viewform",
    "/src/assets/images/poster_cultural_night_1794562918072.jpg",
    organizer.user_id,
    null,
    cultural.category_id
  );

  const ev3 = insertEvent.run(
    "CSE Cloud & DevOps Bootcamp",
    "Hands-on department laboratory covering containerization, automated CI/CD workflows, and production observability exclusively for CSE cohorts.",
    "2026-11-25",
    "10:00",
    "16:00",
    "CSE Lab Block B · Room 302",
    "Department-specific",
    "Upcoming",
    "https://forms.gle/SampleCseDevopsBootcamp2026",
    "/src/assets/images/poster_cse_bootcamp_1794562919295.jpg",
    organizer.user_id,
    cse.department_id,
    workshop.category_id
  );

  const ev4 = insertEvent.run(
    "ECE Embedded Systems & RISC-V Seminar",
    "Technical guest lecture on open-source RISC-V silicon architecture, hardware debugging with oscilloscopes, and real-time firmware for Electronics students.",
    "2026-11-28",
    "14:00",
    "16:30",
    "ECE Seminar Hall",
    "Department-specific",
    "Upcoming",
    "https://forms.gle/SampleEceRiscvSeminar2026",
    "/src/assets/images/poster_ece_seminar_1794562919419.jpg",
    organizer.user_id,
    ece.department_id,
    seminar.category_id
  );

  const insertAccess = db.prepare(
    "INSERT INTO department_access (event_id, department_id, access_code_hash) VALUES (?, ?, ?)"
  );
  insertAccess.run(ev3.lastInsertRowid, cse.department_id, bcrypt.hashSync("CSE2026", 10));
  insertAccess.run(ev4.lastInsertRowid, ece.department_id, bcrypt.hashSync("ECE2026", 10));

  const insertAnn = db.prepare(
    "INSERT INTO announcements (event_id, title, message, created_by) VALUES (?, ?, ?, ?)"
  );
  insertAnn.run(
    ev1.lastInsertRowid,
    "Team Size & Project Booth Guidelines",
    "Hackathon squads may now register 2 to 4 members per team. Hardware prototypes will be assigned dedicated power tables inside the atrium.",
    organizer.user_id
  );
  insertAnn.run(
    ev3.lastInsertRowid,
    "Bring Laptop with Docker Desktop Installed",
    "Please verify Docker CLI runs locally before arriving at Lab Block B so we can jump straight into multi-stage container builds.",
    organizer.user_id
  );
}
