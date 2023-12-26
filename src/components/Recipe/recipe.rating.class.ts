import {UserShort} from "../User/user.class";
import Firebase from "../Firebase/firebase.class";
import {AuthUser} from "../Firebase/Authentication/authUser.class";
import Feed, {FeedType} from "../Shared/feed.class";
import Recipe from "./recipe.class";
import Role from "../../constants/roles";

export interface Rating {
  avgRating: number;
  noRatings: number;
  myRating: number;
}
interface GetRatingOfUser {
  firebase: Firebase;
  recipeUid: string;
  userUid: string;
}
interface UpdateUserRating {
  firebase: Firebase;
  recipe: Recipe;
  newRating: number;
  authUser: AuthUser;
}

// ===================================================================== */
/**
 * Rezept Rating
 * @ avgRating - Durchschnittliche Bewertung
 * @ noRating - Anzahl abgegebene Bewertungen
 * @ myRaing - Meine Bewertung
 */
export class RecipeRating {
  rating: number;
  // ===================================================================== */
  /**
   * Constructor
   */
  constructor() {
    this.rating = 0;
  }
  // ===================================================================== */
  /**
   * Bewertung eines Users für ein bestimmtes Rezept holen
   * @param param0 - Objekt mit Firebase-Referenz, Rezept-UID, und User-UID
   * @returns Bewertung des angegebenen Users
   */
  static async getUserRating({firebase, recipeUid, userUid}: GetRatingOfUser) {
    let recipeUserRating: number = 0;

    await firebase.recipePublic.rating
      .read<RecipeRating>({uids: [recipeUid, userUid]})
      .then((result) => {
        recipeUserRating = result.rating;
      })
      .catch((error) => {
        // Kein Dokument vorhanden
        recipeUserRating = 0;
      });

    return recipeUserRating;
  }
  // ===================================================================== */
  /**
   * Bewertung eines Users speichern/aktualisieren. Das Dokument wird
   * angelegt/überschrieben.
   * @param param0 - Objekt mit Firebase-Referenz, Rezept-UID, und User-UID
   */
  static async updateUserRating({
    firebase,
    recipe,
    newRating,
    authUser,
  }: UpdateUserRating) {
    let userRating: RecipeRating = {rating: newRating};

    await firebase.recipePublic.rating
      .update({
        uids: [recipe.uid, authUser.uid],
        value: userRating,
        authUser: authUser,
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });

    // Feed aktualisieren
    Feed.createFeedEntry({
      firebase: firebase,
      authUser: authUser,
      feedType: FeedType.recipeRated,
      feedVisibility: Role.basic,
      objectUid: recipe.uid,
      objectName: recipe.name,
      objectPictureSrc: recipe.pictureSrc,
      textElements: [recipe.name, newRating.toString()],
    });
  }
}
export default RecipeRating;
