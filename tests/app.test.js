require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

let cookies;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const loginResponse = await request(app)
    .post("/login")
    .send({ email: "twittmos2005@gmail.com", password: "a0597116801z" }); // تجربة تسجيل دخول مستخدم عادي وتخزينه في متغير

  cookies = loginResponse.headers["set-cookie"]; // هنا بالضبط يحفظ السيرفر التوكنز ونحن خزناه بمتغير
}, 20000);

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Basic server test", () => {
  it("Should response to a request", async () => {
    const response = await request(app).get("/products");
    expect(response.status).toBe(200);
  });
});

describe("authorization", () => {
  it("Should reject regular user from accessing getUsers", async () => {
    const response = await request(app).get("/getUsers").set("Cookie", cookies);
    expect(response.status).toBe(403);
  });

  it("Should return 401 if visitor", async () => {
    const response = await request(app).get("/getUsers");
    expect(response.status).toBe(401);
  });

  it("Should return 400 if login with wrong password", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "twittmos2005@gmail.com", password: "a2871576z" });
    expect(response.status).toBe(400);
  });
});

describe("categories tests", () => {
  it("Should return 200 for all categories", async () => {
    const response = await request(app).get("/allCategories");
    expect(response.status).toBe(200);
  });
});
