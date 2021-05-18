const { sendEmail } = require("./email");

module.exports = function orderCreatedCustomer({
  customer,
  farm,
  farmId,
  objectId
}) {
  const czTranslations = {
    subject: "Shrnutí objednávky",
    text: `Tvoje objednávka byla úspěšně odeslána farmáři, její shrnutí můžeš najít na následující stránce.
https://farmedby.com/farm/${farmId}/order/${objectId}

Další kroky:
1. Vyčkej na email od farmáře s platebními údaji (${farm.email})
2. Zaplať objednávku
3. Vyčkej na email s prvním datem závozu
4. Pravidelně vyzvedávej, dle zvolené frekvence`
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
1. Wait for an email from the farmer with payment details (${farm.email})
2. Make the payment
3. Wait for an email containing first delivery date
4. Pickup your deliveries according to selected frequency`
    }
  };

  return sendEmail({
    receivers: [customer.email],
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
//   customer: {
//     email: "matousvencl@gmail.com"
//   },
//   farmId: "qHgur81fHZ",
//   objectId: "aj8biY509S"
// });
