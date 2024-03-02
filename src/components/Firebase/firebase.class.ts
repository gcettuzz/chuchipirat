import FirebaseAnalyticEvent from "../../constants/firebaseEvent";

import FirebaseDbEvent from "./Db/firebase.db.event.class";
import FirebaseDbFeed from "./Db/firebase.db.feed.class";
import FirebaseDbMasterData from "./Db/firebase.db.masterData.class";
import "firebase/functions";
import FirebaseDbRecipePublic from "./Db/firebase.db.recipe.public.class";
import FirebaseDbRecipePrivate from "./Db/firebase.db.recipe.private.class";
import FirebaseDbRecipeVariant from "./Db/firebase.db.recipe.variant.class";
import FirebaseDbRecipeShortPublic from "./Db/firebase.db.recipeShort.public.class";
import FirebaseDbRecipeShortPrivate from "./Db/firebase.db.recipeShort.private.class";
import FirebaseDbRecipeShortVariant from "./Db/firebase.db.recipeShort.variant.class";

import {FirebaseDbRequest} from "./Db/firebase.db.request.class";

import FirebaseDbStats from "./Db/firebase.db.stats.class";
import FirebaseDbUser from "./Db/firebase.db.user.class";
import FirebaseDbCloudFunction from "./Db/firebase.db.cloudfunction.class";
import FirebaseStorage from "./Storage/firebase.storage.class";
import FirebaseDbMailbox from "./Db/firebase.db.mailbox.class";
import FirebaseDbConfiguration from "./Db/firebase.db.configuration.class";

import app from "firebase/app";
import "firebase/auth";
import "firebase/analytics";
import "firebase/performance";
import "firebase/storage";
import "firebase/firestore";

import FirebaseDbEventShort from "./Db/firebase.db.eventShort.class";
import LocalStorageKey from "../../constants/localStorage";
import AuthUser from "./Authentication/authUser.class";
import User from "../User/user.class";

// interface OnAuthUserListener {
//   callback: (authUser: AuthUser | null) => void;
// }
interface SignInWithEmailAndPassword {
  email: string;
  password: string;
}
interface CreateUserWithEmailAndPassword {
  email: string;
  password: string;
}
interface ConfirmPasswordReset {
  resetCode: string;
  password: string;
}
interface PasswordUpdate {
  password: string;
}
interface ReauthenticateWithCredential {
  email: string;
  password: string;
}
//TODO: zusammenführen mit TEMP (TS) Klasse
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};
// // Suffix von redimensionierten Files
// export const IMAGES_SUFFIX = {
//   size50: { size: 50, suffix: "_50x50.jpeg" },
//   size200: { size: 200, suffix: "_200x200.jpeg" },
//   size300: { size: 300, suffix: "_300x300.jpeg" },
//   size600: { size: 600, suffix: "_600x600.jpeg" },
//   size1000: { size: 1000, suffix: "_1000x1000.jpeg" },
// };

export default class Firebase {
  emailAuthProvider: any;
  auth: app.auth.Auth;
  // auth2: app.auth.Auth;
  db: app.firestore.Firestore;
  analytics: app.analytics.Analytics;
  performance: app.performance.Performance;
  storage: app.storage.Storage;

  timestamp: any;
  fieldValue: any;
  taskEvent: any;

  recipePublic: FirebaseDbRecipePublic;
  recipePrivate: FirebaseDbRecipePrivate;
  recipeVariant: FirebaseDbRecipeVariant;
  recipeShortPublic: FirebaseDbRecipeShortPublic;
  recipeShortPrivate: FirebaseDbRecipeShortPrivate;
  recipeShortVariant: FirebaseDbRecipeShortVariant;
  request: FirebaseDbRequest;
  event: FirebaseDbEvent;
  eventShort: FirebaseDbEventShort;
  user: FirebaseDbUser;
  feed: FirebaseDbFeed;
  stats: FirebaseDbStats;
  masterdata: FirebaseDbMasterData;
  configuration: FirebaseDbConfiguration;
  cloudFunction: FirebaseDbCloudFunction;
  mailbox: FirebaseDbMailbox;
  fileStore: FirebaseStorage;

