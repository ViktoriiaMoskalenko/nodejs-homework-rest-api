const express = require("express");
const Joi = require("joi");
const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require("../../models/contacts.js");

const router = express.Router();

const schema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
});

router.get("/", async (req, res, next) => {
  const data = await listContacts();
  res.json({ data });
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json({ contact });
});

router.post("/", async (req, res, next) => {
  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: "missing required name field" });
  }

  const newContact = await addContact(value);
  res.status(201).json(newContact);
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await removeContact(contactId);
  if (!contact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json({ message: "contact deleted" });
});

router.put("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  const { body } = req;
  const { error, value } = schema.validate(body);

  if (error) {
    return res.status(400).json({ error: "missing fields" });
  }

  const newContact = await updateContact(contactId, value);
  if (!newContact) {
    return res.status(404).json({ message: "Contact not found" });
  }
  res.json(newContact);
});

module.exports = router;
