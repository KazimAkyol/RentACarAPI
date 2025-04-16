"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const router = require("express").Router();
/* ------------------------------------------------------- */
// routes/reservation:

const permissions = require("../middlewares/permissions");
const reservation = require("../controllers/reservation");

// URL: /users

router
  .route("/")
  .get(permissions.isLogin, reservation.list)
  .post(permissions.isLogin, reservation.create);

router
  .route("/:id")
  .get(permissions.isLogin, reservation.read)
  .put(permissions.isStaffOrisAdmin, reservation.update)
  .patch(permissions.isStaffOrisAdmin, reservation.update)
  .delete(permissions.isStaffOrisAdmin, reservation.delete);

/* ------------------------------------------------------- */
module.exports = router;
