require("./packages/farm/farm-functions");
require("./packages/pickup-point/pickup-point-functions");
require("./packages/subscription/subscription-functions");
require("./packages/order/order-functions");

Parse.Cloud.define("subscribeToNewsletter", async ({ params }) => {
  const { email } = params;
  const isSubscribed = Boolean(
    await new Parse.Query("Newsletter")
      .equalTo("email", email)
      .count({ useMasterKey: true })
  );

  if (isSubscribed) return;

  await new Parse.Object("Newsletter").save({ email }, { useMasterKey: true });
});
