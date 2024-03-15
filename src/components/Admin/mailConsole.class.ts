import {ImageRepository} from "../../constants/imageRepository";
import MailTemplate from "../../constants/mailTemplates";
import AuthUser from "../Firebase/Authentication/authUser.class";
import Firebase from "../Firebase/firebase.class";

export enum RecipientType {
  none,
  email,
  uid,
  role,
}

interface Send {
  firebase: Firebase;
  authUser: AuthUser;
  mailContent: Mail;
  recipients: string;
  recipientType: RecipientType;
}
// ===================================================================== */
/**
 * Mail versenden
 * Mail über die Cloud-Fx versenden
 * @param param0 - Objekt
 */
export class Mail {
  subject: string;
  mailtext: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  headerPictureSrc?: string;

  // ===================================================================== */
  /**
   * Constructor
   */
  constructor() {
    this.subject = "";
    this.mailtext = "";
    this.title = "ich bin der Titel";
    this.subtitle = "";
    this.buttonLink = "";
    this.buttonText = "";
    this.headerPictureSrc =
      ImageRepository.getEnviromentRelatedPicture().CARD_PLACEHOLDER_MEDIA;
  }
}

class MailConsole {
  // ===================================================================== */
  /**
   * Mail versenden
   */
  static send = ({
    firebase,
    authUser,
    mailContent,
    recipients,
    recipientType,
  }: Send) => {
    firebase.cloudFunction.mailUser.triggerCloudFunction({
      values: {
        recipients: recipients,
        recipientType: recipientType,
        mailTemplate: MailTemplate.newletter,
        templateData: {
          subject: mailContent.subject,
          mailtext: mailContent.mailtext,
          title: mailContent.title,
          subtitle: mailContent?.subtitle,
          showLinkButton:
            mailContent?.buttonText && mailContent?.buttonLink ? true : false,
          buttonText: mailContent?.buttonText,
          buttonLink: mailContent?.buttonLink,
          headerPictureSrc: mailContent.headerPictureSrc,
        },
      },
      authUser: authUser,
    });
  };
}

export default MailConsole;
