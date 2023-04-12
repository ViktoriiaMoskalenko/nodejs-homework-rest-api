const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const contactsPath = path.join("models", "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  return Object.values(JSON.parse(data));
};

const getContactById = async (contactId) => {
  const resp = await listContacts();
  const data = resp.find(({ id }) => id === contactId);
  if (!data) {
    return null;
  }
  return data;
};

const removeContact = async (contactId) => {
  const resp = await listContacts();
  const idx = resp.findIndex(({ id }) => id === contactId);
  const removed = resp[idx];
  resp.splice(idx, 1);
  await fs.writeFile(contactsPath, JSON.stringify(resp));
  return removed;
};

const addContact = async (body) => {
  const { name, email, phone } = body;
  const resp = await listContacts();
  const add = { id: uuidv4(), name, email, phone };
  resp.push(add);
  await fs.writeFile(contactsPath, JSON.stringify(resp));
  return add;
};

const updateContact = async (contactId, body) => {
  const resp = await listContacts();
  const index = resp.findIndex(({ id }) => id === contactId);
  if (index === -1) {
    return null;
  }
  const oldContact = resp[index];
  const newContact = { ...oldContact, ...body, id: contactId };
  const newContacts = [
    ...resp.slice(0, index),
    newContact,
    ...resp.slice(index + 1),
  ];
  await fs.writeFile(contactsPath, JSON.stringify(newContacts));
  return newContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
