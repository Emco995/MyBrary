if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/mybrary";
mongoose.set("strictQuery", true);
// mongoose.connect("mongodb://127.0.0.1:27017/mybrary");
main().catch((err) => console.log("MONGO DB ERROR", err));
async function main() {
  // await mongoose.connect("mongodb://127.0.0.1:27017/mybrary");
  await mongoose.connect(dbUrl);
  console.log("MONGO CONNECTION OPEN");
}
const db = mongoose.connection;
db.on("error", (error) => console.error(error));

const indexRoute = require("./routes/index");
const authorRoute = require("./routes/authors");
const bookRoute = require("./routes/books");

app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

app.use(methodOverride("_method"));

app.use("/", indexRoute);
app.use("/authors", authorRoute);
app.use("/books", bookRoute);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.engine("ejs", ejsMate);

app.listen(process.env.PORT || 3000, () => {
  console.log("WELCOME TO THE PORT 3000");
});

