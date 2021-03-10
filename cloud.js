Parse.Cloud.define(
  "createFarm",
  async ({ user, params }) => {
    const hasFarm = Boolean(
      await new Parse.Query("Farm")
        .equalTo("owner", user)
        .first({ useMasterKey: true })
    );

    if (hasFarm) {
      throw new Error("User is already farm owner.");
    }

    const farm = new Parse.Object("Farm");
    await farm.save(
      { ...params.farmData, owner: user },
      { useMasterKey: true }
    );
    const response = farm.toJSON();
    delete response.owner;
    return response;
  },
  {
    requireUser: true
  }
);

Parse.Cloud.define(
  "getMyFarm",
  ({ user }) => {
    return new Parse.Query("Farm")
      .equalTo("owner", user)
      .first({ useMasterKey: true });
  },
  {
    requireUser: true
  }
);

Parse.Cloud.define("getFarmById", async ({ user, params }) => {
  let farm = await new Parse.Query("Farm").get(params.farmId, {
    useMasterKey: true
  });
  if (!farm) throw new Error("Farm does not exist.");
  farm = farm.toJSON();

  const isOwner = user && user.id === farm.owner.objectId;
  if (!farm.published && !isOwner) {
    throw new Error("Farm is not publicly available.");
  }

  return farm;
});

// Parse.Cloud.define("averageStars", async (request) => {
//   const query = new Parse.Query("Review");
//   query.equalTo("movie", request.params.movie);
//   const results = await query.find();
//   let sum = 0;
//   for (let i = 0; i < results.length; ++i) {
//     sum += results[i].get("stars");
//   }
//   return sum / results.length;
// },{
// // fields can be also an array
//   fields : {
//     movie : {
//       required: true,
//       type: String,
//       options: val => {
//         return val.length < 20;
//       },
//       error: "Movie must be less than 20 characters"
//     }
//   },
//   requireUserKeys: {
//     accType : {
//       options: 'reviewer',
//       error: 'Only reviewers can get average stars'
//     }
//   }
// });
