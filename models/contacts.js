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
  const newContacts = resp.filter((_, index) => index !== idx);
  await fs.writeFile(contactsPath, JSON.stringify(newContacts));
  return resp[idx];
};

const addContact = async (body) => {
  const { name, email, phone } = body;
  const resp = await listContacts();
  const add = { id: uuidv4(), name, email, phone };
  const addContacts = [...resp, add];
  await fs.writeFile(contactsPath, JSON.stringify(addContacts));
  return add;
};

const updateContact = async (contactId, body) => {
  const { name, email, phone } = body;
  const resp = await listContacts();
  const updatedContacts = resp.map((item) => {
    if (item.id === contactId) {
      return { id: contactId, name, email, phone };
    }
    return item;
  });
  await fs.writeFile(contactsPath, JSON.stringify(updatedContacts));
  return updatedContacts.find((item) => item.id === contactId);
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
