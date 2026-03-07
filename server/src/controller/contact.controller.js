const contactService = require('../services/contact.service');
const { Created, OK } = require('../core/success.response');

class ContactController {
    createContact = async (req, res, next) => {
        new Created({
            message: 'Message sent successfully',
            metadata: await contactService.createContact(req.body),
        }).send(res);
    };

    getAllContacts = async (req, res, next) => {
        new OK({
            message: 'Get contacts success',
            metadata: await contactService.getAllContacts(req.query),
        }).send(res);
    };

    updateStatus = async (req, res, next) => {
        new OK({
            message: 'Update status success',
            metadata: await contactService.updateStatus(req.params.id, req.body.status),
        }).send(res);
    };

    deleteContact = async (req, res, next) => {
        new OK({
            message: 'Delete contact success',
            metadata: await contactService.deleteContact(req.params.id),
        }).send(res);
    };
}

module.exports = new ContactController();
