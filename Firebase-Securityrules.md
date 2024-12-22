Die folgenden Sicherheitsregeln sind in der Firebase-Datenbank hinterlegt und steuern wer, welche Aktion bei den Daten ausführen darf.

```json
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
   
    // Prüfung ob Person Admin/Sub-Admin ist
    function isAdmin() {
      return "admin" in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles 
    }
    
    // Prüfung ob Community Leader
    function isCommunityLeader() {
      return "admin" in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles ||
             "subAdmin" in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles ||
             "communityLeader" in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles; 
    }
        
    // Prüfung ob Person im Event dabei
    function isEventMember(eventUid){
      return request.auth.uid in get(/databases/$(database)/documents/events/$(eventUid)).data.authUsers;
    }
    
    
    // öffentliche Rezepte
    match /recipes/public/recipes/{anyUserFile=**} {
      allow read : if request.auth != null;
      allow write: if request.auth != null && isCommunityLeader();
      allow update: if request.auth != null && (request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['rating']));
    }
    // Index der öffentlichen Rezepte
    match /recipes/public {
      allow read, update : if request.auth != null;
    }
    
    // Rezepte Rating
    match /recipes/public/recipes/{recipeUid}/ratings/{userId} {
      allow read, write : if request.auth != null && ( request.auth.uid == userId);
    }
    
    // Private Rezepte
    match /recipes/private/users/{userId}/recipes/{anyUserFile=**} {
      allow read : if request.auth != null;
      allow write: if request.auth != null && ( request.auth.uid == userId || isCommunityLeader() );      
    }
    match /recipes/private/users/{userId} {
      allow read, update, create : if request.auth != null && (request.auth.uid == userId || isCommunityLeader());
    }
    match /recipes/private {
      allow update : if request.auth != null;
      allow read : if request.auth != null && isCommunityLeader();
    }
   
    // Rezept-Varianten (Event)
    match /recipes/variants/events/{eventId}/recipes/{anyUserFile=**} {
      allow read: if request.auth != null && ( isEventMember(eventId) || isCommunityLeader() );
      allow create, update, delete: if request.auth != null &&  isEventMember(eventId);
    }
    match /recipes/variants/events/{eventId} {
      allow read : if request.auth != null && ( isEventMember(eventId) || isCommunityLeader() );
      allow update, create : if request.auth != null &&  isEventMember(eventId);
    }

    // Review Prozess
    match /requests/log {
      allow read, update : if request.auth != null;
    }
    match /requests/000_globalCounter {
      allow read, update : if request.auth != null;
    }
    match /requests/active {
      allow read: if request.auth != null && isCommunityLeader();
      allow update : if request.auth != null;
    }
    match /requests/closed {
      allow read: if request.auth != null && isCommunityLeader();
      allow update : if request.auth != null;
    }
    match /requests/active/requests/{anyUserFile=**} {
      allow read, update : if request.auth.uid == resource.data.author.uid || isCommunityLeader();
      allow create: if request.auth != null;
      allow delete: if request.auth != null && isCommunityLeader();
    }
    match /requests/closed/requests/{anyUserFile=**} {
      allow read : if request.auth.uid == resource.data.author.uid || isCommunityLeader();
      allow create: if request.auth != null && isCommunityLeader();
    }
    

    

    // Events
    match /events/000_allEvents {
      allow read: if request.auth != null && isCommunityLeader(); 
      allow update: if request.auth != null;  
    }
    match /events/{eventUid} {
      allow create: if request.auth != null;
      allow delete: if request.auth != null && (request.auth.uid in resource.data.authUsers );
      // Lesen, schreiben nur wenn als Koch registriert
      // und Community-Leader*in um Quittung erstellen zu können
			allow read, update:  if request.auth != null && (request.auth.uid in resource.data.authUsers || (isCommunityLeader() ));
    }

    // Event Menuplan
    match /events/{eventUid}/docs/menuplan {
      allow read, create, update, delete: if request.auth != null &&  isEventMember(eventUid) ;
    }
    // Event Group-Config
    match /events/{eventUid}/docs/groupConfiguration {
      allow read, create, update, delete: if request.auth != null && isEventMember(eventUid) ;
    }
    // Event Verwendete Rezepte
    match /events/{eventUid}/docs/usedRecipes {
      allow read, create, update, delete: if request.auth != null && isEventMember(eventUid) ;
    }
    // Event Einkaufsliste
    match /events/{eventUid}/docs/shoppingListCollection {
      allow read, create, update, delete: if request.auth != null && isEventMember(eventUid) ;
    }
    // Alte Einkaufsliste --> löschen nach Migration
    match /events/{eventUid}/docs/shoppingList {
      allow read, create, update, delete: if request.auth != null && isEventMember(eventUid) ;
    }
    match /events/{eventUid}/shoppingLists/{anyUserFile=**} {
      allow read, create, update, delete: if request.auth != null && isEventMember(eventUid) ;
    } 
    // Event Materialliste
    match /events/{eventUid}/docs/materialList {
      allow read, create, update, delete: if request.auth != null && isEventMember(eventUid) ;
    }
    // Event Quittung
    match /events/{eventUid}/docs/receipt {
      allow read, delete : if request.auth != null && isEventMember(eventUid) ;
      allow create, update: if request.auth != null && isCommunityLeader();
    }

    // == Stammdaten ==
    // Produkte
    match /masterData/products {
      allow read, write: if request.auth != null ;
  	}
    // Material
    match /masterData/materials {
      allow read, write: if request.auth != null ;
  	}
    // Abteilung
	  match /masterData/departments {
      allow read:  if request.auth != null ;
      allow create, update: if request.auth != null && isAdmin() ; 
  	}
    // Einheiten
	  match /masterData/units {
      allow read:  if request.auth != null ;
      allow create, update: if request.auth != null && isAdmin() ; 
  	}
    // Umrechnung Basic
     match /masterData/unitConversionBasic {
       allow read: if request.auth != null;
       allow create, update: if request.auth != null && isAdmin() ; 
     }
    // Umrechnung Produkte
     match /masterData/unitConversionProducts {
       allow read: if request.auth != null;
       allow create, update: if request.auth != null && isAdmin() ; 
     }
    // Statistik
    match /stats/{anyUserFile=**} {
      allow read, write: if request.auth != null ;
    }    
    // Feed
    match /feeds/{anyUserFile=**} {
      allow read: if request.auth != null;
      allow update: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && isCommunityLeader() ;
    }
    
    // User
    // Das Feld Roles darf nur von Admins geändert werden
    // Gelesen darf nur der User selbst (und die Admins)
    match /users/{userId} {
      allow read, create: if ( request.auth.uid == userId || isCommunityLeader() );
      allow update: if ( request.auth.uid == userId && 
                        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['roles']) 
                       ) || isAdmin();
    }
    
    match /users/{userId}/public/{anyUserFile=**} {
      allow read : if request.auth != null ;
      allow update: if request.auth != null && (request.auth.uid == userId || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['noEvents']));
      allow create: if request.auth != null && request.auth.uid == userId;
    }
    
    // Einstellungen
    match /_configuration/globalSettings {
      allow read : if true;
      allow update : if isAdmin();
    }
    match /_configuration/systemMessage {
      allow read : if true;
      allow write : if isAdmin();
    }
    
    // Technisches Zeugs, das von jedem gelesen werden darf
      match /_mailbox/{anyUserFile=**} {
      allow read, update, create: if isAdmin();
    }

    
    // CloudFunctions Waiting Area
    match /_cloudFunctions/log {
      allow update: if request.auth != null ;
      allow read: if request.auth != null && isAdmin();
    }
    match /_cloudFunctions/functions {
      allow update : if request.auth != null;
      allow read: if request.auth != null && isAdmin();
    }
    match /_cloudFunctions/functions/updateUserpictureSrc/{anyUserFile=**} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && isAdmin();
    }
    match /_cloudFunctions/functions/updateUserDisplayName/{anyUserFile=**} {
      allow create : if request.auth != null;
      allow read: if request.auth != null && isAdmin();
    }
    match /_cloudFunctions/functions/updateUserMotto/{anyUserFile=**} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && isAdmin();
    }
    match /_cloudFunctions/functions/updateProduct/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }
    match /_cloudFunctions/functions/updateMaterial/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }    
    match /_cloudFunctions/functions/traceObject/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }  
    match /_cloudFunctions/functions/updateRecipe/{anyUserFile=**} {
      allow create : if request.auth != null;
      allow read: if request.auth != null && isAdmin();
    }
    match /_cloudFunctions/functions/mergeProducts/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }
    match /_cloudFunctions/functions/mergeMaterials/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }
    match /_cloudFunctions/functions/convertProductToMaterial/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }
    match /_cloudFunctions/functions/convertMaterialToProduct/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }
    match /_cloudFunctions/functions/deleteFeeds/{anyUserFile=**} {
      allow create : if request.auth != null && isAdmin();
      allow read: if request.auth != null && isAdmin();
    }
    match /_cloudFunctions/functions/deleteRecipe/{anyUserFile=**} {
      allow create : if request.auth != null;
      allow read: if request.auth != null && isAdmin();
    }
    match /_cloudFunctions/functions/sendMail/{anyUserFile=**} {
      allow create : if request.auth != null;
      allow read: if request.auth != null && isAdmin();
    }
    match /_cloudFunctions/functions/publishRecipeRequest/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }
    match /_cloudFunctions/functions/declineRecipeRequest/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }
    match /_cloudFunctions/functions/declineRecipeRequest/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }
    match /_cloudFunctions/functions/productUpdate/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
    }
    match /_cloudFunctions/functions/activateSupportUser/{anyUserFile=**} {
      allow create : if request.auth != null && isCommunityLeader();
      allow read: if request.auth != null && isCommunityLeader();
		}
    match /_cloudFunctions/functions/signOutAllUsers/{anyUserFile=**} {
      allow create : if request.auth != null && isAdmin();
      allow read: if request.auth != null && isAdmin();
		}
    match /_cloudFunctions/functions/rebuildStats/{anyUserFile=**} {
      allow create : if request.auth != null && isAdmin();
      allow read: if request.auth != null && isAdmin();
		}
    match /_cloudFunctions/functions/rebuildStats/{anyUserFile=**} {
      allow create : if request.auth != null && isAdmin();
      allow read: if request.auth != null && isAdmin();
		}
    // Collection-Groups -- User Public - Searchfield
    match /{path=**}/public/{searchFields} {
      allow read: if request.auth != null;
    }
    // Feeds
    match /{path=**}/feeds/{feed} {
      allow read: if request.auth != null;
    }
    // Requests
    match /{path=**}/active/{request} {
      allow read: if request.auth != null;
    }
    
	}
}
```