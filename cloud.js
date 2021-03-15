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
      .include(["pickupPoints", "boxes"])
      .first({ useMasterKey: true });
  },
  {
    requireUser: true
  }
);

Parse.Cloud.define("getFarmById", async ({ user, params }) => {
  let farm = await new Parse.Query("Farm").get(params.objectId, {
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

Parse.Cloud.define(
  "savePickupPoint",
  async ({ user, params }) => {
    const { pickupPointData } = params;
    const farm = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .first({ useMasterKey: true });

    const isNew = pickupPointData.objectId == null;

    if (isNew) {
      const point = new Parse.Object("PickupPoint");
      Object.entries(pickupPointData).forEach(([key, value]) =>
        point.set(key, value)
      );
      farm.add("pickupPoints", point);
      await farm.save(null, { useMasterKey: true });
      return point.toJSON();
    }

    const point = await new Parse.Query(
      "PickupPoint"
    ).get(pickupPointData.objectId, { useMasterKey: true });
    await point.save(pickupPointData);
    return point.toJSON();
  },
  { requireUser: true }
);

Parse.Cloud.define(
  "deletePickupPoint",
  async ({ user, params }) => {
    const point = await new Parse.Query("PickupPoint").get(params.objectId, {
      useMasterKey: true
    });
    if (point == null) return;

    const farm = await new Parse.Query("Farm")
      .equalTo("pickupPoints", point)
      .equalTo("owner", user)
      .first({ useMasterKey: true });

    if (farm) {
      await point.destroy();
      return;
    }

    throw new Error("Not authorized.");
  },
  { requireUser: true }
);
