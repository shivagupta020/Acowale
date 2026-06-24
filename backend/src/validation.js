const categories = ["Product", "Service", "Support", "Feature request", "Other"];

const clean = (value) => (typeof value === "string" ? value.trim() : "");

const validateFeedback = (body = {}) => {
  const value = {
    name: clean(body.name) || "Anonymous",
    email: clean(body.email).toLowerCase(),
    category: clean(body.category),
    rating: Number(body.rating),
    comments: clean(body.comments),
  };
  const errors = {};

  if (value.name.length > 80) errors.name = "Name must be 80 characters or fewer";
  if (value.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!categories.includes(value.category)) errors.category = "Select a valid category";
  if (!Number.isInteger(value.rating) || value.rating < 1 || value.rating > 5) {
    errors.rating = "Choose a rating from 1 to 5";
  }
  if (value.comments.length < 10) errors.comments = "Comments must be at least 10 characters";
  if (value.comments.length > 1200) errors.comments = "Comments must be 1,200 characters or fewer";

  return { value, errors, valid: Object.keys(errors).length === 0 };
};

module.exports = { categories, validateFeedback };
