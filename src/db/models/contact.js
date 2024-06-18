import { Schema, model } from 'mongoose'; 

const contactSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
        },
        isFavourite: {
            type: Boolean,
            required: false,
            default: false,
        },
        contactType: {
            type: String,
            required: false,
            enum: ['work', 'home', 'personal'],
            default: 'personal',
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export const ContactsCollection = model('contacts', contactSchema);