import Recipe, {RecipeType} from "../Recipe/recipe.class";
import MailTemplate from "../../constants/mailTemplates";
import {Request} from "./internal";

import {CARD_PLACEHOLDER_PICTURE} from "../../constants/defaultValues";

import {ValueObject} from "../Firebase/Db/firebase.db.super.class";
import Feed, {FeedType} from "../Shared/feed.class";
import Role from "../../constants/roles";

import {REQUEST_STATUS_TRANSITION_PUBLISH_RECIPE as TEXT_REQUEST_STATUS_TRANSITION_PUBLISH_RECIPE} from "../../constants/text";
import RecipeShort from "../Recipe/recipeShort.class";
import {
  CreateRequestPostFunction,
  PrepareObjectForRequestCreation,
  RequestStatus,
  RequestTransition,
  RequestType,
  TransitionPostFunction,
} from "./request.class";

/**
 * Klasse für den Rezept-Review Prozess
 * @param uid: UID String des Files auf der DB
 * @param number: Request Nummer
 * @param status: Aktueller Status des Requests
 * @param date: Datum an dem der Request erstellt wurde
 * @param recipe: Objekt mit UID und Name des Rezeptes
 * @param author: Objekt mit UID, Display-Name, Vor-, Nachname und E-Mailadresse des\*r Rezeptautor\*in
 */
export class RequestPublishRecipe extends Request {
  uid: string;
  number: number;
  status: Request["status"];
  author: Request["author"];
  assignee: Request["assignee"];
  comments: Request["comments"];
  changeLog: Request["changeLog"];
  createDate: Request["createDate"];
  resolveDate: Request["resolveDate"];
  requestObject: Request["requestObject"];
  requestType: Request["requestType"];
  transitions: Request["transitions"];
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    super();
    this.uid = "";
    this.number = 0;
    this.status = RequestStatus.created;
    this.createDate = new Date();
    this.resolveDate = new Date("9999-12-31");
    this.author = {} as Request["author"];
    this.assignee = {} as Request["assignee"];
    this.comments = [];
    this.changeLog = [];
    this.requestObject = {};
    this.requestType = RequestType.recipePublish;
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
        description:
          TEXT_REQUEST_STATUS_TRANSITION_PUBLISH_RECIPE.created.inReview
            .description,
      },
      {
        fromState: RequestStatus.inReview,
        toState: RequestStatus.declined,
        description:
          TEXT_REQUEST_STATUS_TRANSITION_PUBLISH_RECIPE.created.declined
            .description,
      },
      {
        fromState: RequestStatus.inReview,
        toState: RequestStatus.backToAuthor,
        description:
          TEXT_REQUEST_STATUS_TRANSITION_PUBLISH_RECIPE.created.backToAuthor
            .description,
      },
      {
        fromState: RequestStatus.inReview,
        toState: RequestStatus.done,
        description:
          TEXT_REQUEST_STATUS_TRANSITION_PUBLISH_RECIPE.created.done
            .description,
      },
    ];
  }
  /* =====================================================================
  // PostFunctionos nach einem Übergäng
  // ===================================================================== */
  static async transitionPostFunction({
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
          const recipeShort = RecipeShort.createShortRecipeFromRecipe(result);

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

          // firebase.request.active.updateFields({
          //   uids: [request.uid],
          //   values: {resolveDate: new Date()},
          //   authUser,
          // });

          // Mail auslösen // --> über cloud Function! weil Adresse unbekannt.
          firebase.cloudFunction.mailUser.triggerCloudFunction({
            values: {
              templateData: {
                recipeName: request.requestObject.name,
                headerPictureSrc: request.requestObject.pictureSrc,
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
  }: PrepareObjectForRequestCreation<T>): Record<string, unknown> {
    return {
      name: requestObject.name,
      uid: requestObject.uid,
      pictureSrc: requestObject.pictureSrc
        ? requestObject.pictureSrc
        : CARD_PLACEHOLDER_PICTURE(),
    };
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
          headerPictureSrc: request.requestObject.pictureSrc,
          requestAuthor: authUser.publicProfile.displayName,
          requestNumber: request.number,
        },
        mailTemplate: MailTemplate.newRecipePublishRequest,
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
    const request = new RequestPublishRecipe();
    return request.transitions.filter(
      (transition) => transition.fromState == status
    );
  }
}
