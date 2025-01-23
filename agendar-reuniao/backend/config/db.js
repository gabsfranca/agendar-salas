const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'agendamentos',
    password: 'senha',
    port: 5432,
})

pool.connect((err) => {
    if (err) {
        console.log('erro ao conectar no banco: ', err);
    } else{
        console.log('pg');
    }
});

module.exports = pool;