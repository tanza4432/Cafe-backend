"use strict";

const firebase = require("../db");
const dotenv = require("dotenv");
const firestore = firebase.firestore();
const storage = require("../storage");
const bucket = storage.bucket();
const FoodModel = require("../models/food");

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

const addFoodByID = async (req, res, next) => {
  try {
    const id = req.params.id;
    const formData = req.body;

    const folder = "food-menu";
    const filename = `${folder}/${Date.now()}`;
    const fileUpload = bucket.file(filename);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
        name: filename,
      },
    });

    blobStream.on("error", (err) => {
      res.status(405).json(err);
    });

    blobStream.on("finish", async () => {
      const file = bucket.file(`food-menu/${filename}`);
      const link =
        "https://firebasestorage.googleapis.com/v0" +
        file.parent.baseUrl +
        "/" +
        file.parent.name +
        file.baseUrl +
        "/" +
        folder +
        "%2F" +
        filename.split("/")[1] +
        "?alt=media";

      const foodFirebase = await firestore
        .collection("menu")
        .where("idstore", "==", id);

      const data = await foodFirebase.get();
      const result = data.docs[0].data();
      result.list.push({
        name: formData.name,
        image: link,
        price: formData.price,
      });

      const updateMenu = await firestore.collection("menu").doc(id);

      await updateMenu.update(result);

      return res.status(200).send(result);
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

module.exports = {
  getFoodByID,
  addFoodByID,
};
