export enum AuthMessages {
  WEAK_PASSWORD = "auth/weak-password",
  INVALID_EMAIL = "auth/invalid-email",
  EMAIL_ALREADY_IN_USE = "auth/email-already-in-use",
  USER_DISABLED = "auth/user-disabled",
  USER_NOT_FOUND = "auth/user-not-found",
  WRONG_PASSWORD = "auth/wrong-password",
  EXPIRED_ACTION_CODE = "auth/expired-action-code",
  INVALID_ACTION_CODE = "auth/invalid-action-code",
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL = "auth/account-exists-with-different-credential",
  REQUIRES_RECENT_LOGIN = "auth/requires-recent-login",
  TOO_MANY_REQUESTS = "auth/too-many-requests",
}

export enum General {
  PERMISSION_DENIED = "permission-denied",
  UNAVAILABLE = "unavailable",
}
