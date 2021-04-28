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
    await farm.save(
      { ...params.farmData, owner: user },
      { useMasterKey: true }
    );
    const response = farm.toJSON();
    delete response.owner;
    return response;
  },
  {
    requireUser: true
  }
);

Parse.Cloud.define(
  "updateFarm",
  async ({ user, params }) => {
    const farm = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .first({ useMasterKey: true });
    await farm.save(params.farmData, { useMasterKey: true });
  },
  { requireUser: true }
);

Parse.Cloud.define(
  "getMyFarm",
  ({ user }) => {
    return new Parse.Query("Farm")
      .equalTo("owner", user)
      .include(["pickupPoints", "subscriptions"])
      .first({ useMasterKey: true });
  },
  {
    requireUser: true
  }
);

Parse.Cloud.define("getFarmById", async ({ user, params }) => {
  let farm = await new Parse.Query("Farm")
    .include(["pickupPoints", "subscriptions"])
    .get(params.objectId, {
      useMasterKey: true
    });
  if (!farm) throw new Error("Farm does not exist.");
  farm = farm.toJSON();

  const isOwner = user && user.id === farm.owner.objectId;
  if (!farm.published && !isOwner) {
    throw new Error("Farm is not publicly available.");
  }

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
      "isPickupPoint",
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
    if (farm.get("isPickupPoint"))
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
