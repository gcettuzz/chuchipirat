// Migration Job für neue Datenstrutkur nach Umstellung auf Typescript
import { getHeapSnapshot } from "v8";
import Firebase from "../components/Firebase/firebase.class";
import RecipeShort from "../../src/components/Recipe/recipeShort.class";
import UserPublicProfile from "../components/User/user.public.profile.class";
import AuthUser from "../components/Firebase/Authentication/authUser.class";
import { ValueObject } from "../components/Firebase/Db/firebase.db.super.class";

interface oldUserProfile {
  uid: string;
  displayName: string;
  memberSince: Date;
  memberId: number;
  motto: string;
  pictureSrc: string;
  pictureSrcFullSize: string;
  noComments: number;
  noEvents: number;
  noRecipes: number;
}

export async function restructureUserPublicProfile(firebase: Firebase) {
  // Alle dokumente holen
  let collection = firebase.db.collection("users");
  let counter: number = 0;
  let publicRecipes: RecipeShort[] = [];
  let privateRecipes: RecipeShort[] = [];

  await RecipeShort.getShortRecipesPublic({ firebase: firebase }).then(
    (result) => {
      publicRecipes = result;
    }
  );
  await RecipeShort.getShortRecipesPrivateAll({ firebase: firebase }).then(
    (result) => {
      privateRecipes = result;
    }
  );

  // console.log(publicRecipes, privateRecipes);

  await collection.get().then(async (snapshot) => {
    for (const user of snapshot.docs) {
      counter++;

      let document = firebase.db.doc(`/users/${user.id}/public/profile`);
      await document
        .get()
        .then(async (snapshot) => {
          let oldPublicUserProfile = snapshot.data() as ValueObject;

          let newPublicUserProfile = <UserPublicProfile>{};

          newPublicUserProfile.pictureSrc = {
            smallSize: "",
            normalSize: "",
            fullSize: "",
          };
          newPublicUserProfile.stats = {
            noComments: 0,
            noEvents: 0,
            noRecipesPublic: 0,
            noRecipesPrivate: 0,
          };

          newPublicUserProfile.uid = user.id;
          newPublicUserProfile.displayName = oldPublicUserProfile.displayName;
          newPublicUserProfile.memberSince =
            oldPublicUserProfile.memberSince.toDate();
          newPublicUserProfile.memberId = oldPublicUserProfile?.memberId;

          newPublicUserProfile.pictureSrc.fullSize =
            oldPublicUserProfile?.pictureSrcFullSize;
          newPublicUserProfile.pictureSrc.normalSize =
            oldPublicUserProfile?.pictureSrcFullSize;
          newPublicUserProfile.pictureSrc.smallSize =
            oldPublicUserProfile?.pictureSrc;

          // Stats setzen....
          newPublicUserProfile.stats.noComments =
            oldPublicUserProfile?.noComments;

          newPublicUserProfile.stats.noEvents = oldPublicUserProfile?.noEvents;
          newPublicUserProfile.stats.noRecipesPrivate = privateRecipes.filter(
            (recipe) => recipe.created.fromUid === user.id
          ).length;

          newPublicUserProfile.stats.noRecipesPublic = publicRecipes.filter(
            (recipe) => recipe.created.fromUid === user.id
          ).length;

          console.log(newPublicUserProfile);

          firebase.user.public.profile.set({
            uids: [user.id],
            value: newPublicUserProfile,
            authUser: {} as AuthUser,
          });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });

  return counter;
}
