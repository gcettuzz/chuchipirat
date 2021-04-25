import app from "firebase/app";
import Utils from "../Shared/utils.class";
import Stats, { STATS_FIELDS } from "../Shared/stats.class";
import Feed, { FEED_TYPE } from "../Shared/feed.class";
import * as ROLES from "../../constants/roles";
import * as TEXT from "../../constants/text";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";

export const PUBLIC_PROFILE_FIELDS = {
  NO_RECIPES: "noRecipes",
  NO_COMMENTS: "noComments",
  NO_EVENTS: "noEvents",
};

export default class User {
  /* =====================================================================
  // Konstruktor
  // ===================================================================== */
  constructor({ uid, firstName, lastName, email, lastLogin, noLogins }) {
    this.uid = uid;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    // this.memberSince = new Date(memberSince);
    this.lastLogin = new Date(lastLogin);
    this.noLogins = noLogins;

    // if (!pictureSrc) {
    //   this.pictureSrc = User._getGravatarHash(this.email);
    // }
  }

  /* =====================================================================
  // Zähler für öffentliches Profil hochzählen
  // ===================================================================== */
  static incrementPublicProfileField = async (firebase, uid, field, step) => {
    const publicProfileDoc = firebase.user_publicProfile(uid);

    await publicProfileDoc
      .update({
        [field]: firebase.fieldValue.increment(step),
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };

  // Alle User holen
  static async getAllUsers(firebase) {
    let userList = [];

    // await firebase.db.ref("users").once("value", (snapshot) => {
    //   const userObject = snapshot.val();

    //   Object.keys(userObject).forEach((key) => {
    //     let user = new User(
    //       key,
    //       userObject[key].firstName,
    //       userObject[key].lastName,
    //       userObject[key].email,
    //       userObject[key].memberSince,
    //       userObject[key].lastLogin,
    //       userObject[key].noLogins
    //     );
    //     userList.push(user);
    //   });
    // });

    // // Sortieren nach vornamen
    // userList = Utils.sortArrayWithObjectByText({list: userList, attributeName: "firstName"}, );
    return userList;
  }

  /* =====================================================================
  // Neuer User anlegen
  // ===================================================================== */
  static async createUser(
    firebase,
    uid,
    firstName,
    lastName,
    email,
    pictureSrc = ""
  ) {
    const userDoc = firebase.user(uid);
    const userPublicProfileDoc = firebase.user_publicProfile(uid);
    const userPublicSearchFieldsDoc = firebase.user_publicSearchFields(uid);

    const roles = [];
    roles.push(ROLES.BASIC);

    await userDoc
      .set({
        firstName: firstName,
        lastName: lastName,
        email: email.toLowerCase(),
        lastLogin: firebase.timestamp.fromDate(new Date()),
        noLogins: firebase.fieldValue.increment(1),
        roles: roles,
      })
      .then(async () => {
        // Öffentliches Profil anlegen
        await userPublicProfileDoc
          .set({
            displayName: firstName,
            memberSince: firebase.timestamp.fromDate(new Date()),
            motto: "",
            pictureSrc: pictureSrc,
          })
          .then(() => {
            // durchsuchbare Felder
            userPublicSearchFieldsDoc.set({
              email: email.toLowerCase(),
              uid: uid,
            });
          })
          .then(() => {
            // Statistik
            Stats.incrementStat({
              firebase: firebase,
              field: STATS_FIELDS.USERS,
            });
          })
          .then(() => {
            //Feed
            Feed.createFeedEntry({
              firebase: firebase,
              authUser: {
                uid: uid,
                publicProfile: {
                  displayName: firstName,
                  pictureSrc: pictureSrc,
                },
              },
              feedType: FEED_TYPE.USER_CREATED,
              objectUid: uid,
            });
          })
          .then(() => {
            // Google Analytics
            firebase.analytics.logEvent(FIREBASE_EVENTS.USER_CREATED);
          });
      });
  }
  /* =====================================================================
  // Update User bei Anmeldung durch Social-Login
  // ===================================================================== */
  //  Die allenfalls neuen Werte des Social-Provider aufnehmen
  static async createUpdateSocialUser(
    firebase,
    uid,
    firstName,
    lastName,
    email,
    pictureSrc = "",
    newUser = true
  ) {
    const userDoc = firebase.user(uid);
    const userPublicProfileDoc = firebase.user_publicProfile(uid);

    if (newUser) {
      await User.createUser(
        firebase,
        uid,
        firstName,
        lastName,
        email,
        pictureSrc
      );
    } else {
      // Bestehender User, updaten
      await userDoc
        .update({
          firstName: firstName,
          lastName: lastName,
          email: email,
          lastLogin: firebase.timestamp.fromDate(new Date()),
          noLogins: firebase.fieldValue.increment(1),
        })
        .then(async () => {
          // Öffentliches Profil updaten
          await userPublicProfileDoc.update({
            pictureSrc: pictureSrc,
          });
        });
    }
  }
  /* =====================================================================
  // Letztes Login updaten und Anzahl Logins hochzählen
  // ===================================================================== */
  static registerSignIn(firebase, uid) {
    const userDoc = firebase.user(uid);

    userDoc.update({
      lastLogin: firebase.timestamp.fromDate(new Date()),
      noLogins: firebase.fieldValue.increment(1),
    });
  }
  /* =====================================================================
  // User anhand der Mailadresse holen
  // ===================================================================== */
  static getUidByEmail = async (firebase, email) => {
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
  static getProfile = async ({ firebase, uid }) => {
    const profileDoc = firebase.user(uid);

    let profile = null;
    await profileDoc
      .get()
      .then((snapshot) => {
        let dbData = snapshot.data();
        profile = new User({
          uid: snapshot.id,
          firstName: dbData.firstName,
          lastName: dbData.lastName,
          email: dbData.email,
          lastLogin: dbData.lastLogin.toDate(),
          noLogins: dbData.noLogins,
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    return profile;
  };
  /* =====================================================================
  // Öffentliches Profil lesen
  // ===================================================================== */
  static getPublicProfile = async ({ firebase, uid }) => {
    const publicProfileDoc = firebase.user_publicProfile(uid);
    let publicProfile = {};

    await publicProfileDoc
      .get()
      .then((snapshot) => {
        publicProfile = snapshot.data();
        publicProfile.memberSince = publicProfile.memberSince.toDate();
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
  static getFullProfile = async ({ firebase, uid }) => {
    let fullUserProfile;
    await User.getProfile({ firebase: firebase, uid: uid })
      .then(async (profile) => {
        await User.getPublicProfile({ firebase: firebase, uid: uid })
          .then((publicProfile) => {
            fullUserProfile = { ...profile, ...publicProfile };
          })
          .catch((error) => {
            throw error;
          });
      })
      .catch((error) => {
        throw error;
      });
    return fullUserProfile;
  };
  /* =====================================================================
  // Daten prüfen
  // ===================================================================== */
  static checkUserProfileData(userProfile) {
    if (!userProfile.displayName) {
      throw new Error(TEXT.USER_PROFILE_ERROR_DISPLAYNAME_MISSING);
    }
  }
  /* =====================================================================
  // Profilwerte speichern
  // ===================================================================== */
  // Aber nur diejeinige, die der User auch selbst ändern kann.
  static saveFullProfile = async ({ firebase, userProfile }) => {
    let oldPublicProfile = null;
    let profileDoc = null;
    let publicProfileDoc = null;
    //  prüfen ob alles ok.
    try {
      User.checkUserProfileData(userProfile);
    } catch (error) {
      throw error;
    }

    // Alte werte holen um zu vergelichen ob die Cloud Function gestartet werden muss
    await User.getPublicProfile({ firebase: firebase, uid: userProfile.uid })
      .then((result) => {
        oldPublicProfile = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Die beiden Dokumente updaten
    profileDoc = firebase.user(userProfile.uid);
    await profileDoc
      .update({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    publicProfileDoc = firebase.user_publicProfile(userProfile.uid);
    await publicProfileDoc
      .update({
        displayName: userProfile.displayName,
        motto: userProfile.motto,
        pictureSrc: userProfile.pictureSrc,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    //CloudFunction starten wenn displayname oder pictureSrc geändert wurde
    if (oldPublicProfile.displayName !== userProfile.displayName) {
      // CloudFunction Triggern
      firebase.createTriggerDocForCloudFunctions({
        docRef: firebase.cloudFunctions_user_displayName().doc(),
        uid: userProfile.uid,
        newValue: userProfile.displayName,
      });
    } else if (oldPublicProfile.motto !== userProfile.motto) {
      firebase.createTriggerDocForCloudFunctions({
        docRef: firebase.cloudFunctions_user_motto().doc(),
        uid: userProfile.uid,
        newValue: userProfile.motto,
      });
    }
  };
  /* =====================================================================
  // Profilbild hochladen
  // ===================================================================== */
  static uploadPicture = async ({ firebase, file, userProfile, authUser }) => {
    const userPublicProfileDoc = firebase.user_publicProfile(authUser.uid);

    await firebase
      .uploadPicture({
        file: file,
        filename: authUser.uid,
        folder: firebase.user_folder(),
      })
      .then(async () => {
        await firebase.waitUntilFileDeleted({
          folder: firebase.user_folder(),
          uid: authUser.uid,
          originalFile: file,
        });
        await firebase.delay(2);
      })
      .then(async () => {
        // Redimensionierte Varianten holen
        await firebase
          .getPictureVariants({
            folder: firebase.user_folder(),
            uid: authUser.uid,
            sizes: [50, 600],
            oldDownloadUrl: userProfile.pictureSrc,
          })
          .then((fileVariants) => {
            fileVariants.forEach((fileVariant, counter) => {
              if (fileVariant.size === 50) {
                userProfile.pictureSrc = fileVariant.downloadURL;
              } else if (fileVariant.size === 600) {
                userProfile.pictureSrcFullSize = fileVariant.downloadURL;
              }
            });
          });
      })
      .then(() => {
        // Neuer Wert gleich speichern
        userPublicProfileDoc.update({
          pictureSrc: userProfile.pictureSrc,
          pictureSrcFullSize: userProfile.pictureSrcFullSize,
        });
      })
      .catch((error) => {
        throw error;
      });

    // CloudFunction Triggern
    firebase.createTriggerDocForCloudFunctions({
      docRef: firebase.cloudFunctions_user_pictureSrc().doc(),
      uid: userProfile.uid,
      newValue: userProfile.pictureSrc,
    });
    // Analytik
    firebase.analytics.logEvent(FIREBASE_EVENTS.UPLOAD_PICTRE, {
      foleder: "users",
    });

    return userProfile.pictureSrcFullSize;
  };

  /* =====================================================================
  /* =====================================================================
  /* =====================================================================
  /* =====================================================================
  // ===================================================================== */

  // Annmeldeprovider für die Emailadresse
  static async getSignInMethodsForEmail(firebase, email) {
    // const signInMethods = [];

    return await firebase.auth
      .fetchSignInMethodsForEmail(email)
      .then((activeSignInMethods) => {
        return activeSignInMethods;
        // signInMethods = activeSignInMethods;
      })
      .catch((error) => {
        throw error;
      });
  }

  // Gravatar Bildadresse für
  static _getGravatarHash(mail) {
    var md5 = require("md5");
    let gravatarHash = mail.trim();
    gravatarHash = gravatarHash.toLowerCase();

    gravatarHash = md5(gravatarHash);
    return "https://www.gravatar.com/avatar/" + gravatarHash + "?s=1000";
  }
  // Bild URL definieren anhand der Einstellungen
  static _getImageSrc(useGravatar, imageSrc, mail) {
    if (useGravatar) {
      return this._getGravatarHash(mail);
    } else {
      return imageSrc;
    }
  }
}
