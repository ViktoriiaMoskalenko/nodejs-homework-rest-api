const mongoose = require("mongoose");

const contactShema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false }
);
const Contact = mongoose.model("contacts", contactShema);

const listContacts = async () => {
  const data = await Contact.find();
  return data;
};

const getContactById = async (contactId) => {
  const data = await Contact.findById(contactId);
  if (!data) {
    return null;
  }
  return data;
};

const removeContact = async (contactId) => {
  const removed = await Contact.findByIdAndDelete(contactId);
  return removed;
};

const addContact = async (body) => {
  const { name, email, phone } = body;

  const add = await Contact.create({ name, email, phone });

  return add;
};

const updateContact = async (contactId, body) => {
  const update = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  });
  return update;
};

const updateStatusContact = async (contactId, body) => {
  const update = await Contact.findByIdAndUpdate(
    contactId,
    { favorite: body.favorite },
    {
      new: true,
    }
  );
  return update;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
