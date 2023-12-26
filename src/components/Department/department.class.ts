import Utils from "../Shared/utils.class";
import * as FIREBASE_EVENTS from "../../constants/firebaseEvents";
import Firebase from "../Firebase";

interface GetAllDepartments {
  firebase: Firebase;
}

export default class Department {
  uid: string;
  name: string;
  pos: number;
  usable: boolean;
  /* =====================================================================
// Constructor
// ===================================================================== */
  constructor() {
    this.uid = "";
    this.name = "";
    this.pos = 0;
    this.usable = false;
  }

  /* =====================================================================
  // Alle Einheiten aus der DB holen
  // ===================================================================== */
  static async getAllDepartments({ firebase }: GetAllDepartments) {
    let departments: Department[] = [];

    await firebase.masterdata.department
      .read<Object>({ uids: [] })
      .then((result) => {
        Object.keys(result).forEach((key) => {
          departments.push({
            uid: key,
            name: result[key].name,
            pos: result[key].pos,
            usable: result[key].usable,
          });
        });
      })
      .catch((error) => {
        throw error;
      });

    departments = Utils.sortArray({
      array: departments,
      attributeName: "name",
    });

    return departments;
  }
  /* =====================================================================
  // Abteilung anlegen
  // ===================================================================== */
  static createDepartment = async ({ firebase, name, pos }) => {
    // const departmentsDoc = firebase.departments();
    // let uid = Utils.generateUid(20);
    // await departmentsDoc
    //   .update({
    //     [uid]: { name: name, pos: pos, usable: true },
    //   })
    //   .catch((error) => {
    //     throw error;
    //   });
    // // Event auslösen
    // firebase.analytics.logEvent(FIREBASE_EVENTS.DEPARTMENT_CREATED);
    // return { uid: uid, name: name, pos: pos, usable: true };
  };
  /* =====================================================================
  // Neue Position setzen
  // ===================================================================== */
  static setPositionForDepartment({ list, departmentUid, newPos }) {
    // let department = list.find(
    //   (department) => department.uid === departmentUid
    // );
    // list = Department._sortListByPos(list);
    // // Einträge neu nummerieren --> funtkioniert nur wenn Tabelle sortiert ist
    // if (department.pos > newPos) {
    //   // // das was die aktuelle Position hält, muss eins rauf.
    //   for (let i = newPos; i < department.pos; i++) {
    //     list[i - 1].pos = i + 1;
    //   }
    // } else {
    //   // department.pos -1 +1 --> -1 für Array Zugriff
    //   // +1 für den nächsten Eintrag anpassen
    //   for (let i = department.pos; i < newPos; i++) {
    //     list[i].pos -= 1;
    //   }
    // }
    // department.pos = newPos;
    // // sortieren bevor wir abschliessen
    // return Department._sortListByPos(list);
  }
  /* =====================================================================
  // Alle Abteilungen speichern
  // ===================================================================== */
  static saveDepartments = async ({ firebase, departments }) => {
    // const departmentsDoc = firebase.departments();
    // var departmentsMap = {};
    // departments.forEach((department) => {
    //   departmentsMap[department.uid] = {
    //     name: department.name,
    //     pos: department.pos,
    //     usable: department.usable,
    //   };
    // });
    // await departmentsDoc.update(departmentsMap).catch((error) => {
    //   throw error;
    // });
    // // Analytik
    // firebase.analytics.logEvent(FIREBASE_EVENTS.DEPARTMENT_UPDATED);
  };
  /* =====================================================================
  // PRIVATE: sortieren nach Position
  // ===================================================================== */
  // Liste nach Position sortieren
  static _sortListByPos(list) {
    // return list.sort((a, b) => (a.pos > b.pos ? 1 : -1));
  }
}
