const express = require("express");
const router = express.Router();
const api_key = process.env.sendinblue_API_key_leo;
const mail = process.env.testMail;
const SibApiV3Sdk = require("sib-api-v3-sdk");
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = api_key;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

function envoyerEmail(req, res) {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.to = [{ email: mail }];
  sendSmtpEmail.templateId = 1;

  sendSmtpEmail.subject =
    "Nouveau message de " + req.body.nom + " (" + req.body.email + ")";
  sendSmtpEmail.htmlContent = req.body.message;

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data) {
      console.log("E-mail envoyé avec succès !");
      console.log(mail);
      res.send("Message envoyé avec succès !");
    },
    function (error) {
      console.error(error);
      console.log(sendSmtpEmail);
      console.log(mail);
      res
        .status(500)
        .send("Une erreur est survenue lors de l'envoi du message.");
    }
  );
}

router.post("/", envoyerEmail);

module.exports = router;
