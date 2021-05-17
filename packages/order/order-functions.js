const { orderCreatedFarmer, orderCreatedCustomer } = require("../email");

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
  const orderAsJson = order.toJSON();

  await orderCreatedFarmer(orderAsJson);
  await orderCreatedCustomer(orderAsJson);

  return orderAsJson;
});

Parse.Cloud.define("getOrder", async ({ user, params }) => {
  const order = await new Parse.Query("Order").get(params.orderId, {
    useMasterKey: true
  });
  const orderAsJson = order.toJSON();

  let isOwner = false;
  if (user) {
    const count = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .equalTo("objectId", order.farmId)
      .count({ useMasterKey: true });
    isOwner = count > 0;
  }

  if (!isOwner) delete orderAsJson.journal;

  return order.toJSON();
});

Parse.Cloud.define(
  "updateOrder",
  async ({ user, params }) => {
    const order = await new Parse.Query("Order")
      .select("farmId")
      .get(params.objectId, {
        useMasterKey: true
      });

    let isOwner = false;
    const count = await new Parse.Query("Farm")
      .equalTo("owner", user)
      .equalTo("objectId", order.get("farmId"))
      .count({ useMasterKey: true });
    isOwner = count > 0;
    if (!isOwner) throw new Error("Not authorized");

    await order.save(
      {
        journal: params.journal,
        completed: params.completed
      },
      { useMasterKey: true }
    );
  },
  {
    requireUser: true
  }
);
