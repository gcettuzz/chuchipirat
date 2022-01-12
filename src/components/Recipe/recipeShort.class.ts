import Recipe from "./recipe.class";
import Firebase from "../Firebase/firebase.class";
import { AuthUser } from "../Firebase/Authentication/authUser.class";

interface GetShortRecipes {
  firebase: Firebase;
  authUser: AuthUser;
}

// ===================================================================== */
/**
 * Kurz Rezept - aus den Übersichten:
 * Aufbau gleich wie auf der DB unter
 * recipe/000_allRecipes
 * @param uid - UID des Rezeptes
 * @param name - Name des Rezeptes
 * @param pi–tureSrc - Bildquelle (URL)
 * @param private - Flag ob Rezept privat ist
 * @param tags - Liste von Tags
 * @param linkedRecipes - Liste von verlinkten Rezepten
 * @param createdFromUid - UID des*r Erfasser*in
 */
export class RecipeShort {
  uid: string;
  name: string;
  pictureSrc: string;
  private: boolean;
  tags: string[];
  linkedRecipes: RecipeShort[];
  createdFromUid: string;
  // ===================================================================== */
  /**
   * Konstruktor für ein leeres Objekt
   */
  constructor() {
    this.uid = "";
    this.name = "";
    this.pictureSrc = "";
    this.private = false;
    this.tags = [];
    this.linkedRecipes = [];
    this.createdFromUid = "";
  }
  // ===================================================================== */
  /**
   * Kurz-Rezept aus Rezept erzeugen
   * @param recipe Objekt Rezept
   * @returns Kurzrezept
   */
  static createShortRecipeFromRecipe(recipe: Recipe): RecipeShort {
    return {
      uid: recipe.uid,
      name: recipe.name,
      pictureSrc: recipe.pictureSrc.normalSize,
      private: recipe.private,
      tags: recipe.tags,
      linkedRecipes: recipe.linkedRecipes,
      createdFromUid: recipe.created.fromUid,
    };
  }
  // ===================================================================== */
  /**
   * Alle Rezepte (in Kurzform) holen. Es wird das Dokuement ausgelesen, welches
   * alle Rezepte beinhaltet. Die Methode ändert den Aufbau von einem Objekt
   * (pro Property ein Rezept) zu einem Arry mit einem Rezept pro Eintrag
   * @param param0 - Objekt mit Firebase-Referenz und authUser
   */
  static async getShortRecipes({ firebase, authUser }: GetShortRecipes) {
    let recipesShort: RecipeShort[] = [];
    await firebase.recipeShort.read<Object>({ uids: [] }).then((result) => {
      Object.keys(result).forEach((key) => {
        // Nur Rezepte aufnehmen, die nicht Privat sind ODER Privat
        // und vom gleichen Benutzer erfasst
        if (
          !result[key].hasOwnProperty("private") ||
          result[key]?.private === false ||
          (result[key]?.private && result[key]?.createdFromUid === authUser.uid)
        ) {
          recipesShort.push({
            uid: key,
            name: result[key].name,
            pictureSrc: result[key].pictureSrc,
            private: result[key].private,
            tags: result[key].tags,
            linkedRecipes: result[key].linkedRecipes,
            createdFromUid: result[key].createdFromUid,
          });
        }
      });
    });
    return recipesShort;
  }
}
export default RecipeShort;
