import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import { getAllContacts, getContactById, createContact, updateContact, deleteContact } from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { env } from '../utils/env.js';

export const getContactsController = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { page, perPage } = parsePaginationParams(req.query);
        const { sortBy, sortOrder } = parseSortParams(req.query);

        const contacts = await getAllContacts({
            userId,
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
    } catch (error) {
        next(error);
    }
};

export const getContactByIdController = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const contactId = req.params.contactId;

        if (!mongoose.Types.ObjectId.isValid(contactId)) {
            throw new Error('Invalid contact ID');
        }

        const contact = await getContactById(contactId, userId);

        if (!contact) {
            next(createHttpError(404, 'Contact not found'));
            return;
        }

        res.status(200).json({
            status: 200,
            message: `Successfully found contact with id ${contactId}!`,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

export const createContactController = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const photo = req.file;

        let photoUrl;
        if (photo) {
            if (env('ENABLE_CLOUDINARY') === 'true') {
              photoUrl = await saveFileToCloudinary(photo);
            } else {
              photoUrl = await saveFileToUploadDir(photo);
            }
          }

        const contact = await createContact({ ...req.body, photo: photoUrl,userId });

        res.status(201).json({
            status: 201,
            message: `Successfully created a contact!`,
            data: contact,
        });
    } catch (error) {
        next(error);
    }
};

export const patchContactController = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { contactId } = req.params;
        
        const photo = req.file;

        let photoUrl;
      
        if (photo) {
            if (env('ENABLE_CLOUDINARY') === 'true') {
              photoUrl = await saveFileToCloudinary(photo);
            } else {
              photoUrl = await saveFileToUploadDir(photo);
            }
          }
      
        const result = await updateContact(contactId, {
          ...req.body,
          photo: photoUrl,
          userId,
        });

        if (!result) {
            next(createHttpError(404, 'Contact not found'));
            return;
        }

        res.json({
            status: 200,
            message: `Successfully patched a contact!`,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteContactController = async (req, res, next) => {
    try {
        const { _id: userId } = req.user;
        const { contactId } = req.params;

        const contact = await deleteContact(contactId, userId);

        if (!contact) {
            return next(createHttpError(404, 'Contact not found'));
        }

        res.status(204).send();
    } catch (error) {
        next(createHttpError(500, error.message));
    }
};
