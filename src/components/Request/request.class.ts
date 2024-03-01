import Firebase from "../Firebase/firebase.class";
import {AuthUser} from "../Firebase/Authentication/authUser.class";
import {RequestPublishRecipe} from "./internal";
import {RequestReportError} from "./internal";

import {
  STATUS_NAME as TEXT_STATUS_NAME,
  REQUEST_TYPE as TEXT_REQUEST_TYPE,
} from "../../constants/text";

import {
  SortOrder,
  Operator,
  ValueObject,
} from "../Firebase/Db/firebase.db.super.class";

import Role from "../../constants/roles";
import MailTemplate from "../../constants/mailTemplates";
import _ from "lodash";
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
  newValue: Record<string, unknown>;
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

export type RequestAuthor = {
  uid: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  pictureSrc: string;
};

export type RequestAssignee = {
  uid: string;
  displayName: string;
  pictureSrc: string;
};

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
  description: string;
}

export enum RequestType {
  recipePublish = "recipePublish",
  reportError = "reportError",
}

interface NumberStorage {
  counter: number;
}

export interface Comment {
  comment: string;
  date: Date;
  user: {uid: string; displayName: string; pictureSrc: string};
}

export interface ChangeLog {
  date: Date;
  user: {uid: string; displayName: string};
  action: RequestAction;
  newValue: Record<string, unknown>;
}

export abstract class Request {
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

