const express = require('express');
const pool = require('../config/db');
const { ClientSecretCredential, InteractiveBrowserCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

const router = express.Router();

// const credential = new InteractiveBrowserCredential({
//     clientId: process.env.CLIENT_ID,
//     tentantId: process.env.TENANT_ID,
//     redirectUri: 'https://192.168.0.178:4000/auth/callback'
// });

const clientSecretCredential = new ClientSecretCredential(
    process.env.TENANT_ID,
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
)

const authProvider = new TokenCredentialAuthenticationProvider(clientSecretCredential, {
    scopes: ['https://graph.microsoft.com/.default']
});

const client = Client.initWithMiddleware({
    authProvider
});


const createMeeting = async (meetingDetails) => {
    const { subject, startTime, endTime, attendees = [], description } = meetingDetails;

    console.log('meetingDetails: ', meetingDetails);

    console.log('subject: ', subject);
    console.log('startTime: ', startTime);
    console.log('endTime: ', endTime);
    console.log('attendees: ', attendees);
    console.log('description: ', description);


    const event = {
        subject: subject,
        start: {
            dateTime: startTime,
            timeZone: 'America/Sao_Paulo'
        },
        end: {
            dateTime: endTime,
            timeZone: 'America/Sao_Paulo'
        },
        body: {
            contentType: 'HTML',
            content: description || 'Reuniao agendada'
        },
        attendees: attendees.map(email => ({
            emailAddress: {
                address: email
            },
            type: 'required'
        })),
    };

    try {
        const result = await client.api('/users/gabriel.menegasso@similar.ind.br/events')
            .post(event);

        console.log('reuniao criada: ', result);
        return result;
    } catch (error) {
        console.error('erro ao criar reuniao: ', error.response?.data || error.message);
        throw new Error('Falha ao criar reunião: ' + (error.response?.data?.erro?.message || error.message));
    }
};

router.post('/createMeeting', async(req, res) => {
    try{

        console.log('meetingDetails antes: ', req.body);

        const meetingDetails = req.body;

        if (!Array.isArray(meetingDetails.attendees)) {
            meetingDetails.attendees = [];
        }

        const result = await createMeeting(meetingDetails);
        res.status(201).json(result);

        console.log(meetingDetails);
    } catch (error) {
        console.error('erro na rota: ', error);
        res.status(500).json({
            error: error.message,
            details: error.message?.data || null
        });
    }
});

router.get('/users', async (req, res) => {
    console.log('rota users acessada');
    try {
        const query = `
            SELECT id, email FROM usuarios;
        `

        const result = await pool.query(query);

        console.log(result.rows);
        return res.status(200).json(result.rows)
    } catch (error) {
        console.error('erro ao buscar usuarios no bacno de dados: ', error);
    }
})

module.exports = router;