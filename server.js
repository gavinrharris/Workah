// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));// absolute route to views folder
app.use('/public', express.static(path.join(__dirname, 'public'))); // static files middleware
app.use(express.urlencoded({ extended: true }));    // to parse form data. leer form body

// Route: Home - show all Pokémon ordered by name
app.get('/', async (req, res) => {
    try {
    const { rows } = await db.query(
      'SELECT * FROM pokemon ORDER BY description ASC'
    );
    res.render('index', { pokemon: rows });
} catch (err) {
    console.error(err);
    res.status(500).send('Error loading Pokémon');
    }
});

// Route: searchPokemon
app.post('/searchPokemon', async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
    return res.render('result', {
        found: false,
        message: 'Please enter a Pokémon name',
        data: null
    });
    }

    try {
    const result = await db.query(
        'SELECT description, base_total FROM pokemon WHERE description ILIKE $1 LIMIT 1',
        [name.trim()]
    );

    if (result.rowCount > 0) {
        res.render('result', {
        found: true,
        message: 'Pokémon found!',
        data: result.rows[0]
        });
    } else {
        res.render('result', {
        found: false,
        message: 'No Pokémon found with that name.',
        data: null
        });
    }
    } catch (err) {
    console.error(err);
    res.status(500).send('Search error');
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));