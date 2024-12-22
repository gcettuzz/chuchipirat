Cloud Firestore organisiert Daten in einer Hierarchie, die ähnlich wie ein Dateisystem funktioniert. Dabei gibt es zwei Hauptkonzepte: **Sammlungen** (vergleichbar mit Ordnern oder Verzeichnissen) und **Dokumente** (vergleichbar mit Dateien).
## Grundlegende Struktur:

- **Sammlungen (Collections)**: Sammlungen sind wie Verzeichnisse oder Ordner, die mehrere Dokumente enthalten können. Eine Sammlung selbst speichert keine Daten direkt, sondern dient nur als Container für Dokumente.
    
- **Dokumente (Documents)**: Dokumente sind wie Dateien, die die eigentlichen Daten speichern. Jedes Dokument besteht aus Schlüsseln und Werten (ähnlich wie ein JSON-Objekt). Ein Dokument kann nicht direkt andere Dokumente enthalten, aber es kann untergeordnete **Sammlungen** haben.

In der folgenden Grafik haben Sammlungen ein `/` am Schluss, um den Unterschied zwischen Sammlung und Dokument besser zu veranschaulichen. Die ersten Verzeichnisse beginnen mit einem `_`. Diese Verzeichnisse beinhalten Systemdaten und nicht die Daten, die im chuchipirat bearbeitbar sind.

> [!Info]
> Die UIDs in der DB werden automatisch generiert. In den Beispieldaten hier werden die UIDs für die bessere lesbarkeit zwischen `$` Zeichen gesetzt. Beispiel: `$USER-UID1$`

```
├── _cloudfunctions/               # Statische Dateien wie index.html
├── _configuration/                # Quellcode des Projekts
├── _mailTemplates/                # ...
├── _mailbox/                      # ...
├── events/                        # ...
├── feeds/                         # ...
├── masterdata/                    # ...
├── recipes/                       # ...
│── requests/                      # Anträge
│   ├──000_globalCounter
│   ├──active/
│   │  └── requests/
│   │      ├── $REQUEST_UID1$
│   │      ├── $REQUEST_UID2$
│   │      ├── ...
│   └──closed/
│      └── requests/
│          ├── $REQUEST_UID1$
│          ├── $REQUEST_UID2$
│          └── ...
├── stats/                         # Statistikdaten
│   ├── counter
│   ├── recipeVariants
│   └── recipesInMenuplan
└── users/                         # Userdaten
    ├── 000_allUsers
    ├── $USER_UID1$
    │   └── public/
    │       ├── profile
    │       └── searchFields
    ├── $USER_UID2$
    └── ...                  

```

Die Erklärung der einzelnen Files und deren Inhalt, findest du in den folgenden Abschnitten. 
# File Strukturen

## Hauptverzeichnis `requests`
Die Verwaltung der unterschiedlichen Anträge wird in diesem Verzeichnis abgehandelt. 

### Datei `requests/000_globalCounter`
Zentrale Datei, damit neue Anträge mit der richtigen ID versehen werden können. Der Counter gibt die aktuell höchste verwendete ID an. 

``` json
{
  "counter": "1012",
}
```
### Datei `requests/active`
Übersichtsfile über alle aktiven Anträge.

``` json
{
  "$REQUEST_UID1$": {
	  "author": { 
		  "displayName":"John Doe", 
		  "email": "johndoe@example.com",, 
		  "fistName": "John",
		  "lastName": "Doe",
		  "uid":"$USER_UID1$"
		},
		"number": 1012,
		"requestObject": {"_variabel-je-nach-requestType_"},
		"requestType": "recipePublish",
		"status": "created"
	},
  "$REQUEST_UID2$": {
	  "author": { 
		  "displayName":"Jame Roe", 
		  "email": "janeroe@muster.ch",, 
		  "fistName": "Jane",
		  "lastName": "Roe",
		  "uid":"$USER_UID2$"
		},
		"number": 1010,
		"requestObject": {"_variabel-je-nach-requestType_"},
		"requestType": "reportError",
		"status": "backToAuthor"
	},
	...
}
```
### Datei `requests/closed`
Übersichtsfile über alle abgeschlossenen Anträge. Der Aufbau ist mit dem `active`-File identisch.

