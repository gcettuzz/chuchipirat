import React from "react";
import TextField from "@mui/material/TextField";

import {
  Autocomplete,
  AutocompleteChangeReason,
  createFilterOptions,
} from "@mui/material";

import {RecipeProduct} from "../Recipe/recipe.class";
import Material, {MaterialType} from "./material.class";
import Utils from "../Shared/utils.class";

import {MATERIAL, ADD, ITEM_CANT_BE_CHANGED} from "../../constants/text";
import {TextFieldSize} from "../../constants/defaultValues";

interface MaterialAutocompleteProps {
  componentKey?: string;
  material: Material | RecipeProduct | null;
  materials: Material[];
  label?: string;
  disabled: boolean;
  allowCreateNewMaterial?: boolean;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    newValue: string | Material | null,
    action: AutocompleteChangeReason,
    objectId: string
  ) => void;
  error?: {isError: boolean; errorText: string};
  size?: TextFieldSize;
}
interface filterHelpWithSortRank {
  uid: string;
  name: string;
  type: MaterialType;
  sortRank?: number;
  usable: boolean;
}

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
  label = MATERIAL,
  disabled,
  allowCreateNewMaterial = true,
  onChange,
  error,
  size = TextFieldSize.medium,
}: MaterialAutocompleteProps) => {
  // Handler für Zutaten/Produkt hinzufügen
  const filter = createFilterOptions<Material>();

  return (
    <Autocomplete
      id={componentKey ? "material_" + componentKey : "material"}
      key={componentKey ? "material_" + componentKey : "material"}
      value={material?.name}
      onChange={(event, newValue, reason) =>
        onChange(
          event as unknown as React.ChangeEvent<HTMLInputElement>,
          newValue,
          reason,
          componentKey ? "material_" + componentKey : "material"
        )
      }
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
          if (allowCreateNewMaterial) {
            // Hinzufügen-Möglichkeit auch als Produkt reinschmuggeln
            const newMaterial = new Material();
            newMaterial.name = `"${params.inputValue}" ${ADD}`;
            filtered.push(newMaterial);
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
      options={materials}
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
      disabled={disabled}
      isOptionEqualToValue={(optionMaterial) =>
        optionMaterial.name === material?.name
      }
      fullWidth
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error?.isError}
          helperText={
            error?.isError
              ? error.errorText
              : disabled
              ? ITEM_CANT_BE_CHANGED
              : ""
          }
          size={size}
        />
      )}
    />
  );
};
export default MaterialAutocomplete;
