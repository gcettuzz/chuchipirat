import React from "react";
import {useTheme} from "@material-ui/core/styles";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  AutocompleteChangeReason,
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";

import {RecipeProduct} from "../../Recipe/recipe.class";
import Material, {MaterialType} from "../../Material/material.class";
import Utils from "../../Shared/utils.class";

import {ITEM, ADD, ITEM_CANT_BE_CHANGED} from "../../../constants/text";
import Product from "../../Product/product.class";
import {ItemType} from "./shoppingList.class";

interface ItemAutocompleteProps {
  componentKey: string;
  item: MaterialItem | ProductItem | null;
  materials: Material[];
  products: Product[];
  disable: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: string | MaterialItem | ProductItem | null,
    action: AutocompleteChangeReason,
    objectId: string
  ) => void;
  error: {isError: boolean; errorText: string};
}
interface filterHelpWithSortRank {
  uid: string;
  name: string;
  type: MaterialType;
  sortRank?: number;
  usable: boolean;
  itemType: ItemType;
}

export interface ProductItem extends Product {
  itemType: ItemType;
}

export interface MaterialItem extends Material {
  itemType: ItemType;
}

type Item = ProductItem | MaterialItem;

// ===================================================================== */
/**
 * Autocomplete Feld für Produkte und Material kombiniert
 * @param param0
 * @returns
 */
const ItemAutocomplete = ({
  componentKey,
  item,
  materials,
  products,
  disable,
  error,
  onChange,
}: ItemAutocompleteProps) => {
  const theme = useTheme();
  const breakpointIsXs = useMediaQuery(theme.breakpoints.down("xs"));
  // Handler für Zutaten/Produkt hinzufügen
  const filter = createFilterOptions<MaterialItem | ProductItem>();

  const [items, setItems] = React.useState<Array<ProductItem | MaterialItem>>(
    []
  );

  if (items.length == 0) {
    let tempProducts: ProductItem[] = products.map((product) => ({
      ...product,
      itemType: ItemType.food,
    }));
    let tempMaterials: MaterialItem[] = materials.map((material) => ({
      ...material,
      itemType: ItemType.material,
    }));

    // Ein Array mit beiden Elementen drin
    let tempItems = [...tempProducts, ...tempMaterials];
    Utils.sortArray({array: items, attributeName: "name"});
    setItems(tempItems);
  }

  return (
    <Autocomplete
      key={"item_" + componentKey}
      id={"item_" + componentKey}
      value={item?.name}
      options={items}
      disabled={disable}
      autoSelect
      autoHighlight
      // getOptionSelected={(optionItem) => optionItem.name === item.name}
      getOptionSelected={(option, value) => option.name === item?.name}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }

        if (option.name.endsWith(ADD)) {
          let words = option.name.match('".*"');
          if (words && words.length >= 0) {
            return words[0].slice(1, -1);
          }
        }
        return option.name;
      }}
      onChange={(event, newValue, action) => {
        onChange(
          event as unknown as React.ChangeEvent<HTMLInputElement>,
          newValue,
          action,
          "item_" + componentKey
        );
      }}
      fullWidth
      filterOptions={(options, params) => {
        let filtered = filter(options, params) as Item[];
        if (
          params.inputValue !== "" &&
          // Sicherstellen, dass kein Produkt mit gleichem Namen erfasst wird
          items.find(
            (item) =>
              item.name.toLowerCase() === params.inputValue.toLowerCase()
          ) === undefined &&
          !params.inputValue.endsWith(ADD)
        ) {
          // Hinzufügen-Möglichkeit auch als Produkt reinschmuggeln
          let newMaterial: MaterialItem = {
            ...new Material(),
            itemType: ItemType.material,
          };

          newMaterial.name = `"${params.inputValue}" ${ADD}`;
          filtered.push(newMaterial);
        }
        // So sortieren, dass Zutaten, die mit den gleichen Zeichen beginnen
        // vorher angezeigt werden (Salz vor Erdnüsse, gesalzen)
        let tempFiltered = filtered.map((entry) => {
          let sortRank: number;

          if (
            entry.name.substring(0, params.inputValue.length).toLowerCase() ===
            params.inputValue.toLowerCase()
          ) {
            sortRank = 1;
          } else {
            sortRank = 100;
          }

          return {...entry, ...{sortRank: sortRank}};
        }) as filterHelpWithSortRank[];

        tempFiltered = Utils.sortArray({
          array: tempFiltered,
          attributeName: "sortRank",
        });
        filtered = tempFiltered.map((entry) => {
          delete entry.sortRank;
          return entry;
        });
        return filtered;
      }}
      renderOption={(option) => option.name}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label={ITEM}
          size="small"
          error={error.isError}
          helperText={
            error.isError
              ? error.errorText
              : disable
              ? ITEM_CANT_BE_CHANGED
              : ""
          }
        />
      )}
    />
  );
};
export default ItemAutocomplete;
