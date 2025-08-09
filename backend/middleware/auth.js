const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch user from DB to get username
    const user = await User.findById(decoded.id).select("id username");
    if (!user) throw new Error();
    req.user = { id: user.id, username: user.username };
    next();
  } catch (err) {
    res.status(401).json({ error: "Please authenticate" });
  }
};
