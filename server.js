const mongoose = require("mongoose");
const app = require("./app");
require("dotenv").config();

const { MONGODB_URI, PORT = 3000 } = process.env;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Database connection successful");
    app.listen(PORT, () => {
      console.log("Server running. Use our API on port: " + PORT);
    });
  })
  .catch((error) => {
    console.log("Database connection error: " + error.message);
    process.exit(1);
  });
