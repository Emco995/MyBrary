const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/avif",
  "image/gif",
];

///////////All books route

router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title) {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore) {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter) {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch (err) {
    res.redirect("/");
  }
});

////////// new book route

router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

////////// create book route

router.post("/", async (req, res) => {
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description,
  });

  saveCover(book, req.body.cover);

  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`);
    res.redirect(`books`);
  } catch (err) {
    renderNewPage(res, book, true);
  }
});

////////////////////book details

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id).populate("author").exec();
    res.render("books/show.ejs", { book });
  } catch {
    res.redirect("/");
  }
});

//////////////////////edit book route

// router.get("/:id/edit", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const book = await Book.findById(id);
//     res.render("books/edit", { book });
//   } catch {
//     res.redirect("/");
//   }
// });

// router.put("/:id", async (req, res) => {
//   let book;
//   try {
//     const { id } = req.params;
//     book = await Book.findByIdAndUpdate(id, req.body, {
//       runValidators: true,
//     });
//     res.redirect(`/books/${book.id}`);
//   } catch {
//     if (book == null) {
//       res.redirect(`/`);
//     } else {
//       let locals = { errorMessage: `Error updating Book` };
//       res.render("books/edit", {
//         book: book,
//         locals: locals,
//       });
//     }
//     res.redirect(`/books`);
//   }
// });

router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch {
    res.redirect("/");
  }
});

router.put("/:id", async (req, res) => {
  let book;

  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover != null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch {
    if (book != null) {
      renderEditPage(res, book, true);
    } else {
      redirect("/");
    }
  }
});

//////////////////////delete book route

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    res.redirect(`/books`);
  } catch {
    res.redirect(`/books/${book.id}`);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    let locals = { errorMessage: `Error creating Author` };
    if (hasError) params.errorMessage = locals;
    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}

async function renderEditPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book,
    };
    let locals1 = "Error Updating Book";
    let locals2 = "Error Creating Book";
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = locals1;
      } else {
        params.errorMessage = locals2;
      }
    }
    let locals3 = { errorMessage: `Error Creating Book` };
    if (hasError) params.errorMessage = locals3;
    res.render("books/edit", params);
  } catch {
    res.redirect("/books");
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
