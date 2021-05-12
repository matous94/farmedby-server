Parse.Cloud.define("createOrder", async ({ params }) => {
  const order = new Parse.Object("Order", {
    completed: false,
    customer: params.customer,
    farm: params.farm,
    farmId: params.farm.objectId,
    journal: "",
    note: params.note,
    pickupPoint: params.pickupPoint,
    subscriptions: params.subscriptions
  });
  await order.save(null, { useMasterKey: true });
  return order.toJSON();
});

Parse.Cloud.define("getOrder", async ({ user, params }) => {
  const orderQuery = new Parse.Query("Order");

  let isOwner = false;
  if (user) {
    const count = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .count({ useMasterKey: true });
    isOwner = count > 0;
  }
  if (!isOwner) {
    orderQuery.exclude("journal");
  }

  const order = await orderQuery.get(params.orderId, {
    useMasterKey: true
  });
  return order.toJSON();
});
