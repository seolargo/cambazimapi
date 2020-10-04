const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.contactForm = (req, res) => {
  //res.send('contact endpoint');
  //const data = req.body;
  console.log(req.body);
  const { email, name, message } = req.body;

  const emailData = {
    to: process.env.EMAIL_TO,
    from: email,
    subject: `Contact form - ${process.env.APP_NAME}`,
    text: `İletişim formundan gelen mesaj: \n Gönderen ismi: ${name} \n Gönderen e-postası: ${email} \n Gönderen mesajı: ${message}`,
    html: `
                <h4>İletişim formundan gelen mesaj: </h4>
                <p>Gönderen ismi: ${name}</p>
                <p>Gönderen e-postası: ${email}</p>
                <p>Mesajı: ${message}</p>
                <hr />
                <p>http://cambazim.com</p>
            `,
  };

  /*try {
    sgMail.send(emailData).then((sent) => {
      return res.json({
        success: true,
      });
    });
  } catch (e) {
    console.log(e);
  }*/

  (async () => {
    try {
      await sgMail.send(emailData).then((sent) => {
        return res.json({
          success: true,
        });
      });
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
      }
    }
  })();
};

exports.contactProductAuthorForm = (req, res) => {
  //res.send('contact endpoint');
  //const data = req.body;
  //console.log(req.body);
  const { authorEmail, email, name, message } = req.body;

  let maillist = [authorEmail, process.env.EMAIL_TO];

  const emailData = {
    to: maillist,
    from: email,
    subject: `Birisi sana mesaj gönderdi! - ${process.env.APP_NAME}`,
    text: `İletişim formundan gelen mesaj \n Gönderen ismi: ${name} \n Gönderen e-postası: ${email} \n Gönderen mesajı: ${message}`,
    html: `
            <h4>Mesaj şu kişiden geldi: </h4>
            <p>Gönderen ismi: ${name}</p>
            <p>Gönderen e-postası: ${email}</p>
            <p>Mesajı: ${message}</p>
            <hr />
            <p>http://cambazim.com</p>
        `,
  };

  sgMail.send(emailData).then((sent) => {
    return res.json({
      success: true,
    });
  });
};
