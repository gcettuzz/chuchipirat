import Firebase from "../firebase.class";
import Utils from "../../Shared/utils.class";
import {ERROR_PARAMETER_NOT_PASSED} from "../../../constants/text";
import FirebaseAnalyticEvent from "../../../constants/firebaseEvent";

interface UploadFile {
  file: File;
  filename: string;
}
interface GetPictureVariants {
  uid: string;
  sizes: ImageSize[];
  oldDownloadUrl: string;
}

export enum ImageSize {
  size_50 = 50,
  size_200 = 200,
  size_300 = 300,
  size_500 = 500,
  size_600 = 600,
  size_1000 = 1000,
}

// Suffix von redimensionierten Files
export const IMAGES_SUFFIX: {[key: string]: ImageSuffix} = {
  size50: {size: ImageSize.size_50, suffix: "_50x50.jpeg"},
  size200: {size: ImageSize.size_200, suffix: "_200x200.jpeg"},
  size300: {size: ImageSize.size_300, suffix: "_300x300.jpeg"},
  size500: {size: ImageSize.size_500, suffix: "_500x500.jpeg"},
  size600: {size: ImageSize.size_600, suffix: "_600x600.jpeg"},
  size1000: {size: ImageSize.size_1000, suffix: "_1000x1000.jpeg"},
};

interface ImageSuffix {
  size: ImageSize;
  suffix: string;
}

export abstract class FirebaseStorageSuper {
  abstract firebase: Firebase;
  // ===================================================================== */
  /**
   * getFolder: Verzeichnis holen
   */
  // ===================================================================== */
  abstract getFolder(): string;
  // ===================================================================== */
  /**
   * getFile: Bestimmtes File holen
   * @param filename - Name des Files
   */
  // ===================================================================== */
  /**
   * Datei hochladen
   */
  uploadFile({file, filename}: UploadFile): Promise<string> {
    const suffix = Utils.getFileSuffix(file.name);
    filename = filename + "." + suffix;

    const storageRef = this.firebase.storage.ref();
    const folder = this.getFolder();

    // aktuell werden nur Bilder hochgeladen
    const metadata = {
      contentType: "image/jpeg",
    };

    this.firebase.analytics.logEvent(FirebaseAnalyticEvent.uploadPicture, {
      folder: this.getFolder(),
    });

    return new Promise((resolve, reject) => {
      const uploadTask = storageRef
        .child(folder + filename)
        .put(file, metadata);

      uploadTask.on(
        "state_changed",
        function (snapshot) {
          console.info("File wird hochgeladen:", snapshot.metadata.name);
        },
        function error(error) {
          console.error(error);
          reject();
        },
        function complete() {
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  }
  // ===================================================================== */
  /**
   * Geänderte Bild-Varianten holen
   * Nachdem das Bild hochgeladen wurde, setzt eine Cloudfunction ein, und
   * redimensioniert die Bilder (je nach Speicherort, in diversen Grössen).
   * Diese Methode holt die neu erstellen Varianten als Download-URL
   * @param objekt GetPictureVariants
   */
  async getPictureVariants({
    uid,
    sizes = [],
    oldDownloadUrl,
  }: GetPictureVariants) {
    let counter = 0;
    let fileFound = false;
    const fileVariants: {size: number; downloadURL: string}[] = [];
    const docRefs: Promise<string>[] = [];
    let downloadUrls: any[] = [];

    // Info: die oldDownloadUrl muss auch der ersten Size entsprechen
    // sonst funtkioniert das nicht

    if (sizes.length === 0) {
      throw new Error(ERROR_PARAMETER_NOT_PASSED);
    }

    const folder = this.getFolder();

    // Warten bis das erste Bild vorhanden ist
    const checkFile = `${folder}${uid}${this.getImageFileSuffix(sizes[0])}`;

    do {
      await this.firebase.storage
        .ref(checkFile)
        .getDownloadURL()
        .then(async (result: string) => {
          if (result === oldDownloadUrl) {
            // Wenn das File ersetzt wird, kann das etwas dauern
            // darum muss überprüft werden, dass der neue Down-
            // loadlink nicht der selbe ist
            fileFound = false;
            await this.delay(1);
          } else {
            // gefunden
            fileFound = true;
          }
        })
        .catch(async () => {
          await this.delay(1);
          counter++;
        });
    } while (fileFound === false && counter <= 10);

    // Alle URLs für die geforderten Grössen holen
    sizes.forEach((size) => {
      docRefs.push(
        this.firebase.storage
          .ref(`${folder}${uid}${this.getImageFileSuffix(size)}`)
          .getDownloadURL()
      );
    });

    downloadUrls = await Promise.all(docRefs);

    downloadUrls.forEach((downloadURL) => {
      const sizeType = Object.values(IMAGES_SUFFIX).find((sizeType) =>
        downloadURL.includes(sizeType.suffix)
      );
      if (sizeType) {
        fileVariants.push({size: sizeType.size, downloadURL: downloadURL});
      }
    });
    return fileVariants;
  }
  // ===================================================================== */
  /**
   * deleteFile: Datei löschen
   * Die Datei im entpsrechnden Verzeichnis wird gelöscht
   * @param filename: Dateiname (mit Suffix) - ohne Pfad. Das Verzeichnis
   *        wird anhand der Klasse ermittelt
   */
  async deleteFile(filename: string) {
    this.firebase.storage
      .ref(`${this.getFolder()}${filename}`)
      .delete()
      .then(() => {
        this.firebase.analytics.logEvent(FirebaseAnalyticEvent.deletePicture, {
          folder: this.getFolder(),
        });
      })
      .catch((error) => {
        throw error;
      });
  }
  // ===================================================================== */
  /**
   * Suffix der angegebenen Dateigrösse holen:
   * die geänderten Bilder werden mit einem speziellen Suffix hinterlegt
   * Diese Methode, für die geforderte Grösse, den zugehörigen Suffix.
   * Bsp: Input 300 -> Output:"_300x300.jpeg"
   * @param size: geforderte Grösse
   */
  getImageFileSuffix(size: number): string {
    const suffix = Object.values(IMAGES_SUFFIX).find(
      (sizeType) => sizeType.size === size
    )?.suffix;

    if (!suffix) {
      throw "Kein passendes File-Suffix gefunden!";
    }
    return suffix;
  }
  // ===================================================================== */
  /**
   * Warte-Method
   * Bei Aufruf der Methode, wird X Sekunde gewartet, bevor die Methode
   * abgeschlossen wird
   * @param seconds - Anzahl zu wartende Sekunden
   */
  delay = (seconds: number) => {
    return new Promise(function (resolve) {
      setTimeout(resolve, seconds * 1000);
    });
  };
}

export default FirebaseStorageSuper;
