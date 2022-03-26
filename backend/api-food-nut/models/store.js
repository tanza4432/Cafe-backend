class StoreModel {
  constructor(
    id,
    address,
    idstore,
    image,
    latitude,
    longitude,
    name,
    open,
    tel,
    total_review,
    website
  ) {
    this.id = id;
    this.address = address;
    this.idstore = idstore;
    this.image = image;
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.open = open;
    this.tel = tel;
    this.total_review = total_review;
    this.website = website;
  }
}


module.exports = StoreModel;
