import Firebase from "../Firebase";
import FirebaseAnalyticEvent from "../../constants/firebaseEvent";

import AuthUser from "../Firebase/Authentication/authUser.class";

import Utils from "../Shared/utils.class";
import Stats, {StatsField, STATS_FIELDS} from "../Shared/stats.class";
import Feed, {FeedType} from "../Shared/feed.class";
import Role from "../../constants/roles";
import Product from "../Product/product.class";

export enum MaterialType {
  none = 0,
  consumable,
  usage,
}

interface CreateMaterialProps {
  firebase: Firebase;
  name: string;
  type: MaterialType;
  authUser: AuthUser;
}

interface GetAllMaterials {
  firebase: Firebase;
  onlyUsable?: boolean;
}
export default class Material {
  uid: string;
  name: string;
  type: MaterialType;
  usable: boolean;

  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.name = "";
    this.type = MaterialType.consumable;
    this.usable = false;
  }
  // =====================================================================
  /**
   * Alle Materiale aus der DB holen -->
   * Möglichkeit mit onlyUsable die nicht nutzbaren Produkte
   * auszufiltern.
   * @param Objekt nach Interface GetAllMaterials
   * @returns Liste der Materiale
   */
  static async getAllMaterials({firebase, onlyUsable}: GetAllMaterials) {
    let materials: Material[] = [];

    // Produkte holen
    await firebase.masterdata.materials
      .read<Object>({uids: []})
      .then((result) => {
        Object.entries(result).forEach(([key, value]) => {
          if (onlyUsable === true && value.usable === false) {
            // Nächster Datensatz
            return;
          }

          materials.push({
            uid: key,
            name: value.name,
            type: value.type,
            usable: value.usable,
          });
        });

        materials = Utils.sortArray({
          array: materials,
          attributeName: "name",
        });
      })
      .catch((error) => {
        throw error;
      });

    return materials;
  }
  /* =====================================================================
  // Material anlegen
  // ===================================================================== */
  static createMaterial = async ({
    firebase,
    name,
    type,
    authUser,
  }: CreateMaterialProps) => {
    let material = new Material();

    material.uid = Utils.generateUid(20);
    material.name = name.trim();
    material.type = type;
    material.usable = true;

    // Dokument updaten mit neuem Produkt
    firebase.masterdata.materials.update<Material>({
      uids: [""], // Wird in der Klasse bestimmt
      value: material,
      authUser: authUser,
    });

    // Event auslösen
    firebase.analytics.logEvent(FirebaseAnalyticEvent.materialCreated);

    // interner Feed-Eintrag
    Feed.createFeedEntry({
      firebase: firebase,
      authUser: authUser,
      feedType: FeedType.materialCreated,
      feedVisibility: Role.communityLeader,
      objectUid: material.uid,
      objectName: material.name,
    });

    // Statistik
    Stats.incrementStat({
      firebase: firebase,
      field: StatsField.noMaterials,
      value: 1,
    });

    return material;
  };
}
