import express from 'express'; 
import pino from 'pino-http';
import cors from 'cors';
import mongoose from 'mongoose';
import { getAllContacts, getContactById } from './services/contacts.js';
import { env } from './utils/env.js';

const PORT = Number(env('PORT', '3000'));

function setupServer() {
    const app = express();

    app.use(express.json());
    app.use(cors());

    app.use(
        pino({
            transport: {
                target: 'pino-pretty',
            },
        }),
    );

    app.get('/contacts', async (req, res) => {
        try {
            const contacts = await getAllContacts();
    
            res.status(200).json({
                status: 200,
                message: 'Successfully found contacts!',
                data: contacts,
            });
            } catch (error) {
                console.log('Something went wrong', error);
            }
    });
    
    app.get('/contacts/:contactId', async (req, res) => {
        try {
            const contactId = req.params.contactId;
            if (!mongoose.Types.ObjectId.isValid(contactId)) {
                throw new Error('Invalid contact ID');
        }
    
        const contact = await getContactById(contactId);
    
        if (!contact) {
            res.status(404).json({
                status: 404,
                message: 'Contact not found',
            });
            return;
        }
    
        res.status(200).json({
            status: 200,
            message: `Successfully found contact with id ${contactId}!`,
            data: contact,
        });
        } catch (error) {
            console.log('Contact not found!', error);
            res.status(404).json({
                status: 404,
                message: 'Contact not found',
            });
        }
    });
    
    app.use('*', (req, res) => {
        res.status(404).json({
            message: 'Not found',
        });
    });
    
    app.use((err, req, res) => {
        res.status(500).json({
            message: 'Something went wrong',
            error: err.message,
        });
    });
    
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = setupServer;
