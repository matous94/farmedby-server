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
4. Pravidelně doručuj, dle zvolené frekvence`
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
    EN: {
      subject: "New order",
      text: `A new order have just been created. You can find its summary at the following page.
https://farmedby.com/farm/${farmId}/order/${objectId}

Next steps:
1. Send an order confirmation email with payment details to the customer
2. Wait for the payment
3. Send an email containing first delivery date
4. Deliver regulary according to selected frequency`
    }
  };

  return sendEmail({
    receivers: [farm.email],
    subject: translations[farm.countryCode].subject || translations.EN,
    text: translations[farm.countryCode].text || translations.EN
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
