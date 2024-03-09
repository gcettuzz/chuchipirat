import {AuthUser} from "../Authentication/authUser.class";
import {
  DocumentReference,
  CollectionReference,
  Query,
} from "@firebase/firestore-types";

import Firebase from "../firebase.class";
import {
  SessionStorageHandler,
  StorageObjectProperty,
} from "./sessionStorageHandler.class";

import _ from "lodash";

import {DB_DOCUMENT_DELETED as TEXT_DB_DOCUMENT_DELETED} from "../../../constants/text";

export interface ValueObject {
  [key: string]: any;
}

interface Create<T> {
  value: T;
  authUser: AuthUser;
  uids?: string[];
  force?: boolean;
}
interface Read {
  uids?: string[];
  ignoreCache?: boolean;
}
interface ReadCollection {
  uids: string[];
  orderBy: OrderBy;
  limit?: number;
  where?: Where[];
  startAfter?: any;
  ignoreCache?: boolean;
}
interface ReadCollectionGroup {
  orderBy?: OrderBy;
  limit?: number;
  where?: Where[];
  // ignoreCache?: boolean;
}
interface Listen<T> {
  uids?: string[];
  callback: (value: T) => void;
  errorCallback: (error: Error) => void;
}
interface Update<T> {
  uids: string[];
  value: T;
  authUser: AuthUser;
}
interface UpdateFields {
  uids: string[];
  values: {[key: string]: any};
  authUser: AuthUser;
  updateChangeFields?: boolean;
}
interface Set<T> {
  uids: string[];
  value: T;
  authUser: AuthUser;
}
interface IncrementField {
  uids: string[];
  field: string;
  value: number;
}
interface Delete {
  uids: string[];
}
interface DeleteField {
  fieldName: string;
  uids: string[];
}
export interface PrepareDataForDb<T> {
  value: T;
}
export interface ListCollections {
  uids: string[];
}

export interface PrepareDataForApp {
  uid: string;
  value: ValueObject;
}
export interface UpdateSessionStorageFromDbRead {
  value: ValueObject;
  documentUid: string;
}

export interface OrderBy {
  field: string;
  sortOrder: SortOrder;
}
export interface Where {
  field: string;
  operator: Operator;
  value: any;
}
export enum SortOrder {
  desc = "desc",
  asc = "asc",
}
export enum Operator {
  LT = "<",
  LE = "<=",
  EQ = "==",
  GT = ">",
  GE = ">=",
  NE = "!=",
  ArrayContains = "array-contains",
  ArrayContainsAny = "array-contains-any",
  in = "in",
  notIn = "not-in",
}

