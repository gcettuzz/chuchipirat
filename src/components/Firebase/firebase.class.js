import Utils from "../Shared/utils.class";
import * as TEXT from "../../constants/text";
import * as LOCAL_STORAGE from "../../constants/localStorage";

import app from "firebase/app";
import "firebase/auth";

// import "firebase/database";
import "firebase/analytics";
import "firebase/performance";
import "firebase/storage";
import "firebase/firestore";
import "firebase/functions";

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
// Suffix von redimensionierten Files
export const IMAGES_SUFFIX = {
  size50: { size: 50, suffix: "_50x50.jpeg" },
  size200: { size: 200, suffix: "_200x200.jpeg" },
  size300: { size: 300, suffix: "_300x300.jpeg" },
  size600: { size: 600, suffix: "_600x600.jpeg" },
  size1000: { size: 1000, suffix: "_1000x1000.jpeg" },
};

/* ===================================================================
// ============================= Firebase ============================
// =================================================================== */
class Firebase {
  /* =====================================================================
  // Konstruktor
  // ===================================================================== */
  constructor() {
    let firebase = app.initializeApp(config);

    this.emailAuthProvider = app.auth.EmailAuthProvider;

    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.analytics = firebase.analytics();
    this.performance = firebase.performance();
    this.storage = firebase.storage();
    this.functions = firebase.functions("europe-west6");
    // this.googleProvider = new app.auth.GoogleAuthProvider();
    // this.facebookProvider = new app.auth.FacebookAuthProvider();

    // Helper
    this.timestamp = app.firestore.Timestamp;
    this.fieldValue = app.firestore.FieldValue;
    this.taskEvent = app.storage.TaskEvent;
  }
  /* =====================================================================
  // 
  // ===================================================================== */
  // *** Merge Auth and DB User API *** //
  onAuthUserListener = (next, fallback) => {
    let publicProfile;
    let dbUser;
    let counter = 0;

    return this.auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // Prüfen ob Infos zu User bereits im Session Storage gepseichert wurden
        let localStorageAuthUser = JSON.parse(
          localStorage.getItem(LOCAL_STORAGE.AUTH_USER)
        );

        if (!localStorageAuthUser) {
          await this.user(authUser.uid)
            .get()
            .then((snapshot) => {
              dbUser = snapshot.data();
              // default empty roles
              if (!dbUser && !dbUser.roles) {
                dbUser.roles = [];
              }
            })
            .then(async () => {
              // Public Profile holen (oder warten bis zur Verfügung)
              do {
                await this.user_publicProfile(authUser.uid)
                  .get()
                  .then(async (snapshot) => {
                    if (!snapshot) {
                      await this.delay(1);
                    } else {
                      publicProfile = snapshot.data();
                    }
                  });

                counter++;
              } while (!publicProfile === false && counter <= 10);
            })
            .then(() => {
              // merge auth and db user
              authUser = {
                uid: authUser.uid,
                email: authUser.email,
                emailVerified: authUser.emailVerified,
                providerData: authUser.providerData,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                roles: dbUser.roles,
                publicProfile: {
                  motto: publicProfile?.motto,
                  displayName: publicProfile?.displayName,
                  pictureSrc: publicProfile?.pictureSrc,
                },
              };
              next(authUser);
            });
        } else {
          authUser = localStorageAuthUser;
          next(authUser);
        }
      } else {
        fallback();
      }
    });
  };

  /* =====================================================================
  // Neuer User anlegen mit Mail/Passwort
  // ===================================================================== */
  createUserWithEmailAndPassword = (email, password) => {
    return this.auth.createUserWithEmailAndPassword(email, password);
  };
  /* =====================================================================
  // Email Verifizierung versenden 
  // ===================================================================== */
  sendEmailVerification = () => {
    return this.auth.currentUser.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT,
    });
  };
  // Anmelden mit Mail/Passwort
  signInWithEmailAndPassword = (email, password) => {
    return this.auth.signInWithEmailAndPassword(email, password);
  };
  // Erneut anmelden
  reauthenticateWithCredential = ({ email, password }) => {
    let credential = this.emailAuthProvider.credential(email, password);
    return this.auth.currentUser.reauthenticateWithCredential(credential);
  };
  // mit Google Account anmelden
  signInWithGoogle = () => {
    return this.auth.signInWithPopup(this.googleProvider);
  };
  signInWithFacebook = () => {
    return this.auth.signInWithPopup(this.facebookProvider);
  };
  // Abmelden
  signOut = () => {
    return this.auth.signOut();
  };
  // E-Mail ändern
  emailChange = (email) => {
    return this.auth.currentUser.updateEmail(email);
  };
  // Passwort zurücksetzen
  passwordReset = (email) => {
    return this.auth.sendPasswordResetEmail(email);
  };
  //Passwort ändern --> User muss angemeldet sein
  passwordUpdate = (password) => {
    return this.auth.currentUser.updatePassword(password);
  };
  // Passwort anhand resetCode zurücksetzen
  confirmPasswordReset = (resetCode, password) => {
    return this.auth.confirmPasswordReset(resetCode, password);
  };
  // Mailadresse abfragen anhand Obj.Code (Passwort zurücksetzen)
  getEmailFromVerifyCode = (resetCode) => {
    return this.auth.verifyPasswordResetCode(resetCode);
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
  /* =====================================================================
  // Alle Referenzen zu den Collections in Firebase
  // ===================================================================== */
  // Einzelner User
  user = (uid) => this.db.doc(`users/${uid}`);
  // Alle User
  users = () => this.db.collection("users");
  // Öffentliches Profil User
  user_publicProfile = (uid) => this.db.doc(`users/${uid}/public/profile`);
  // Öffentliche durchsuchbare Felder
  user_publicSearchFields = (uid) =>
    this.db.doc(`users/${uid}/public/searchFields`);
  // Sammlung aller Dokumente mit Name SearchFields
  public_CollectionGroup = () => this.db.collectionGroup("public");
  // Statistik
  stats = () => this.db.doc("stats/counter");
  // Feeds
  feeds = () => this.db.collection("feeds");
  // Einheiten
  units = () => this.db.doc("masterData/units");
  // Umrechnung Einheiten Basic
  unitConversionBasic = () => this.db.doc("masterData/unitConversionBasic");
  // Umrechnung Einheiten Produkt
  unitConversionProducts = () =>
    this.db.doc("masterData/unitConversionProducts");
  // Produkte
  products = () => this.db.doc("masterData/products");
  // Abteilungen
  departments = () => this.db.doc("masterData/departments");
  // Rezept
  recipe = (uid) => this.db.doc(`recipes/${uid}`);
  // Übersicht aller Rezepte
  allRecipes = () => this.db.doc(`recipes/000_allRecipes`);
  // Rezepte
  recipes = () => this.db.collection("recipes");
  // alle Details-Dokumente zum Rezept
  recipe_details_collectionGroup = () => this.db.collectionGroup("details");
  // Details zu Rezept
  recipe_details = (uid) => this.db.doc(`recipes/${uid}/details/details`);
  // Rezept Bewertungen
  recipe_ratings = (uid) => this.db.collection(`recipes/${uid}/ratings/`);
  // Rezept Bewertungen User
  recipe_ratings_user = (uid, userUid) =>
    this.db.doc(`recipes/${uid}/ratings/${userUid}`);
  // Rezept Kommentare
  recipe_comments = (uid) => this.db.collection(`recipes/${uid}/comments/`);
  // Events
  events = () => this.db.collection("events");
  // Event
  event = (uid) => this.db.doc(`events/${uid}`);
  // Menuplan
  menuplan = (uid) => this.db.doc(`events/${uid}/docs/menuplan`);
  // alle Dokumente Menuplan
  event_docs_collectionGroup = () => this.db.collectionGroup("docs");
  // Postizettel
  shoppingList = (uid) => this.db.doc(`events/${uid}/docs/shoppingList`);
  // Aktuelle Version
  actualVersion = () => this.db.doc("_environment/version");
  /* =====================================================================
  // Cloud Functions Speicherorte
  // ===================================================================== */
  // Wartebereich für CloudFunctions User
  cloudFunctions_user_pictureSrc = () =>
    this.db.collection("_cloudFunctions/waitingArea/user_pictureSrc");
  cloudFunctions_user_displayName = () =>
    this.db.collection("_cloudFunctions/waitingArea/user_displayName");
  cloudFunctions_user_motto = () =>
    this.db.collection("_cloudFunctions/waitingArea/user_motto");
  cloudFunctions_productUpdate = () =>
    this.db.collection("_cloudFunctions/waitingArea/productUpdate");
  cloudFunctions_recipeUpdate = () =>
    this.db.collection("_cloudFunctions/waitingArea/recipeUpdate");
  cloudFunctions_productTrace = () =>
    this.db.collection("_cloudFunctions/waitingArea/productTrace");
  cloudFunctions_recipeTrace = () =>
    this.db.collection("_cloudFunctions/waitingArea/recipeTrace");
  cloudFunctions_mergeProducts = () =>
    this.db.collection("_cloudFunctions/waitingArea/mergeProducts");
  /* =====================================================================
  // Alle Referenzen zu den Bildern
  // ===================================================================== */

  recipe_image = (filenName) => this.storage.ref(`recipes/${filenName}`);
  event_image = (filenName) => this.storage.ref(`events/${filenName}`);
  event_folder = () => "events/";
  recipe_folder = () => "recipes/";
  user_folder = () => "users/";

  /* =====================================================================
  // Bild hochladen
  // ===================================================================== */
  async uploadPicture({ file, filename = Utils.generateUid(20), folder }) {
    filename = filename + "." + Utils.getFileSuffix(file.name);

    let storageRef = this.storage.ref();

    // Create the file metadata
    var metadata = {
      contentType: "image/jpeg",
    };
    return new Promise(function (resolve, reject) {
      let uploadTask = storageRef.child(folder + filename).put(file, metadata);

      uploadTask.on(
        "state_changed",
        function (snapshot) {
          var progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        function error(error) {
          console.error(error);
          reject();
        },
        function complete() {
          // Bilder werden redimensioniert... Bild suchen, die
          uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
            resolve(downloadURL);
          });
        }
      );
    });
  }
  /* =====================================================================
  // Filevarianten mit Downloadlink holen
  // ===================================================================== */
  async getPictureVariants({ folder, uid, sizes = [], oldDownloadUrl }) {
    let counter = 0;
    let fileFound = false;
    let fileVariants = [];
    let docRefs = [];
    let results = [];

    // Info: die oldDownloadUrl muss auch der ersten Size entsprechen
    // sonst funtkioniert das nicht

    if (sizes.length === 0) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }
    // Warten bis das erste Bild vorhanden ist
    let checkFile = `${folder}${uid}${Firebase.getImageFileSuffix(sizes[0])}`;
    do {
      await this.storage
        .ref(checkFile)
        .getDownloadURL()
        .then(async (result) => {
          if (result === oldDownloadUrl) {
            // Wenn das File ersetzt wird, kann das etwas dauern
            // darum muss überprüft werden, dass der neue Down-
            // loadlink nicht der selbe ist
            fileFound = false;
            await this.delay(1);
          } else {
            // gefunden
            fileFound = true;
          }
        })
        .catch(async () => {
          await this.delay(1);
          counter++;
        });
    } while (fileFound === false && counter <= 10);

    sizes.forEach((size) => {
      docRefs.push(
        this.storage
          .ref(`${folder}${uid}${Firebase.getImageFileSuffix(size)}`)
          .getDownloadURL()
      );
    });

    results = await Promise.all(docRefs);

    results.forEach((result) => {
      let sizeType = Object.values(IMAGES_SUFFIX).find((sizeType) =>
        result.includes(sizeType.suffix)
      );
      fileVariants.push({ size: sizeType.size, downloadURL: result });
    });

    return fileVariants;
  }
  /* =====================================================================
  // Anhand der Grösse den File Zuffix holen
  // ===================================================================== */
  static getImageFileSuffix = (size) => {
    return Object.values(IMAGES_SUFFIX).find(
      (sizeType) => sizeType.size === size
    ).suffix;
  };

  /* =====================================================================
  // Warten bis File gelöscht wurde
  // ===================================================================== */
  waitUntilFileDeleted({ folder, uid, originalFile }) {
    let fileDeleted = false;
    let counter = 0;
    let originalRef = this.storage.ref(
      `${folder}${uid}.${Utils.getFileSuffix(originalFile.name)}`
    );
    return new Promise(async function (resolve, reject) {
      do {
        await originalRef
          .getDownloadURL()
          .then(async () => {
            fileDeleted = false;
            await this.delay(1);
          })
          .catch((error) => {
            fileDeleted = true;
          });

        counter++;
      } while (fileDeleted === false && counter <= 10);
      resolve(true);
    });
  }
  /* =====================================================================
  // Bild löschen
  // ===================================================================== */
  deletePicture = async ({ folder, filename }) => {
    const imageRef = this.storage.ref(`${folder}${filename}`);

    await imageRef.delete().catch((error) => {
      throw error;
    });
  };
  /* =====================================================================
  // Warte-Funktion
  // ===================================================================== */
  delay = (seconds) => {
    return new Promise(function (resolve) {
      setTimeout(resolve, seconds * 1000);
    });
  };
  /* =====================================================================
  // Trigger-File für CloudFunctions erstellen
  // ===================================================================== */
  createTriggerDocForCloudFunctions = async ({
    docRef,
    uid,
    newValue,
    newValue2 = "",
  }) => {
    if (!docRef || !uid) {
      throw new Error(TEXT.ERROR_PARAMETER_NOT_PASSED);
    }
    await docRef
      .set({
        uid: uid,
        newValue: newValue,
        newValue2: newValue2,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
}

export default Firebase;
