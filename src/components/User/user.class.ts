// import app from "firebase/app";
// import Utils from "../Shared/utils.class";
// import {StatsField} from "../Shared/stats.class";
// import Feed, {FeedType} from "../Shared/feed.class";
import {Role} from "../../constants/roles";

import Firebase from "../Firebase/firebase.class";

import {
  USER_NOT_IDENTIFIED_BY_EMAIL as TEXT_USER_NOT_IDENTIFIED_BY_EMAIL,
  USER_PROFILE_ERROR_DISPLAYNAME_MISSING as TEXT_USER_PROFILE_ERROR_DISPLAYNAME_MISSING,
  NO_USER_WITH_THIS_EMAIL as TEXT_NO_USER_WITH_THIS_EMAIL,
} from "../../constants/text";
import FirebaseAnalyticEvent from "../../constants/firebaseEvent";
import {AuthUser} from "../Firebase/Authentication/authUser.class";
import UserPublicProfile from "./user.public.profile.class";
import UserPublicSearchFields from "./user.public.searchFields.class";
import {Operator, SortOrder} from "../Firebase/Db/firebase.db.super.class";
import {StatsField} from "../Shared/stats.class";
import Feed, {FeedType} from "../Shared/feed.class";
import {Picture} from "../Shared/global.interface";
import {
  IMAGES_SUFFIX,
  ImageSize,
} from "../Firebase/Storage/firebase.storage.super.class";

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

export interface UserOverviewStructure {
  firstName: User["firstName"];
  lastName: User["lastName"];
  displayName: UserPublicProfile["displayName"];
  email: User["email"];
  memberId: UserPublicProfile["memberId"];
  memberSince: Date;
  uid?: User["uid"];
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
}
interface RegisterSignIn {
  firebase: Firebase;
  authUser: AuthUser;
}
interface GetUidByEmail {
  firebase: Firebase;
  email: string;
}
interface GetUser {
  firebase: Firebase;
  uid: string;
}
interface GetAllUsers {
  firebase: Firebase;
}

