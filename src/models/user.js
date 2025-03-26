"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
/* ------------------------------------------------------- *
{
    "username": "test",
    "password": "1234",
    "email": "test@site.com",
    "isActive": true,
    "isStaff": false,
    "isAdmin": false
}
/* ------------------------------------------------------- */

const { mongoose } = require("../configs/dbConnection");
const passwordEncrypt = require("../helpers/passwordEncrypt");
const uniqueValidator = require("mongoose-unique-validator");
const passwordValidation = require("../helpers/emailValidation");
const emailValidation = require("../helpers/emailValidation");
// User Model:
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      trim: true,
      required: true,
      set: (password) => passwordEncrypt(password),
      // select:false //* Adminsin, firmada Staff da Customer da islemleri yapiyor. Admin bile olsan Staff'in dahi sifresini görmemeli.Bu secenek ile ekrana sifre bilgisi gelmesin.
    },

    email: {
      type: String,
      trim: true,
      required: [true, "An Email address is required"],
      unique: true, //* mongoDB unique veriler icin kendi mesajini gösterir.
      validate: [
        (email) => emailValidation(email),
        "Email format is not valid",
      ],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isStaff: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { collection: "users", timestamps: true }
);

//* Biz unique verileri icin kendi mesajimizi göndermek istiyorsak plugin(uniqueValidator) methodu kullanilir.
UserSchema.plugin(uniqueValidator, {
  message: "This {PATH} is exist",
});

/* ------------------------------------------------------- */
module.exports = mongoose.model("User", UserSchema);
