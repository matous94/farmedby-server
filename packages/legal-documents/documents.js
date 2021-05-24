const path = require("path");
const fs = require("fs").promises;

const idToDirectoryMapper = {
  privacyPolicy: "privacy-policy",
  termsOfUse: "terms-of-use"
};

function getDocumentPath({ documentId, lastUpdateDate, languageCode }) {
  return path.join(
    __dirname,
    idToDirectoryMapper[documentId],
    `${lastUpdateDate}-${languageCode}.md`
  );
}

const documents = {
  privacyPolicy: {
    releaseDate: "5-24-2021",
    lastUpdateDate: "5-24-2021"
  },
  termsOfUse: {
    releaseDate: "5-24-2021",
    lastUpdateDate: "5-24-2021"
  }
};

exports.getDocument = async ({ documentId, languageCode }) => {
  const document = { ...documents[documentId] };
  document.content = await fs.readFile(
    getDocumentPath({
      documentId,
      languageCode,
      lastUpdateDate: document.lastUpdateDate
    }),
    { encoding: "utf8" }
  );
  return document;
};
