const products = require("./products.json");

function validateProduct(req, res, next) {
  const { title, price, shortDesc, imgFile } = req.body;

  if (!title || !price || !shortDesc || imgFile) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  next();
}

function checkIfProductExists(productId) {
  return products.find((product) => product.serial === productId);
}

module.exports = { validateProduct, checkIfProductExists };
