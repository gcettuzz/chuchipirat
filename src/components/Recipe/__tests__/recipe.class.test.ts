import Recipe, { Ingredient, PreparationStep } from "../recipe.class";
import recipe from "../__mocks__/recipe.mock";

import RecipeShort from "../recipeShort.class";

/* =====================================================================
// Kostruktor
// ===================================================================== */
test("Recipe.constructor(): Konstruktor der Klasse", () => {
  let newRecipe = new Recipe();

  expect(newRecipe).toBeDefined();
  expect(newRecipe).toHaveProperty("uid");
  expect(newRecipe).toHaveProperty("name");
  expect(newRecipe).toHaveProperty("portions");
  expect(newRecipe).toHaveProperty("source");
  expect(newRecipe).toHaveProperty("times");
  expect(newRecipe).toHaveProperty("pictureSrc");
  expect(newRecipe).toHaveProperty("note");
  expect(newRecipe).toHaveProperty("tags");
  expect(newRecipe).toHaveProperty("private");
  expect(newRecipe).toHaveProperty("linkedRecipes");
  expect(newRecipe).toHaveProperty("ingredients");
  expect(newRecipe).toHaveProperty("preparationSteps");
  expect(newRecipe).toHaveProperty("usedProducts");
  expect(newRecipe).toHaveProperty("created");
  expect(newRecipe).toHaveProperty("lastChange");
});
/* =====================================================================
// Leeres Objket Zutat erzeugen
// ===================================================================== */
test("Recipe.createEmptyIngredient(): leere Zutat erzeugen", () => {
  let ingredient = Recipe.createEmptyIngredient();

  expect(ingredient).toBeDefined();
  expect(ingredient.pos).toEqual(0);
  expect(ingredient.scalingFactor).toEqual(1);
});
/* =====================================================================
// Leeren Zubereitungsschritt erzeugen
// ===================================================================== */
test("Recipe.createEmptyPreparationStep(): leerer Zubereitungsschritt erzeugen", () => {
  let preparationStep = Recipe.createEmptyPreparationStep();

  expect(preparationStep).toBeDefined();
  expect(preparationStep.uid.length).toEqual(5);
  expect(preparationStep.pos).toEqual(0);
  expect(preparationStep).toHaveProperty("uid");
  expect(preparationStep).toHaveProperty("pos");
  expect(preparationStep).toHaveProperty("step");
});
/* =====================================================================
// Tag löschen
// ===================================================================== */
test("Recipe.deleteTag(): Löschen eines Tags", () => {
  let tags = ["klassiker", "italienisch", "vegi", "iloveit"];

  let deletedTag = Recipe.deleteTag({ tags: tags, tagToDelete: "vegi" });

  expect(deletedTag).toBeDefined();
  expect(deletedTag.length).toEqual(3);
  expect(deletedTag.includes("vegi")).toBeFalsy();
  expect(deletedTag.includes("klassiker")).toBeTruthy();

  deletedTag = Recipe.deleteTag({ tags: tags, tagToDelete: "vegan" });
  expect(deletedTag).toBeDefined();
  expect(deletedTag.length).toEqual(4);
  expect(deletedTag.includes("vegi")).toBeTruthy();
  expect(deletedTag.includes("klassiker")).toBeTruthy();
});
/* =====================================================================
// Tag hinzufügen
// ===================================================================== */
test("Recipe.addTag(): Neuer Tag hinzuüfgen", () => {
  const tags = ["klassiker", "italienisch", "vegi", "iloveit"];

  let newTags = Recipe.addTag({ tags: tags, tagsToAdd: "" });
  expect(newTags).toBeDefined();
  expect(newTags).toEqual(tags);

  newTags = Recipe.addTag({ tags: tags, tagsToAdd: "allTimeFavorite" });
  expect(newTags).toBeDefined();
  expect(newTags.length).toEqual(5);
  expect(newTags.includes("alltimefavorite")).toBeTruthy();

  newTags = Recipe.addTag({ tags: tags, tagsToAdd: "pasta pizza ciao" });

  expect(newTags).toBeDefined();
  expect(newTags.length).toEqual(8);
  expect(newTags.includes("ciao")).toBeTruthy();

  newTags = Recipe.addTag({ tags: tags, tagsToAdd: "klassiker" });
  expect(newTags).toBeDefined();
  expect(newTags.length).toEqual(8);
});
/* =====================================================================
// Verlinktes Rezept hinzufügen
// ===================================================================== */
test("Recipe.addLinkedRecipe(); Neues verlinktes Rezept anlegen", () => {
  let newRecipe: RecipeShort = {
    uid: "VQcUXQ6qpvNp8vWqcExi",
    name: "Spätzli",
    pictureSrc:
      "https://bettybossi.ch/static/rezepte/x/bb_etxx041101_0006a_x.jpg",
    private: false,
    tags: ["vegi", "vegetarisch", "klassiker", "schweiz"],
    linkedRecipes: [],
    createdFromUid: "7HoaQsZC4NXqb4wq6CqOZQMBcg13",
  };

  // Liste an Rezepten (um auch Sortierung gleich zu prüfen)
  let allreadyLinkedRecipes: RecipeShort[] = recipe.linkedRecipes;

  let allLinkedRecipes = Recipe.addLinkedRecipe({
    linkedRecipes: allreadyLinkedRecipes,
    recipeToLink: newRecipe,
  });
  expect(allLinkedRecipes).toBeDefined();
  expect(allLinkedRecipes.length).toEqual(3);
  expect(allLinkedRecipes[1].name).toEqual("Spätzli");
});
/* =====================================================================
// Verlinktes Rezept entfernen
// ===================================================================== */
test("Recipe.removeLinkedRecipe(): Verlinktes Rezept entfernen", () => {
  let allreadyLinkedRecipes: RecipeShort[] = recipe.linkedRecipes;

  let allLinkedRecipes = Recipe.removeLinkedRecipe({
    linkedRecipes: allreadyLinkedRecipes,
    recipeToRemoveUid: "NdSQvHJlnD0r4IoO8KsA",
  });

  expect(allLinkedRecipes).toBeDefined();
  expect(allLinkedRecipes.length).toEqual(2);
  expect(allLinkedRecipes[1].name).toEqual("Vegi Stroganoff");
});
/* =====================================================================
// Daten prüfen
// ===================================================================== */
test("Recipe.checkRecipeData(): Überprüfung der Eingabe vor dem Speichern", () => {
  let newRecipe = new Recipe();

  // ohne Namen
  expect(() => {
    Recipe.checkRecipeData(newRecipe);
  }).toThrow();

  // Portionen fehlen
  newRecipe.name = "Test";
  expect(() => {
    Recipe.checkRecipeData(newRecipe);
  }).toThrow();

  // Zutaten ohne UID
  newRecipe.portions = 4;
  newRecipe.ingredients = [
    {
      uid: "abcde",
      pos: 1,
      product: { uid: "", name: "Oktopus" },
      quantity: 1,
      unit: "kg",
      detail: "",
      scalingFactor: 1,
    },
  ];
  expect(() => {
    Recipe.checkRecipeData(newRecipe);
  }).toThrow();

  // Zutaten nur mit Menge
  newRecipe.ingredients = [
    {
      uid: "abcde",
      pos: 1,
      product: { uid: "", name: "" },
      quantity: 1,
      unit: "",
      detail: "",
      scalingFactor: 1,
    },
  ];
  expect(() => {
    Recipe.checkRecipeData(newRecipe);
  }).toThrow();

  // Zutaten nur mit Einheit
  newRecipe.ingredients = [
    {
      uid: "abcde",
      pos: 1,
      product: { uid: "", name: "" },
      quantity: 0,
      unit: "kg",
      detail: "",
      scalingFactor: 1,
    },
  ];
  expect(() => {
    Recipe.checkRecipeData(newRecipe);
  }).toThrow();

  // Zutaten nur mit Name
  newRecipe.ingredients = [
    {
      uid: "abcde",
      pos: 1,
      product: { uid: "", name: "Oktopus" },
      quantity: 0,
      unit: "",
      detail: "",
      scalingFactor: 1,
    },
  ];
  expect(() => {
    Recipe.checkRecipeData(newRecipe);
  }).toThrow();

  // Zutaten OK
  newRecipe.ingredients = [
    {
      uid: "abcde",
      pos: 1,
      product: { uid: "SAk6W0EkQ5sXFG98WHKN", name: "Oktopus" },
      quantity: 0,
      unit: "",
      detail: "",
      scalingFactor: 1,
    },
  ];
  expect(() => {
    Recipe.checkRecipeData(newRecipe);
  }).not.toThrow();
});
/* =====================================================================
// leere Zutaten entfernen
// ===================================================================== */
test("Recipe.deleteEmptyIngredients(): Leere Zutaten löschen", () => {
  let ingredients: Ingredient[] = recipe.ingredients;

  let checkedIngriendts = Recipe.deleteEmptyIngredients(ingredients);

  expect(checkedIngriendts).toBeDefined();
  expect(checkedIngriendts.length).toEqual(3);
});
/* =====================================================================
// leere Zubereitungsschritte entfernen
// ===================================================================== */
test("Recipe.deleteEmptyPreparationSteps(): leere Zubereitungsschritte löschen:", () => {
  let preparationSteps: PreparationStep[] = recipe.preparationSteps;
  let cleanedPreparationSteps =
    Recipe.deleteEmptyPreparationSteps(preparationSteps);

  expect(cleanedPreparationSteps).toBeDefined();
  expect(cleanedPreparationSteps.length).toEqual(2);
});
/* =====================================================================
// Speichern vorbereiten
// ===================================================================== */
test("Recipe.prepareSave(): Vorbereitungsschritte für das Speichern", () => {
  let recipeToCheck = Object.assign({}, recipe);

  let preparedRecipe = Recipe.prepareSave(recipeToCheck);

  expect(preparedRecipe).toBeDefined();
  expect(preparedRecipe.ingredients.length).toEqual(3);
  expect(preparedRecipe.ingredients[1].product.name).toEqual("Nori");
  expect(preparedRecipe.preparationSteps.length).toEqual(2);
  expect(preparedRecipe.preparationSteps[1].pos).toEqual(2);
  expect(preparedRecipe.preparationSteps[1].step).toEqual("Hacken");
  // expect(preparedRecipe.pictureSrcFullSize).toEqual(preparedRecipe.pictureSrc);

  recipeToCheck.ingredients = [Recipe.createEmptyIngredient()];
  recipeToCheck.preparationSteps = [Recipe.createEmptyPreparationStep()];
  preparedRecipe = Recipe.prepareSave(recipeToCheck);

  expect(preparedRecipe).toBeDefined();

  recipeToCheck.name = "";
  expect(() => {
    Recipe.prepareSave(recipeToCheck);
  }).toThrow();
});
/* =====================================================================
// Genutzte Produkte sammeln (damit diese auch wieder gefunden werden)
// ===================================================================== */
test("Recipe.getUsedProducts(): Genutze Zutaten extrahieren", () => {
  let recipeToCheck = Object.assign({}, recipe);
  let ingredients = Recipe.deleteEmptyIngredients(recipeToCheck.ingredients);
  let usedProducts = Recipe.getUsedProducts(ingredients);

  expect(usedProducts).toBeDefined();
  expect(usedProducts.length).toEqual(3);
  expect(usedProducts[0]).toEqual("xyz");
  expect(usedProducts[1]).toEqual("n0r!");
});
/* =====================================================================
// Eintrag in Array hinzufügen
// ===================================================================== */
test("Recipe.addEmptyEntry(): Eintrag in einfügen.", () => {
  let testRecipe = Object.assign({}, recipe);

  let emptyIngredient = Recipe.createEmptyIngredient();
  let emptyPreparationStep = Recipe.createEmptyPreparationStep();
  let newArrayIngredient = Recipe.addEmptyEntry({
    array: testRecipe.ingredients,
    pos: 1,
    emptyObject: emptyIngredient,
    renumberByField: "pos",
  }) as Ingredient[];

  expect(newArrayIngredient).toBeDefined();
  expect(newArrayIngredient.length).toEqual(5);
  expect(newArrayIngredient[2].uid).toEqual("fghij");

  let newArrayPreparationStep = Recipe.addEmptyEntry({
    array: testRecipe.preparationSteps,
    pos: 1,
    emptyObject: emptyPreparationStep,
    renumberByField: "pos",
  }) as PreparationStep[];

  expect(newArrayPreparationStep).toBeDefined();
  expect(newArrayPreparationStep.length).toEqual(5);
  expect(newArrayPreparationStep[3].uid).toEqual("mnopqr");
});
/* =====================================================================
// Eintrag in Array löschen
// ===================================================================== */
test("Recipe.deleteEntry(): Eintrag aus Array löschen", () => {
  let testRecipe: Recipe = Object.assign({}, recipe);

  let deletedArray = Recipe.deleteEntry({
    array: testRecipe.ingredients,
    fieldValue: "abcde",
    fieldName: "uid",
    emptyObject: Recipe.createEmptyIngredient(),
    renumberByField: "pos",
  });
  expect(deletedArray).toBeDefined();
  expect(deletedArray.length).toEqual(3);
  expect(deletedArray[0].uid).toEqual("fghij");

  // Test, wenn letzes Element gelöscht wird
  deletedArray = Recipe.deleteEntry({
    array: deletedArray,
    fieldValue: "fghij",
    fieldName: "uid",
    emptyObject: Recipe.createEmptyIngredient(),
    renumberByField: "pos",
  });
  expect(deletedArray).toBeDefined();
  expect(deletedArray.length).toEqual(2);

  deletedArray = Recipe.deleteEntry({
    array: deletedArray,
    fieldValue: "klmno",
    fieldName: "uid",
    emptyObject: Recipe.createEmptyIngredient(),
    renumberByField: "pos",
  });
  expect(deletedArray).toBeDefined();
  expect(deletedArray.length).toEqual(1);

  deletedArray = Recipe.deleteEntry({
    array: deletedArray,
    fieldValue: "pqrst",
    fieldName: "uid",
    emptyObject: Recipe.createEmptyIngredient(),
    renumberByField: "pos",
  });

  expect(deletedArray).toBeDefined();
  expect(deletedArray.length).toEqual(1);
});
/* =====================================================================
  // Eintrag in Liste runter schieben
  // ===================================================================== */
