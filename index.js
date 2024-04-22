const express = require("express");
const products = require("./products.json");
const { validateProduct, checkIfProductExists } = require("./middlewares");
const fs = require("fs");

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
app.post("/cart/add/:productId", (req, res) => {
  const productId = req.params.productId;
  const product = checkIfProductExists(productId);

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
app.delete("/cart/remove/:productId", (req, res) => {
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

  if (validCartProducts.length === 0) {
    return res.json({ error: "The contents of the cart is empty" });
  }

  res.json(validCartProducts);
});

app.post("/order", (req, res) => {
  if (shoppingCart.length === 0) {
    return res.status(400).json({ error: "Shopping cart is currently empty" });
  }
  const orderDetails = {
    products: shoppingCart.map((productId) => {
      const product = checkIfProductExists(productId);
      return {
        title: product.title,
        price: product.price,
        shortDesc: product.shortDesc,
        serial: product.serial,
      };
    }),
  };

  shoppingCart = [];

  res
    .status(201)
    .json({ message: "Order placed successfully", order: orderDetails });
});
// För admin att addera ny product, saknas givetvis massa checks, kan brytas ut till mer middleware, FÖRSTÅS!
app.post("/product", validateProduct, (req, res) => {
  const { title, price, category, shortDesc, longDesc, imgFile, serial } =
    req.body;

  const newProduct = {
    title,
    price,
    category,
    shortDesc,
    longDesc,
    imgFile,
    serial,
  };

  fs.readFile("products.json", "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file", err);
      return res.status(500).json({ error: "Internal server error" });
    }
    let products = [];
    try {
      products = JSON.parse(data);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    products.push(newProduct);

    const updatedData = JSON.stringify(products, null, 2);

    fs.writeFile("products.json", updatedData, (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    });

    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  });
});

// Kunna lägga en order med alla producter från varukorgen

app.use((req, res, next) => {
  res.status(404).json({ error: "No endpoint found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log("Server has been initialized");
});
