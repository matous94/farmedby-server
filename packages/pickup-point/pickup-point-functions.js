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
    await point.save(pickupPointData, { useMasterKey: true });
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
      farm.remove("pickupPoints", point);
      await farm.save(null, { useMasterKey: true });
      try {
        await point.destroy({ useMasterKey: true });
        return;
      } catch {
        return;
      }
    }

    throw new Error("Not authorized.");
  },
  { requireUser: true }
);
