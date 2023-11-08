import SibApiV3Sdk from "sib-api-v3-sdk";
import config from "../../../config";

const sendEmail = async (subject, name, email, templateId, params) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = config.EMAIL_API_KEY;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      email: config.SENDER_EMAIL,
      name: "55Feast",
    };
    sendSmtpEmail.subject = subject; 
    sendSmtpEmail.replyTo = {
      email: config.SENDER_EMAIL,
      name: "55Feast",
    };
    sendSmtpEmail.params = params;
    sendSmtpEmail.to = [{ name: name, email: email }];
    sendSmtpEmail.templateId = templateId; 
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return {
      status: "success",
      message: "Email sent successfully",
    };
  } catch (error) {
    return {
      status: "failure",
      message: error.message,
    };
  }
};

export default sendEmail;
