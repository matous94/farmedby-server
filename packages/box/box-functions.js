Parse.Cloud.define(
  "saveBox",
  async ({ user, params }) => {
    const { boxData } = params;
    const farm = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .first({ useMasterKey: true });

    const isNew = boxData.objectId == null;

    if (isNew) {
      const box = new Parse.Object("Box");
      Object.entries(boxData).forEach(([key, value]) => box.set(key, value));
      farm.add("boxes", box);
      await farm.save(null, { useMasterKey: true });
      return box.toJSON();
    }

    const box = await new Parse.Query("Box").get(boxData.objectId, {
      useMasterKey: true
    });
    await box.save(boxData, { useMasterKey: true });
    return box.toJSON();
  },
  { requireUser: true }
);

Parse.Cloud.define(
  "deleteBox",
  async ({ user, params }) => {
    const box = await new Parse.Query("Box").get(params.objectId, {
      useMasterKey: true
    });
    if (box == null) return;

    const farm = await new Parse.Query("Farm")
      .equalTo("boxes", box)
      .equalTo("owner", user)
      .first({ useMasterKey: true });

    if (farm) {
      farm.remove("boxes", box);
      await farm.save(null, { useMasterKey: true });
      try {
        await box.destroy({ useMasterKey: true });
        return;
      } catch {
        return;
      }
    }

    throw new Error("Not authorized.");
  },
  { requireUser: true }
);
