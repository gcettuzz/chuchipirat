import React, {Dispatch, SetStateAction, useState} from "react";
import Action from "../../constants/actions";

export enum NavigationObject {
  none = 0,
  home,
  menueplan,
  groupConfigruation,
  usedRecipes,
  shoppingList,
  materialList,
  eventSettings,
}

interface NavigationValues {
  object: NavigationObject;
  action: Action;
}

interface NavigationContext {
  navigationValues: NavigationValues;
  setNavigationValues: Dispatch<SetStateAction<NavigationValues>>;
}

export const NavigationValuesContext =
  React.createContext<NavigationContext | null>(null);

export const NavigationContextProvider = ({children}) => {
  const [navigationValues, setNavigationValues] = useState<NavigationValues>({
    object: NavigationObject.none,
    action: Action.NONE,
  });

  return (
    <NavigationValuesContext.Provider
      value={{navigationValues, setNavigationValues}}
    >
      {children}
    </NavigationValuesContext.Provider>
  );
};
