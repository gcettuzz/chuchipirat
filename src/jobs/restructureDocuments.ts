import Firebase from "../components/Firebase/firebase.class";
import Recipe from "../components/Recipe/recipe.class";

export async function restructureRecipeDocuments(firebase: Firebase) {
  // Alle dokumente holen
  let collection = firebase.db.collection("recipes");
  let counter: number = 0;

  await collection.get().then((snapshot) => {
    snapshot.forEach((document) => {
      let documentData = document.data();
      if (
        document.id == "000_allRecipes" ||
        documentData.hasOwnProperty("times") ||
        documentData.hasOwnProperty("created") ||
        documentData.hasOwnProperty("lastEdit")
      ) {
        // Dokument darf nur einmal angepasst werden!
      } else {
        counter += 1;

        let documentNewStructure = {
          name: documentData.name,
          portions: documentData.portions,
          source: documentData.source,
          times: {
            preparation:
              documentData.preparationTime == ""
                ? 0
                : parseInt(documentData.preparationTime),
            rest:
              documentData.restTime == "" ? 0 : parseInt(documentData.restTime),
            cooking:
              documentData.cookTime == "" ? 0 : parseInt(documentData.cookTime),
          },
          pictureSrc: {
            smallSize: documentData.pictureSrc,
            normalSize: documentData.pictureSrc,
            fullSize: documentData.pictureSrcFullSize,
          },
          note: documentData.note,
          tags: documentData.tags,
          private: documentData.hasOwnProperty("private")
            ? documentData.private
            : false,
          linkedRecipes: documentData.hasOwnProperty("linkedRecipes")
            ? documentData.linkedRecipes
            : [],
          ingredients: documentData.ingredients,
          preparationSteps: documentData.preparationSteps,
          rating: documentData.rating,
          usedProducts: documentData.usedProducts,
          created: documentData.hasOwnProperty("created")
            ? documentData.created
            : {
                date: documentData.createdAt,
                fromDisplayName: documentData.createdFromDisplayName,
                fromUid: documentData.createdFromUid,
              },
          lastChange: documentData.hasOwnProperty("lastChange")
            ? documentData.created
            : {
                date: documentData.lastChangeAt,
                fromDisplayName: documentData.lastChangeFromDisplayName,
                fromUid: documentData.lastChangeFromUid,
              },
        };

        // let documentReference = firebase.db.doc(`recipes/${document.id}`);
        //TODO: Klasse anpassen bevor das ausgeführt wird // auch db-klasse
        // await documentReference.set(documentNewStructure);
      }
    });
  });
  return counter;
}
