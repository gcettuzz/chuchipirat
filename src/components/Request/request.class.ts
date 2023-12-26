import Firebase from "../Firebase/firebase.class";
import { AuthUser } from "../Firebase/Authentication/authUser.class";
import RequestRecipeReview from "./request.recipeReview.class";
import {
  STATUS_NAME as TEXT_STATUS_NAME,
  REQUEST_TYPE as TEXT_REQUEST_TYPE,
} from "../../constants/text";

import {
  SortOrder,
  Operator,
  ValueObject,
} from "../Firebase/Db/firebase.db.super.class";

import FirebaseDbRequestRecipeReview from "../Firebase/Db/firebase.db.request.recipeReview.class";
import Role from "../../constants/roles";
import MailTemplate from "../../constants/mailTemplates";

export interface GetActiveRequests {
  firebase: Firebase;
  authUser: AuthUser;
}

export interface GetAllClosedRequests {
  firebase: Firebase;
  authUser: AuthUser;
}

export interface UpdateStatus {
  firebase: Firebase;
  request: Request;
  nextStatus: RequestStatus;
  authUser: AuthUser;
}

interface GetAllActiveRequests {
  firebase: Firebase;
  authUser: AuthUser;
}

interface CreateRequest<T> {
  firebase: Firebase;
  requestObject: T;
  messageForReview: string;
  authUser: AuthUser;
}
interface PrepareRequestData<T> {
  requestObject: T;
  messageForReview: string;
  authUser: AuthUser;
}

interface AssignToMe {
  request: Request;
  firebase: Firebase;
  authUser: AuthUser;
}

interface AddComment {
  request: Request;
  comment: string;
  firebase: Firebase;
  authUser: AuthUser;
}

interface CloseRequest {
  request: Request;
  firebase: Firebase;
  authUser: AuthUser;
}

interface CreateChangeLogEntry {
  action: RequestAction;
  changeLog: ChangeLog[];
  authUser: AuthUser;
  newValue: Object;
}

export interface TransitionPostFunction {
  request: Request;
  firebase: Firebase;
  authUser: AuthUser;
}

export interface PrepareObjectForRequestCreation<T> {
  requestObject: T;
}

export interface GetNextFreeRequestNumber {
  firebase: Firebase;
}

export interface GetRequestFirebasePointer {
  firebase: Firebase;
}

export interface CreateRequestPostFunction {
  firebase: Firebase;
  request: Request;
  authUser: AuthUser;
}

export interface GetNextPossibleTransitions {
  status: RequestStatus;
  requestType: RequestType;
}
export interface GetRequestObjectByType {
  requestType: RequestType;
}

export interface RequestAuthor {
  uid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  pictureSrc: string;
}

export interface RequestAssignee {
  uid: string;
  displayName: string;
  pictureSrc: string;
}

export enum RequestAction {
  none = "",
  created = "created",
  assign = "assign",
  changeState = "changeState",
}

export enum RequestStatus {
  created = "created",
  inReview = "inReview",
  declined = "declined",
  backToAuthor = "backToAuthor",
  // published = "published",
  done = "done",
}

export interface RequestTransition {
  fromState: RequestStatus | "*";
  toState: RequestStatus;
  description: String;
}

export enum RequestType {
  recipeReview = "recipeReview",
}

interface NumberStorage {
  counter: number;
}

export interface Comment {
  comment: string;
  date: Date;
  user: { uid: string; displayName: string; pictureSrc: string };
}

export interface ChangeLog {
  date: Date;
  user: { uid: string; displayName: string };
  action: RequestAction;
  newValue: Object;
}

export default abstract class Request {
  abstract uid: string;
  abstract number: number;
  abstract status: RequestStatus;
  abstract author: RequestAuthor;
  abstract assignee: RequestAssignee;
  abstract comments: Comment[];
  abstract changeLog: ChangeLog[];
  abstract createDate: Date;
  abstract resolveDate: Date;
  abstract requestObject: ValueObject;
  abstract requestType: RequestType;
  abstract transitions: RequestTransition[];

