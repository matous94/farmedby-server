function getValidFields(farmData) {
  return {
    about: farmData.about,
    addressLevel1: farmData.addressLevel1,
    city: farmData.city,
    countryCode: farmData.countryCode,
    email: farmData.email,
    isFarmPickupPoint: farmData.isFarmPickupPoint,
    name: farmData.name,
    objectId: farmData.objectId,
    owner: farmData.owner,
    phoneNumber: farmData.phoneNumber,
    pickupDay: farmData.pickupDay,
    pickupPoints: farmData.pickupPoints,
    postcode: farmData.postcode,
    productTypes: farmData.productTypes,
    published: farmData.published,
    street: farmData.street,
    subscriptions: farmData.subscriptions,
    webUrl: farmData.webUrl
  };
}

Parse.Cloud.define(
  "createFarm",
  async ({ user, params }) => {
    const hasFarm = Boolean(
      await new Parse.Query("Farm")
        .equalTo("owner", user)
        .first({ useMasterKey: true })
    );

    if (hasFarm) {
      throw new Error("User is already farm owner.");
    }

    const farm = new Parse.Object("Farm");
    const farmData = getValidFields(params);
    await farm.save(
      {
        ...farmData,
        about: farmData.about || "",
        addressLevel1: farmData.addressLevel1 || "",
        isFarmPickupPoint: farmData.isFarmPickupPoint ?? true,
        phoneNumber: farmData.phoneNumber || "",
        pickupPoints: farmData.pickupPoints ?? [],
        published: farmData.published ?? true,
        owner: user,
        subscriptions: farmData.subscriptions ?? [],
        webUrl: farmData.webUrl ?? ""
      },
      { useMasterKey: true }
    );
    const response = farm.toJSON();
    response.owner = {
      objectId: response.owner.objectId
    };
    return response;
  },
  {
    fields: [
      "city",
      "countryCode",
      "email",
      "name",
      "pickupDay",
      "postcode",
      "productTypes",
      "street"
    ],
    requireUser: true
  }
);

Parse.Cloud.define(
  "updateFarm",
  async ({ user, params }) => {
    const farm = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .first({ useMasterKey: true });
    await farm.save(getValidFields(params), { useMasterKey: true });
  },
  { requireUser: true }
);

Parse.Cloud.define(
  "getMyFarm",
  async ({ user }) => {
    let farm = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .include(["pickupPoints", "subscriptions"])
      .first({ useMasterKey: true });

    if (farm == null) return null;

    farm = farm.toJSON();

    const orders = await new Parse.Query("Order")
      .equalTo("farmId", farm.objectId)
      .select("objectId", "createdAt", "completed", "pickupPoint.name")
      .find({ useMasterKey: true });
    farm.orders = orders.map((order) => {
      const asJson = order.toJSON();
      return {
        objectId: asJson.objectId,
        createdAt: asJson.createdAt,
        pickupPointName: asJson.pickupPoint.name,
        completed: asJson.completed
      };
    });
    return farm;
  },
  {
    requireUser: true
  }
);

Parse.Cloud.define("getFarmById", async ({ params }) => {
  let farm = await new Parse.Query("Farm")
    .include(["pickupPoints", "subscriptions"])
    .get(params.objectId, {
      useMasterKey: true
    });
  if (!farm) throw new Error("Farm does not exist.");
  farm = farm.toJSON();

  // const isOwner = user && user.id === farm.owner.objectId;
  // if (!farm.published && !isOwner) {
  //   throw new Error("Farm is not publicly available.");
  // }

  return farm;
});

Parse.Cloud.define("getFarms", async ({ params }) => {
  const { limit = 300, skip = 0, countryCode } = params;

  const farms = await new Parse.Query("Farm")
    .limit(limit)
    .skip(skip)
    .ascending("name")
    .equalTo("countryCode", countryCode)
    .equalTo("published", true)
    .include(["pickupPoints"])
    .select(
      "city",
      "isFarmPickupPoint",
      "name",
      "pickupPoints.city",
      "pickupPoints.postcode",
      "pickupPoints.street",
      "postcode",
      "productTypes",
      "street"
    )
    .find({ useMasterKey: true });

  return farms.map((farm) => {
    const deliversTo = farm.get("pickupPoints").map((point) => ({
      city: point.get("city"),
      postcode: point.get("postcode"),
      street: point.get("street")
    }));
    if (farm.get("isFarmPickupPoint"))
      deliversTo.push({
        city: farm.get("city"),
        postcode: farm.get("postcode"),
        street: farm.get("street")
      });

    return {
      objectId: farm.id,
      name: farm.get("name"),
      productTypes: farm.get("productTypes"),
      deliversTo
    };
  });
});
