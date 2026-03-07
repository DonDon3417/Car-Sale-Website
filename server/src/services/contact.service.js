const Contact = require('../models/contact.model');

class ContactService {
    // Create new contact
    async createContact(data) {
        return await Contact.create(data);
    }

    // Get all contacts (for admin)
    async getAllContacts(query = {}) {
        const { page = 1, limit = 10, status, search } = query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const [contacts, total] = await Promise.all([
            Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Contact.countDocuments(filter),
        ]);

        return {
            contacts,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        };
    }

    // Update status
    async updateStatus(id, status) {
        return await Contact.findByIdAndUpdate(id, { status }, { new: true });
    }

    // Delete contact
    async deleteContact(id) {
        return await Contact.findByIdAndDelete(id);
    }
}

module.exports = new ContactService();
