import {ERROR_NOT_IMPLEMENTED_YET} from "../../../constants/text";

import Firebase from "../firebase.class";
import FirebaseDbCloudFunctionUpdateUserPictureSrc from "./firebase.db.cloudfunction.updateUserPictureSrc.class";
import FirebaseDbCloudFunctionUpdateUserMotto from "./firebase.db.cloudfunction.updateUserMotto.class";
import FirebaseDbCloudFunctionUpdateRecipe from "./firebase.db.cloudfunction.updateRecipe.class";
import FirebaseDbCloudFunctionTraceObject from "./firebase.db.cloudfunction.traceObject.class";
import FirebaseDbCloudFunctionDeleteRecipe from "./firebase.db.cloudfunction.deleteRecipe.class";
import FirebaseDbCloudFunctionPublishRecipeRequest from "./firebase.db.cloudfunction.publishRecipeRequest.class";
import FirebaseDbCloudFunctionSendMail from "./firebase.db.cloudfunction.sendMail.class";
import FirebaseDbCloudFunctionDeleteFeeds from "./firebase.db.cloudfunction.deleteFeeds.class";
import FirebaseDbCloudFunctionMergeProducts from "./firebase.db.cloudfunction.mergeProducts.class";
import FirebaseDbCloudFunctionUpdateUserDisplayName from "./firebase.db.cloudfunction.updateUserDisplayName.class";
import FirebaseDbCloudFunctionUpdateProduct from "./firebase.db.cloudfunction.updateProduct";
import FirebaseDbCloudFunctionConvertProductToMaterial from "./firebase.db.cloudfunction.convertProductToMaterial.class";
import FirebaseDbCloudFunctionActivateSupportUser from "./firebase.db.cloudfunction.activateSupportUser.class";
import FirebaseDbCloudFunctionSignOutAllUsers from "./firebase.db.cloudfunction.signOutAllUsers.class";
import FirebaseDbCloudFunctionLog from "./firebase.db.cloudfunction.log.class";
import {
  FirebaseDbSuper,
  PrepareDataForApp,
  PrepareDataForDb,
  ValueObject,
} from "./firebase.db.super.class";
import {
  STORAGE_OBJECT_PROPERTY,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";
import FirebaseDbCloudFunctionRebuildStats from "./firebase.db.cloudfunction.rebuildStats.class";
import FirebaseDbCloudFunctionDeclineRecipeRequest from "./firebase.db.cloudfunction.declineRecipeRequest.class";
import FirebaseDbCloudFunctionUpdateMaterial from "./firebase.db.cloudfunction.updateMaterial";
import FirebaseDbCloudFunctionMergeMaterials from "./firebase.db.cloudfunction.mergeMaterials.class";
import FirebaseDbCloudFunctionConvertMaterialToProduct from "./firebase.db.cloudfunction.convertMaterialToProduct.class copy";
import FirebaseDbCloudFunctionCreateUserPublicData from "./firebase.db.cloudfunction.createUserPublicData.class";
import {collection, collectionGroup, doc} from "firebase/firestore";

export class FirebaseDbCloudFunction extends FirebaseDbSuper {
  firebase: Firebase;
  log: FirebaseDbCloudFunctionLog;
  updateRecipe: FirebaseDbCloudFunctionUpdateRecipe;
  deleteRecipe: FirebaseDbCloudFunctionDeleteRecipe;
  traceObject: FirebaseDbCloudFunctionTraceObject;
  updateUserMotto: FirebaseDbCloudFunctionUpdateUserMotto;
  updateUserDisplayName: FirebaseDbCloudFunctionUpdateUserDisplayName;
  updateUserPictureSrc: FirebaseDbCloudFunctionUpdateUserPictureSrc;
  publishRecipeRequest: FirebaseDbCloudFunctionPublishRecipeRequest;
  declineRecipeRequest: FirebaseDbCloudFunctionDeclineRecipeRequest;
  sendMail: FirebaseDbCloudFunctionSendMail;
  deleteFeeds: FirebaseDbCloudFunctionDeleteFeeds;
  mergeProducts: FirebaseDbCloudFunctionMergeProducts;
  mergeMaterials: FirebaseDbCloudFunctionMergeMaterials;
  convertProductToMaterial: FirebaseDbCloudFunctionConvertProductToMaterial;
  convertMaterialToProduct: FirebaseDbCloudFunctionConvertMaterialToProduct;
  updateProduct: FirebaseDbCloudFunctionUpdateProduct;
  updateMaterial: FirebaseDbCloudFunctionUpdateMaterial;
  activateSupportUser: FirebaseDbCloudFunctionActivateSupportUser;
  signOutAllUsers: FirebaseDbCloudFunctionSignOutAllUsers;
  rebuildStats: FirebaseDbCloudFunctionRebuildStats;
  createUserPublicData: FirebaseDbCloudFunctionCreateUserPublicData;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    super();
    this.firebase = firebase;
    this.log = new FirebaseDbCloudFunctionLog(firebase);
    this.updateRecipe = new FirebaseDbCloudFunctionUpdateRecipe(firebase);
    this.traceObject = new FirebaseDbCloudFunctionTraceObject(firebase);
    this.deleteRecipe = new FirebaseDbCloudFunctionDeleteRecipe(firebase);
    this.updateUserMotto = new FirebaseDbCloudFunctionUpdateUserMotto(firebase);
    this.updateUserDisplayName =
      new FirebaseDbCloudFunctionUpdateUserDisplayName(firebase);
    this.updateUserPictureSrc = new FirebaseDbCloudFunctionUpdateUserPictureSrc(
      firebase
    );
    this.publishRecipeRequest = new FirebaseDbCloudFunctionPublishRecipeRequest(
      firebase
    );
    this.declineRecipeRequest = new FirebaseDbCloudFunctionDeclineRecipeRequest(
      firebase
    );
    this.sendMail = new FirebaseDbCloudFunctionSendMail(firebase);
    this.deleteFeeds = new FirebaseDbCloudFunctionDeleteFeeds(firebase);
    this.mergeProducts = new FirebaseDbCloudFunctionMergeProducts(firebase);
    this.mergeMaterials = new FirebaseDbCloudFunctionMergeMaterials(firebase);
    this.convertProductToMaterial =
      new FirebaseDbCloudFunctionConvertProductToMaterial(firebase);
    this.convertMaterialToProduct =
      new FirebaseDbCloudFunctionConvertMaterialToProduct(firebase);
    this.updateProduct = new FirebaseDbCloudFunctionUpdateProduct(firebase);
    this.updateMaterial = new FirebaseDbCloudFunctionUpdateMaterial(firebase);
    this.activateSupportUser = new FirebaseDbCloudFunctionActivateSupportUser(
      firebase
    );
    this.signOutAllUsers = new FirebaseDbCloudFunctionSignOutAllUsers(firebase);
    this.rebuildStats = new FirebaseDbCloudFunctionRebuildStats(firebase);
    this.createUserPublicData = new FirebaseDbCloudFunctionCreateUserPublicData(
      firebase
    );
  }
  /* =====================================================================
  // Collection holen
  // ===================================================================== */
  getCollection() {
    return collection(this.firebase.firestore, `_cloudFunctions`);
  }
  /* =====================================================================
  // Collection-Group holen
  // ===================================================================== */
  getCollectionGroup() {
    throw Error(ERROR_NOT_IMPLEMENTED_YET);
    return collectionGroup(this.firebase.firestore, `none`);
  }
  /* =====================================================================
  // Dokument holen
  // ===================================================================== */
  getDocument(uids: string[]) {
    return doc(this.firebase.firestore, this.getCollection().path, uids[0]);
  }
  /* =====================================================================
  // Dokumente holen
  // ===================================================================== */
  getDocuments() {
    // Not implemented
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForDb<T extends ValueObject>({value}: PrepareDataForDb<T>) {
    return value as unknown as T;
  }
  /* =====================================================================
  // Daten für DB-Strutkur vorbereiten
  // ===================================================================== */
  prepareDataForApp<T extends ValueObject>({value}: PrepareDataForApp): T {
    return value as unknown as T;
  }
  /* =====================================================================
  // Einstellungen für den Session Storage zurückgeben
  //===================================================================== */
  getSessionHandlerProperty(): StorageObjectProperty {
    return STORAGE_OBJECT_PROPERTY.NONE;
  }
}
export default FirebaseDbCloudFunction;
