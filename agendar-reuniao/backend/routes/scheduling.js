const express = require('express');
const pool = require('../config/db');
// const { ensureAuthenticated } = require('../middleware/auth');
const router = express.Router();

console.log('arquivo importado');

router.post('/agendar', async(req, res) => { 
    const { name, topic, sede, date, time } = req.body;
    console.log('body recebido: ', req.body);
    if (!name || !topic || !sede || !date || !time) {
        return res.status(400).json({ error: 'todos os campos sao obrigatorios'})
    }

    try {
        const query = `
            INSERT INTO agendamentos (name, topic, sede, date, time)
            VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;

        for (const horario of time) {
            await pool.query(query, [name, topic, sede, date, horario]);
        }


        res.status(201).json({ message: 'agendamento efetuado com sucesso! ' });

    } catch (error) {
        console.error('erro no agendamento: ', error);
        return res.status(500).json({ error: 'nao foi possivel realizar o agendamento'});
    }
});

router.get('/horarios', async (req, res) => {
    console.log('rota acessada');
    const { date, sede } = req.query;
    if (!date || !sede) {
        return res.status(400).json({ error: 'faltam paramentros' });
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
        } catch (error) {
            res.status(500).json({ error: 'erro ao buscar horarios'})
        }
    });

router.post('/teste', async (req, res) => {
    return res.status(200).json({ message: 'teste '})
})

router.delete('/agendar', async (req, res) => {
    const { name, date, time, sede } = req.body;

    console.log('recebido no back: ', req.body);

    if (!name || !date || !time || !sede) {
        return res.status(400).json({ error: 'ta faltando coisa na exclusao' });
    }

    try{
        const query = `
            DELETE FROM agendamentos
            WHERE name = $1 and date = $2 AND sede = $3 AND time LIKE $4;
        `;

        const result = await pool.query(query, [name, date, sede, time]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Agendamento excluído com sucesso!' });
        } else {
            res.status(404).json({ error: 'Agendamento nao encontrado'})
            console.log('erro no agendamento');
        } 
    } catch (error) {
        console.error('erro ao excluir agendamento: ', error);
        res.status(500).json({ error: 'erro interno no servidor' });
    }
});

module.exports = router;