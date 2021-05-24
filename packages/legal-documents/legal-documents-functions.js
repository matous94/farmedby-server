const { getDocument } = require("./documents");

Parse.Cloud.define("getLegalDocument", ({ params }) => {
  return getDocument({
    documentId: params.documentId,
    languageCode: params.languageCode
  });
});
