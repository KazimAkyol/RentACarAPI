"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const router = require("express").Router();
/* ------------------------------------------------------- */
// routes/car:

const permissions = require("../middlewares/permissions");
const car = require("../controllers/car");

// URL: /users

router.route("/").get(car.list).post(permissions.isStaffOrisAdmin, car.create);

router
  .route("/:id")
  .get(car.read)
  .put(permissions.isStaffOrisAdmin, car.update)
  .patch(permissions.isStaffOrisAdmin, car.update)
  .delete(permissions.isStaffOrisAdmin, car.delete);

/* ------------------------------------------------------- */
module.exports = router;
