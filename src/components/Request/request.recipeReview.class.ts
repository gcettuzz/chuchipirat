import Firebase from "../Firebase";
import AuthUser from "../Firebase/Authentication/authUser.class";
import Recipe, { RecipeType } from "../Recipe/recipe.class";
import MailTemplate from "../../constants/mailTemplates";
import Request, {
  RequestStatus,
  RequestAction,
  GetActiveRequests,
  RequestAuthor,
  PrepareObjectForRequestCreation,
  GetRequestFirebasePointer,
  CreateRequestPostFunction,
  RequestAssignee,
  RequestType,
  RequestTransition,
  ChangeLog,
  Comment,
  TransitionPostFunction,
} from "./request.class";

import { CARD_PLACEHOLDER_PICTURE } from "../../constants/defaultValues";

import { ValueObject } from "../Firebase/Db/firebase.db.super.class";
import Feed, { FeedType } from "../Shared/feed.class";
import Role from "../../constants/roles";

import { STATUS_TRANSITION_REQUEST_RECIPE as TEXT_STATUS_TRANSITION } from "../../constants/text";
import RecipeShort from "../Recipe/recipeShort.class";

interface CreateRequest {
  firebase: Firebase;
  recipe: Recipe;
  messageForReview: string;
  authUser: AuthUser;
}

/**
 * Klasse für den Rezept-Review Prozess
 * @param uid: UID String des Files auf der DB
 * @param number: Request Nummer
 * @param status: Aktueller Status des Requests
 * @param date: Datum an dem der Request erstellt wurde
 * @param recipe: Objekt mit UID und Name des Rezeptes
 * @param author: Objekt mit UID, Display-Name, Vor-, Nachname und E-Mailadresse des\*r Rezeptautor\*in
 */
class RequestRecipeReview extends Request {
  uid: string;
  number: number;
  status: RequestStatus;
  author: RequestAuthor;
  assignee: RequestAssignee;
  comments: Comment[];
  changeLog: ChangeLog[];
  createDate: Date;
  resolveDate: Date;
  requestObject: ValueObject;
  requestType: RequestType;
  transitions: RequestTransition[];

