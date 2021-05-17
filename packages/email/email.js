const nodemailer = require("nodemailer");

exports.sendEmail = async function sendEmail({
  from = '"FarmedBy" <matous@farmedby.com>',
  receivers,
  subject,
  text,
  html
}) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.forpsi.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }

    // host: "smtp.ethereal.email",
    // port: 587,
    // secure: false, // true for 465, false for other ports
    // auth: {
    //   user: testAccount.user, // generated ethereal user
    //   pass: testAccount.pass, // generated ethereal password
    // },
  });

  const info = await transporter.sendMail({
    from,
    to: receivers.join(", "),
    subject, // Subject line
    text, // plain text body
    html // html body
  });

  console.log("Email sent: ", JSON.stringify(info, null, 2));

  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

exports.orderCreatedFarmer = function orderCreatedFarmer({
  farm,
  farmId,
  objectId
}) {
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

  return exports.sendEmail({
    receivers: [farm.email],
    subject: translations[farm.countryCode].subject || translations.EN,
    text: translations[farm.countryCode].text || translations.EN
  });
};

exports.orderCreatedCustomer = function orderCreatedFarmer({
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
      1. Wait for an email from the farmer with payment details
      2. Make the payment
      3. Wait for an email containing first delivery date
      4. Pickup your deliveries according to selected frequency`
    }
  };

  return exports.sendEmail({
    receivers: [customer.email],
    subject: translations[farm.countryCode].subject || translations.EN,
    text: translations[farm.countryCode].text || translations.EN
  });
};
