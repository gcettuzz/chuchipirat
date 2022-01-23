class GlobalSettings {
  static getGlobalSettings = async ({ firebase }) => {
    let globalSettings = {};

    const document = firebase.db.doc(`_configuration/globalSettings`);

    await document
      .get()
      .then((snapshot) => {
        globalSettings = snapshot.data();
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
  static setGlobalSettings = async ({ firebase, globalSettings }) => {
    const document = firebase.db.doc(`_configuration/globalSettings`);

    await document.update(globalSettings).catch((error) => {
      console.error(error);
      throw error;
    });
  };
}

export default GlobalSettings;
