const express = require("express");
const products = require("./products.json");
const { validateProduct, checkIfProductExists } = require("./middlewares");

const app = express();
const PORT = 8000;

app.use(express.json());

let shoppingCart = [];

app.use((req, res, next) => {
  console.log(
    `I en middleware innan route ${req.url} och metod: ${req.method}`
  );
  next();
});

// Hämta alla producter för att visa på en produktlistningssida
app.get("/products", (req, res) => {
  res.json(products);
});

// Kunna lägga till en product i en varukorg
app.post("/cart/add/:productId", async (req, res) => {
  const productId = req.params.productId;
  const product = await checkIfProductExists(productId);

  if (!product) {
    return res.status(400).json({ error: "Product not found" });
  }
  if (shoppingCart.includes(productId)) {
    return res.status(400).json({ error: "Product was already in cart" });
  }
  shoppingCart.push(productId);
  res.status(201).json({ message: "Product was successfully added to cart" });
});

// Kunna ta bort en product i en varukorg
app.delete("/cart/add/:productId", (req, res) => {
  const productId = req.params.productId;
  const index = shoppingCart.indexOf(productId);

  if (index === -1) {
    return res.status(404).json({ error: "PRoduct not found in cart" });
  }
  shoppingCart.splice(index, 1);
  res.json({ message: "Product was removed from cart successfully" });
});

// Kunna hämta alla produkter i en varukorg GET
app.get("/cart", (req, res) => {
  const cartProducts = shoppingCart.map((productId) => {
    const product = checkIfProductExists(productId);
    if (!product) {
      res.json({ error: "The contents of the cart is empty" });
      return null;
    }
    return {
      title: product.title,
      shortDesc: product.shortDesc,
      serial: product.serial,
      price: product.price,
    };
  });

  const validCartProducts = cartProducts.filter((product) => product);

  res.json(validCartProducts);
});

// Kunna lägga en order med alla producter från varukorgen

app.use((req, res, next) => {
  res.status(404).json({ error: "No endpoint found" });
});

app.listen(PORT, () => {
  console.log("Server has been initialized");
});
