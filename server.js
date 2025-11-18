    // server.js
    require('dotenv').config();
    const express = require('express');
    const path = require('path');
    const knex = require('knex');

    const app = express();
    const PORT = process.env.PORT || 3000;

    const db = knex({
    client: 'pg',
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_PASSWORD || "SuperSecretPassword",
        database: process.env.RDS_DB_NAME || "pokemon",
       port: process.env.RDS_PORT || process.env.DB_PORT || 5432,
        ssl:
        process.env.DB_SSL === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
    },
    });

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use('/public', express.static(path.join(__dirname, 'public')));
    app.use(express.urlencoded({ extended: true }));

    // Home – lista Pokémon
    app.get('/', async (req, res) => {
    try {
        const rows = await db('pokemon').orderBy('description', 'asc');
        res.render('index', { pokemon: rows });
    } catch (err) {
        console.error('Error en GET /:', err);
        res.status(500).send('Error loading Pokémon');
    }
    });

    // Buscar Pokémon
    app.post('/searchPokemon', async (req, res) => {
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.render('result', {
        found: false,
        message: 'Please enter a Pokémon name',
        data: null,
        });
    }

    try {
        const result = await db('pokemon')
        .select('description', 'base_total')
        .whereILike('description', `%${name.trim()}%`)
        .first();

        if (result) {
        res.render('result', {
            found: true,
            message: 'Pokémon found!',
            data: result,
        });
        } else {
        res.render('result', {
            found: false,
            message: 'No Pokémon found with that name.',
            data: null,
        });
        }
    } catch (err) {
        console.error('Error en POST /searchPokemon:', err);
        res.status(500).send('Search error');
    }
    });

    app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
    );
