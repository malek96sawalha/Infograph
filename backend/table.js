const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./marker.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});

const sql = `CREATE TABLE marker(ID INTEGER PRIMARY KEY, lat REAL NOT NULL, lan REAL NOT NULL, name TEXT NOT NULL, note TEXT NOT NULL)`;
db.run(sql);