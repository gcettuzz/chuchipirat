import React from "react";

import TextField from "@mui/material/TextField";
import {
  Autocomplete,
  AutocompleteChangeReason,
  createFilterOptions,
} from "@mui/material";

import {IngredientProduct} from "../Recipe/recipe.class";
import Product, {DietProperties} from "./product.class";
import Department from "../Department/department.class";
import Unit from "../Unit/unit.class";
import Utils from "../Shared/utils.class";
import {ADD, INGREDIENT} from "../../constants/text";
import {TextFieldSize} from "../../constants/defaultValues";

interface ProductAutocompleteProps {
  componentKey: string;
  product: Product | IngredientProduct;
  products: Product[];
  label?: string;
  allowCreateNewProduct?: boolean;
  size?: TextFieldSize;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: string | Product | null,
    action: AutocompleteChangeReason,
    objectId: string
  ) => void;
}

interface filterHelpWithSortRank {
  uid: string;
  name: string;
  department: Department;
  shoppingUnit: Unit["key"];
  dietProperties: DietProperties;
  usable: boolean;
  sortRank?: number;
}

// ===================================================================== */
/**
 * Autocomplete Feld für Produkt
 * @param param0
 * @returns
 */
const ProductAutocomplete = ({
  componentKey,
  product,
  products,
  label = INGREDIENT,
  onChange,
  allowCreateNewProduct = true,
  size = TextFieldSize.medium,
}: ProductAutocompleteProps) => {
  // Handler für Zutaten/Produkt hinzufügen
  const filter = createFilterOptions<Product>();
  return (
    <Autocomplete
      id={"product_" + componentKey}
      key={"product_" + componentKey}
      value={product.name}
      onChange={(event, newValue, reason) => {
        onChange(
          event as unknown as React.ChangeEvent<HTMLInputElement>,
          newValue,
          reason,
          "product_" + componentKey
        );
      }}
      filterOptions={(options, params) => {
        let filtered = filter(options, params) as Product[];
        if (
          params.inputValue !== "" &&
          // Sicherstellen, dass kein Produkt mit gleichem Namen erfasst wird
          products.find(
            (product) =>
              product.name.toLowerCase() === params.inputValue.toLowerCase()
          ) === undefined &&
          !params.inputValue.endsWith(ADD)
        ) {
          if (allowCreateNewProduct) {
            // Hinzufügen-Möglichkeit auch als Produkt reinschmuggeln
            const newProduct = new Product();
            newProduct.name = `"${params.inputValue}" ${ADD}`;
            filtered.push(newProduct);
          }
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
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={products}
      getOptionLabel={(option) => {
        if (typeof option === "string") {
          return option;
        }

        if (option.name.endsWith(ADD)) {
          const words = option.name.match('".*"');
          if (words && words.length >= 0) {
            return words[0].slice(1, -1);
          }
        }
        return option.name;
      }}
      renderOption={(props, option) => {
        // eslint-disable-next-line react/prop-types
        const {key, ...optionProps} = props;
        return (
          <li key={key} {...optionProps}>
            {option.name}
          </li>
        );
      }}
      freeSolo
      autoSelect
      autoHighlight
      renderInput={(params) => (
        <TextField {...params} label={label} size={size} />
      )}
    />
  );
};

export default ProductAutocomplete;
