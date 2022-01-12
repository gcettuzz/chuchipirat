// import app from "firebase/app";
// import Utils from "../Shared/utils.class";
import UserPublic from "./user.public.class";
import Stats, { StatsField } from "../Shared/stats.class";
import Feed, { FeedType } from "../Shared/feed.class";
import Role from "../../constants/role";
import { IMAGES_SUFFIX } from "../Firebase/Storage/firebase.storage.super.class";

import Firebase from "../Firebase";

import * as TEXT from "../../constants/text";
import FirebaseAnalyticEvent from "../../constants/firebaseEvent";
import { AuthUser } from "../Firebase/Authentication/authUser.class";
import authUser from "../Firebase/__mocks__/authuser.mock";
import UserPublicProfile from "./user.public.profile.class";
import UserPublicSearchFields from "./user.public.searchFields.class";

/**
 * User Aufbau (kurz)
 * zu verwnden für Useranzeige im Kontext (Kommentar, Koch, usw)
 * @param userUid - UID des Users
 * @param displayName - Anzeigename des Users
 * @param picutreSrc - Bild-URL des Profilbildes
 * @param motto - Motto des Users
 */
export interface UserShort {
  userUid: string;
  displayName: string;
  pictureSrc: string;
  motto: string;
}
export interface UserFullProfile extends User, UserPublicProfile {}
/**
 * Schnittstelle für die IncrementPublicProfile
 * @param firebase - Referenz auf die DB
 * @param uid - UID des Users
 * @param field - Name des Feldes, dass erhöht/reduziert wird
 * @param step - Anzahl Punkte, die dazugezhält oder abgezogen werden
 */

interface CreateUser {
  firebase: Firebase;
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  pictureSrc?: string;
  emailVerified: boolean;
  providerData: object[];
  authUser: AuthUser;
}
interface RegisterSignIn {
  firebase: Firebase;
  uid: string;
}
interface GetUidByEmail {
  firebase: Firebase;
  email: string;
}
interface GetUser {
  firebase: Firebase;
  uid: string;
}
interface GetPublicProfile {
  firebase: Firebase;
  uid: string;
}
interface GetFullProfile {
  firebase: Firebase;
  uid: string;
}
interface SaveFullProfile {
  firebase: Firebase;
  userProfile: UserFullProfile;
}
interface UploadPicture {
  firebase: Firebase;
  file: object;
  userProfile: UserPublicProfile;
  authUser: AuthUser;
}
interface DeletePicture {
  uid: string;
  firebase: Firebase;
  authUser: AuthUser;
}
interface UpdateEmail {
  firebase: Firebase;
  uid: string;
  newEmail: string;
}

