"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

// Reservation Controller:

const Reservation = require("../models/reservation");
const Car = require("../models/car");
const dateValidation = require("../helpers/dateValidation");
const CustomError = require("../errors/customError");

module.exports = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Reservations"]
            #swagger.summary = "List Reservations"
            #swagger.description = `
                You can send query with endpoint for search[], sort[], page and limit.
                <ul> Examples:
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=1&sort[field2]=-1</b></li>
                    <li>URL/?<b>page=2&limit=1</b></li>
                </ul>
            `
        */

    //* Customer sadece kendi rezervasyonunu görsün, Bütün rezervasyonları isAdmin ve isStaff görmeli
    let customFilter = {};

    if (!req.user.isAdmin || !req.user.isStaff)
      customFilter = { userId: req.user._id };

    const data = await res.getModelList(Reservation, customFilter);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Reservation, customFilter),
      data,
    });
  },

  create: async (req, res) => {
    /*
            #swagger.tags = ["Reservations"]
            #swagger.summary = "Create Reservation"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref:"#/definitions/Reservation"
                }
            }
        */

    /* -------------------------------------------------------------------------- */

    if (!req.user.isAdmin || !req.user.isStaff) {
      req.body.userId = req.user._id;
    } else if (!req.body.userId) {
      req.body.userId = req.user._id;
    }

    /* -------------------------------------------------------------------------- */

    const [start, end, reservedDays] = dateValidation(
      req.body?.startDate,
      req.body?.endDate
    );

    console.log("start,end,reservedDays", start, end, reservedDays);

    // Öncelikle müsait olan araçları bulmak için müsait olmayanları bulalım
    // Çakışan araçları buluyoruz
    // db startDate<query end date,   db endDate> query startDate

    const isReserved = await Reservation.findOne({
      cardId: req.body.cardId,
      startDate: { $lte: req.body?.endDate },
      endDate: { $gte: req.body?.startDate },
    });

    if (isReserved) {
      throw new CustomError("The car is already reserved for given dates", 400);
    }
    /* -------------------------------------------------------------------------- */

    const userReservation = await Reservation.findOne({
      userId: req.body.userId,
      startDate: { $lte: req.body?.endDate },
      endDate: { $gte: req.body?.startDate },
    });
    if (userReservation) {
      throw new CustomError(
        "The user is already reserved another car for given dates",
        400
      );
    }
    /* -------------------------------------------------------------------------- */
    const dailyCost = await Car.findOne(
      { _id: req.body.cardId },
      { _id: 0, pricePerDay: 1 }
    ).then((car) => Number(car.pricePerDay));

    req.body.amount = dailyCost * reservedDays;

    console.log(req.body.amount);
    /* -------------------------------------------------------------------------- */
    const data = await Reservation.create(req.body);
    /* -------------------------------------------------------------------------- */

    // Todo: send mail to user

    res.status(201).send({
      error: false,
      data,
    });
  },

  read: async (req, res) => {
    /*
            #swagger.tags = ["Reservations"]
            #swagger.summary = "Get Single Reservation"
        */
    let customFilter = {};

    if (!req.user.isAdmin || !req.user.isStaff)
      customFilter = { userId: req.user._id };

    const data = await Reservation.findOne({
      _id: req.params._id,
      ...customFilter,
    });

    res.status(200).send({
      error: false,
      data,
    });
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Reservations"]
            #swagger.summary = "Update Reservation"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    "username": "test",
                    "password": "1234",
                    "email": "test@site.com",
                    "isActive": true,
                    "isStaff": false,
                    "isAdmin": false,
                }
            }
        */

    const data = await Reservation.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    res.status(202).send({
      error: false,
      data,
      new: await Reservation.findOne({ _id: req.params.id }),
    });
  },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Reservations"]
            #swagger.summary = "Delete Reservation"
        */

    const data = await Reservation.deleteOne({ _id: req.params.id });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
    });
  },
};
