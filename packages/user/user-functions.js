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
