const express = require("express");
const app = express();
const PORT = 8000;

app.use(express.json());

app.listen(PORT, () => {
  console.log("Servern har startat");
});