  /* =====================================================================
  // Konstruktor
  // ===================================================================== */
  constructor() {
    const firebase = app.initializeApp(config);
    this.emailAuthProvider = app.auth.EmailAuthProvider;
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.analytics = firebase.analytics();
    this.performance = firebase.performance();
    this.storage = firebase.storage();
    // Helper
    this.timestamp = app.firestore.Timestamp;
    this.fieldValue = app.firestore.FieldValue;
    this.taskEvent = app.storage.TaskEvent;

    this.recipePublic = new FirebaseDbRecipePublic(this);
    this.recipePrivate = new FirebaseDbRecipePrivate(this);
    this.recipeVariant = new FirebaseDbRecipeVariant(this);
    this.recipeShortPublic = new FirebaseDbRecipeShortPublic(this);
    this.recipeShortPrivate = new FirebaseDbRecipeShortPrivate(this);
    this.recipeShortVariant = new FirebaseDbRecipeShortVariant(this);
    this.request = new FirebaseDbRequest(this);

    this.event = new FirebaseDbEvent(this);
    this.eventShort = new FirebaseDbEventShort(this);
    this.user = new FirebaseDbUser(this);
    this.feed = new FirebaseDbFeed(this);
    this.stats = new FirebaseDbStats(this);
    this.masterdata = new FirebaseDbMasterData(this);

    // this.cloudFunctionRecipeTrace =
    //   new FirebaseDbCloudfunctionWaitingareaRecipetrace(this);
    this.configuration = new FirebaseDbConfiguration(this);
    this.cloudFunction = new FirebaseDbCloudFunction(this);
    this.mailbox = new FirebaseDbMailbox(this);
    //TODO: umbennenen sobald V9
    this.fileStore = new FirebaseStorage(this);
  }
  /* =====================================================================
  // 
  // ===================================================================== */
  // onAuthUserStateChange = async (user: app.User): Promise<AuthUser | null> => {
  //   let authUser: AuthUser;
  //   if (user) {
  //     // Prüfen ob Infos zu User bereits im Session Storage gespeichert wurden
  //     const localStorageAuthUserString = localStorage.getItem(
  //       LocalStorageKey.AUTH_USER
  //     );

  //     if (!localStorageAuthUserString) {
  //       return await User.getFullProfile({firebase: this, uid: user.uid}).then(
  //         (result) => {
  //           console.warn("read profile");
  //           authUser = {
  //             uid: user.uid,
  //             email: result.email,
  //             emailVerified: user.emailVerified,
  //             providerData: user.providerData,
  //             firstName: result.firstName,
  //             lastName: result.lastName,
  //             roles: result.roles,
  //             publicProfile: {
  //               displayName: result.displayName,
  //               motto: result.motto,
  //               pictureSrc: result.pictureSrc,
  //             },
  //           };

  //           localStorage.setItem(
  //             LocalStorageKey.AUTH_USER,
  //             JSON.stringify(authUser)
  //           );
  //           return authUser;
  //         }
  //       );
  //     } else {
  //       return JSON.parse(localStorageAuthUserString) as AuthUser;
  //     }
  //   } else {
  //     localStorage.removeItem(LocalStorageKey.AUTH_USER);
  //     return null;
  //   }
  // };

