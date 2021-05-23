const path = require("path");
const fs = require("fs").promises;

const idToDirectoryMapper = {
  privacyPolicy: "privacy-policy",
  termsOfUse: "terms-of-use"
};

function getDocumentPath(documentId, lastUpdateDate) {
  return path.join(
    __dirname,
    idToDirectoryMapper[documentId],
    `${lastUpdateDate}.json`
  );
}

const documents = {
  privacyPolicy: {
    releaseDate: "5-21-2021",
    lastUpdateDate: "5-21-2021"
  },
  termsOfUse: {
    releaseDate: "5-23-2021",
    lastUpdateDate: "5-23-2021"
  }
};

exports.getDocument = async (documentId) => {
  const document = { ...documents[documentId] };
  document.json = await fs.readFile(
    getDocumentPath(documentId, document.lastUpdateDate),
    { encoding: "utf8" }
  );
  return document;
};
