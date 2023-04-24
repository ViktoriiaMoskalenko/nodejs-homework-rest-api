const { Contact } = require("../models/contacts");
const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
  owner: Joi.string(),
});

const listContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, favorite } = req.query;
    const skip = (page - 1) * limit;

    let query = { owner: req.user.id };
    if (favorite === "true") {
      query.favorite = true;
    } else if (favorite === "false") {
      query.favorite = false;
    }

    const totalContacts = await Contact.countDocuments(query);
    const contacts = await Contact.find(query).skip(skip).limit(limit);

    return res.json({
      totalContacts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalContacts / limit),
      contacts,
    });
  } catch (error) {
    return next(error);
  }
};

const getContactById = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await Contact.findOne({
    _id: contactId,
    owner: req.user.id,
  });
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json(contact);
};

const removeContact = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await Contact.findOneAndDelete({
    _id: contactId,
    owner: req.user.id,
  });
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

  const newContact = await Contact.create({
    name,
    email,
    phone,
    owner: req.user.id,
  });
  res.status(201).json(newContact);
};

const updateContact = async (req, res, next) => {
  const { contactId } = req.params;
  const { body } = req;
  const { error, value } = schema.validate(body);

  if (error) {
    return res.status(400).json({ error: "missing fields" });
  }

  const newContact = await Contact.findOneAndUpdate(
    { _id: contactId, owner: req.user.id },
    value,
    {
      new: true,
    }
  );
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

  const newContact = await await Contact.findOneAndUpdate(
    { _id: contactId, owner: req.user.id },
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
