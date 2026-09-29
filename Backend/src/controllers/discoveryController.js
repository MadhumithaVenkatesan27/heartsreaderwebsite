const Book = require("../models/Book");
const ReadingProgress = require("../models/ReadingProgress");
const User = require("../models/User");
const { catchAsync } = require("../middleware/errorMiddleware");

const bookSelect =
  "title slug author coverImageUrl price genres description ratingAverage ratingCount readerCount analytics chapters createdAt";

const uniqueBooks = (books = []) => {
  const seen = new Set();
  return books.filter((book) => {
    const id = book._id.toString();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const findPublishedBooks = (filter = {}, sort = { createdAt: -1 }, limit = 10) =>
  Book.find({ isPublished: true, ...filter })
    .select(bookSelect)
    .sort(sort)
    .limit(limit);

const getPublicCollections = catchAsync(async (req, res) => {
  const [newReleases, trending, topRated, freePreviews, mostPurchased, comingSoon] =
    await Promise.all([
      findPublishedBooks({}, { createdAt: -1 }, 12),
      findPublishedBooks({}, { "analytics.views": -1, readerCount: -1, createdAt: -1 }, 12),
      findPublishedBooks({ ratingCount: { $gt: 0 } }, { ratingAverage: -1, ratingCount: -1 }, 12),
      findPublishedBooks({ "chapters.isPreview": true }, { createdAt: -1 }, 12),
      findPublishedBooks({}, { "analytics.purchases": -1, createdAt: -1 }, 12),
      Book.find({ releaseStatus: "coming_soon" })
        .select(bookSelect)
        .sort({ releaseDate: 1, createdAt: -1 })
        .limit(12),
    ]);

  res.status(200).json({
    status: "success",
    data: {
      collections: [
        { key: "new_releases", title: "New Releases", books: newReleases },
        { key: "trending", title: "Trending Now", books: trending },
        { key: "top_rated", title: "Most Loved", books: topRated },
        { key: "free_previews", title: "Free First Chapters", books: freePreviews },
        { key: "most_purchased", title: "Reader Favorites", books: mostPurchased },
        { key: "coming_soon", title: "Coming Soon", books: comingSoon },
      ],
    },
  });
});

const getDiscoveryHome = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("wishlist purchases");
  const progress = await ReadingProgress.find({ userId: req.user._id })
    .populate("bookId", bookSelect)
    .sort({ lastReadAt: -1 })
    .limit(8);

  const ownedBookIds = (user.purchases || []).map((purchase) => purchase.bookId.toString());
  const wishlistIds = (user.wishlist || []).map((bookId) => bookId.toString());
  const excludedIds = [...new Set([...ownedBookIds, ...wishlistIds])];

  const genreSet = new Set();
  progress.forEach((item) => {
    (item.bookId?.genres || []).forEach((genre) => genreSet.add(genre));
  });

  const wishlistBooks = await Book.find({
    _id: { $in: wishlistIds },
    isPublished: true,
  }).select(bookSelect);
  wishlistBooks.forEach((book) => {
    (book.genres || []).forEach((genre) => genreSet.add(genre));
  });

  const preferredGenres = [...genreSet];
  const recommendationFilter = preferredGenres.length
    ? { genres: { $in: preferredGenres }, _id: { $nin: excludedIds } }
    : { _id: { $nin: excludedIds } };

  const [recommended, trending, newReleases, topRated, freePreviews] =
    await Promise.all([
      findPublishedBooks(recommendationFilter, { ratingAverage: -1, "analytics.purchases": -1 }, 12),
      findPublishedBooks({}, { "analytics.views": -1, readerCount: -1, createdAt: -1 }, 10),
      findPublishedBooks({ _id: { $nin: ownedBookIds } }, { createdAt: -1 }, 10),
      findPublishedBooks({ ratingCount: { $gt: 0 } }, { ratingAverage: -1, ratingCount: -1 }, 10),
      findPublishedBooks({ "chapters.isPreview": true }, { createdAt: -1 }, 10),
    ]);

  const continueReading = progress
    .filter((item) => item.bookId)
    .map((item) => ({
      book: item.bookId,
      chapterId: item.chapterId,
      page: item.page,
      percentage: item.percentage,
      lastReadAt: item.lastReadAt,
    }));

  res.status(200).json({
    status: "success",
    data: {
      continueReading,
      preferredGenres,
      sections: [
        {
          key: "recommended",
          title: "Recommended For You",
          books: uniqueBooks(recommended),
        },
        { key: "wishlist", title: "From Your Wishlist", books: wishlistBooks },
        { key: "trending", title: "Trending Now", books: trending },
        { key: "new_releases", title: "New Releases", books: newReleases },
        { key: "top_rated", title: "Most Loved", books: topRated },
        { key: "free_previews", title: "Free First Chapters", books: freePreviews },
      ],
    },
  });
});

module.exports = {
  getDiscoveryHome,
  getPublicCollections,
};
