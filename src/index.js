import React from "react";
import ReactDOM from "react-dom";
import reportWebVitals from "./reportWebVitals";
import * as Sentry from "@sentry/react";

import App from "../src/components/App/App";
import {FirebaseContext} from "./components/Firebase/firebaseContext";
import packageJson from "../package.json";

import "typeface-roboto";
import "@fontsource/roboto-mono";

import {CustomDialogContextProvider} from "./components/Shared/customDialogContext";
import {NavigationContextProvider} from "./components/Navigation/navigationContext";
import Firebase from "./components/Firebase/firebase.class";
import ErrorInfo from "./components/500/500";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENVIROMENT,
  release: packageJson.version,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/chuchipirat\.ch/,
    /^https:\/\/chuchipirat-tst\.web\.app/,
  ],
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

ReactDOM.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorInfo />}>
      <FirebaseContext.Provider value={new Firebase()}>
        <CustomDialogContextProvider>
          <NavigationContextProvider>
            <App />
          </NavigationContextProvider>
        </CustomDialogContextProvider>
      </FirebaseContext.Provider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