``` json
{
    "$REQUEST_UID1$": {
		"author": { 
			"displayName":"John Doe", 
			"email": "johndoe@example.com",, 
			"fistName": "John",
			"lastName": "Doe",
			"uid":"$USER_UID1$"
		},
		"number": 1001,
		"requestObject": {"_variabel-je-nach-requestType_"},
		"requestType": "recipePublish",
		"status": "done"
	},
	...
}
```
### Datei `requests/active/requests/$REQUEST_UID1$`
Datei zu einem spezifischen Antrag. Die Antragsnummer ist im Feld `number`. Im Feld `requestObject` sind die spezifischen Werte eines Antrages. Welche Ausprägungen möglich sind, sind in der entsprechenden [Typescript Definition](https://github.com/gcettuzz/chuchipirat/blob/master/src/components/Request/request.class.ts) ersichtlich. 

``` json
{
	"asignee": {
		"displayName": "",
		"pictureSrc": "",
		"uid": "",
	},
	"author": { 
		"displayName":"John Doe", 
		"email": "johndoe@example.com",, 
		"fistName": "John",
		"lastName": "Doe",
		"uid":"$USER_UID1$"
	},
	"changelog": [
		{
			"action": "created",
			"date": "2024-01-01 13:13:00",
			"user": {
				"displayName": "John Doe",
				"uid": "$USER_UID1$"
			}
		},
	],
	"comments": [],
	"createdDate": "2024-01-01 13:13:00",
	"number": "1003",
	"requestObject": {
		"authorUid": "$USER_UID1$",
		"name": "Hörnli & Ghackets",
		"pictureSrc": "https://bildurl.com",
		"uid": "$RECIPE_UID1$",
		},
	"requestType": "recipePublish",
	"resolveDate": "9999-12-31 23:59:59",
	"status": "created",
}
```
### Datei `requests/closed/requests/$REQUEST_UID1$`
Der Aufbau entspricht 1:1 dem eines Files im `active`-Verzeichnis. Nachdem ein Antrag abgeschlossen wird, wird das File in das Verzeichnis `closed` verschoben. 

``` json
{
	"asignee": {
		"displayName": "",
		"pictureSrc": "",
		"uid": "",
	},
	"author": { 
		"displayName":"John Doe", 
		"email": "johndoe@example.com",, 
		"fistName": "John",
		"lastName": "Doe",
		"uid":"$USER_UID1$"
	},
	"changelog": [
		{
			"action": "created",
			"date": "2024-01-01 13:13:00",
			"user": {
				"displayName": "John Doe",
				"uid": "$USER_UID1$"
			}
		},
	],
	"comments": [
		{
			"comment": "ich bin ein Lauftext...",
			"date":"2024-07-25 13:00:00",
			"user": {
				"displayName":"Community-Leader-Peter",
				"pictureSrc": "",
				"uid": "$USER_UID7$",
			}
		}
	],
	"createdDate": "2024-01-01 13:13:00",
	"number": "1007",
	"requestObject": {
		"authorUid": "$USER_UID1$",
		"name": "Tiramisu",
		"pictureSrc": "https://bildurl.com",
		"uid": "$RECIPE_UID2$",
		},
	"requestType": "recipePublish",
	"resolveDate": "2024-09-07 09:22:00",
	"status": "done",
}
```
## Hauptverzeichnis `stats`
Verzeichnis mit allen Statistikdaten
### Datei `stats/counter`
File bei dem die diversen Stammdaten gezählt werden. Wird für die Anzeige auf dem Home-Screen benötigt. 

``` json
{
  "noEvents": 11,
  "noIngredients": 144,
  "noMaterialLists": 9,
  "noMaterials": 21,
  "noParticipants": 192,
  "noPlanedDays": 423,
  "noPortions": 1364,
  "noRecipesPrivate": 10,
  "noRecipePublic": 17,
  "noRecipesVariants": 7,
  "noShoppingLists": 12,
  "noUsers": 6
}
```

### Datei `stats/recipeVariants`
Zählerfile, von welchem Rezept schon wie viele Varianten erstellt wurden.

``` json
{
  "$RECIPE-UID1$": 4,
  "$RECIPE-UID2$": 13,
  "$RECIPE-UID3$": 1,
  "$RECIPE-UID#$": ...
}
```

### Datei `stats/recipesInMenuplan`
Zählerfile welches Rezept wie oft in den Menüplänen eingefügt wurde.

``` json
{
  "$RECIPE-UID1$": 4,
  "$RECIPE-UID2$": 13,
  "$RECIPE-UID3$": 1,
  "$RECIPE-UID#$": ...
}
```

## Hauptverzeichnis `users`
Verzeichnis mit allen Userdaten. 
### Datei `users/000_allUsers`
Indexfile mit der Übersicht aller registrierten Users:

```json
{
  "$USER_UID1$": {
    "displayName": "John Doe",
    "email": "johndoe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "memberId": "1",
    "memberSince": "2020-01-01 14:42:00",
  },
  "$USER_UID2$": {
    "displayName": "Jane Roe",
    "email": "janeroe@muster.ch",
    "firstName": "Jane",
    "lastName": "Roe",
    "memberId": "33",
    "memberSince": "2024-05-22 13:15:13",
  },
  ...
}
```

### Datei `users/$USER_UID1$`
Pro User gibt es eine Datei.

```json
{
  "email": "johndoe@example.com",  
  "firstName": "John",
  "lastLogin": "2024-01-01 11:15:00",
  "lastName": "Doe",
  "noLogins": 11,
  "roles": ["basic", "admin"]
}
```

### Verzeichnis `users/$USER_UID1$/public/`
In diesem Verzeichnis sind alle Daten einer Person, die von allen Usern gelesen werden können/dürfen.

### Datei `users/$USER_UID1$/public/searchfields`
Diese Daten werden benötigt um anhand der E-Mailadresse die entsprechende UID zu finden. 

``` json
{
  "email": "johndoe@example.com",
  "uid": "$USER_UID1$",
}
```

### Datei `users/$USER_UID1$/public/profile`
Alle Profilinformationen einer Person, die von allen Personen aufrufbar sind. 

``` json
{
  "displayName": "John Doe",
  "memberId": 1,
  "memberSince": "2020-01-01 14:42:00",
  "motto": "Es hät solängs hät...",
  "pictureSrc": {
    "fullSize": "",
    "normalSize": "",
    "smallSize": ""
  },
  "stats": {
    "noComments": 0,
    "noEvents": 1,
    "noRecipesPrivate": 7,
    "noRecipesPublic": 3
  }
}
```



``` json
{
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
  "": "",
}
```