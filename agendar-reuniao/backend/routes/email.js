const express = require('express');
const pool = require('../config/db');
const { ClientSecretCredential, InteractiveBrowserCredential } = require('@azure/identity');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');

const router = express.Router();

const credential = new InteractiveBrowserCredential({
    clientId: process.env.CLIENT_ID,
    tentantId: process.env.TENANT_ID,
    redirectUri: 'https://192.168.0.178:4000/auth/callback'
});

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['Calendars.ReadWrite', 'Calendars.ReadWrite.Shared']
});

const client = Client.initWithMiddleware({
    authProvider: authProvider
});

const createMeeting = async (meetingDetails) => {
    const { subject, startTime, attendees, description } = meetingDetails;

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
        const result = await client.api('/me/events')
            .post(event);

        console.log('reuniao criada: ', result);
        return result;
    } catch (error) {
        console.error('erro ao criar reuniao: ', error);
        throw error;
    }
};

router.post('/createMeeting', async (req, res) => {
    try {
        const { subject, startTime, endTime, attendees, description } = req.body;

        if (!subject || !startTime || !endTime || !attendees ) {
            console.log('falta coisa na req da reuniao');
            return res.status(400).json({
                error: 'dados incompletos',
                message: 'falta coisa na req da reuniao'
            });
        }   

        const meetingDetails = {
            subject, 
            startTime, 
            endTime,
            attendees,
            description
        };

        const result = await createMeeting(meetingDetails);

        return res.status(200).json({
            message: 'reuniao criada',
            meetingDetails: result
        });
    } catch (error) {
        console.error('erro na rota createmeeting: ', error);
        return res.status(500).json({
            error: 'erro ao criar reuniao',
            details: error.message
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