const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

const app = require("../express_server");

describe("Login and Access Control Test", () => {
  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b2xVn2"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });

  it('should redirected from "http://localhost:8080/urls/b2xVn2"to "http://localhost:8080/login" if the user is not logged in', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "user2@example.com", password: "dishwasher-funk" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b2xVn2").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });
});

// /////////////////////////////////////////////////////////////////
// // Redirection from /urls/new to /login if user is not logged in
describe('Server Routes', () => {
  let agent = chai.request.agent("http://localhost:8080"); // Create a chai agent to persist session cookies

  // After each test, clear session and logout
  afterEach(() => {
    return agent
      .post('/logout')
      .redirects(0)
      .then((res) => {
        expect(res).to.not.have.cookie('session'); // Check if session cookie is cleared after logout
        expect(res).to.redirectTo('/login');
      });
  });

  describe('GET /', () => {
    it('should redirect to /login with status 302', () => {
      return agent
        .get('/')
        .redirects(0)
        .then((res) => {
          expect(res).to.redirectTo('/login');
          expect(res).to.have.status(302);
        });
    });
  });

  describe('GET /urls/new', () => {
    it('should redirect to /login with status 302', () => {
      return agent
        .get('/urls/new')
        .redirects(0)
        .then((res) => {
          expect(res).to.redirectTo('/login');
          expect(res).to.have.status(302);
        });
    });
  });

  describe('GET /urls/NOTEXISTS', () => {
    it('should return status 404', () => {
      return agent
        .get('/urls/NOTEXISTS')
        .then((res) => {
          expect(res).to.have.status(404);
        });
    });
  });

  describe('GET /urls/b2xVn2', () => {
    it('should return status 403', () => {
      return agent
        .get('/urls/b2xVn2')
        .then((res) => {
          expect(res).to.have.status(403);
        });
    });
  });
});