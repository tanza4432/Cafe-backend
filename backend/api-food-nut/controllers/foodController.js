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
  try {
    const getFoodDatabase = await firestore
      .collection("menu")
      .where("idstore", "==", id);
    const check = await getFoodDatabase.get();
    const result = check.docs[0].data();

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

      result.list.push({
        name: formData.name,
        image: link,
        price: formData.price,
      });

      const updateMenu = await firestore
        .collection("menu")
        .doc(check.docs[0].id);

      await updateMenu.update(result);

      return res.status(200).send("success");
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
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

      const result = { idstore: id, list: [] };
      result.list.push({
        name: formData.name,
        image: link,
        price: formData.price,
      });

      await firestore.collection("menu").doc().set(result);

      return res.status(200).send("success");
    });

    blobStream.end(req.file.buffer);
  }
};

module.exports = {
  getFoodByID,
  addFoodByID,
};