  constructor() {
    super();
    this.uid = "";
    this.uid = "";
    this.number = 0;
    this.status = RequestStatus.created;
    this.createDate = new Date();
    this.resolveDate = new Date("9999-12-31");
    this.author = {} as RequestAuthor;
    this.assignee = {} as RequestAssignee;
    this.comments = [];
    this.changeLog = [];
    this.requestObject = {};
    this.requestType = RequestType.recipeReview;
    this.transitions = this.definitionTransitions();
  }
  /* =====================================================================
  // Übergänge definieren
  // ===================================================================== */
  definitionTransitions(): Array<RequestTransition> {
    return [
      {
        fromState: RequestStatus.created,
        toState: RequestStatus.inReview,
        description: TEXT_STATUS_TRANSITION.created.inReview.description,
      },
      {
        fromState: RequestStatus.inReview,
        toState: RequestStatus.declined,
        description: TEXT_STATUS_TRANSITION.created.declined.description,
      },
      {
        fromState: RequestStatus.inReview,
        toState: RequestStatus.backToAuthor,
        description: TEXT_STATUS_TRANSITION.created.backToAuthor.description,
      },
      {
        fromState: RequestStatus.inReview,
        toState: RequestStatus.done,
        description: TEXT_STATUS_TRANSITION.created.done.description,
      },
    ];
  }
  /* =====================================================================
  // PostFunctionos nach einem Übergäng
  // ===================================================================== */
  async transitionPostFunction({
    request,
    firebase,
    authUser,
  }: TransitionPostFunction) {
    switch (request.status) {
      case RequestStatus.done:
        // Die 000_allRecipes werden auch angepasst, daher braucht es das Recipe Short
        await Recipe.getRecipe({
          firebase: firebase,
          uid: request.requestObject.uid,
          type: RecipeType.private,
          userUid: request.author.uid,
          authUser: authUser,
        }).then((result: Recipe) => {
          let recipeShort = RecipeShort.createShortRecipeFromRecipe(result);

          // Cloud Function auslösen
          firebase.cloudFunction.requestRecipePublish.triggerCloudFunction({
            values: {
              recipeName: request.requestObject.name,
              recipeUid: request.requestObject.uid,
              recipeShort: recipeShort,
              recipeAuthorUid: request.author.uid,
            },
            authUser: authUser,
          });

          firebase.request.recipe.active.updateFields({
            uids: [request.uid],
            values: { resolveDate: new Date() },
            authUser,
          });

          // Mail auslösen // --> über cloud Function! weil Adresse unbekannt.
          firebase.cloudFunction.mailUser.triggerCloudFunction({
            values: {
              templateData: {
                recipeName: request.requestObject.name,
                pictureUrl: request.requestObject.pictureSrc,
                recipeUid: request.requestObject.uid,
                requestNumber: request.number,
              },
              recipientUid: request.author.uid,
              mailTemplate: MailTemplate.requestRecipePublished,
            },
            authUser: authUser,
          });

          // Feed-Eintrag
          Feed.createFeedEntry({
            firebase: firebase,
            authUser: authUser,
            feedType: FeedType.recipePublished,
            feedVisibility: Role.basic,
            textElements: [request.requestObject.name],
            objectUid: request.requestObject.uid,
            objectName: request.requestObject.name,
            objectPictureSrc: request.requestObject.pictureSrc,
            objectUserUid: request.author.uid,
            objectUserDisplayName: request.author.displayName,
            objectUserPictureSrc: request.author.pictureSrc,
          });

          // Antrag abschliessen
          super.closeRequest({
            request: request,
            firebase: firebase,
            authUser: authUser,
          });

          // Dem User für das veröffentlichte Rezept Credit geben!
          //TODO:
        });
        break;
      case RequestStatus.declined:
        //TODO: Mail auslösen
        break;
      default:
        return;
    }
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareObjectForRequestCreation<T extends ValueObject>({
    requestObject,
  }: PrepareObjectForRequestCreation<T>): object {
    return {
      name: requestObject.name,
      uid: requestObject.uid,
      pictureSrc: requestObject.pictureSrc.normalSize
        ? requestObject.pictureSrc.normalSize
        : CARD_PLACEHOLDER_PICTURE(),
    };
  }
  /* =====================================================================
  // Pointer an den richtigen Ort zurückgeben
  // ===================================================================== */
  getRequestFirebasePointer({ firebase }: GetRequestFirebasePointer) {
    return firebase.request.recipe;
  }
  /* =====================================================================
  // Postfunction --> Mail auslösen
  // ===================================================================== */
  createRequestPostFunction({
    firebase,
    request,
    authUser,
  }: CreateRequestPostFunction) {
    // Mail auslösen --> Die Adressen der Content-Admins werden per
    // Cloudfunction ausgelesen (Datenschutz!)
    firebase.cloudFunction.mailCommunityLeaders.triggerCloudFunction({
      values: {
        templateData: {
          recipeName: request.requestObject.name,
          pictureUrl: request.requestObject.pictureSrc,
          requestAuthor: authUser.publicProfile.displayName,
          requestNumber: request.number,
        },
        mailTemplate: MailTemplate.newRecipeRequest,
      },
      authUser: authUser,
    });
  }
  /* =====================================================================
  // Bestimmen was für Status nachfolgend möglich sind
  // ===================================================================== */
  static getNextPossibleTransitions(
    status: RequestStatus
  ): Array<RequestTransition> {
    // Übergänge holen
    let request = new RequestRecipeReview();

    return request.transitions.filter(
      (transition) => transition.fromState == status
    );
  }
}

export default RequestRecipeReview;
