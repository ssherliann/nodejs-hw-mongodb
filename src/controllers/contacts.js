import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import { getAllContacts, getContactById, createContact, updateContact, deleteContact } from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

export const getContactsController = async(req, res, next) => {
    try {
        const { page, perPage } = parsePaginationParams(req.query);
        const { sortBy, sortOrder } = parseSortParams(req.query);

        const contacts = await getAllContacts({
            page,
            perPage,
            sortBy,
            sortOrder,
        });

        res.status(200).json({
            status: 200,
            message: 'Successfully found contacts!',
            data: contacts,
        });
    } catch(error) {
        next(error);
    }

};

export const getContactByIdController = async(req, res, next) => {
    const contactId = req.params.contactId;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
        throw new Error('Invalid contact ID');
    }

    const contact = await getContactById(contactId);

    if (!contact) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }

    res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
    });
};

export const createContactController = async (req, res) => {
    const contact = await createContact(req.body);

    res.status(201).json({
        status: 201,
        message: `Successfully created a contact!`,
        data: contact,
    });
};

export const patchContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const result = await updateContact(contactId, req.body);

    if (!result) {
        next(createHttpError(404, 'Contact not found'));
        return;
    }
    
    res.json({
        status: 200,
        message: `Successfully patched a contact!`,
        data: result.contact,
    });
};

export const deleteContactController = async (req, res, next) => {
    const { contactId } = req.params;

    try {
        const contact = await deleteContact(contactId);

        if (!contact) {
            return next(createHttpError(404, 'Contact not found'));
        }
        
        res.status(204).send();
    } catch (error) {
        next(createHttpError(500, error.message));
    }
};

