import React from "react";
import {AlertColor, AutocompleteChangeReason} from "@mui/material";
import Product from "../../Product/product.class";
import Department from "../../Department/department.class";
import Unit from "../../Unit/unit.class";
import ShoppingList, {
  ItemType,
  ShoppingListItem,
} from "./shoppingList.class";
import ShoppingListCollection, {
  ShoppingListTrace,
} from "./shoppingListCollection.class";
import Recipe from "../../Recipe/recipe.class";
import Utils from "../../Shared/utils.class";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "../../Shared/customDialogContext";
import {ItemAutocompleteProps, ProductItem} from "./itemAutocomplete";
import {
  ARTICLE_ALREADY_ADDED as TEXT_ARTICLE_ALREADY_ADDED,
  REPLACE as TEXT_REPLACE,
  SUM as TEXT_SUM,
  ADD_OR_REPLACE_ARTICLE,
  SHOPPINTLIST_ITEM_MOVED_TO_RIGHT_DEPARTMENT as TEXT_SHOPPINTLIST_ITEM_MOVED_TO_RIGHT_DEPARTMENT,
} from "../../../constants/text";

/* ===================================================================
// ========================= Type Definitions ========================
// =================================================================== */
export type ItemChange =
  | {
      source: "textfield";
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
      value: string;
    }
  | {
      source: "autocompleteItem";
      event: React.ChangeEvent<HTMLInputElement>;
      value: ItemAutocompleteProps["item"];
      reason: AutocompleteChangeReason;
      objectId: string;
    }
  | {
      source: "autocompleteUnit";
      event: React.ChangeEvent<HTMLInputElement>;
      value: Unit | null;
      reason: AutocompleteChangeReason;
      objectId: string;
    };

enum AddItemAction {
  REPLACE = 1,
  ADD,
}

interface UseShoppingListOperationsProps {
  shoppingList: ShoppingList | null;
  shoppingListCollection: ShoppingListCollection;
  selectedListItem: string | null;
  departments: Department[];
  onShoppingListUpdate: (shoppingList: ShoppingList) => void;
  onShoppingCollectionUpdate: (
    shoppingListCollection: ShoppingListCollection,
  ) => void;
  onSnackbarShow: (severity: AlertColor, message: string) => void;
}

/* ===================================================================
// ========================= Helper Functions ========================
// =================================================================== */

/**
 * Determine which department an item belongs to based on its type
 */
const determineItemDepartment = ({
  itemType,
  itemValue,
  currentDepartmentPos,
  departments,
}: {
  itemType: ItemType;
  itemValue: ItemAutocompleteProps["item"];
  currentDepartmentPos: number;
  departments: Department[];
}): Department | undefined => {
  switch (itemType) {
    case ItemType.food:
      return departments.find(
        (department) =>
          department.uid == (itemValue as ProductItem).department.uid,
      );
    case ItemType.material:
      return departments.find(
        (department) => department.name.toUpperCase() == "NON FOOD",
      );
    case ItemType.custom:
    case ItemType.none:
      return departments.find(
        (department) => department.pos == currentDepartmentPos,
      );
    default:
      return departments.find(
        (department) => department.pos == currentDepartmentPos,
      );
  }
};

/**
 * Move an item from one department to another in the shopping list
 */
const moveItemToDepartment = ({
  shoppingList,
  item,
  fromDepartmentPos,
  toDepartment,
  isNewItem,
}: {
  shoppingList: ShoppingList;
  item: ShoppingListItem;
  fromDepartmentPos: number;
  toDepartment: Department;
  isNewItem: boolean;
}): boolean => {
  if (toDepartment.pos != fromDepartmentPos && !isNewItem) {
    // Remove from original department
    shoppingList.list[Number(fromDepartmentPos) as Department["pos"]].items =
      shoppingList.list[fromDepartmentPos].items.filter(
        (listItem) => listItem.item.uid != item.item.uid,
      );
    // Add to correct department
    shoppingList.list[toDepartment.pos].items.push(item);
    return true;
  } else if (isNewItem) {
    if (!Object.hasOwn(shoppingList.list, toDepartment.pos)) {
      shoppingList.list[toDepartment.pos] = {
        departmentUid: toDepartment.uid,
        departmentName: toDepartment.name,
        items: [],
      };
    }
    shoppingList.list[toDepartment.pos].items.push(item);
    return toDepartment.pos != fromDepartmentPos;
  }
  return false;
};

