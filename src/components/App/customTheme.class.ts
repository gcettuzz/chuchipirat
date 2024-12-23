import {PaletteColorOptions} from "@mui/material";
import Utils, {Enviroment} from "../Shared/utils.class";
import red from "@mui/material/colors/red";

interface CustomColorPalette {
  type: string;
  primary: PaletteColorOptions;
  secondary: PaletteColorOptions;
  error: PaletteColorOptions;
}

export default class CustomTheme {
  static getTheme = (prefersDarkMode: boolean): CustomColorPalette => {
    switch (Utils.getEnviroment()) {
      case Enviroment.production:
      case Enviroment.development:
        if (prefersDarkMode) {
          return {
            type: "dark",
            primary: {
              main: "#00bcd4",
              light: "#fff",
              dark: "#fff",
              contrastText: "#000",
            },
            secondary: {
              main: "#c6ff00",
              light: "#fdff58",
              dark: "#90cc00",
              contrastText: "#000",
            },
            error: red,
          };
        } else {
          return {
            type: "light",
            primary: {
              main: "#006064",
              light: "#428e92",
              dark: "#00363a",
              contrastText: "#fff",
            },
            secondary: {
              main: "#c6ff00",
              light: "#fdff58",
              dark: "#90cc00",
              contrastText: "#000",
            },
            error: red,
          };
        }
      case Enviroment.test:
        if (prefersDarkMode) {
          return {
            type: "dark",
            primary: {
              main: "#AB47BC",
              light: "#E1BEE7",
              dark: "#9C27B0",
              contrastText: "#fff",
            },
            secondary: {
              main: "#c6ff00",
              light: "#fdff58",
              dark: "#90cc00",
              contrastText: "#000",
            },
            error: red,
          };
        } else {
          return {
            type: "light",
            primary: {
              main: "#6a1b9a",
              light: "#8748ae",
              dark: "#4a126b",
              contrastText: "#fff",
            },
            secondary: {
              main: "#c6ff00",
              light: "#fdff58",
              dark: "#90cc00",
              contrastText: "#000",
            },
            error: red,
          };
        }
    }
  };
}
