const bcrypt = require("bcryptjs");

const password = "512006";

bcrypt.hash(password, 10, (err, hash) => {
    console.log(hash);
});