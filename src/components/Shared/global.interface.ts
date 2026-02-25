/**
 * Change-Management Objekt für das festhalten von
 * Created / Edited
 * @param date - Datum der Änderung
 * @param fromUid - UID des Users
 * @param fromDisplayName - Anzeigename des Users
 */
export interface ChangeRecord {
  date: Date;
  fromUid: string;
  fromDisplayName: string;
}
/**
 * Bilder-URL in verschiedenen grössen
 * @param smallSize - für Avatar
 * @param normalSize - normale Grösse
 * @param fullSize - Grösse in voller Auflösung
 */
export interface Picture {
  smallSize: string;
  normalSize: string;
  fullSize: string;
}
export interface ButtonAction {
  buttonText: string;
  onClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    value?: {[key: string]: any}
  ) => void;
}
