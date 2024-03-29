const { sendEmail } = require("./email");

module.exports = function orderCreatedFarmer({ farm, farmId, objectId }) {
  const czTranslations = {
    subject: "Nová objednávka",
    text: `Právě byla vytvořena nová objednávka, její shrnutí najdeš na následující stránce.
https://farmedby.com/farm/${farmId}/order/${objectId}

Další kroky:
1. Zašli objednateli na email potvrzení objednávky s platebními údaji
2. Vyčkej na platbu
3. Zašli email s prvním datem závozu
4. Pravidelně doručuj, dle frekvence zvoleného odběrového místa`
  };

  const translations = {
    CZ: {
      subject: czTranslations.subject,
      text: czTranslations.text
    },
    SK: {
      subject: czTranslations.subject,
      text: czTranslations.text
    },
    GB: {
      subject: "New order",
      text: `A new order have just been created. You can find its summary at the following page.
https://farmedby.com/farm/${farmId}/order/${objectId}

Next steps:
1. Send an order confirmation email with payment details to the customer
2. Wait for the payment
3. Send an email containing first delivery date
4. Deliver regularly according to selected pickup point`
    }
  };

  let farmEmail = farm.email;

  if (
    farmEmail === "ilustrace2@farmedby.com" ||
    farmEmail === "ilustrace3@farmedby.com" ||
    farmEmail === "illustration1@farmedby.com" ||
    farmEmail === "illustration2@farmedby.com" ||
    farmEmail === "illustration3@farmedby.com" ||
    farmEmail === "ilustracia1@farmedby.com" ||
    farmEmail === "ilustracia2@farmedby.com" ||
    farmEmail === "ilustracia3@farmedby.com" ||
    farmEmail === "ilustrace4@farmedby.com" ||
    farmEmail === "test@farmedby.com" ||
    farmEmail === "matous@farmedby.com"
  ) {
    farmEmail = "matousvencl@gmail.com";
  }

  return sendEmail({
    receivers: [farmEmail],
    subject: translations[farm.countryCode]?.subject || translations.GB,
    text: translations[farm.countryCode]?.text || translations.GB
  });
};

// TEST EMAIL
// module.exports({
//   farm: {
//     countryCode: "CZ",
//     email: "matousvencl@gmail.com"
//   },
//   farmId: "qHgur81fHZ",
//   objectId: "G60piQWJSC"
// });
