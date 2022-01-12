import Firebase from "../firebase.class";
import FirebaseDbCloudFunction from "./firebase.db.cloudfunction.class";

import FirebaseDbEvent from "./firebase.db.event.class";
import FirebaseDbFeed from "./firebase.db.feed.class";
import FirebaseDbRecipe from "./firebase.db.recipe.class";
import FirebaseDbStats from "./firebase.db.stats.class";
import FirebaseDbUser from "./firebase.db.user.class";

import {} from "firebase/";
export class FirebaseDb {
  event: FirebaseDbEvent;
  recipe: FirebaseDbRecipe;
  user: FirebaseDbUser;
  feed: FirebaseDbFeed;
  stats: FirebaseDbStats;
  cloudFunction: FirebaseDbCloudFunction;

  // recipe:FirebaseRecipe
  /* =====================================================================
  // Konstruktor
  // ===================================================================== */
  constructor(firebase: Firebase) {
    this.recipe = new FirebaseDbRecipe(firebase);
    //RECIPESHORT
    this.event = new FirebaseDbEvent(firebase);
    this.user = new FirebaseDbUser(firebase);
    this.feed = new FirebaseDbFeed(firebase);
    this.stats = new FirebaseDbStats(firebase);
    this.cloudFunction = new FirebaseDbCloudFunction(firebase);
  }
}
export default FirebaseDb;
