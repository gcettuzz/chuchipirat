import Firebase from "../Firebase/firebase.class";

interface IncrementField {
  firebase: Firebase;
  uid: string;
  field: UserPublicProfileFields;
  step: number;
}

export enum UserPublicProfileFields {
  noRecipes = "noRecipes",
  noComments = "noComments",
  noEvents = "noEvents",
}

/**
 * Öffentliches Profile, wie von jedem*r einsehbar
 */
export class UserPublicProfile {
  uid: string;
  displayName: string;
  memberSince: Date;
  memberId: number;
  motto: string;
  pictureSrc: string;
  pictureSrcFullSize: string;
  noComments: number;
  noEvents: number;
  noRecipes: number;
  /* =====================================================================
  // Constructor
  // ===================================================================== */
  constructor() {
    this.uid = "";
    this.displayName = "";
    this.memberSince = new Date(0);
    this.memberId = 0;
    this.motto = "";
    this.pictureSrc = "";
    this.pictureSrcFullSize = "";
    this.noComments = 0;
    this.noEvents = 0;
    this.noRecipes = 0;
  }

  /* =====================================================================
  // Zähler für öffentliches Profil hochzählen
  // ===================================================================== */
  /* istanbul ignore next */
  /* DB-Methode wird zur Zeit nicht geprüft */
  static incrementField = async ({
    firebase,
    uid,
    field,
    step,
  }: IncrementField) => {
    firebase.user.public.profile.incrementField({
      uids: [uid],
      field: field,
      value: step,
    });
  };
}

export default UserPublicProfile;
