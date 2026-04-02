const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'pwd_hub.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ── Create Tables ──────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    status TEXT DEFAULT 'Active',
    budget REAL DEFAULT 0,
    spent REAL DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    contractor_id INTEGER,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contractors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    specialization TEXT,
    status TEXT DEFAULT 'Active',
    rating REAL DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    address TEXT,
    license_no TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS labor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    skill TEXT,
    daily_rate REAL DEFAULT 0,
    status TEXT DEFAULT 'Available',
    project_id INTEGER,
    address TEXT,
    aadhar_no TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    quantity REAL DEFAULT 0,
    unit_price REAL DEFAULT 0,
    supplier TEXT,
    status TEXT DEFAULT 'In Stock',
    project_id INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    rate REAL DEFAULT 0,
    gst_percent REAL DEFAULT 18,
    description TEXT,
    effective_date TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_no TEXT,
    type TEXT,
    party_name TEXT,
    project_id INTEGER,
    amount REAL DEFAULT 0,
    status TEXT DEFAULT 'Pending',
    payment_date TEXT,
    payment_mode TEXT DEFAULT 'Bank Transfer',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// ── Seed Data ──────────────────────────────────────────────────

const seedContractors = db.prepare('SELECT COUNT(*) as c FROM contractors').get();
if (seedContractors.c === 0) {
  const ins = db.prepare(`INSERT INTO contractors (name,phone,email,specialization,status,rating,projects_completed,address,license_no) VALUES (?,?,?,?,?,?,?,?,?)`);
  [
    ['Ramesh Kumar','9876543210','ramesh@example.com','Civil Construction','Active',4.5,12,'Delhi','LIC-2021-001'],
    ['Suresh Verma','9812345678','suresh@example.com','Electrical Works','Active',4.2,8,'Haryana','LIC-2020-045'],
    ['Mahesh Singh','9898989898','mahesh@example.com','Plumbing & Sanitation','Active',4.7,15,'Punjab','LIC-2019-112'],
    ['Dinesh Yadav','9765432109','dinesh@example.com','Road Construction','Inactive',3.9,5,'UP','LIC-2022-033'],
    ['Rajesh Patel','9654321098','rajesh@example.com','Building Construction','Active',4.8,20,'Gujarat','LIC-2018-078'],
  ].forEach(r => ins.run(...r));
}

const seedProjects = db.prepare('SELECT COUNT(*) as c FROM projects').get();
if (seedProjects.c === 0) {
  const ins = db.prepare(`INSERT INTO projects (name,location,status,budget,spent,start_date,end_date,contractor_id,description) VALUES (?,?,?,?,?,?,?,?,?)`);
  [
    ['NH-48 Road Repair','Delhi-Gurgaon','Active',5000000,2100000,'2024-01-10','2024-06-30',1,'National highway repair and resurfacing'],
    ['Community Hall Construction','Rohtak','Active',3200000,800000,'2024-02-15','2024-09-30',5,'New community hall for Rohtak district'],
    ['Water Pipeline Project','Panipat','Completed',1800000,1750000,'2023-08-01','2024-01-15',3,'Underground water pipeline installation'],
    ['School Building Renovation','Karnal','Active',2500000,600000,'2024-03-01','2024-12-31',2,'Renovation of Govt. Senior Secondary School'],
    ['Bridge Construction','Ambala','On Hold',8000000,1200000,'2024-01-20','2025-03-31',4,'New bridge over Tangri river'],
  ].forEach(r => ins.run(...r));
}

const seedLabor = db.prepare('SELECT COUNT(*) as c FROM labor').get();
if (seedLabor.c === 0) {
  const ins = db.prepare(`INSERT INTO labor (name,phone,skill,daily_rate,status,project_id,address,aadhar_no) VALUES (?,?,?,?,?,?,?,?)`);
  [
    ['Mohan Lal','9111111111','Mason',650,'Available',null,'Rohtak','XXXX-XXXX-1234'],
    ['Raju Sharma','9222222222','Carpenter',700,'On Site',1,'Delhi','XXXX-XXXX-2345'],
    ['Sita Ram','9333333333','Electrician',750,'On Site',4,'Karnal','XXXX-XXXX-3456'],
    ['Bhola Nath','9444444444','Plumber',680,'Available',null,'Panipat','XXXX-XXXX-4567'],
    ['Chotu Singh','9555555555','Helper',450,'On Site',2,'Rohtak','XXXX-XXXX-5678'],
    ['Deepak Kumar','9666666666','Welder',800,'Available',null,'Ambala','XXXX-XXXX-6789'],
    ['Ganesh Prasad','9777777777','Mason',650,'On Site',1,'Delhi','XXXX-XXXX-7890'],
    ['Harish Pal','9888888888','Painter',600,'Available',null,'Sonipat','XXXX-XXXX-8901'],
  ].forEach(r => ins.run(...r));
}

