"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Menuplan {
    /* =====================================================================
     // Konstruktor
     // ===================================================================== */
    constructor() {
        this.dates = [];
        this.meals = [];
        this.notes = [];
        this.recipes = [];
        this.createdAt = new Date();
        this.createdFromUid = "";
        this.createdFromDisplayName = "";
        this.lastChangeAt = new Date();
        this.lastChangeFromUid = "";
        this.lastChangeFromDisplayName = "";
    }
    /* =====================================================================
     // Factory
     // ===================================================================== */
    static factory({ dates, meals, notes, recipes, createdAt, createdFromUid, createdFromDisplayName, lastChangeAt, lastChangeFromUid, lastChangeFromDisplayName, }) {
        let menuplan = new Menuplan();
        menuplan.dates = dates;
        menuplan.meals = meals;
        menuplan.notes = notes;
        menuplan.recipes = recipes;
        menuplan.createdAt = createdAt;
        menuplan.createdFromUid = createdFromUid;
        menuplan.createdFromDisplayName = createdFromDisplayName;
        menuplan.lastChangeAt = lastChangeAt;
        menuplan.lastChangeFromUid = lastChangeFromUid;
        menuplan.lastChangeFromDisplayName = lastChangeFromDisplayName;
        return menuplan;
    }
}
exports.default = Menuplan;