/**
 * Create a trace entry for a shopping list item
 */
const createTraceEntry = ({
  shoppingListCollection,
  selectedListItem,
  item,
}: {
  shoppingListCollection: ShoppingListCollection;
  selectedListItem: string;
  item: ShoppingListItem;
}): ShoppingListTrace => {
  return ShoppingListCollection.addTraceEntry({
    trace: shoppingListCollection.lists[selectedListItem].trace,
    menueUid: "",
    recipe: {} as Recipe,
    item: item.item as Product,
    quantity: item.quantity,
    unit: item.unit,
    addedManually: true,
    itemType: item.type,
  });
};

/**
 * Handle duplicate item detection: prompt user to ADD or REPLACE
 * Returns null if cancelled, otherwise the chosen action.
 */
const handleDuplicateItem = async ({
  existingItem,
  newItem,
  customDialog,
}: {
  existingItem: ShoppingListItem;
  newItem: ShoppingListItem;
  customDialog: ReturnType<typeof useCustomDialog>["customDialog"];
}): Promise<SingleTextInputResult> => {
  return (await customDialog({
    dialogType: DialogType.selectOptions,
    title: TEXT_ARTICLE_ALREADY_ADDED,
    text: ADD_OR_REPLACE_ARTICLE(
      newItem.item.name,
      newItem.unit,
      newItem.quantity.toString(),
      existingItem.quantity.toString(),
    ),
    options: [
      {key: AddItemAction.REPLACE, text: TEXT_REPLACE},
      {key: AddItemAction.ADD, text: TEXT_SUM},
    ],
  })) as SingleTextInputResult;
};

