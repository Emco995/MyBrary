const mongoose = require("mongoose");
const Books = require("./book");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
});

// authorSchema.post("findOneAndDelete", async function (author) {
//   if (author.products.length) {
//     const res = await Book.deleteMany({ _id: { $in: author.books } });
//     console.log(res);
//   }
// });

authorSchema.pre("findByIdAndDelete", function (next) {
  Books.find({ author: this.id }, (err, books) => {
    if (err) {
      next(err);
    } else if (books.length > 0) {
      next(new Error("This author has books still"));
    } else {
      next();
    }
  });
});

module.exports = mongoose.model("Author", authorSchema);
