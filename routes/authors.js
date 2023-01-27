const express = require("express");
const router = express.Router();
const Author = require("../models/author");

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
  const { id } = req.params;
  const author = await Author.findById(id);
  res.render("authors/show", { author });
  //   res.send("Show author id" + req.params.id);
});

router.get("/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);
    res.render("authors/edit", { author });
  } catch {
    res.redirect("/authors");
  }
  //   res.send("Edit author id " + req.params.id);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const author = await Author.findByIdAndUpdate(id, req.body, {
    runValidators: true,
  });
  res.redirect(`/authors/${author.id}`);
  //   res.send("Update author id " + req.params.id);
});

// router.put('/:id', async (req, res) => {
//     let author
//     try {
//         author = await Author.findById(req.params.id)
//         author.name = req.body.name
//         await author.save()
//         res.redirect(`/authors/${author.id}`)
//     } catch (err) {
//         if (author == null) {
//             res.redirect('/');
//         } else {
//             let locals = { errorMessage: `Error updating Author` }
//             res.render('authors/edit', {
//                 author: author,
//                 locals: locals
//             });
//         }
//     }
// })

router.delete("/:id", async (req, res) => {
  res.send("Deleted Author " + req.params.id);
});

module.exports = router;