interface GetUsersOverview {
  firebase: Firebase;
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
  authUser: AuthUser;
  localPicture?: File | null;
}
interface UploadPicture {
  firebase: Firebase;
  file: File;
  authUser: AuthUser;
}
interface DeletePicture {
  firebase: Firebase;
  authUser: AuthUser;
}
interface UpdateEmail {
  firebase: Firebase;
  newEmail: string;
  authUser: AuthUser;
}
interface UpdateRoles {
  firebase: Firebase;
  userUid: User["uid"];
  newRoles: User["roles"];
  authUser: AuthUser;
}
// interface SetDisabled {
//   firebase: Firebase;
//   userUid: User["uid"];
//   disabled: boolean;
//   authUser: AuthUser;
// }

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
  static factory({uid, firstName, lastName, email, lastLogin, noLogins}: User) {
    const user = new User();

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
  static async getAllUsers({firebase}: GetAllUsers) {
    let userList: User[] = [];

    await firebase.user
      .readCollection<User>({
        uids: [""],
        orderBy: {field: "firstName", sortOrder: SortOrder.desc},
        ignoreCache: true,
      })
      .then((result) => {
        userList = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

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
  }: CreateUser) {
    const user = new User();
    user.uid = uid;
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.noLogins = 0;
    user.roles = [Role.basic];

    // wird hier erzeugt. User wurde gerade angelegt. Der AuthUser existiert noch nicht richtig
    const authUser = new AuthUser();
    authUser.email = user.email;
    authUser.uid = user.uid;
    authUser.firstName = user.firstName;
    authUser.lastName = user.lastName;
    authUser.roles = user.roles;
    authUser.publicProfile.displayName = firstName;

    const userPublicProfile = new UserPublicProfile();
    userPublicProfile.uid = uid;
    userPublicProfile.displayName = firstName;
    userPublicProfile.memberSince = new Date();

    const userPublicSearchFields = new UserPublicSearchFields();
    userPublicSearchFields.uid = uid;
    userPublicSearchFields.email = email;

    await firebase.user
      .set({uids: [user.uid], value: user, authUser: {} as AuthUser})
      .then(async () => {
        // Öffentliches Profil anlegen
        await firebase.user.public.profile
          .set<UserPublicProfile>({
            value: userPublicProfile,
            authUser: authUser,
            uids: [user.uid],
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
      })
      .then(async () => {
        // Durchsuchbare Felder
        await firebase.user.public.searchFields.set({
          value: userPublicSearchFields,
          authUser: authUser,
          uids: [user.uid],
        });
      })
      .then(async () => {
        // Statistik
        await firebase.stats.counter.incrementField({
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
          feedVisibility: Role.basic,
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
  /* =====================================================================
  // Übersicht aller User holen
  // ===================================================================== */
  static getUsersOverview = async ({firebase}: GetUsersOverview) => {
    const userOverview = [] as UserOverviewStructure[];

    await firebase.user.short.read({uids: []}).then((result) => {
      Object.keys(result).forEach((key) => {
        userOverview.push({uid: key, ...result[key]});
      });
    });

    return userOverview;
  };

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
  static registerSignIn({firebase, authUser}: RegisterSignIn) {
    firebase.user.updateFields({
      uids: [authUser.uid],
      values: {
        lastLogin: firebase.timestamp.fromDate(new Date()),
        noLogins: firebase.fieldValue.increment(1),
      },
      authUser: authUser,
    });
  }
  /* =====================================================================
  // User anhand der Mailadresse holen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getUidByEmail = async ({firebase, email}: GetUidByEmail) => {
    let userUid = "";
    await firebase.user.public.searchFields
      .readCollectionGroup<UserPublicSearchFields>({
        where: [
          {
            field: "email",
            operator: Operator.EQ,
            value: email.toLocaleLowerCase().trim(),
          },
        ],
      })
      .then((result) => {
        if (result.length == 1) {
          userUid = result[0].uid;
        } else if (result.length == 0) {
          throw new Error(TEXT_NO_USER_WITH_THIS_EMAIL);
        } else {
          // Nicht Eindeutig
          throw new Error(TEXT_USER_NOT_IDENTIFIED_BY_EMAIL);
        }
      });
    return userUid;
  };
  /* =====================================================================
  // Profile holen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getUser = async ({firebase, uid}: GetUser) => {
    return await firebase.user
      .read({uids: [uid]})
      .then((result) => {
        return result as User;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  /* =====================================================================
  // Öffentliches Profil lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getPublicProfile = async ({firebase, uid}: GetPublicProfile) => {
    let publicProfile = {} as UserPublicProfile;

    return await firebase.user.public.profile
      .read<UserPublicProfile>({uids: [uid]})
      .then((result) => {
        publicProfile = result;
        publicProfile.uid = uid;
        return publicProfile;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  /* =====================================================================
  // Profil und Öffentliches Profil lesen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static getFullProfile = async ({firebase, uid}: GetFullProfile) => {
    let user = <User>{};
    let userPublicProfile: UserPublicProfile;
    let userFullProfile: UserFullProfile;

    return await firebase.user
      .read<User>({uids: [uid]})
      .then(async (result) => {
        user = result;
      })
      .then(async () => {
        await firebase.user.public.profile
          .read<UserPublicProfile>({
            uids: [uid],
          })
          .then((result) => (userPublicProfile = result));
      })
      .then(() => {
        userFullProfile = {...userPublicProfile, ...user};
        return userFullProfile;
      })
      .catch((error: Error) => {
        throw error;
      });
  };
  /* =====================================================================
  // Daten prüfen
  // ===================================================================== */
  static checkUserProfileData(userProfile: UserPublicProfile) {
    if (!userProfile.displayName) {
      throw new Error(TEXT_USER_PROFILE_ERROR_DISPLAYNAME_MISSING);
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
    localPicture,
    authUser,
  }: SaveFullProfile) => {
    let pictureSrc = userProfile.pictureSrc;

    if (userProfile.displayName == "") {
      userProfile.displayName = userProfile.firstName;
    }

    // Alte werte holen um zu vergleichen ob die Cloud Function gestartet werden muss
    let actualPublicProfile = <UserPublicProfile>{};
    await firebase.user.public.profile
      .read<UserPublicProfile>({uids: [userProfile.uid]})
      .then((result) => {
        actualPublicProfile = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Bild hochladen wenn vorhanden
    if (localPicture instanceof File) {
      if (userProfile.pictureSrc) {
        // Vorhandenes Bild löschen
        await User.deletePicture({firebase: firebase, authUser: authUser});
      }

      await User.uploadPicture({
        firebase: firebase,
        file: localPicture,
        authUser: authUser,
      }).then((result) => {
        pictureSrc = result;
      });
    }

    await firebase.user
      .updateFields({
        uids: [userProfile.uid],
        authUser: authUser,
        values: {
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
        },
        updateChangeFields: false,
      })
      .then(async () => {
        // Öffentliche Felder updaten
        await firebase.user.public.profile
          .updateFields({
            uids: [userProfile.uid],
            authUser: authUser,
            values: {
              displayName: userProfile.displayName,
              motto: userProfile.motto,
              pictureSrc: pictureSrc,
            },
            updateChangeFields: false,
          })
          .catch((error) => {
            console.error(error);
            throw error;
          });
      })
      .catch((error) => {
        throw error;
      });

    //CloudFunction starten wenn displayname oder pictureSrc geändert wurde
    if (
      actualPublicProfile &&
      (actualPublicProfile.displayName !== userProfile.displayName ||
        actualPublicProfile.motto !== userProfile.motto)
    ) {
      if (actualPublicProfile.displayName !== userProfile.displayName) {
        firebase.cloudFunction.updateUserDisplayName.triggerCloudFunction({
          values: {
            uid: userProfile.uid,
            newDisplayName: userProfile.displayName,
          },
          authUser: authUser,
        });
      }
      if (actualPublicProfile.motto !== userProfile.motto) {
        firebase.cloudFunction.updateUserMotto.triggerCloudFunction({
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
  static uploadPicture = async ({firebase, file, authUser}: UploadPicture) => {
    const pictureSrc: Picture = {normalSize: "", smallSize: "", fullSize: ""};

    await firebase.fileStore.users
      .uploadFile({file: file, filename: authUser.uid})
      .then(async (result) => {
        // Redimensionierte Varianten holen
        await firebase.fileStore.users
          .getPictureVariants({
            uid: authUser.uid,
            sizes: [ImageSize.size_600, ImageSize.size_50],
            oldDownloadUrl: result,
          })
          .then((result) => {
            // Wir wollen nur eine Grösse
            result.forEach((size) => {
              if (size.size === ImageSize.size_50) {
                pictureSrc.smallSize = size.downloadURL;
              } else if (size.size === ImageSize.size_600) {
                pictureSrc.normalSize = size.downloadURL;
              }
            });
          });
      });

    return pictureSrc;
  };
  /* =====================================================================
  // Bild löschen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static deletePicture = async ({firebase, authUser}: DeletePicture) => {
    await firebase.fileStore.users
      .deleteFile(`${authUser.uid}${IMAGES_SUFFIX.size50.suffix}`)
      .then(async () => {
        firebase.fileStore.users
          .deleteFile(`${authUser.uid}${IMAGES_SUFFIX.size600.suffix}`)
          .catch((error) => {
            console.error(error);
            throw error;
          });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // CloudFunction Triggern
    firebase.cloudFunction.updateUserPictureSrc.triggerCloudFunction({
      values: {
        uid: authUser.uid,
        pictureSrc: {smallSize: "", normalSize: "", fullSize: ""} as Picture,
      },
      authUser: authUser,
    });
  };
  /* =====================================================================
  // E-Mailadresse updaten
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static updateEmail = async ({firebase, newEmail, authUser}: UpdateEmail) => {
    // Email muss im Profil und in den Searchfiedls angepasst werden
    firebase.user
      .updateFields({
        uids: [authUser.uid],
        authUser: authUser,
        values: {emailvalue: newEmail},
        updateChangeFields: false,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    firebase.user.public.searchFields
      .updateFields({
        uids: [authUser.uid],
        authUser: authUser,
        values: {emailvalue: newEmail},
        updateChangeFields: false,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    firebase.analytics.logEvent(FirebaseAnalyticEvent.userChangedEmail);
  };
  /* =====================================================================
  // Berechtigungen aktualiseiren
  // ===================================================================== */
  static updateRoles = async ({
    firebase,
    userUid,
    newRoles,
    authUser,
  }: UpdateRoles) => {
    firebase.user
      .updateFields({
        uids: [userUid],
        values: {roles: newRoles},
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  /* =====================================================================
  // User aktiv/oder inaktiv schalten
  // ===================================================================== */
  // static setDisabledState = async ({
  //   firebase,
  //   userUid,
  //   disabled,
  //   authUser,
  // }: SetDisabled) => {
  //   firebase.auth
  //     .updateUser(userUid, {disabled: disabled})
  //     .then(() => {
  //       // Auf dem Datensatz nachführen
  //       firebase.user.updateFields({
  //         uids: [userUid],
  //         values: {disabled: disabled},
  //         authUser: authUser,
  //       });
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //       throw error;
  //     });
  // };
}
