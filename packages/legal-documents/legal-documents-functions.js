const { getDocument } = require("./documents");

Parse.Cloud.define("getLegalDocument", ({ params }) => {
  return getDocument(params.documentId);
});