  // ===================================================================== */
  /**
   * Request anlegen.
   * @param param0 - Objekt mit Firebase-Referenz, und Objekt, dass den
   * Request auslöst authUser
   */
  async createRequest<T extends ValueObject>({
    firebase,
    requestObject,
    messageForReview,
    authUser,
  }: CreateRequest<T>) {
    // Request aufbauen
    this.prepareRequestData<T>({
      requestObject: requestObject,
      messageForReview: messageForReview,
      authUser: authUser,
    });

    // Pointer zu richtigem Verzeichnis holen
    let firebasePointer = this.getRequestFirebasePointer({
      firebase: firebase,
    });

    await firebasePointer.numberStorage
      .read<NumberStorage>({ uids: [] })
      .then((result) => {
        this.number = result.counter + 1;
      })
      .then(async () => {
        // File erstellen
        await firebasePointer.active
          .create<Request>({ value: this, uids: [], authUser: authUser })
          .then((result) => {
            this.uid = result.uid;
          })
          .catch((error) => {
            throw error;
          });
      })
      .then(async () => {
        // im Log nummer hochzählen...
        await firebasePointer.numberStorage
          .incrementField({
            uids: [],
            field: "counter",
            value: 1,
          })
          .catch((error) => {
            throw error;
          });
      })
      .then(async () => {
        // Log-File mit neu erzeugtem Request
        await firebasePointer.log.update({
          uids: [],
          value: {
            uid: this.uid,
            number: this.number,
            requestObject: this.requestObject,
            status: this.status,
            author: {
              uid: authUser.uid,
              displayName: authUser.publicProfile.displayName,
              firstName: authUser.firstName,
              lastName: authUser.lastName,
              email: authUser.email,
            },
          },
          authUser: authUser,
        });
      })
      .then(() => {
        // Post-Function auslösen
        this.createRequestPostFunction({
          firebase: firebase,
          request: this,
          authUser: authUser,
        });
      })
      .catch((error) => {
        throw error;
      });
    return this.number;
  }
  // ===================================================================== */
  /**
   * Definition der möglichen Übergänge.
   * @param param0 - Array mit den möglichen Übergängen (Status -> Status)
   */
  abstract definitionTransitions(): Array<RequestTransition>;
  // ===================================================================== */
  /**
   * Postfunction nach einem Übergang.
   * @param param0 - Neuer Status (nach Übergang)
   */
  abstract transitionPostFunction({
    firebase,
    authUser,
    request,
  }: TransitionPostFunction): void;
  // ===================================================================== */
  /**
   * RequestObjekt vorbereiten für die Erstellung des Request vorbereiten
   * @param param0 - Objekt
   */
  prepareRequestData<T extends ValueObject>({
    requestObject,
    messageForReview,
    authUser,
  }: PrepareRequestData<T>) {
    this.status = RequestStatus.created;
    this.createDate = new Date();
    this.author = {
      uid: authUser.uid,
      displayName: authUser.publicProfile.displayName,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      email: authUser.email,
      pictureSrc: authUser.publicProfile.pictureSrc.normalSize,
    };
    this.assignee = {
      uid: "",
      displayName: "",
      pictureSrc: "",
    };
    if (messageForReview) {
      this.comments.push({
        date: new Date(),
        user: {
          uid: authUser.uid,
          displayName: authUser.publicProfile.displayName,
          pictureSrc: authUser.publicProfile.pictureSrc.normalSize,
        },
        comment: messageForReview,
      });
    }
    this.changeLog.push({
      date: new Date(),
      user: {
        uid: authUser.uid,
        displayName: authUser.publicProfile.displayName,
      },
      action: RequestAction.created,
      newValue: { status: RequestStatus.created },
    });

    // Daten vorbereiten
    this.requestObject = this.prepareObjectForRequestCreation<T>({
      requestObject: requestObject,
    });
  }
  // ===================================================================== */
  /**
   * Objekt der Unterklasse generieren.
   * @param param0 - Type des Request von dem ein Objekt generiert werden soll
   */
  static getRequestObjectByType({ requestType }: GetRequestObjectByType) {
    switch (requestType) {
      case RequestType.recipeReview:
        return new RequestRecipeReview();
      default:
        throw new Error("RequestType unbekannt.");
    }
  }
  // ===================================================================== */
  /**
   * Changelog erweitern.
   * @param param0 - Bestehendes Changelog, neue Aktion, die den Eintrag auslöst,
   * Kommentar und User
   */
  static createChangeLogEntry({
    changeLog,
    action,
    newValue,
    authUser,
  }: CreateChangeLogEntry) {
    changeLog.unshift({
      action: action,
      date: new Date(),
      user: {
        displayName: authUser.publicProfile.displayName,
        uid: authUser.uid,
      },
      newValue: newValue,
    });
    return changeLog;
  }
  // ===================================================================== */
  /**
   * RequestObjekt vorbereiten für die Erstellung des Request vorbereiten
   * @param param0 - Objekt
   */
  abstract prepareObjectForRequestCreation<T extends ValueObject>({
    requestObject,
  }: PrepareObjectForRequestCreation<T>): object;
  // ===================================================================== */
  /**
   * Pointer auf richtige Firebaseklasse
   * @abstract
   */
  abstract getRequestFirebasePointer({
    firebase,
  }: GetRequestFirebasePointer): FirebaseDbRequestRecipeReview;
  // ===================================================================== */
  /**
   * Mögliche Postfunction nach dem anlegen des Requests
   * @abstract
   * @param0 - Objekt mit Firebase-Referenz und Request
   */
  abstract createRequestPostFunction({
    firebase,
    request,
    authUser,
  }: CreateRequestPostFunction): void;

