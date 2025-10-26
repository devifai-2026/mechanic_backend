import jwt from "jsonwebtoken";
import { models } from "../models/index.js";
const { Employee, Admin } = models;

// const jwtMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res
//       .status(401)
//       .json({ message: "Unauthorized - No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const { emp_id } = decoded;
//     console.log({ emp_id });
//     if (!emp_id) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized - Invalid token payload" });
//     }

//     const employee = await Employee.findOne({ where: { emp_id } });

//     if (!employee) {
//       return res.status(404).json({ message: "Employee not found" });
//     }
//     console.log({ employee });
//     console.log(employee.active_jwt_token);
//     console.log(token);

//     if (employee.active_jwt_token !== token) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized - Token mismatch" });
//     }

//     // Token is valid and matches DB
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error("JWT Middleware Error:", err);
//     return res.status(401).json({ message: "Unauthorized - Invalid token0" });
//   }
// };

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

    let user = null;
    let userType = null;

    if (decoded.emp_id) {
      user = await Employee.findOne({ where: { emp_id: decoded.emp_id } });
      userType = "employee";
    } else if (decoded.admin_id) {
      user = await Admin.findOne({ where: { admin_id: decoded.admin_id } });
      userType = "admin";
    } else {
      return res
        .status(401)
        .json({ message: "Unauthorized - Invalid token payload" });
    }

    if (!user) {
      return res.status(404).json({ message: `${userType} not found` });
    }

    if (user.active_jwt_token !== token) {
      return res.status(401).json({ message: "Unauthorized - Token mismatch" });
    }

    // Attach user and type to request
    req.user = decoded;
    req.userType = userType;
    next();
  } catch (err) {
    console.error("JWT Middleware Error:", err);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export default jwtMiddleware;
