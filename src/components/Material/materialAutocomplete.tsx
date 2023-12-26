import React from "react";
import {useTheme} from "@material-ui/core/styles";

import useMediaQuery from "@material-ui/core/useMediaQuery";

import TextField from "@material-ui/core/TextField";
import Autocomplete, {
  AutocompleteChangeReason,
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";

import {RecipeProduct} from "../Recipe/recipe.class";
import Material, {MaterialType} from "./material.class";
import Utils from "../Shared/utils.class";

import {MATERIAL, ADD} from "../../constants/text";
import Product from "../Product/product.class";

interface MaterialAutocompleteProps {
  componentKey: string;
  material: Material | RecipeProduct;
  materials: Material[];
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: string | Material,
    action: AutocompleteChangeReason,
    objectId: string
  ) => void;
}
interface filterHelpWithSortRank {
  uid: string;
  name: string;
  type: MaterialType;
  sortRank?: number;
  usable: boolean;
}

type Item = Product | Material;

// ===================================================================== */
/**
 * Autocomplete Feld für Material
 * @param param0
 * @returns
 */
const MaterialAutocomplete = ({
  componentKey,
  material,
  materials,
  onChange,
}: MaterialAutocompleteProps) => {
  const theme = useTheme();
  const breakpointIsXs = useMediaQuery(theme.breakpoints.down("xs"));
  // Handler für Zutaten/Produkt hinzufügen
  const filter = createFilterOptions<Material>();

  let items: Item[] = [];

  return (
    <Autocomplete
      key={"material_" + componentKey}
      id={"material_" + componentKey}
      value={material.name}
      options={materials}
      autoSelect
      autoHighlight
      getOptionSelected={(optionMaterial) =>
        optionMaterial.name === material.name
      }
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
      onChange={(event, newValue, action) =>
        newValue &&
        onChange(
          event as unknown as React.ChangeEvent<HTMLInputElement>,
          newValue,
          action,
          "material_" + componentKey
        )
      }
      fullWidth
      filterOptions={(options, params) => {
        let filtered = filter(options, params) as Material[];
        if (
          params.inputValue !== "" &&
          // Sicherstellen, dass kein Produkt mit gleichem Namen erfasst wird
          materials.find(
            (material) =>
              material.name.toLowerCase() === params.inputValue.toLowerCase()
          ) === undefined &&
          !params.inputValue.endsWith(ADD)
        ) {
          // Hinzufügen-Möglichkeit auch als Produkt reinschmuggeln
          let newMaterial = new Material();
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
        <TextField {...params} label={MATERIAL} size="small" />
      )}
    />
  );
};
export default MaterialAutocomplete;
