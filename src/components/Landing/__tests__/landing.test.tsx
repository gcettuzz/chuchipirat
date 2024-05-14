import React from "react";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {LandingBase} from "../landing";
import Firebase from "../../Firebase/firebase.class";
import {createMemoryHistory} from "history";
import userEvent from "@testing-library/user-event";
import authUser from "../../Firebase/Authentication/__mocks__/authuser.mock";
import {
  SIGN_IN as ROUTE_SIGN_IN,
  SIGN_UP as ROUTE_SIGN_UP,
  HOME as ROUTE_HOME,
} from "../../../constants/routes";

const history = createMemoryHistory();

const location = {
  pathname: "/",
  search: "",
  hash: "",
  state: {},
};

const mockProps = {
  match: {
    params: undefined,
    isExact: true,
    path: "",
    url: "",
  },
  history: history,
  location: location,
  firebase: {} as Firebase, // Hier können Sie auch ein Mock-Firebase-Objekt bereitstellen, falls erforderlich
};

test("Buttons aktiv", () => {
  render(<LandingBase {...mockProps} authUser={null} />);

  // Test status of button here
  let button = screen.getByRole("button", {name: /Anmelden/i});
  expect(button).toBeEnabled();
  button = screen.getByRole("button", {name: /Registrieren/i});
  expect(button).toBeEnabled();
});

test("Navigation funktioniert", () => {
  render(<LandingBase {...mockProps} authUser={null} />);
  let button = screen.getByRole("button", {name: /Anmelden/i});
  userEvent.click(button);

  expect(history.location.pathname).toBe(ROUTE_SIGN_IN);
  button = screen.getByRole("button", {name: /Registrieren/i});

  userEvent.click(button);
  expect(history.location.pathname).toBe(ROUTE_SIGN_UP);
});

test("Authuser != null, Weiterleitung zu Home", () => {
  render(<LandingBase {...mockProps} authUser={authUser} />);
  expect(history.location.pathname).toBe(ROUTE_HOME);
});
