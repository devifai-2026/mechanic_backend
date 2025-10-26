import jwt from "jsonwebtoken";
import db from "../models/index.js"; // Adjust path if needed
const { employee: Employee } = db;

const jwtMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Optional: Check if token matches the one in DB
    const employee = await Employee.findByPk(decoded.id);

    if (!employee || employee.active_jwt_token !== token) {
      return res.status(401).json({ message: "Session expired or invalid" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export default jwtMiddleware;
