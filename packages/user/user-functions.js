Parse.Cloud.define(
  "signUp",
  async ({ params }) => {
    const { email, password, firstName, lastName } = params;

    const user = new Parse.User({
      email,
      username: email,
      password,
      firstName,
      lastName
    });

    await user.save(null, { useMasterKey: true });

    return user.toJSON();
  },
  { fields: ["email", "password", "firstName", "lastName"] }
);

Parse.Cloud.define("signIn", async ({ params }) => {
  const { email, password } = params;

  const user = await Parse.User.logIn(email, password);

  return user.toJSON();
});

Parse.Cloud.define("getBySessionToken", async ({ params }) => {
  const { sessionToken } = params;

  const user = await Parse.User.me(sessionToken);

  return user.toJSON();
});

Parse.Cloud.define(
  "updateCredentials",
  async ({ user, params }) => {
    const { email, password } = params;

    if (email) {
      user.set({
        email,
        username: email
      });
    }
    if (password) {
      user.set("password", password);
    }

    await user.save(null, { useMasterKey: true });
  },
  { requireUser: true }
);

Parse.Cloud.define(
  "destroyUserAndFarm",
  async ({ user }) => {
    const farm = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .include(["pickupPoints", "subscriptions"])
      .first({ useMasterKey: true });

    if (farm) {
      const pickupPoints = farm.get("pickupPoints");
      const destroyPointsPromises = pickupPoints.map((point) =>
        point.destroy({ useMasterKey: true })
      );
      await Promise.all(destroyPointsPromises);

      const subscriptions = farm.get("subscriptions");
      const destroySubscriptionsPromises = subscriptions.map((point) =>
        point.destroy({ useMasterKey: true })
      );
      await Promise.all(destroySubscriptionsPromises);

      await farm.destroy({ useMasterKey: true });
    }

    await user.destroy({ useMasterKey: true });
  },
  { requireUser: true }
);
