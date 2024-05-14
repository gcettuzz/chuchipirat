import Feed from "../feed.class";

/* =====================================================================
// Kostruktor
// ===================================================================== */
test("Feed.constructor: Objekt Typ Feed instazieren", () => {
  const feed = new Feed();
  expect(feed).toBeDefined();
  // expect(feed).toHaveProperty("uid");
  // expect(feed).toHaveProperty("createdAt");
  // expect(feed).toHaveProperty("userUid");
  // expect(feed).toHaveProperty("displayName");
  // expect(feed).toHaveProperty("pictureSrc");
  // expect(feed).toHaveProperty("title");
  // expect(feed).toHaveProperty("text");
  // expect(feed).toHaveProperty("feedType");
  // expect(feed).toHaveProperty("objectUid");
  // expect(feed).toHaveProperty("objectName");
  // expect(feed).toHaveProperty("objectPictureSrc");
});
/* =====================================================================
// Anhand des Feed Typs den Titel bestimmen
// ===================================================================== */
test("Feed.getTitle(): Überschrift eines Feeds holen:", () => {
  // expect(Feed.getTitle(FeedType.userCreated)).toEqual(FEED_TITLE.USER_CREATED);
  // expect(Feed.getTitle(FeedType.recipeCreated)).toEqual(
  //   FEED_TITLE.RECIPE_CREATED
  // );
  // expect(Feed.getTitle(FeedType.eventCreated)).toEqual(
  //   FEED_TITLE.EVENT_CREATED
  // );
  // expect(Feed.getTitle(FeedType.eventCookAdded)).toEqual(
  //   FEED_TITLE.EVENT_COOK_ADDED
  // );
  // expect(Feed.getTitle(FeedType.shoppingListCreated)).toEqual(
  //   FEED_TITLE.SHOPPINGLIST_CREATED
  // );
  // expect(Feed.getTitle(FeedType.menuplanCreated)).toEqual(
  //   FEED_TITLE.MENUPLAN_CREATED
  // );
  // expect(Feed.getTitle(FeedType.none)).toEqual("?");
});
/* =====================================================================
// Anhand des Feed Typs den Text bestimmen
// ===================================================================== */
test("Feed.getText(): Text eines Feeds holen:", () => {
  // let testText = "Ich bin ein Test-Text :)";
  // expect(Feed.getText({ feedType: FeedType.userCreated })).toEqual(
  //   FEED_TEXT.USER_CREATED
  // );
  // expect(
  //   Feed.getText({ feedType: FeedType.recipeCreated, text: testText })
  // ).toEqual(FEED_TEXT.RECIPE_CREATED(testText));
  // expect(
  //   Feed.getText({ feedType: FeedType.eventCreated, text: testText })
  // ).toEqual(FEED_TEXT.EVENT_CREATED(testText));
  // expect(
  //   Feed.getText({ feedType: FeedType.eventCookAdded, text: testText })
  // ).toEqual(FEED_TEXT.EVENT_COOK_ADDED(testText));
  // expect(
  //   Feed.getText({ feedType: FeedType.shoppingListCreated, text: testText })
  // ).toEqual(FEED_TEXT.SHOPPINGLIST_CREATED(testText));
  // expect(
  //   Feed.getText({ feedType: FeedType.menuplanCreated, text: testText })
  // ).toEqual(FEED_TEXT.MENUPLAN_CREATED(testText));
  // expect(Feed.getText({ feedType: FeedType.none })).toEqual("?");
});

//TEST_MISSING
/* ====================================================================
// Feed Eintrag erzeugen
/ ==================================================================== */
// test("Feed.createFeedEntry(): XXX:", () => {})
/* =====================================================================
// Cloud Function deleteFeeds aufrufen
// ===================================================================== */
// test("Feed.callCloudFunctionDeleteFeeds(): XXX:", () => {})
/* =====================================================================
// Neuste X Feed holen
// ===================================================================== */
// test("Feed.getNewestFeeds(): XXX:", () => {})
