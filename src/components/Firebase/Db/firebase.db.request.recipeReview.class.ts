import Firebase from "../firebase.class";
import {
  ValueObject,
  PrepareDataForDb,
  PrepareDataForApp,
  FirebaseDbSuper,
} from "./firebase.db.super.class";
import FirebaseDbRequest from "./firebase.db.request.class";
import {
  ERROR_WRONG_DB_CLASS,
  ERROR_NOT_IMPLEMENTED_YET,
} from "../../../constants/text";
import FirebaseDbRequestRecipeReviewActive from "./firebase.db.request.recipeReview.active.class";
import FirebaseDbRequestRecipeReviewClosed from "./firebase.db.request.recipeReview.closed.class";
import FirebaseDbRequestRecipeReviewLog from "./firebase.db.request.recipeReview.log.class";
import FirebaseDbRequestRecipeReviewNumberStorage from "./firebase.db.request.recipeReview.numberStorage.class";
import { ChangeLog, Comment } from "../../Request/request.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";

export class FirebaseDbRequestRecipeReview extends FirebaseDbSuper {
  firebase: Firebase;
  request: FirebaseDbRequest;
  active: FirebaseDbRequestRecipeReviewActive;
  closed: FirebaseDbRequestRecipeReviewClosed;
  log: FirebaseDbRequestRecipeReviewLog;
  numberStorage: FirebaseDbRequestRecipeReviewNumberStorage;

  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase, request: FirebaseDbRequest) {
    super();
    this.firebase = firebase;
    this.request = request;
    this.active = new FirebaseDbRequestRecipeReviewActive(firebase, this);
    this.closed = new FirebaseDbRequestRecipeReviewClosed(firebase, this);
    this.log = new FirebaseDbRequestRecipeReviewLog(firebase, this);
    this.numberStorage = new FirebaseDbRequestRecipeReviewNumberStorage(
      firebase,
      this
    );
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection(uids: string[]) {
    return this.firebase.db.collection("_requests/recipeReview");
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return this.firebase.db.collectionGroup("none");
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return this.firebase.db.doc(`_requests/recipeReview}`);
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    throw Error(ERROR_WRONG_DB_CLASS);
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({ value }: PrepareDataForDb<T>) {
    let changeLog = value.changeLog.map((entry: ChangeLog) => {
      return {
        // date: this.firebase.timestamp.fromDate(entry.date),
        date: entry.date,
        user: { uid: entry.user.uid, displayName: entry.user.displayName },
        action: entry.action,
      };
    });

    let comments = value.comments.map((comment: Comment) => {
      return {
        ...comment,
        // date: this.firebase.timestamp.fromDate(comment.date),
        date: comment.date,
      };
    });
    let resolveDate: Date = new Date();
    value.resolveDate
      ? (resolveDate = value.resolveDate)
      : (resolveDate = new Date("9999-12-31"));

    return {
      number: value.number,
      status: value.status,
      createDate: value.createDate,
      resolveDate: resolveDate,
      // createDate: this.firebase.timestamp.fromDate(value.createDate),
      // resolveDate: this.firebase.timestamp.fromDate(resolveDate),
      requestObject: value.requestObject,
      requestType: value.requestType,
      author: value.author,
      assignee: value.assignee,
      comments: comments,
      changeLog: changeLog,
    };
  }
  /* =====================================================================
  // Daten für App-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({ uid, value }: PrepareDataForApp) {
    // let comments = value?.comments.map((comment) => {
    //   return { ...comment, date: comment.date.toDate() };
    // });

    return {
      uid: uid,
      number: value.number,
      status: value.status,
      createDate: value.createDate,
      resolveDate: value.resolveDate,
      // createDate: value.createDate.toDate(),
      // resolveDate: value.resolveDate.toDate(),
      requestObject: value.requestObject,
      requestType: value.requestType,
      author: value.author,
      assignee: value.assignee,
      comments: value?.comments ? value?.comments : [],
      changeLog: value.changeLog ? value.changeLog : [],
    } as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}
export default FirebaseDbRequestRecipeReview;