test("Recipe.moveArrayEntryDown(): Element nach unten schieben", () => {
  let testRecipe: Recipe = Object.assign({}, recipe);

  let arrangedIngredients = Recipe.moveArrayEntryDown({
    array: testRecipe.ingredients,
    posToMoveDown: 1,
    renumberByField: "pos",
  }) as Ingredient[];
  expect(arrangedIngredients).toBeDefined();
  expect(arrangedIngredients.length).toEqual(4);
  expect(arrangedIngredients[0].pos).toEqual(1);
  expect(arrangedIngredients[1].product.name).toEqual("Oktopus");
});
/* =====================================================================
// Eintrag in Liste runter schieben
// ===================================================================== */
test("Recipe.moveArrayEntryUp(): Element nach oben schieben", () => {
  let testRecipe: Recipe = Object.assign(recipe);

  let arrangedIngredients = Recipe.moveArrayEntryUp({
    array: testRecipe.ingredients,
    posToMoveUp: 2,
    renumberByField: "pos",
  }) as Ingredient[];
  expect(arrangedIngredients).toBeDefined();
  expect(arrangedIngredients.length).toEqual(4);
  expect(arrangedIngredients[0].pos).toEqual(1);
  expect(arrangedIngredients[1].product.name).toEqual("Oktopus");
});
/* =====================================================================
// Rezept skalieren
// ===================================================================== */
test("Recipe.scale(): Rezept skalieren", () => {
  let testRecipe: Recipe = Object.assign({}, recipe);
  let scaledIngredients = Recipe.scale({
    recipe: testRecipe,
    portionsToScale: 12,
  });
  expect(scaledIngredients).toBeDefined();
  expect(scaledIngredients.length).toEqual(4);
  expect(scaledIngredients[0].quantity).toEqual(126);
  expect(scaledIngredients[2].quantity).toEqual(3);
});
/* =====================================================================
// Rezept lesen
// ===================================================================== */
test("Recipe.getRecipe(): Rezept lesen", () => {
  //TODO: richtig mocken....

  expect(true).toBeTruthy();
});
/* =====================================================================

// TEST_MISSING
// Zur Zeit keine Prüfung!
/* =====================================================================
// Daten in Firebase SPEICHERN
// ===================================================================== */
// test("Recipe.save(): Daten speichern", () => {});
/* =====================================================================
// Rating updaten
// ===================================================================== */
// test("Recipe.updateRating(): XXX", () => {});
/* =====================================================================
// Kommentar speichern
// ===================================================================== */
// test("Recipe.saveComment(): XXX", () => {});
