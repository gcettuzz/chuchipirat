//💡 Muss gleich heissen wie das Template-Dokument im Firestore
enum MailTemplate {
  newRecipePublishRequest = "NewRecipePublishRequest",
  newReportErrorRequest = "NewReportErrorRequest",
  requestRecipePublished = "RequestRecipePublished",
  requestReportErrorFixed = "RequestReportErrorFixed",
  requestNewComment = "RequestNewComment",
  newletter = "Newsletter",
  welcomeNewUser = "WelcomeNewUser",
}

export default MailTemplate;
