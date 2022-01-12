import { AuthUser } from "../Authentication/authUser.class";
import {
  DocumentReference,
  DocumentData,
  CollectionReference,
} from "@firebase/firestore-types";

import Firebase from "../firebase.class";

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
}
interface ReadCollection {
  uids: string[];
  orderBy: OrderBy;
  limit: number;
  where?: Where[];
  startAfter?: any;
}
interface Listen {
  uids?: string[];
}
interface Update<T> {
  uids: string[];
  value: T;
  authUser: AuthUser;
}
interface UpdateFields {
  uids: string[];
  values: { [key: string]: any };
  authUser: AuthUser;
  updateChangeFields?: boolean;
}
interface IncrementField {
  uids: string[];
  field: string;
  value: number;
}
interface Delete {
  uids: string[];
}

export interface PrepareDataForDb<T> {
  value: T;
}

export interface PrepareDataForApp {
  uid: string;
  value: ValueObject;
}

interface OrderBy {
  field: string;
  sortOrder: SortOrder;
}
interface Where {
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

export abstract class FirebaseSuper {
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
    value = FirebaseSuper.setCreatedFields<T>(value, authUser, force);

    // Felder auf Firebase anpassen
    let dbObject = this.prepareDataForDb({ value: value });

    const collection = this.getCollection(uids);

    return await collection
      .add(dbObject)
      .then((docRef) => {
        return this.prepareDataForApp<T>({ uid: docRef.id, value: dbObject });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  /* =====================================================================
  // Read
  // ===================================================================== */
  async read<T>({ uids }: Read): Promise<T> {
    const document = this.getDocument(uids);

    return await document.get().then((snapshot) => {
      return this.prepareDataForApp<T>({
        uid: snapshot.id,
        value: snapshot.data() as ValueObject,
      });
    });
  }
  /* =====================================================================
  // Read Collection
  // ===================================================================== */
  /**
   * readCollection: Lesen mehrere Dokumente. Abstrakt, da nicht alle die gleichen
   * Paremter (OrderBy, Where, Limit) benötigen.
   * @param interface ReadCollection mit Key: uid, orderBy, limit, where?
   */
  async readCollection<T extends ValueObject>({
    uids,
    orderBy,
    limit,
    where,
    startAfter,
  }: ReadCollection) {
    let result: T[] = [];

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

    queryObject = queryObject.limit(limit);

    return await queryObject
      .get()
      .then((snapshot) => {
        snapshot.forEach((document) => {
          let object = this.prepareDataForApp<T>({
            uid: document.id,
            value: document.data(),
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
   * @param param0 - Objekt mit uids ->  Array mit UIDs um zum Dokument
   *                 zu gelangen
   */
  async listen<T extends ValueObject>({ uids }: Listen) {
    const document = this.getDocument(uids);

    let listener = { unsubscribe: () => {}, data: {} };

    listener.unsubscribe = await document.onSnapshot((snapshot) => {
      listener.data = this.prepareDataForApp<T>({
        uid: snapshot.id,
        value: snapshot.data() as ValueObject,
      });
    });

    return listener;
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
    value = FirebaseSuper.setLastChangeFields(value, authUser) as T;

    // Felder auf Firebase anpassen
    let dbObject = this.prepareDataForDb<T>({ value: value });

    const document = this.getDocument(uids);
    return await document
      .set(dbObject)
      .then(() => {
        return this.prepareDataForApp<T>({ uid: value.id, value: value });
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
    //TODO: Testen und auch die Update Methode!
    console.log("values vor lastEdit", values);
    values = FirebaseSuper.setLastChangeFields(
      values,
      authUser,
      updateChangeFields
    );
    console.log("values nach lastEdit", values);

    const document = this.getDocument(uids);
    return document.update(values);
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
      .catch((error) => {
        console.error(error);
        throw error;
      });
  }
  // =====================================================================
  /**
   * Delete
   * Löschen eines Dokumentes - 💥 🧨 Achtung!!! Nicht implementiert!
   * @param uid - UID des Dokumentes
   */
  // =====================================================================
  delete({ uids }: Delete): void {
    console.error("🤪 not implemented!");
    throw "🤪 not implemented!";
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
  }: PrepareDataForDb<T>): object;
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
    if (value.hasOwnProperty("created") || force) {
      let created = {
        date: new Date(),
        fromUid: authUser.uid,
        fromDisplayName: authUser.publicProfile.displayName,
      };
      value = { ...value, ...created };
    }
    // else {
    //   if (value.hasOwnProperty("createdAt") || force) {
    //     value = { ...value, ...{ createdAt: new Date() } };
    //   }
    //   if (value.hasOwnProperty("createdFromUid") || force) {
    //     value = { ...value, ...{ createdFromUid: authUser.uid } };
    //   }
    //   if (value.hasOwnProperty("createdFromDisplayName") || force) {
    //     value = {
    //       ...value,
    //       ...{ createdFromDisplayName: authUser.publicProfile.displayName },
    //     };
    //   }
    // }
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
    if (value.hasOwnProperty("lastChange") || force) {
      let lastChange = {
        date: new Date(),
        fromUid: authUser.uid,
        fromDisplayName: authUser.publicProfile.displayName,
      };
      value = { ...value, ...lastChange };
    }

    // if (value.hasOwnProperty("lastChangeAt") || force) {
    //   value = { ...value, ...{ lastChangeAt: new Date() } };
    // }
    // if (value.hasOwnProperty("lastChangeFromUid") || force) {
    //   value = { ...value, ...{ lastChangeFromUid: authUser.uid } };
    // }
    // if (value.hasOwnProperty("lastChangeFromDisplayName") || force) {
    //   value = {
    //     ...value,
    //     ...{ lastChangeFromDisplayName: authUser.publicProfile.displayName },
    //   };
    // }
    return value;
  }
}