  // ===================================================================== */
  /**
   * Alle aktiven Requests holen. Je nachdem ob der User ein Content-Admin ist,
   * werden nur die eigenen oder alle aktiven Requests geholt.
   * ℹ️ hier muss für jede neue Klasse die entsprechende Methode ergänzt werden
   * @param param0 - Objekt mit Firebase-Referenz und authUser
   */
  static getAllActiveRequests({
    firebase,
    authUser,
  }: GetAllActiveRequests): Promise<Request[]> {
    return new RequestRecipeReview()
      .getActiveRequests({
        firebase: firebase,
        authUser: authUser,
      })
      .then((result) => {
        return result;
      });
  }

  // ===================================================================== */
  /**
   * Alle (pro Typ) aktiven Requests holen. Je nachdem ob der User ein
   * Content-Admin ist, werden nur die eigenen oder alle aktiven Requests geholt.
   * 💡 Diese Methode für jede Klasse ausgeführt (Vererbung)
   * @param param0 - Objekt mit Firebase-Referenz und authUser
   */
  async getActiveRequests({ firebase, authUser }: GetActiveRequests) {
    let requests: Request[] = [];
    // Pointer zu richtigem Verzeichnis holen
    let firebasePointer = this.getRequestFirebasePointer({
      firebase: firebase,
    });

    if (authUser.roles.includes(Role.communityLeader)) {
      await firebasePointer.active
        .readCollection<Request>({
          uids: [],
          orderBy: { field: "number", sortOrder: SortOrder.asc },
          limit: 1000,
        })
        .then((result) => (requests = result));
    } else {
      await firebasePointer.active
        .readCollection<Request>({
          uids: [],
          orderBy: { field: "number", sortOrder: SortOrder.asc },
          limit: 1000,
          where: [
            {
              field: "author.uid",
              operator: Operator.EQ,
              value: authUser.uid,
            },
          ],
        })
        .then((result) => (requests = result));
    }
    return requests;
  }
  // ===================================================================== */
  /**
   * Alle abgeschlossenen Requests holen. Je nachdem ob der User ein
   * Content-Admin ist, werden nur die eigenen oder alle geschlossenen Requests
   * geholt. ℹ️ hier muss für jede neue Klasse die entsprechende Methode ergänzt werden
   * @param Object - Objekt mit Firebase-Referenz und authUser
   */
  static getAllClosedRequests({
    firebase,
    authUser,
  }: GetAllClosedRequests): Promise<Request[]> {
    return new RequestRecipeReview()
      .getClosedRequests({
        firebase: firebase,
        authUser: authUser,
      })
      .then((result) => {
        console.log(result);
        return result;
      });
  }
  // ===================================================================== */
  /**
   * Alle geschlossenen Requests holen (dieser Klasse). Je nachdem ob der User ein
   * Content-Admin ist, werden nur die eigenen oder alle aktiven Requests geholt.
   * 💡 Diese Methode für jede Klasse ausgeführt (Vererbung).
   * @param param0 - Objekt mit Firebase-Referenz und authUser
   */
  async getClosedRequests({ firebase, authUser }: GetAllClosedRequests) {
    let requests: Request[] = [];
    // Pointer zu richtigem Verzeichnis holen
    let firebasePointer = this.getRequestFirebasePointer({
      firebase: firebase,
    });

    if (authUser.roles.includes(Role.communityLeader)) {
      await firebasePointer.closed
        .readCollection<Request>({
          uids: [],
          orderBy: { field: "number", sortOrder: SortOrder.asc },
          limit: 1000,
        })
        .then((result) => (requests = result));
    } else {
      await firebasePointer.closed
        .readCollection<Request>({
          uids: [],
          orderBy: { field: "number", sortOrder: SortOrder.asc },
          limit: 1000,
          where: [
            {
              field: "author.uid",
              operator: Operator.EQ,
              value: authUser.uid,
            },
          ],
        })
        .then((result) => (requests = result));
    }
    console.log(requests);
    return requests;
  }
  // ===================================================================== */
  /**
   * Request in den nächsten Status verschieben
   * @param param0 - Objekt mit Firebase-Referenz, Request, nächster Status und AuthUser
   */
  static async updateStatus({
    firebase,
    request,
    nextStatus,
    authUser,
  }: UpdateStatus) {
    let requestWrapper = Request.getRequestObjectByType({
      requestType: request.requestType,
    });

    let firebasePointer = requestWrapper.getRequestFirebasePointer({
      firebase: firebase,
    });

    request.status = nextStatus;

    request.changeLog = Request.createChangeLogEntry({
      changeLog: request.changeLog,
      action: RequestAction.changeState,
      authUser: authUser,
      newValue: { status: request.status },
    });

    firebasePointer.active.updateFields({
      uids: [request.uid],
      values: {
        status: request.status,
        changeLog: request.changeLog,
      },
      authUser: authUser,
    });

    let logField = {};
    logField[`${request.uid}.status`] = request.status;

    firebasePointer.log.updateFields({
      uids: [],
      values: logField,
      authUser: authUser,
    });

    // PostFunction...
    requestWrapper.transitionPostFunction({
      request: request,
      firebase: firebase,
      authUser: authUser,
    });
    return request;
  }