/* ===================================================================
// ================================ Hook =============================
// =================================================================== */
const useShoppingListOperations = ({
  shoppingList,
  shoppingListCollection,
  selectedListItem,
  departments,
  onShoppingListUpdate,
  onShoppingCollectionUpdate,
  onSnackbarShow,
}: UseShoppingListOperationsProps) => {
  const {customDialog} = useCustomDialog();

  const onCheckboxClick = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const pressedCheckbox = event.target.name.split("_");
      const departmentIndex = parseInt(pressedCheckbox[1], 10);

      if (isNaN(departmentIndex) || !shoppingList?.list[departmentIndex]) {
        return;
      }

      const item = shoppingList.list[departmentIndex].items.find(
        (item: ShoppingListItem) =>
          item.item.uid == pressedCheckbox[2] &&
          item.unit == pressedCheckbox[3],
      ) as ShoppingListItem | undefined;

      if (!item) {
        return;
      }

      item.checked = !item.checked;
      onShoppingListUpdate(shoppingList);
    },
    [shoppingList, onShoppingListUpdate],
  );

  const onChangeItem = React.useCallback(
    async (change: ItemChange) => {
      const field = change.event.target.id.split("_");
      let newItem = false;
      let itemMovedToRightDepartment = false;
      let item = shoppingList?.list[parseInt(field[1])].items.find(
        (item) => item.item.uid == field[2],
      );
      let department: Department | undefined;
      let userInput = {valid: false, input: ""} as SingleTextInputResult;

      if (!shoppingList) {
        return;
      }
      if (!item) {
        item = ShoppingList.createEmptyListItem();
        item.item.uid = field[2];
        newItem = true;
      }

      if (!newItem) {
        item.manualEdit = true;
      }

      switch (change.source) {
        case "textfield":
          item.quantity = parseFloat(change.value);
          if (newItem) {
            shoppingList.list[parseInt(field[1])].items.push(item);
          }
          break;

        case "autocompleteItem":
          if (change.reason === "clear") {
            item.item.name = "";
            break;
          }
          if (!change.value) {
            break;
          }

          if (
            typeof change.value == "object" &&
            Object.hasOwn(change.value, "uid")
          ) {
            item.item = {uid: change.value.uid, name: change.value.name};
            item.type = change.value.itemType;
          }

          if (typeof change.value === "string") {
            if (item.item.uid.length == 20) {
              item.item.uid = Utils.generateUid(10);
            }
            item.item.name = change.value;
            item.type = ItemType.custom;
          }

          // Determine correct department
          department = determineItemDepartment({
            itemType: item.type,
            itemValue: change.value,
            currentDepartmentPos: parseInt(field[1]),
            departments,
          });

          if (!department) {
            department = departments.find(
              (department) => department.pos == parseInt(field[1]),
            )!;
          }
          if (!department) {
            console.error("Abteilung für Artikel nicht gefunden!");
            return;
          }

          // Move item to correct department
          itemMovedToRightDepartment = moveItemToDepartment({
            shoppingList,
            item,
            fromDepartmentPos: parseInt(field[1]),
            toDepartment: department,
            isNewItem: newItem,
          });

          // Check for duplicate items (only for items with UID length 20)
          if (item.item.uid.length == 20) {
            const currentItem = item;
            const existingShoppingListItem = shoppingList.list[
              department.pos
            ]?.items.find(
              (shoppingListItem) =>
                shoppingListItem !== currentItem &&
                shoppingListItem.item.uid == currentItem.item.uid &&
                shoppingListItem.unit == currentItem.unit,
            );

            if (
              existingShoppingListItem?.quantity == 0 &&
              item.quantity == 0
            ) {
              shoppingList.list[department.pos].items = shoppingList.list[
                department.pos
              ].items.filter((listItem) => listItem !== item);
              itemMovedToRightDepartment = false;
              return;
            }

            if (existingShoppingListItem && item.quantity != 0) {
              userInput = await handleDuplicateItem({
                existingItem: existingShoppingListItem,
                newItem: item,
                customDialog,
              });

              if (!userInput.valid) {
                shoppingList.list[department.pos].items = shoppingList.list[
                  department.pos
                ].items.filter((listItem) => listItem !== item);
                return;
              }

              switch (parseInt(userInput.input) as AddItemAction) {
                case AddItemAction.ADD: {
                  const addedQuantity = item.quantity;
                  existingShoppingListItem.quantity += addedQuantity;

                  const trace = createTraceEntry({
                    shoppingListCollection,
                    selectedListItem: selectedListItem!,
                    item,
                  });
                  const tempShoppingListCollection = {
                    ...shoppingListCollection,
                  };
                  tempShoppingListCollection.lists[selectedListItem!].trace =
                    trace;
                  onShoppingCollectionUpdate(tempShoppingListCollection);
                  break;
                }
                case AddItemAction.REPLACE:
                  existingShoppingListItem.quantity = item.quantity;
                  break;
                default:
                  console.warn("ENUM unbekannt:", userInput.input);
                  return;
              }

              shoppingList.list[department.pos].items = shoppingList.list[
                department.pos
              ].items.filter((listItem) => listItem !== item);
              existingShoppingListItem.manualEdit = true;
            }
          }
          break;

        case "autocompleteUnit":
          if (!change.value) {
            item.unit = "";
          } else {
            item.unit = change.value.key;
          }
          break;
      }

      // Create trace for new items with a name
      if (newItem && item.item.name) {
        const trace = createTraceEntry({
          shoppingListCollection,
          selectedListItem: selectedListItem!,
          item,
        });
        const tempShoppingListCollection = {...shoppingListCollection};
        tempShoppingListCollection.lists[selectedListItem!].trace = trace;
        onShoppingCollectionUpdate(tempShoppingListCollection);
      }

      onShoppingListUpdate(shoppingList!);

      if (itemMovedToRightDepartment) {
        onSnackbarShow(
          "info",
          TEXT_SHOPPINTLIST_ITEM_MOVED_TO_RIGHT_DEPARTMENT(
            item.item.name,
            department?.name as string,
          ),
        );
      }
    },
    [
      shoppingList,
      shoppingListCollection,
      selectedListItem,
      departments,
      customDialog,
      onShoppingListUpdate,
      onShoppingCollectionUpdate,
      onSnackbarShow,
    ],
  );

  return {
    onCheckboxClick,
    onChangeItem,
  };
};

export default useShoppingListOperations;
