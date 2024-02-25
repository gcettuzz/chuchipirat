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

class GlobalSettings {
  allowSignUp: boolean;

  constructor() {
    this.allowSignUp = false;
  }

  static getGlobalSettings = async ({firebase}: GetGlobalSettings) => {
    let globalSettings = {} as GlobalSettings;

    await firebase.configuration.globalSettings
      .read<GlobalSettings>({uids: []})
      .then((result) => (globalSettings = result))
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
    await firebase.configuration.globalSettings
      .set({
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
}

export default GlobalSettings;
