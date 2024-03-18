// Migration Job für neue Datenstrutkur nach Umstellung auf Typescript
import Firebase from "../components/Firebase/firebase.class";
import RecipeShort from "../../src/components/Recipe/recipeShort.class";
import UserPublicProfile from "../components/User/user.public.profile.class";
import {ValueObject} from "../components/Firebase/Db/firebase.db.super.class";

// interface oldUserProfile {
//   uid: string;
//   displayName: string;
//   memberSince: Date;
//   memberId: number;
//   motto: string;
//   pictureSrc: string;
//   pictureSrcFullSize: string;
//   noComments: number;
//   noEvents: number;
//   noRecipes: number;
// }

export async function restructureUserPublicProfile(firebase: Firebase) {
  // Alle dokumente holen
  const collection = firebase.db.collection("users");
  let counter = 0;
  let publicRecipes: RecipeShort[] = [];
  let privateRecipes: RecipeShort[] = [];

  await RecipeShort.getShortRecipesPublic({firebase: firebase}).then(
    (result) => {
      publicRecipes = result;
    }
  );
  await RecipeShort.getShortRecipesPrivateAll({firebase: firebase}).then(
    (result) => {
      privateRecipes = result;
    }
  );

  // console.log(publicRecipes, privateRecipes);

  await collection.get().then(async (userDocuments) => {
    console.log(userDocuments.size);
    for (const user of userDocuments.docs) {
      counter++;

      await firebase.db
        .doc(`/users/${user.id}/public/profile`)
        .get()
        .then(async (publicProfileDocument) => {
          const oldPublicUserProfile =
            publicProfileDocument.data() as ValueObject;
          console.log(oldPublicUserProfile);

          if (
            oldPublicUserProfile &&
            !Object.prototype.hasOwnProperty.call(oldPublicUserProfile, "stats")
          ) {
            const newPublicUserProfile: UserPublicProfile = {
              uid: "",
              displayName: "",
              memberSince: new Date(0),
              memberId: 0,
              motto: "",
              pictureSrc: {
                smallSize: "",
                normalSize: "",
                fullSize: "",
              },
              stats: {
                noComments: 0,
                noEvents: 0,
                noRecipesPublic: 0,
                noRecipesPrivate: 0,
                noFoundBugs: 0,
              },
            };

            newPublicUserProfile.uid = user.id;
            newPublicUserProfile.displayName = oldPublicUserProfile.displayName;
            newPublicUserProfile.memberSince = oldPublicUserProfile.memberSince;
            newPublicUserProfile.memberId = oldPublicUserProfile?.memberId;
            newPublicUserProfile.motto = oldPublicUserProfile.motto;

            if (oldPublicUserProfile?.pictureSrc !== "") {
              newPublicUserProfile.pictureSrc.fullSize =
                oldPublicUserProfile.pictureSrcFullSize;
              newPublicUserProfile.pictureSrc.normalSize =
                oldPublicUserProfile.pictureSrcFullSize;
              newPublicUserProfile.pictureSrc.smallSize =
                oldPublicUserProfile.pictureSrc;
            }

            // Stats setzen....
            newPublicUserProfile.stats.noComments =
              oldPublicUserProfile?.noComments
                ? oldPublicUserProfile.noComments
                : 0;

            newPublicUserProfile.stats.noEvents = oldPublicUserProfile?.noEvents
              ? oldPublicUserProfile.noEvents
              : 0;

            newPublicUserProfile.stats.noRecipesPrivate = privateRecipes.filter(
              (recipe) => recipe.created.fromUid === user.id
            ).length;

            newPublicUserProfile.stats.noRecipesPublic = publicRecipes.filter(
              (recipe) => recipe.created.fromUid === user.id
            ).length;

            console.log(newPublicUserProfile);
            await publicProfileDocument.ref
              .set({...newPublicUserProfile})
              .catch((error) => {
                console.error(error);
                console.info(newPublicUserProfile);
                console.info(publicProfileDocument.id);
              });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });

  return counter;
}
