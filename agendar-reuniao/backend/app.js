const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const pool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'agendamentos',
    password:'senha',
    port:5432,
});

pool.connect((err) => {
    if (err) {
        console.log('erro ao conectar no banco: ', err);
    } else {
        console.log('conectado ao pg');
    }
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/agendar', async (req, res) => {
    const { name, topic, sede, date, time } = req.body;

    if (!name || !topic || !sede || !date || !time) {
        return res.status(400).json({ error: 'todos os campos sao obrigatorios.' });
    }

    try{ 
        const query = `
            INSERT INTO agendamentos (name, topic, sede, date, time)
            VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;

        const values = [name, topic, sede, date, time.join(',')];
        const result = await pool.query(query, values);

        res.status(201).json({ message: 'Agendamento salvo com sucesso! ', id: result.rows[0].id });
    } catch (error) {
        console.log('erro ao salvar agendamento: ', error);
        res.status(500).json({ error: 'erro ao salvar agendamento '});
    }
});

app.get('/horarios', async (req, res) => {
    const { date, sede } = req.query;

    if (!date || !sede) {
        return res.status(400).json({ error: 'falta coisa'});
    }

    try {
        const query = `
            SELECT time, name, topic FROM agendamentos WHERE date = $1 AND sede = $2; 
        `;
        const result = await pool.query(query, [date, sede]);

        const horariosOcupados = result.rows.flatMap((row) => 
            row.time.split(',').map((time) => ({
                time: time.trim(), 
                name: row.name,
                topic: row.topic,
            }))
        );

        res.status(200).json(horariosOcupados);
    }catch (error) {
        console.log('erro ao buscar horarios: ', error);
        res.status(500).json({ error: 'erro ao buscar horarios ocupados'})
    }
});

const porta = 4000
const ip = '0.0.0.0'

app.listen(porta, ip, () => {
    console.log('ouvindo: ',ip, porta);
})