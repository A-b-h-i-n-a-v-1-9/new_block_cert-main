// backend/tests/validator.test.js
import { validateEvent, validateRegistration } from "../src/utils/validator.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("Validator Tests", () => {
  it("should pass valid event", () => {
    const req = { body: { name: "Tech Fest", date: "2025-12-25" } };
    const res = mockRes();
    validateEvent(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should fail invalid event", () => {
    const req = { body: { name: "", date: "not-a-date" } };
    const res = mockRes();
    validateEvent(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should pass valid registration", () => {
    const req = { body: { name: "John", email: "john@example.com" } };
    const res = mockRes();
    validateRegistration(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should fail invalid email", () => {
    const req = { body: { name: "John", email: "bademail" } };
    const res = mockRes();
    validateRegistration(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