    await firebase.request.numberStorage
      .read<NumberStorage>({uids: []})
      .then((result) => {
        this.number = result.counter + 1;
      })
      .then(async () => {
        // File erstellen
        await firebase.request.active
          .create<Request>({value: this, uids: [], authUser: authUser})
          .then((result) => {
            this.uid = result.uid;
          })
          .catch((error) => {
            throw error;
          });
      })
      .then(async () => {
        // im Log nummer hochzählen...
        await firebase.request.numberStorage
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
        await firebase.request.log.update({
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
        console.error(error);
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
  static transitionPostFunction = ({
    firebase,
    authUser,
    request,
  }: TransitionPostFunction) => {
    switch (request.requestType) {
      case RequestType.recipePublish:
        RequestPublishRecipe.transitionPostFunction({
          request: request,
          firebase: firebase,
          authUser: authUser,
        });
        break;
      case RequestType.reportError:
        RequestReportError.transitionPostFunction({
          request: request,
          firebase: firebase,
          authUser: authUser,
        });
        break;
      default:
        throw new Error("RequestType unbekannt.");
    }

    if (request.status === RequestStatus.done) {
      Request.closeRequest({
        request: request,
        firebase: firebase,
        authUser: authUser,
      });
    }
  };
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
      newValue: {status: RequestStatus.created},
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
  static getRequestObjectByType({requestType}: GetRequestObjectByType) {
    switch (requestType) {
      case RequestType.recipePublish:
        return new RequestPublishRecipe();
      case RequestType.reportError:
        return new RequestReportError();
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
  }: PrepareObjectForRequestCreation<T>): Record<string, unknown>;
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
   * Alle (pro Typ) aktiven Requests holen. Je nachdem ob der User ein
   * Content-Admin ist, werden nur die eigenen oder alle aktiven Requests geholt.
   * 💡 Diese Methode für jede Klasse ausgeführt (Vererbung)
   * @param param0 - Objekt mit Firebase-Referenz und authUser
   */
  static async getActiveRequests({firebase, authUser}: GetActiveRequests) {
    let requests: Request[] = [];

    if (authUser.roles.includes(Role.communityLeader)) {
      await firebase.request.active
        .readCollection<Request>({
          uids: [],
          orderBy: {field: "number", sortOrder: SortOrder.asc},
          limit: 100,
        })
        .then((result) => (requests = result));
    } else {
      await firebase.request.active
        .readCollection<Request>({
          uids: [],
          orderBy: {field: "number", sortOrder: SortOrder.asc},
          limit: 100,
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
   * Alle geschlossenen Requests holen (dieser Klasse). Je nachdem ob der User ein
   * Content-Admin ist, werden nur die eigenen oder alle aktiven Requests geholt.
   * 💡 Diese Methode für jede Klasse ausgeführt (Vererbung).
   * @param param0 - Objekt mit Firebase-Referenz und authUser
   */
  static async getClosedRequests({firebase, authUser}: GetAllClosedRequests) {
    let requests: Request[] = [];

    if (authUser.roles.includes(Role.communityLeader)) {
      await firebase.request.closed
        .readCollection<Request>({
          uids: [],
          orderBy: {field: "number", sortOrder: SortOrder.asc},
          limit: 100,
        })
        .then((result) => (requests = result));
    } else {
      await firebase.request.closed
        .readCollection<Request>({
          uids: [],
          orderBy: {field: "number", sortOrder: SortOrder.asc},
          limit: 100,
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
   * Request in den nächsten Status verschieben
   * @param param0 - Objekt mit Firebase-Referenz, Request, nächster Status und AuthUser
   */
  static async updateStatus({
    firebase,
    request,
    nextStatus,
    authUser,
  }: UpdateStatus) {
    request.status = nextStatus;

    request.changeLog = Request.createChangeLogEntry({
      changeLog: request.changeLog,
      action: RequestAction.changeState,
      authUser: authUser,
      newValue: {status: request.status},
    });

    firebase.request.active.updateFields({
      uids: [request.uid],
      values: {
        status: request.status,
        changeLog: request.changeLog,
      },
      authUser: authUser,
    });

    const logField = {};
    logField[`${request.uid}.status`] = request.status;

    firebase.request.log.updateFields({
      uids: [],
      values: logField,
      authUser: authUser,
    });

    // PostFunction...
    Request.transitionPostFunction({
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
        case RequestType.recipePublish:
          return RequestPublishRecipe.getNextPossibleTransitions(status);
        case RequestType.reportError:
          return RequestReportError.getNextPossibleTransitions(status);
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
  static async assignToMe({request, firebase, authUser}: AssignToMe) {
    request.assignee = {
      displayName: authUser.publicProfile.displayName,
      pictureSrc: authUser.publicProfile.pictureSrc.normalSize,
      uid: authUser.uid,
    };
    request.changeLog = Request.createChangeLogEntry({
      changeLog: request.changeLog,
      action: RequestAction.assign,
      authUser: authUser,
      newValue: {asignee: request.assignee},
    });

    firebase.request.active.updateFields({
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
  static async addComment({request, comment, firebase, authUser}: AddComment) {
    request.comments.push({
      comment: comment,
      date: new Date(),
      user: {
        displayName: authUser.publicProfile.displayName,
        pictureSrc: authUser.publicProfile.pictureSrc.normalSize,
        uid: authUser.uid,
      },
    });
    firebase.request.active
      .updateFields({
        uids: [request.uid],
        values: {comments: _.cloneDeep(request.comments)},
        authUser: authUser,
      })
      .then(() => {
        // Mail auslösen, dass neuer Kommentar erfasst wurde
        // Der Empfänger ist jeweils die andere Partei Author*in <--> Bearbeiter*in
        if (request.assignee.uid && request.assignee.uid) {
          firebase.cloudFunction.mailUser.triggerCloudFunction({
            values: {
              templateData: {
                headerPictureSrc: request.requestObject.pictureSrc,
                requestNumber: request.number,
                commentAuthor: authUser.publicProfile.displayName,
                comment: comment,
              },
              recipientUid:
                request.author.uid === authUser.uid
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
  static closeRequest({request, firebase, authUser}: CloseRequest) {
    firebase.request.closed
      .set({
        uids: [request.uid],
        value: request,
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    firebase.request.active.delete({uids: [request.uid]});

    // Log updaten
    const logField = {};
    logField[`${request.uid}.status`] = request.status;

    firebase.request.log
      .updateFields({
        uids: [],
        values: logField,
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
}
