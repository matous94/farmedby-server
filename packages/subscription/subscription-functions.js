Parse.Cloud.define(
  "saveSubscription",
  async ({ user, params }) => {
    const { subscriptionData } = params;
    const farm = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .first({ useMasterKey: true });

    const isNew = subscriptionData.objectId == null;

    if (isNew) {
      const subscription = new Parse.Object("Subscription");
      Object.entries(subscriptionData).forEach(([key, value]) =>
        subscription.set(key, value)
      );
      farm.add("subscriptions", subscription);
      await farm.save(null, { useMasterKey: true });
      return subscription.toJSON();
    }

    const subscription = await new Parse.Query("Subscription").get(
      subscriptionData.objectId,
      {
        useMasterKey: true
      }
    );
    await subscription.save(subscriptionData, { useMasterKey: true });
    return subscription.toJSON();
  },
  { requireUser: true }
);

Parse.Cloud.define(
  "deleteSubscription",
  async ({ user, params }) => {
    const subscription = await new Parse.Query("Subscription").get(
      params.objectId,
      {
        useMasterKey: true
      }
    );
    if (subscription == null) return;

    const farm = await new Parse.Query("Farm")
      .equalTo("subscriptions", subscription)
      .equalTo("owner", user)
      .first({ useMasterKey: true });

    if (farm) {
      farm.remove("subscriptions", subscription);
      await farm.save(null, { useMasterKey: true });
      try {
        await subscription.destroy({ useMasterKey: true });
        return;
      } catch {
        return;
      }
    }

    throw new Error("Not authorized.");
  },
  { requireUser: true }
);