const seedMaterials = db.prepare('SELECT COUNT(*) as c FROM materials').get();
if (seedMaterials.c === 0) {
  const ins = db.prepare(`INSERT INTO materials (name,category,unit,quantity,unit_price,supplier,status,project_id) VALUES (?,?,?,?,?,?,?,?)`);
  [
    ['Cement (OPC 53)','Binding Material','Bag',500,380,'ACC Cement Ltd','In Stock',1],
    ['TMT Steel Bars','Steel','Kg',2000,65,'SAIL','In Stock',1],
    ['River Sand','Aggregate','CFT',300,45,'Local Supplier','Low Stock',2],
    ['Crushed Stone','Aggregate','CFT',500,35,'Rajesh Quarry','In Stock',2],
    ['Bricks (Red)','Masonry','Nos',10000,8,'Brick Kiln Rohtak','In Stock',4],
    ['PVC Pipes 4"','Plumbing','Mtr',200,120,'Finolex','Out of Stock',3],
    ['Electrical Wire','Electrical','Mtr',500,45,'Havells','In Stock',4],
    ['Paint (Exterior)','Finishing','Ltr',100,280,'Asian Paints','In Stock',4],
  ].forEach(r => ins.run(...r));
}

const seedPricing = db.prepare('SELECT COUNT(*) as c FROM pricing').get();
if (seedPricing.c === 0) {
  const ins = db.prepare(`INSERT INTO pricing (item_name,category,unit,rate,gst_percent,description,effective_date) VALUES (?,?,?,?,?,?,?)`);
  [
    ['Cement (OPC 53)','Material','Bag',380,18,'Ordinary Portland Cement 53 Grade','2024-01-01'],
    ['TMT Steel Bars','Material','Kg',65,18,'Fe-500 Grade TMT Bars','2024-01-01'],
    ['Mason (Skilled)','Labor','Day',650,0,'Skilled mason daily rate','2024-01-01'],
    ['Carpenter','Labor','Day',700,0,'Skilled carpenter daily rate','2024-01-01'],
    ['Electrician','Labor','Day',750,0,'Licensed electrician daily rate','2024-01-01'],
    ['Excavation (Machine)','Equipment','Hour',1200,18,'JCB excavation per hour','2024-01-01'],
    ['Concrete Mixer','Equipment','Day',2500,18,'Concrete mixer on rent per day','2024-01-01'],
    ['Road Bitumen','Material','Kg',55,18,'VG-30 Bitumen for road work','2024-01-01'],
  ].forEach(r => ins.run(...r));
}

const seedPayments = db.prepare('SELECT COUNT(*) as c FROM payments').get();
if (seedPayments.c === 0) {
  const ins = db.prepare(`INSERT INTO payments (reference_no,type,party_name,project_id,amount,status,payment_date,payment_mode,notes) VALUES (?,?,?,?,?,?,?,?,?)`);
  [
    ['PAY-2024-001','Contractor Payment','Ramesh Kumar',1,500000,'Paid','2024-02-01','Bank Transfer','1st installment NH-48'],
    ['PAY-2024-002','Material Purchase','ACC Cement Ltd',1,190000,'Paid','2024-02-10','Cheque','500 bags cement'],
    ['PAY-2024-003','Labor Wages','Weekly Wages',2,85000,'Paid','2024-03-01','Cash','Week 1 wages'],
    ['PAY-2024-004','Contractor Payment','Rajesh Patel',2,300000,'Pending','2024-04-01','Bank Transfer','2nd installment community hall'],
    ['PAY-2024-005','Material Purchase','SAIL',1,130000,'Paid','2024-03-15','Bank Transfer','2000 kg TMT bars'],
    ['PAY-2024-006','Equipment Rent','JCB Services',5,96000,'Pending','2024-04-10','Bank Transfer','80 hours excavation'],
  ].forEach(r => ins.run(...r));
}

module.exports = db;
