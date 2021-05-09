Parse.Cloud.define("createOrder", async ({ params }) => {
  const order = new Parse.Object("Order", {
    completed: false,
    farm: params.farm,
    farmId: params.objectId,
    journal: "",
    note: params.note,
    pickupPoint: params.pickupPoint,
    subscriptions: params.subscriptions
  });
  await order.save(null, { useMasterKey: true });
  return order.toJSON();
});