  /* =====================================================================
  // Listener, falls sich mit dem User was ändern
  // ===================================================================== */
  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (callback: (authUser: AuthUser | null) => void) => {
    let authUser: AuthUser;
    // let dbUser: app.firestore.DocumentData | undefined;
    return this.auth.onAuthStateChanged(async (user: app.User) => {
      if (user) {
        // Prüfen ob Infos zu User bereits im Session Storage gespeichert wurden
        const localStorageAuthUserString = localStorage.getItem(
          LocalStorageKey.AUTH_USER
        );

        if (!localStorageAuthUserString) {
          await User.getFullProfile({firebase: this, uid: user.uid}).then(
            (result) => {
              console.warn("user-Full-Profile read");
              authUser = {
                uid: user.uid,
                email: result.email,
                emailVerified: user.emailVerified,
                providerData: user.providerData,
                firstName: result.firstName,
                lastName: result.lastName,
                roles: result.roles,
                publicProfile: {
                  displayName: result.displayName,
                  motto: result.motto,
                  pictureSrc: result.pictureSrc,
                },
              };

              localStorage.setItem(
                LocalStorageKey.AUTH_USER,
                JSON.stringify(authUser)
              );
              callback(authUser);
            }
          );
        } else {
          // Prüfen ob sich was geändert hat
          const localStorageUser = JSON.parse(
            localStorageAuthUserString
          ) as AuthUser;
          if (user.emailVerified !== localStorageUser.emailVerified) {
            localStorageUser.emailVerified = user.emailVerified;
            localStorage.setItem(
              LocalStorageKey.AUTH_USER,
              JSON.stringify(localStorageUser)
            );
          }

          callback(localStorageUser);
        }
      } else {
        callback(null);
      }
    });
  };

  /* =====================================================================
  // Neuer User anlegen mit Mail/Passwort
  // ===================================================================== */
  createUserWithEmailAndPassword = ({
    email,
    password,
  }: CreateUserWithEmailAndPassword) => {
    return this.auth.createUserWithEmailAndPassword(
      email,
      password
    ) as Promise<app.auth.UserCredential>;
  };
  /* =====================================================================
  // Email Verifizierung versenden 
  // ===================================================================== */
  sendEmailVerification = () => {
    return this.auth.currentUser!.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT!,
    });
  };
  /* =====================================================================
  /**
   * Anmeldung mit Email und Password durchühren
   */
  signInWithEmailAndPassword = ({
    email,
    password,
  }: SignInWithEmailAndPassword) => {
    return this.auth.signInWithEmailAndPassword(
      email,
      password
    ) as Promise<app.auth.UserCredential>;
  };
  /* =====================================================================
  /**
   * Erneut anmelden
   */
  reauthenticateWithCredential = ({
    email,
    password,
  }: ReauthenticateWithCredential): Promise<app.auth.UserCredential> => {
    const credential = this.emailAuthProvider.credential(email, password);
    return this.auth.currentUser!.reauthenticateWithCredential(credential);
  };
  // Abmelden
  signOut = () => {
    return this.auth.signOut();
  };
  // E-Mail ändern
  emailChange = (email: string): Promise<void> => {
    return this.auth.currentUser!.updateEmail(email);
  };
  // Passwort zurücksetzen
  passwordReset = (email: string): Promise<void> => {
    return this.auth.sendPasswordResetEmail(email);
  };
  /* =====================================================================
  /**
   * Passwort ändern 
   * User muss angemeldet sein
   */
  passwordUpdate = ({password}: PasswordUpdate): Promise<void> => {
    this.analytics.logEvent(FirebaseAnalyticEvent.userChangedPassword);
    return this.auth.currentUser!.updatePassword(password);
  };
  /* =====================================================================
  /**
   * Password anhand Reset-Code zurücksetzen
   */
  confirmPasswordReset = ({
    resetCode,
    password,
  }: ConfirmPasswordReset): Promise<void> => {
    this.analytics.logEvent(FirebaseAnalyticEvent.userResetetPassword);
    return this.auth.confirmPasswordReset(resetCode, password);
  };
  // Mailadresse abfragen anhand Obj.Code (Passwort zurücksetzen)
  getEmailFromVerifyCode = (resetCode: string) => {
    return this.auth.verifyPasswordResetCode(resetCode) as Promise<string>;
  };
  // Referenz zu DB zurückgeben
  getDbReference = () => {
    return this.db;
  };
  getUser = () => {
    return this.auth.currentUser;
  };
  /* =====================================================================
  // Objektcode Verifizieren
  // ===================================================================== */
  applyActionCode = (objectCode) => {
    return this.auth.applyActionCode(objectCode);
  };
}
