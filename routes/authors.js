const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

///////////All authors route

router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name) {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", {
      authors: authors,
      searchOptions: req.query,
    });
  } catch {
    res.redirect("/");
  }
});

////////// new author route

router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

////////// create author route

router.post("/", async (req, res) => {
  const author = new Author({ name: req.body.name });
  try {
    const newAuthor = await author.save();
    res.redirect(`authors/${newAuthor.id}`);
  } catch {
    let locals = { errorMessage: `Error creating Author` };
    res.render("authors/new", {
      author: author,
      locals: locals,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);
    // const author = await Author.findById(id).populate("books", 'coverImage);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render("authors/show", { author: author, booksByAuthor: books });
  } catch {
    res.redirect("/");
  }
});

// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   const author = await Author.findById(id);
//   res.render("authors/show", { author });
// });

router.get("/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);
    res.render("authors/edit", { author });
  } catch {
    res.redirect("/authors");
  }
});

router.put("/:id", async (req, res) => {
  let author;
  try {
    const { id } = req.params;
    author = await Author.findByIdAndUpdate(id, req.body, {
      runValidators: true,
    });
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author == null) {
      res.redirect(`/`);
    } else {
      let locals = { errorMessage: `Error updating Author` };
      res.render("author/edit", {
        author: author,
        locals: locals,
      });
    }
    res.redirect(`/authors`);
  }
});

router.delete("/:id", async (req, res) => {
  let author;
  try {
    const { id } = req.params;
    author = await Author.findByIdAndDelete(id);
    res.redirect("/authors");
  } catch {
    if (author == null) {
      res.redirect(`/`);
    } else {
      res.redirect(`/authors/${author.id}`);
    }
  }
});

// router.get("/:id/books/new", async (req, res) => {
//   const { id } = req.params;
//   const author = await Author.findById(id);
//   res.render("products/new", { author });
// });

// router.post("/:id/books", async (req, res) => {
//   const { id } = req.params;
//   const author = await Author.findById(id);
//   const {
//     title,
//     description,
//     publishDate,
//     pageCount,
//     createdAt,
//     coverImage,
//     coverImageType,
//   } = req.body;
//   const book = new Book({
//     title,
//     description,
//     publishDate,
//     pageCount,
//     createdAt,
//     coverImage,
//     coverImageType,
//   });
//   author.books.push(book);
//   book.author = author;
//   await author.save();
//   await book.save();
//   res.redirect(`/authors/${id}`);
// });

module.exports = router;
