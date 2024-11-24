import AuthUser from "../components/Firebase/Authentication/authUser.class";
import {ValueObject} from "../components/Firebase/Db/firebase.db.super.class";
import Firebase from "../components/Firebase/firebase.class";
import Feed from "../components/Shared/feed.class";

export async function rebuildFile000AllFeeds(firebase: Firebase) {
  const allFeeds: ValueObject = {};
  let counter = 0;

  const feeds = await Feed.getNewestFeeds({
    firebase: firebase,
    limitTo: 10000,
    visibility: "*",
  });
  feeds.forEach((feed) => {
    counter++;
    allFeeds[feed.uid] = {
      created: feed.created,
      type: feed.type,
      visibility: feed.visibility,
      title: feed.title,
      text: feed.text,
    };
  });
  await firebase.feed.log
    .set({
      uids: [],
      value: allFeeds,
      authUser: {} as AuthUser,
    })
    .catch((error) => console.error(error));

  return counter;
}
