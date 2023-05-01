const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../app");

const { MONGODB_URI, PORT = 3000 } = process.env;
describe("tests for login/register controllers", () => {
  beforeAll(() =>
    mongoose
      .connect(MONGODB_URI)
      .then(() => {
        console.log("database connection successful");
        app.listen(PORT, () => {
          console.log(`Server running. Use our API on port: ${PORT}`);
        });
      })
      .catch((error) => {
        console.log(`Server is not running. Error message: ${error.message}`);
        process.exit(1);
      })
  );

  test("login returns response status 200 and response body must contain a token ", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: "inokentiy@gmail.com",
      password: "qwerty",
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe("string");
  });

  test("register returns response status 201 and response body must contain  email and subscription type", async () => {
    const response = await request(app).post("/api/users/register").send({
      name: "Inokentiy",
      email: "inokentiy631@gmail.com",
      password: "qwerty",
    });
    const { user } = response.body;
    expect(response.status).toBe(201);
    expect(typeof user === "object").toBe(true);
    expect(typeof user.email).toBe("string");
  });
});
