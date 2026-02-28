import React, {Dispatch, SetStateAction, useState} from "react";
import Action from "../../constants/actions";

export enum NavigationObject {
  none = 0,
  home,
  menueplan,
  groupConfiguration,
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

interface NavigationContextProviderProps {
  children: JSX.Element;
}

export const NavigationContextProvider = ({
  children,
}: NavigationContextProviderProps) => {
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
