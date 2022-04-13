"use strict";

const firebase = require("../db");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const firestore = firebase.firestore();

dotenv.config();

const getFoodByID = async (req, res, next) => {
  try {
    const id = req.params.id;
    const account = await firestore
      .collection("menu")
      .where("idstore", "==", id);
    const data = await account.get();
    return res.status(200).send(data.docs[0].data());
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  getFoodByID,
};
