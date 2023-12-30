export enum FirebaseAnalyticEvent {
  recipeCreated = "recipe_created",
  recipeVariantCreated = "recipe_variant_created",
  ingredientCreated = "ingredient_created",
  materialCreated = "material_created",
  recipeSearch = "recipe_search",
  recipeRatingSet = "recipe_rating_set",
  recipeCommentCreated = "recipe_comment_created",
  recipeShowPreviousComment = "recipe_show_previous_comments",
  eventCreated = "event_created",
  eventGetActual = "event_get_actual",
  eventGetHistory = "event_get_history",
  eventCookAdded = "event_cook_added",
  userCreated = "user_created",
  userChangedEmail = "user_changed_email",
  userChangedPassword = "user_changed_password",
  userResetetPassword = "user_reseted_password",
  unitCreated = "unit_created",
  unitConversionCreated = "unit_conversion_created",
  departmentCreated = "department_created",
  departmentUpdated = "department_updated",
  shoppingListGenerated = "shopping_list_generated",
  shoppingListRefreshed = "shopping_list_refreshed",
  shoppingListDeleted = "shopping_list_deleted",
  materialListGenerated = "material_list_generated",
  materialListRefreshed = "material_list_refreshed",
  materialListDeleted = "material_list_deleted",
  menuplanCreated = "menuplan_created",
  menuplanGet = "menuplan_get",
  quantityCalculationCreated = "quantity_calculation_created",
  uploadPicture = "upload_picture",
  deletePicture = "delete_picture",
  appForceRefresh = "app_force_refresh",
  cloudFunctionExecuted = "cloud_function_executed",
}
export default FirebaseAnalyticEvent;
