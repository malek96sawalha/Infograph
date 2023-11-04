const cors = require("cors");
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
let sql;
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./marker.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) return console.error(err);
});
app.use(
    cors()
);
app.use(bodyParser.json());

app.post('/pointer', (req, res) => {
    try {
        console.log(req.body.name);
        const { lat, lan, name, note } = req.body;
        sql = "INSERT INTO marker(lat, lan, name, note) VALUES (?,?,?,?)";
        db.run(sql, [lat, lan, name, note], function (err) {
            if (err) {
                return res.json({ status: 300, success: false, error: err });
            }

            console.log("successful input", lat, lan, name, note);

            // Fetch the inserted marker from the database
            db.get("SELECT * FROM marker WHERE ROWID = ?", this.lastID, (err, row) => {
                if (err) {
                    return res.json({ status: 400, success: false, error: err });
                }

                return res.json({
                    status: 201,
                    success: true,
                    pointer: row,
                });
            });
        });
    } catch (error) {
        return res.json({
            status: 400,
            success: false,
        });
    }
});
const url = require('url');

app.get("/pointer", (req, res) => {
    sql = "SELECT * FROM marker";
    try {
        db.all(sql, [], (err, rows) => {
            if (err) return res.json({ status: 300, success: false, error: err });

            if (rows.length < 1) return res.json({ status: 300, success: false, error: "No Data" });

            return res.json({ status: 200, data: rows, success: true });
        })
    } catch (error) {
        console.log(error);
        return res.json({
            status: 400,
            success: false,

        });
    }
})

app.get("/pointer/:id", (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.json({ status: 400, success: false, error: 'Invalid pointer ID' });
    }

    sql = "SELECT * FROM marker WHERE id = ?";
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err);
            return res.json({ status: 300, success: false, error: err.message });
        }

        if (row) {
            return res.json({ status: 200, data: row, success: true });
        } else {
            return res.json({ status: 300, success: false, error: 'Pointer not found' });
        }
    });
});

app.delete('/pointer/:id', (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.json({ status: 400, success: false, error: 'Invalid pointer ID' });
    }

    sql = "DELETE FROM marker WHERE id = ?";
    db.run(sql, [id], (err) => {
        if (err) {
            console.error(err);
            return res.json({ status: 300, success: false, error: err.message });
        }
        return res.json({ status: 200, success: true, message: 'Pointer deleted successfully' });
    });
});

app.put('/pointer/:id', (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.json({ status: 400, success: false, error: 'Invalid pointer ID' });
    }

    const { lat, lan, name, note } = req.body;
    if (!lat || !lan || !name || !note) {
        return res.json({ status: 400, success: false, error: 'Missing required fields' });
    }

    sql = "UPDATE marker SET lat = ?, lan = ?, name = ?, note = ? WHERE id = ?";
    db.run(sql, [lat, lan, name, note, id], (err) => {
        if (err) {
            console.error(err);
            return res.json({ status: 300, success: false, error: err.message });
        }

        return res.json({ status: 200, success: true, message: 'Pointer updated successfully' });
    });
});

app.listen(3500);
