const { Contact } = require("../models/contacts");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

const listContacts = async (req, res, next) => {
  const { favorite, page = 1, limit = 2 } = req.query;

  try {
    let contacts;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    if (favorite) {
      contacts = await Contact.find({ favorite: true })
        .skip(startIndex)
        .limit(limit);
    } else {
      contacts = await Contact.find().skip(startIndex).limit(limit);
    }

    res.json(contacts);
  } catch (err) {
    next(err);
  }
};

const getContactById = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId);
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json(contact);
};

const removeContact = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await Contact.findByIdAndDelete(contactId);
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json({ message: "contact deleted" });
};

const addContact = async (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  const { name, email, phone } = value;
  if (error) {
    return res.status(400).json({ error: "missing required name field" });
  }

  const newContact = await Contact.create({ name, email, phone });
  res.status(201).json(newContact);
};

const updateContact = async (req, res, next) => {
  const { contactId } = req.params;
  const { body } = req;
  const { error, value } = schema.validate(body);

  if (error) {
    return res.status(400).json({ error: "missing fields" });
  }

  const newContact = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });
  if (!newContact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json(newContact);
};

const updateStatusContact = async (req, res, next) => {
  const { contactId } = req.params;
  const { body } = req;

  if (!body || typeof body.favorite === "undefined") {
    return res.status(400).json({ message: "missing field favorite" });
  }

  const newContact = await await Contact.findByIdAndUpdate(
    contactId,
    { favorite: body.favorite },
    {
      new: true,
    }
  );
  if (!newContact) {
    return res.status(404).json({ message: "Not found" });
  }
  res.json(newContact);
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
