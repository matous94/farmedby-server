Parse.Cloud.define("signUp", async ({ params }) => {
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
});

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