export abstract class FirebaseDbSuper {
  abstract firebase: Firebase;
  /* =====================================================================
  // Create
  // ===================================================================== */
  async create<T extends ValueObject>({
    value,
    authUser,
    uids,
    force = false,
  }: Create<T>): Promise<T> {
    value = FirebaseDbSuper.setCreatedFields<T>(value, authUser, force);

    let dbObject = _.cloneDeep(this.convertDateValuesToTimestamp(value));
    // Felder auf Firebase anpassen
    dbObject = this.prepareDataForDb({value: dbObject});

    const collection = this.getCollection(uids);

    return await collection
      .add(dbObject)
      .then((docRef) => {
        value = this.prepareDataForApp<T>({
          uid: docRef.id,
          value: this.convertTimestampValuesToDates(dbObject),
        });
        // Session Storage aufnehmen
        SessionStorageHandler.upsertDocument({
          storageObjectProperty: this.getSessionHandlerProperty(),
          documentUid: docRef.id,
          value: value,
          prefix: uids ? uids[0] : "",
        });
        return value as T;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  /* =====================================================================
  // Read
  // ===================================================================== */
  async read<T extends ValueObject>({
    uids,
    ignoreCache = false,
  }: Read): Promise<T> {
    const document = this.getDocument(uids);

    if (!ignoreCache) {
      // prüfen ob im Session-Storage was ist!
      const sessionStorageData = SessionStorageHandler.getDocument<T>({
        storageObjectProperty: this.getSessionHandlerProperty(),
        documentUid: document.id,
        prefix: uids ? uids[0] : "",
      });
      if (sessionStorageData) {
        return new Promise((resolve) => {
          resolve(sessionStorageData!);
        });
      }
    }

    return await document
      .get()
      .then((snapshot) => {
        if (!snapshot.data()) {
          // Keine Daten -> Gibt ein leeres Objekt
          return <T>{};
        }
        const values = this.prepareDataForApp<T>({
          uid: snapshot.id,
          value: this.convertTimestampValuesToDates(
            snapshot.data() as ValueObject
          ),
        });
        // SessionStorage update
        SessionStorageHandler.upsertDocument({
          storageObjectProperty: this.getSessionHandlerProperty(),
          documentUid: document.id,
          value: values,
          prefix: uids ? uids[0] : "",
        });

        return values;
      })
      .catch((error) => {
        console.info("get Document:", document.id);
        console.error(error);
        throw error;
      });
  }
  /* =====================================================================
  /**
   * readRawData: Direktes lesen (ohne anpassen des Resultates an
   * die gewünschte Datenstrutktur). Parameter als 1 Objekt übergeben
   * @param uid - allfällige UID, die nötig sind für das ermitteln des
   *              Dokuments
   */
  async readRawData({uids}: Read): Promise<ValueObject> {
    const document = this.getDocument(uids);

    return await document.get().then((snapshot) => {
      if (!snapshot.data()) {
        return {} as ValueObject;
      } else {
        return snapshot.data() as ValueObject;
      }
    });
  }
  /* =====================================================================
  /**
   * setRawData: Direktes schreiben (ohne anpassen des Resultates an
   * die gewünschte Datenstrutktur). Parameter als 1 Objekt übergeben
   * ATTENTION: Solte nur für Migration u.Ä. genutzt werden.
   * @param uid - allfällige UID, die nötig sind für das ermitteln des
   *              Dokuments
   */
  async setRawData<T>({uids, value}: Set<T>): Promise<void> {
    const document = this.getDocument(uids);
    const dbObject = value as ValueObject;
    return await document.set(dbObject).catch((error) => {
      console.error(error);
      throw error;
    });
  }
  /* =====================================================================
  // Read Collection
  // ===================================================================== */
  /**
   * readCollection: Lesen mehrere Dokumente.
   * Paremter (OrderBy, Where, Limit) sind im Objektform.
   * @param interface ReadCollection mit Key: uid, orderBy, limit, where?
   */
  async readCollection<T extends ValueObject>({
    uids,
    orderBy,
    limit,
    where,
    startAfter,
    ignoreCache = false,
  }: ReadCollection) {
    const result: T[] = [];

    if (!ignoreCache) {
      // prüfen ob im Session-Storage was ist!
      const sessionStorageData = SessionStorageHandler.getDocuments<T>({
        storageObjectProperty: this.getSessionHandlerProperty(),
        where: where,
        orderBy: orderBy,
        limit: limit,
      });

      if (sessionStorageData !== null) {
        return new Promise<T[]>((resolve) => {
          resolve(sessionStorageData!);
        });
      }
    }

    const collection = this.getCollection(uids);

    let queryObject = collection.orderBy(orderBy.field, orderBy.sortOrder);

    if (startAfter) {
      queryObject = queryObject.startAfter(startAfter);
    }

    if (where && where.length > 0) {
      // Where Bedingungen verketten
      where.forEach((statment) => {
        queryObject = queryObject.where(
          statment.field,
          statment.operator,
          statment.value
        );
      });
    }
    if (limit) {
      queryObject = queryObject.limit(limit);
    }

    return await queryObject
      .get()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          const object = this.prepareDataForApp<T>({
            uid: document.id,
            value: this.convertTimestampValuesToDates(document.data()),
          }) as T;
          result.push(object);
        });
        // Session Storage updaten
        SessionStorageHandler.upsertDocuments({
          storageObjectProperty: this.getSessionHandlerProperty(),
          values: result,
        });
        return result;
      })
      .catch((error) => {
        console.info("read collection:", collection.id);
        console.error(error);
        throw error;
      });
  }
  /* =====================================================================
  // Read Collection
  // ===================================================================== */
  /**
   * readCollectionGroup: Lesen aller Dokumente mit dem gleichen Namen.
   * Paremter (OrderBy, Where, Limit) sind im Objektform.
   * @param interface ReadCollection mit Key: uid, orderBy, limit, where?
   */
  async readCollectionGroup<T extends ValueObject>({
    orderBy,
    limit,
    where,
  }: ReadCollectionGroup) {
    const result: T[] = [];
    let collectionGroup = this.getCollectionGroup();

    if (orderBy) {
      collectionGroup = collectionGroup.orderBy(
        orderBy.field,
        orderBy.sortOrder
      );
    }

    if (where) {
      // Where Bedingungen verketten
      where.forEach((statment) => {
        collectionGroup = collectionGroup.where(
          statment.field,
          statment.operator,
          statment.value
        );
      });
    }

    if (limit) {
      collectionGroup = collectionGroup.limit(limit);
    }

    return await collectionGroup
      .get()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          const object = this.prepareDataForApp<T>({
            uid: document.id,
            value: this.convertTimestampValuesToDates(document.data()),
          }) as T;
          result.push(object);
        });
        return result;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }

  // ===================================================================== */
  /**
   * Listener für ein bestimmtes Dokument
   * Sobald das Dokument ändert, werden die Änderungen zurückgegeben
   * Da die Methode nur ein Objekt zurückgeben kann und dies der Listener ist
   * --> unsubscribe(), müssen die Werte über einen Callback hochgegeben werden.
   * @param param0 - Objekt mit uids ->  Array mit UIDs um zum Dokument
   *                 zu gelangen
   */
  async listen<T extends ValueObject>({
    uids,
    callback,
    errorCallback,
  }: Listen<T>) {
    const document = this.getDocument(uids);

    return document.onSnapshot(
      (snapshot) => {
        if (!snapshot.exists) {
          throw new Error(TEXT_DB_DOCUMENT_DELETED);
        }

        const dataForApp = this.prepareDataForApp<T>({
          uid: snapshot.id,
          value: this.convertTimestampValuesToDates(
            snapshot.data() as ValueObject
          ),
        });

        callback(dataForApp);
      },
      (error) => {
        console.error("Fehler beim Hören auf Snapshot:", document.id, error);
        errorCallback(error);
      }
    );
  }
  // ===================================================================== */
  /**
   * Update: Update des gesamten Dokumentes
   * @param uid - UID des Dokumentes in der Collection
   * @param value - Werte für das Dokument
   * @param authUser - AuthUser der Person, die das Update durchführt
   * @returns Promise<T> - geänderte Daten (lastChanged etc.)
   */
  // ===================================================================== */
  async update<T extends ValueObject>({
    uids,
    value,
    authUser,
  }: Update<T>): Promise<ValueObject> {
    value = FirebaseDbSuper.setLastChangeFields(value, authUser) as T;
    // Felder auf Firebase anpassen
    let dbObject = _.cloneDeep(this.prepareDataForDb<T>({value: value}));
    dbObject = this.convertDateValuesToTimestamp(dbObject);

    const document = this.getDocument(uids);
    return await document
      .set(dbObject, {merge: true})
      .then(() => {
        dbObject = this.prepareDataForApp<T>({
          uid: document.id,
          value: this.convertTimestampValuesToDates(dbObject),
        });
        // Session Storage updaten
        SessionStorageHandler.upsertDocument({
          storageObjectProperty: this.getSessionHandlerProperty(),
          documentUid: document.id,
          value: dbObject,
          prefix: uids ? uids[0] : "",
        });

        return dbObject;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  // =====================================================================
  /**
   * UpdateFields:
   * Einzelne Felder eines Dokumentes ändern.
   * Achtung: Values muss genaus so aufgebaut sein. Bezeichner = Feld auf DB,
   * Wert = neuer Wert --> Beispiel: <caption>values = {name:"abcd", age:42}</caption>
   * Im Dokument werden das Feld name und age geändert.
   * @param uid - UID des Dokumentes in der Collection
   * @param values - Neuer Wert
   * @param updateChangeFields - Sollen die Felder *lastChangeAt*,
   *        *lastChangeFromUid* und *lastChangeFromDisplayName* automatisch
   *        gesetzt werden (egal ob vorhanden oder nicht)?
   * @returns Promise<void>
   */
  // =====================================================================
  public async updateFields({
    uids,
    values,
    authUser,
    updateChangeFields = false,
  }: UpdateFields): Promise<void> {
    if (updateChangeFields) {
      values = FirebaseDbSuper.setLastChangeFields(
        values,
        authUser,
        updateChangeFields
      );
    }
    values = _.cloneDeep(this.convertDateValuesToTimestamp(values));
    const document = this.getDocument(uids);

    return document
      .update(values)
      .then(() => {
        SessionStorageHandler.updateDocumentField({
          storageObjectProperty: this.getSessionHandlerProperty(),
          documentUid: document.id,
          value: values,
          prefix: uids ? uids[0] : "",
        });
      })
      .catch((error) => {
        console.info("updateFields:", document.id, values);
        console.error(error);
        throw error;
      });
  }
  // =====================================================================
  /**
   * Set:
   * Ganzes Dokument neu anlegen (oder überschreiben)
   * Achtung: Wenn das Dokument bereits besteht, wird dieses ohne Rück-
   * frage überschrieben
   * @param uid - UID des Dokumentes in der Collection
   * @param values - Neuer Wert
   * @returns Promise<void>
   */
  // =====================================================================
  public async set<T extends ValueObject>({
    uids,
    value,
    authUser,
  }: Set<T>): Promise<T> {
    let dbObject = _.cloneDeep(
      FirebaseDbSuper.setLastChangeFields(value, authUser) as T
    );
    dbObject = this.convertDateValuesToTimestamp(dbObject);
    const document = this.getDocument(uids);
    dbObject = this.prepareDataForDb<T>({value: dbObject}) as T;
    return document
      .set(dbObject)
      .then(() => {
        dbObject = this.convertTimestampValuesToDates(dbObject);
        dbObject = this.prepareDataForApp({uid: value.uid, value: dbObject});

        // Session Storage updaten
        SessionStorageHandler.upsertDocument({
          storageObjectProperty: this.getSessionHandlerProperty(),
          documentUid: document.id,
          value: dbObject,
          prefix: uids ? uids[0] : "",
        });

        return dbObject;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  // ===================================================================== */
  /**
   * incrementField: Wert eines Feldes um einen Wert erhöhen/reduzieren.
   * @param uid - UID des Dokumentes in der Collection
   * @param field - Feld im Dokument, das ein Update erhält
   * @param value - Wert für das Inkrement (positiv oder negativ). Default 1
   * @returns <Promise>void
   */
  // =====================================================================
  public async incrementField({
    uids,
    field,
    value,
  }: IncrementField): Promise<void> {
    const document = this.getDocument(uids);

    return await document
      .update({
        [field]: this.firebase.fieldValue.increment(value),
      })
      .then(() => {
        // Session Storage anpassen
        SessionStorageHandler.incrementFieldValue({
          storageObjectProperty: this.getSessionHandlerProperty(),
          documentUid: document.id,
          field: field,
          value: value,
          prefix: uids ? uids[0] : "",
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  // =====================================================================
  /**
   * Delete
   * Löschen eines Dokumentes
   * @param uid - UID des Dokumentes
   */
  // =====================================================================
  async delete({uids}: Delete) {
    const document = this.getDocument(uids);

    return document
      .delete()
      .then(() => {
        // Session Storage updaten
        SessionStorageHandler.deleteDocument({
          storageObjectProperty: this.getSessionHandlerProperty(),
          documentUid: document.id,
          prefix: uids ? uids[0] : "",
        });
      })
      .catch((error) => {
        throw error;
      });
  }
  // =====================================================================
  /**
   * Delete Field:
   * Löschen eines bestimmten Feldes im Dokument
   * @param uid - UID des Dokumentes
   */
  async deleteField({fieldName, uids}: DeleteField) {
    const document = this.getDocument(uids);
    return document
      .update({
        [fieldName]: this.firebase.fieldValue.delete(),
      })
      .then(() => {
        // Session Storage updaten
        SessionStorageHandler.deleteDocumentField({
          storageObjectProperty: this.getSessionHandlerProperty(),
          documentUid: document.id,
          field: fieldName,
          prefix: uids ? uids[0] : "",
        });
      })
      .catch((error) => {
        throw error;
      });
  }
  // =====================================================================
  /**
   * Dokument Referenz holen
   * Diese Methode hold die Referenz eines Dokumentes
   * Da ein Dokument tief in Collections sein kann, müssen die UIDs
   * in einem Array übergeben werden.
   * Beispiel: recipes/XYZ/comment/abc
   * somit sind XYZ und ABC variable Namen
   * @param uids - String-Array aller variablen Dokumentennamen
   */
  abstract getDocument(uids?: string[]): DocumentReference;
  abstract getDocuments(): void;
  abstract getCollection(uids?: string[]): CollectionReference;
  abstract getCollectionGroup(): Query;
  // =====================================================================
  /**
   * structureDataForDb: Daten in Struktur der DB verschieben
   * allfällige Konvertierung der Werte. Z.B. Datum
   * @abstract
   * @param value - Daten als Objekt
   */
  // =====================================================================
  abstract prepareDataForDb<T extends ValueObject>({
    value,
  }: PrepareDataForDb<T>): ValueObject;
  // =====================================================================
  /**
   * structureDataFromDb: Daten in von DB Struktur in Objekt-Struktur
   * verschieben. allfällige Konvertierung der Werte. Z.B. Datum |
   * @abstract
   * @param uid - UID des Dokumentes (dieser Wert wird danach als Property
   *              des Objektes geführt)
   * @param value - Daten des Dokumentes
   */
  // =====================================================================
  abstract prepareDataForApp<T extends ValueObject>({
    uid,
    value,
  }: PrepareDataForApp): T;
  // =====================================================================
  /**
   * Einstellungen zu Session Handler holen
   *
   */
  // =====================================================================
  abstract getSessionHandlerProperty(): StorageObjectProperty;
  /**
   * Session Storage updaten
   * Diese Methoden aktualisieren - wo nötig - den Sesseion Storage
   */
  // abstract updateSessionStorageFromDbRead({
  //   value,
  //   documentUid,
  // }: UpdateSessionStorageFromDbRead): void;
  // =====================================================================
  /**
   * Session Storage updaten
   * Diese Methoden aktualisier gleich mehrere Dokuemnte
   */
  // abstract updateSessionStorageFromDbReadCollection(value: ValueObject[]): void;
  // =====================================================================
  /**
   * Session Storage lesen
   * Holen eines einzelnen Dokumentes
   */
  // abstract readSessionStorageValue<T extends ValueObject>(
  //   documentUid: string
  // ): T | null;
  // =====================================================================
  /**
   * Session Storage lesen
   * Holen eines mehrerer Dokumente
   * @param where: Array mit möglichen Filterkriterien
   */
  // abstract readSessionStorageValues<T extends ValueObject>(
  //   uids: string[] | undefined,
  //   where: Where[],
  //   orderBy: OrderBy
  // ): T | null;

  // ===================================================================== */
  /**
   * setCreatedFields: Felder Created setzen. Falls vorhanden werden die
   * Felder: *createdAt*, *createdFromUid* und *createdFromDisplayName*
   * gesetzt
   * @param value - Werte, des Dokumentes
   * @param authUser - authUser der Person, die die Änderung vornimmt
   * @param force - ist der Parameter Force gesetzt, wird nicht geprüft ob
   *                die Werte (value) auch die entsprechdenden Felder aufweisen
   *                die Werte werden einfach gesetzt.
   * @returns value - Value mit den angepassten Felder
   */
  // ===================================================================== */
  static setCreatedFields<T extends ValueObject>(
    value: T,
    authUser: AuthUser,
    force?: boolean
  ) {
    if (Object.prototype.hasOwnProperty.call(value, "created") || force) {
      value.created.date = new Date();
      value.created.fromUid = authUser.uid;
      value.created.fromDisplayName = authUser.publicProfile.displayName;
    }
    return value;
  }
  // ===================================================================== */
  /**
   * setLastChangeFields: Felder LastChange setzen. Falls der Typ des
   * Dokumentes die Felder aufweist werden
   * die Felder: *lastChangeAt*, *lastChangeFromUid* und
   * *lastChangeFromDisplayName* gesetzt.
   * @param value - Werte, des Dokumentes
   * @param authUser - authUser der Person, die die Änderung vornimmt
   * @param force - ist der Parameter Force gesetzt, wird nicht geprüft ob
   *                die Werte (value) auch die entsprechdenden Felder aufweisen
   *                die Änderungsfelder werden einfach gesetzt.
   * @returns value - Value mit den angepassten Felder
   */
  // ===================================================================== */
  static setLastChangeFields(
    value: ValueObject,
    authUser: AuthUser,
    force?: boolean
  ) {
    if (Object.prototype.hasOwnProperty.call(value, "lastChange") || force) {
      value.lastChange.date = new Date();
      value.lastChange.fromUid = authUser.uid;
      value.lastChange.fromDisplayName = authUser.publicProfile.displayName;
    }
    return value;
  }
  // ===================================================================== */
  /**
   * Datum (JS) in Firebase Timestamp umwandeln
   * Methode wird Rekursiv ausgeführt!
   * @param values - Objekt
   * @returns values- Objekt mit angepassten werten
   */
  // ===================================================================== */
  convertDateValuesToTimestamp(values: any) {
    if (typeof values === "object" && values !== null) {
      Object.entries(values).forEach(([key, value]) => {
        switch (typeof value) {
          case "object":
            if (value instanceof Date) {
              // if (
              //   value.getHours() !== 23 ||
              //   value.getMinutes() !== 59 ||
              //   value.getSeconds() !== 59
              // ) {
              // value = new Date(new Date(value).setUTCHours(0, 0, 0, 0));
              // }
              value = this.firebase.timestamp.fromDate(value as Date);
            } else if (Array.isArray(value)) {
              value.forEach((entry) =>
                this.convertDateValuesToTimestamp(entry)
              );
            } else {
              value = this.convertDateValuesToTimestamp(value);
            }
            break;
          default:
        }
        values[key] = value;
      });
    }
    return values;
  }
  // ===================================================================== */
  /**
   * Timestamp (Firebase) in JS Datum umwandeln
   * Methode wird Rekursiv ausgeführt!
   * @param values - Objekt
   * @returns values- Objekt mit angepassten werten
   */
  // ===================================================================== */
  convertTimestampValuesToDates(values: any) {
    if (typeof values === "object" && values !== null) {
      // Wenn das Objekt bereits der Timestamp ist, hier abfangen
      if (values instanceof this.firebase.timestamp) {
        values = new Date(values.toDate());
      } else {
        // Objekt auseinandernehmen
        Object.entries(values).forEach(([key, value]) => {
          switch (typeof value) {
            case "object":
              if (value instanceof this.firebase.timestamp) {
                //@ts-expect-error: Mit dem vorigem Check, funktioniert dies.
                value = new Date(value!.toDate());
              } else if (Array.isArray(value)) {
                value = value.map((entry) => {
                  return this.convertTimestampValuesToDates(entry);
                });
              } else {
                value = this.convertTimestampValuesToDates(value);
              }
              break;
            default:
          }
          values[key] = value;
        });
      }
    }
    return values;
  }
}