  // ===================================================================== */
  /**
   * Status für User auf Deutsch übersetzen
   * @param param0 - Status wie es in der DB gespeichert wird.
   */
  static translateStatus(status: string) {
    return TEXT_STATUS_NAME[status];
  }
  // ===================================================================== */
  /**
   * Request-Typ für User auf Deutsch übersetzen
   * @param param0 - Typ wie es in der DB gespeichert wird.
   */
  static translateType(type: RequestType) {
    return TEXT_REQUEST_TYPE[type];
  }
  // ===================================================================== */
  /**
   * Definition welche nachfolgende Stati möglich sind
   * @param param0 - aktueller Status.
   */
  static getNextPossibleTransitionsForType({
    status,
    requestType,
  }: GetNextPossibleTransitions) {
    if (status) {
      switch (requestType) {
        case RequestType.recipeReview:
          return RequestRecipeReview.getNextPossibleTransitions(status);
        default:
          return [] as RequestTransition[];
        // throw new Error(
        //   "Definition nächster Status für Request Typ nicht definiert."
        // );
      }
    } else {
      return [] as RequestTransition[];
    }
  }
  // ===================================================================== */
  /**
   * Request mir selber zuweisen
   * @param param0 - AuthUser.
   */
  static async assignToMe({ request, firebase, authUser }: AssignToMe) {
    let requestWrapper = Request.getRequestObjectByType({
      requestType: request.requestType,
    });

    let firebasePointer = requestWrapper.getRequestFirebasePointer({
      firebase: firebase,
    });

    request.assignee = {
      displayName: authUser.publicProfile.displayName,
      pictureSrc: authUser.publicProfile.pictureSrc.normalSize,
      uid: authUser.uid,
    };
    request.changeLog = Request.createChangeLogEntry({
      changeLog: request.changeLog,
      action: RequestAction.assign,
      authUser: authUser,
      newValue: { asignee: request.assignee },
    });

    firebasePointer.active.updateFields({
      uids: [request.uid],
      values: {
        assignee: request.assignee,
        changeLog: request.changeLog,
      },
      authUser: authUser,
    });

    return request;
  }
  // ===================================================================== */
  /**
   * Kommentar hinzufügen
   * @param object - request, Kommentar, Firebase, AuthUser.
   */
  static async addComment({
    request,
    comment,
    firebase,
    authUser,
  }: AddComment) {
    let requestWrapper = Request.getRequestObjectByType({
      requestType: request.requestType,
    });

    let firebasePointer = requestWrapper.getRequestFirebasePointer({
      firebase: firebase,
    });
    request.comments.push({
      comment: comment,
      date: new Date(),
      user: {
        displayName: authUser.publicProfile.displayName,
        pictureSrc: authUser.publicProfile.pictureSrc.normalSize,
        uid: authUser.uid,
      },
    });
    firebasePointer.active
      .updateFields({
        uids: [request.uid],
        values: { comments: request.comments },
        authUser: authUser,
      })
      .then(() => {
        // Mail auslösen, dass neuer Kommentar erfasst wurde
        // Der Empfänger ist jeweils die andere Partei Author*in <--> Bearbeiter*in
        if (request.assignee.uid && request.assignee.uid) {
          firebase.cloudFunction.mailUser.triggerCloudFunction({
            values: {
              templateData: {
                pictureUrl: request.requestObject.pictureSrc,
                requestNumber: request.number,
                commentAuthor: authUser.publicProfile.displayName,
                comment: comment,
              },
              recipientUid:
                request.author.uid == authUser.uid
                  ? request.assignee.uid
                  : request.author.uid,
              mailTemplate: MailTemplate.requestNewComment,
            },
            authUser: authUser,
          });
        }
      })
      .catch((error) => {
        throw error;
      });

    return request;
  }
  // ===================================================================== */
  /**
   * Antrag abschliessen
   * Aus dem Aktiven Folder herausnehmen und in den Abgeschlossenen verschieben
   * @param object - request der verschoeben werden soll (+firebase und AuthUser).
   */
  closeRequest({ request, firebase, authUser }: CloseRequest) {
    let requestWrapper = Request.getRequestObjectByType({
      requestType: request.requestType,
    });
    let firebasePointer = requestWrapper.getRequestFirebasePointer({
      firebase: firebase,
    });

    firebasePointer.closed.set({
      uids: [request.uid],
      value: request,
      authUser: authUser,
    });
    firebasePointer.active.delete({ uids: [request.uid] });

    // Log updaten
    let logField = {};
    logField[`${request.uid}.status`] = request.status;

    firebasePointer.log.updateFields({
      uids: [],
      values: logField,
      authUser: authUser,
    });
  }
}
