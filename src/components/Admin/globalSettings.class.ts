import Firebase from "../Firebase/firebase.class";
import AuthUser from "../Firebase/Authentication/authUser.class";

interface GetGlobalSettings {
  firebase: Firebase;
}
interface Save {
  firebase: Firebase;
  authUser: AuthUser;
  globalSettings: GlobalSettings;
}
interface SignOutAllUsers {
  firebase: Firebase;
  authUser: AuthUser;
}

class GlobalSettings {
  allowSignUp: boolean;
  maintenanceMode: boolean;

  constructor() {
    this.allowSignUp = false;
    this.maintenanceMode = false;
  }

  static getGlobalSettings = async ({firebase}: GetGlobalSettings) => {
    let globalSettings = {} as GlobalSettings;

    await firebase.configuration.globalSettings
      .read<GlobalSettings>({uids: []})
      .then((result) => {
        globalSettings = result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    return globalSettings;
  };
  /* =====================================================================
  // Speichern
  // ===================================================================== */
  static save = async ({firebase, authUser, globalSettings}: Save) => {
    // Update, da da auch Werte stehen, die nicht geändert werden sollen
    await firebase.configuration.globalSettings
      .update({
        uids: [],
        value: globalSettings,
        authUser: authUser,
      })
      .then((result) => (globalSettings = result as GlobalSettings))
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
  /* =====================================================================
  // Alle User abmelden (über Cloud-FX)
  // ===================================================================== */
  static signOutAllUsers = async ({firebase, authUser}: SignOutAllUsers) => {
    await firebase.cloudFunction.signOutAllUsers
      .triggerCloudFunction({values: {}, authUser: authUser})
      .catch((error) => {
        console.error(error);
        throw error;
      });
  };
}

export default GlobalSettings;
