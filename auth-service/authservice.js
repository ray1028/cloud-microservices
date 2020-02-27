const jwt = require("jsonwebtoken");

module.exports = {
  generateJwt: function(id) {
    const token = jwt.sign({ id: id }, "secret", {
      expiresIn: 86400
    });
    return token;
  }
};