export default class User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  lastLogin: Date;
  noLogins: number;
  roles: Role[];
  /* =====================================================================
  // Konstruktor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.firstName = "";
    this.lastName = "";
    this.email = "";
    this.lastLogin = new Date();
    this.noLogins = 0;
    this.roles = [];
  }
  /* =====================================================================
    // Objekt erzeugen
    // ===================================================================== */
  static factory({
    uid,
    firstName,
    lastName,
    email,
    lastLogin,
    noLogins,
  }: User) {
    let user = new User();

    user.uid = uid;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.lastLogin = lastLogin;
    user.noLogins = noLogins;
    return user;
  }

  /* =====================================================================
  // Alle User holen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static async getAllUsers(firebase: Firebase) {
    let userList: User[] = [];
    //     // await firebase.db.ref("users").once("value", (snapshot) => {
    //     //   const userObject = snapshot.val();
    //     //   Object.keys(userObject).forEach((key) => {
    //     //     let user = new User(
    //     //       key,
    //     //       userObject[key].firstName,
    //     //       userObject[key].lastName,
    //     //       userObject[key].email,
    //     //       userObject[key].memberSince,
    //     //       userObject[key].lastLogin,
    //     //       userObject[key].noLogins
    //     //     );
    //     //     userList.push(user);
    //     //   });
    //     // });
    //     // // Sortieren nach vornamen
    //     // userList = Utils.sortArrayWithObjectByText({list: userList, attributeName: "firstName"}, );
    return userList;
  }
  /* =====================================================================
  // Neuer User anlegen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static async createUser({
    firebase,
    uid,
    firstName,
    lastName,
    email,
    pictureSrc = "",
    emailVerified,
    providerData,
    authUser,
  }: CreateUser) {
    let user: User = {
      uid: uid,
      firstName: firstName,
      lastName: lastName,
      email: email,
      lastLogin: new Date(),
      noLogins: 1,
      roles: [Role.basic],
    };

    let userPublicProfile: UserPublicProfile = {
      uid: uid,
      displayName: firstName,
      memberSince: new Date(),
      memberId: 0,
      motto: "",
      pictureSrc: "",
      pictureSrcFullSize: "",
      noComments: 0,
      noEvents: 0,
      noRecipes: 0,
    };

    let userPublicSearchFields: UserPublicSearchFields = {
      uid: uid,
      email: email,
    };

    await firebase.user
      .create({ value: user, authUser: authUser })
      .then(async () => {
        // Öffentliches Profil anlegen
        await firebase.user.public.profile
          .create<UserPublicProfile>({
            value: userPublicProfile,
            authUser: authUser,
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
      })
      .then(async () => {
        // Durchsuchbare Felder
        await firebase.user.public.searchFields.create({
          value: userPublicSearchFields,
          authUser: authUser,
        });
      })
      .then(async () => {
        // Statistik
        await firebase.stats.incrementField({
          uids: [""],
          field: StatsField.noUsers,
          value: 1,
        });
      })
      .then(async () => {
        //Feed
        Feed.createFeedEntry({
          firebase: firebase,
          authUser: authUser,
          feedType: FeedType.userCreated,
          objectUid: uid,
          objectName: authUser.publicProfile.displayName,
        });
      })
      .then(() => {
        // Google Analytics
        firebase.analytics.logEvent(FirebaseAnalyticEvent.userCreated);
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  //   /* =====================================================================
  //   // Update User bei Anmeldung durch Social-Login
  //   // ===================================================================== */
  //   //  Die allenfalls neuen Werte des Social-Provider aufnehmen
  //   static async createUpdateSocialUser(
  //     firebase,
  //     uid,
  //     firstName,
  //     lastName,
  //     email,
  //     pictureSrc = "",
  //     newUser = true
  //   ) {
  //     const userDoc = firebase.user(uid);
  //     const userPublicProfileDoc = firebase.user_publicProfile(uid);
  //     if (newUser) {
  //       await User.createUser(
  //         firebase,
  //         uid,
  //         firstName,
  //         lastName,
  //         email,
  //         pictureSrc
  //       );
  //     } else {
  //       // Bestehender User, updaten
  //       await userDoc
  //         .update({
  //           firstName: firstName,
  //           lastName: lastName,
  //           email: email,
  //           lastLogin: firebase.timestamp.fromDate(new Date()),
  //           noLogins: firebase.fieldValue.increment(1),
  //         })
  //         .then(async () => {
  //           // Öffentliches Profil updaten
  //           await userPublicProfileDoc.update({
  //             pictureSrc: pictureSrc,
  //           });
  //         });
  //     }
  //   }
  /* =====================================================================
  // Letztes Login updaten und Anzahl Logins hochzählen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static registerSignIn({ firebase, uid }: RegisterSignIn) {
    //FIXME:
    // const userDoc = firebase.userDocument(uid);
    // userDoc.update({
    //   lastLogin: firebase.timestamp.fromDate(new Date()),
    //   noLogins: firebase.fieldValue.increment(1),
    // });
  }
  /* =====================================================================
  // User anhand der Mailadresse holen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getUidByEmail = async ({ firebase, email }: GetUidByEmail) => {
    //FIXME:
    const profileSearchFields = firebase.public_CollectionGroup();
    let counter = 0;
    let uid = "";
    // Person anhand der Emailadresse suchen
    const snapshot = await profileSearchFields
      .where("email", "==", email.toLowerCase())
      .get()
      .catch((error) => {
        console.error(error);
        throw error;
      });
    snapshot.forEach((obj) => {
      uid = obj.data().uid;
      counter++;
    });
    if (counter > 1) {
      // Nicht Eindeutig
      throw new Error(TEXT.USER_NOT_IDENTIFIED_BY_EMAIL);
    }
    return uid;
  };
  /* =====================================================================
  // Profile holen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getUser = async ({ firebase, uid }: GetUser) => {
    let user = <User>{};
    firebase.user
      .read({ uids: [uid] })
      .then((result) => {
        user = result as User;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return user;
  };
  /* =====================================================================
  // Öffentliches Profil lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getPublicProfile = async ({ firebase, uid }: GetPublicProfile) => {
    let publicProfile = <UserPublicProfile>{};
    console.log("getPublicProfile");
    firebase.user.public.profile
      .read<UserPublicProfile>({ uids: [uid] })
      .then((result) => {
        publicProfile = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return publicProfile;
  };
  /* =====================================================================
  // Profil und Öffentliches Profil lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getFullProfile = async ({ firebase, uid }: GetFullProfile) => {
    let user = <User>{};
    let userPublicProfile = <UserPublicProfile>{};
    let userFullProfile = <UserFullProfile>{};
    await firebase.user
      .read<User>({ uids: [uid] })
      .then(async (result) => {
        user = result;
        await firebase.user.public.profile
          .read<UserPublicProfile>({ uids: [uid] })
          .then((result) => {
            userPublicProfile = result;
            userFullProfile = { ...user, ...userPublicProfile };
          });
      })
      .catch((error) => {
        throw error;
      });
    return userFullProfile;
  };
  /* =====================================================================
  // Daten prüfen
  // ===================================================================== */
  static checkUserProfileData(userProfile: UserPublicProfile) {
    if (!userProfile.displayName) {
      throw new Error(TEXT.USER_PROFILE_ERROR_DISPLAYNAME_MISSING);
    }
  }
  /* =====================================================================
  // Profilwerte speichern
  // ===================================================================== */
  // Aber nur diejeinige, die der User auch selbst ändern kann.
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static saveFullProfile = async ({
    firebase,
    userProfile,
  }: SaveFullProfile) => {
    try {
      User.checkUserProfileData(userProfile);
    } catch (error) {
      throw error;
    }

    // Alte werte holen um zu vergleichen ob die Cloud Function gestartet werden muss
    let actualPublicProfile = <UserPublicProfile>{};
    firebase.user.public.profile
      .read<UserPublicProfile>({ uids: [userProfile.uid] })
      .then((result) => {
        actualPublicProfile = result;
      })
      .catch((error) => {
        throw error;
      });

    firebase.user
      .updateFields({
        uids: [userProfile.uid],
        authUser: authUser,
        values: {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
        },
        updateChangeFields: false,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    firebase.user.public.profile
      .updateFields({
        uids: [userProfile.uid],
        authUser: authUser,
        values: {
          displayName: userProfile.displayName,
          motto: userProfile.motto,
          pictureSrc: userProfile.pictureSrc,
          pictureSrcFullSize: userProfile.pictureSrcFullSize,
        },
        updateChangeFields: false,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    //CloudFunction starten wenn displayname oder pictureSrc geändert wurde
    if (
      actualPublicProfile &&
      (actualPublicProfile.displayName !== userProfile.displayName ||
        actualPublicProfile.motto !== userProfile.motto)
    ) {
      if (actualPublicProfile.displayName !== userProfile.displayName) {
        firebase.cloudFunction.userDisplayName.triggerCloudFunction({
          values: {
            uid: userProfile.uid,
            newValue: userProfile.displayName,
          },
          authUser: authUser,
        });
      }
      if (actualPublicProfile.motto !== userProfile.motto) {
        firebase.cloudFunction.userMotto.triggerCloudFunction({
          values: {
            uid: userProfile.uid,
            newValue: userProfile.motto,
          },
          authUser: authUser,
        });
      }
      firebase.analytics.logEvent(FirebaseAnalyticEvent.cloudFunctionExecuted);
    }
  };
  /* =====================================================================
  // Profilbild hochladen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static uploadPicture = async ({
    firebase,
    file,
    userProfile,
    authUser,
  }: UploadPicture) => {
    //FIXME: auf neue Storage-Klasse umbiegen
    // await firebase
    //   .uploadPicture({
    //     file: file,
    //     filename: authUser.uid,
    //     folder: firebase.user_folder(),
    //   })
    //   .then(async () => {
    //     // Redimensionierte Varianten holen
    //     await firebase
    //       .getPictureVariants({
    //         folder: firebase.user_folder(),
    //         uid: authUser.uid,
    //         sizes: [IMAGES_SUFFIX.size50.size, IMAGES_SUFFIX.size600.size],
    //         oldDownloadUrl: userProfile.pictureSrc,
    //       })
    //       .then((fileVariants) => {
    //         fileVariants.forEach((fileVariant, counter) => {
    //           if (fileVariant.size === IMAGES_SUFFIX.size50.size) {
    //             userProfile.pictureSrc = fileVariant.downloadURL;
    //           } else if (fileVariant.size === IMAGES_SUFFIX.size600.size) {
    //             userProfile.pictureSrcFullSize = fileVariant.downloadURL;
    //           }
    //         });
    //       });
    //   })
    //   .then(() => {
    //     firebase.user.public.profile.updateFields({
    //       uids: [userProfile.uid],
    //       authUser: authUser,
    //       values: {
    //         pictureSrc: userProfile.pictureSrc,
    //         pictureSrcFullSize: userProfile.pictureSrcFullSize,
    //       },
    //       updateChangeFields: false,
    //     });
    //   })
    //   .then(() => {
    //     // CloudFunction Triggern
    //     firebase.cloudFunction.userPictureSrc.triggerCloudFunction({
    //       values: {
    //         uid: userProfile.uid,
    //         pictureSrc: userProfile.pictureSrc,
    //         pictureSrcFullSize: userProfile.pictureSrcFullSize,
    //       },
    //       authUser: authUser,
    //     });
    //   })
    //   .catch((error) => {
    //     throw error;
    //   });
    // // Analytik
    // firebase.analytics.logEvent(FirebaseAnalyticEvent.uploadPicture, {
    //   folder: "users",
    // });
    // firebase.analytics.logEvent(FirebaseAnalyticEvent.cloudFunctionExecuted);
    return {
      pictureSrc: userProfile.pictureSrc,
      pictureSrcFullSize: userProfile.pictureSrcFullSize,
    };
  };
  /* =====================================================================
  // Bild löschen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static deletePicture = async ({ uid, firebase, authUser }: DeletePicture) => {
    firebase
      .deletePicture({
        folder: firebase.user_folder(),
        filename: `${authUser.uid}${IMAGES_SUFFIX.size50.suffix}`,
      })
      .catch((error) => {
        throw error;
      });
    firebase
      .deletePicture({
        folder: firebase.user_folder(),
        filename: `${authUser.uid}${IMAGES_SUFFIX.size600.suffix}`,
      })
      .catch((error) => {
        throw error;
      });
    firebase.user.public.profile
      .updateFields({
        uids: [authUser.uid],
        authUser: authUser,
        values: { pictureSrc: "", pictureSrcFullSize: "" },
        updateChangeFields: false,
      })
      .catch((error) => {
        throw error;
      });
    // CloudFunction Triggern
    firebase.cloudFunction.userPictureSrc.triggerCloudFunction({
      values: { uid: uid, pictureSrc: "", pictureSrcFullSize: "" },
      authUser: authUser,
    });

    // Analytik
    firebase.analytics.logEvent(FirebaseAnalyticEvent.deletePicture, {
      folder: "user",
    });
    firebase.analytics.logEvent(FirebaseAnalyticEvent.cloudFunctionExecuted);
  };
  /* =====================================================================
  // E-Mailadresse updaten
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static updateEmail = async ({ firebase, uid, newEmail }: UpdateEmail) => {
    // Email muss im Profil und in den Searchfiedls angepasst werden
    firebase.user
      .updateFields({
        uids: [uid],
        authUser: authUser,
        values: { emailvalue: newEmail },
        updateChangeFields: false,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    firebase.user.public.searchFields
      .updateFields({
        uids: [uid],
        authUser: authUser,
        values: { emailvalue: newEmail },
        updateChangeFields: false,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    firebase.analytics.logEvent(FirebaseAnalyticEvent.userChangedEmail);
  };
}
