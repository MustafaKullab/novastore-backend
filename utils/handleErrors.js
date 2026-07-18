//Function to handle with errors comes from db
const handleErrors = (err) => {
  const errors = {};

  // ** Sign up errors **
  if (err.message.includes("validation failed")) {
    Object.values(err.errors).map((error) => {
      errors[error.path] = error.message;
    });
  }

  if (err.code === 11000) {
    errors["email"] = "Email already registered";
  }

  if (err.message.includes("Both passwords must be equal")) {
    errors["confPass"] = "Both passwords must be equal";
  }

  // ** login messages
  if (err.message.includes("User is not found, please signup!")) {
    errors["email"] = "User is not found, please signup!";
  }

  if (err.message.includes("Password is not correct")) {
    errors["password"] = "Password is not correct";
  }

  return errors;
};

module.exports = handleErrors;
