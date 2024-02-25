// Wird benötigt, damit langsam durch ein Fenster gescrollt wird.
// --> Bildschirmaufnahme für Dokumentationen
import React, {useEffect, useState} from "react";
import {
  DialogType,
  SingleTextInputResult,
  useCustomDialog,
} from "./customDialogContext";

const ScrollDownOnKeyPress: React.FC = () => {
  const [scrolling, setScrolling] = useState(false);
  const {customDialog} = useCustomDialog();

  const handleKeyPress = (event: KeyboardEvent): void => {
    // Überprüfe, ob die Tastenkombination übereinstimmt (hier: Strg + Alt + S)
    if (!scrolling && event.ctrlKey && event.altKey && event.key === "¥") {
      // Scrolle langsam nach unten
      setScrolling(true);
      scrollToBottom();
    }
  };

  const scrollToBottom = async () => {
    // Setze die Zielposition auf das Ende der Seite
    const targetPosition = document.body.scrollHeight;

    // Definiere die Anzahl der Schritte für das langsame Scrollen

    const userInput = (await customDialog({
      dialogType: DialogType.SingleTextInput,
      title: "Anzahl Steps",
      text: "Wie viele Schritte sollen für den Scrolldown eingesetzt werden. Mehr = lansamger",
      singleTextInputProperties: {
        initialValue: "1000",
        textInputLabel: "Schritte",
      },
    })) as SingleTextInputResult;

    if (!userInput.valid) {
      return;
    }

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });

    const steps = parseInt(userInput.input);

    // Berechne die Distanz pro Schritt
    const distancePerStep = targetPosition / steps;

    // Starte das langsame Scrollen
    const scrollInterval = setInterval(() => {
      // Aktuelle Scroll-Position
      const currentScrollPosition = window.scrollY;

      // Berechne die neue Scroll-Position
      const newScrollPosition = currentScrollPosition + distancePerStep;

      // Setze die Scroll-Position
      window.scrollTo(0, newScrollPosition);

      // Überprüfe, ob das Ende erreicht ist
      if (newScrollPosition >= targetPosition) {
        clearInterval(scrollInterval); // Stoppe das Scroll-Intervall
        setScrolling(false); // Setze scrolling auf false, um erneutes Scrollen zu ermöglichen
      }
    }, 20); // 20 Millisekunden pro Schritt
  };

  useEffect(() => {
    // Füge den Event-Listener hinzu
    window.addEventListener("keydown", handleKeyPress);

    // Aufräumen beim Komponenten-Unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [scrolling]); // Abhängigkeit von scrolling hinzufügen

  return null; //<div>Drücke Strg + Alt + S zum langsamen Scrollen nach unten</div>;
};

export default ScrollDownOnKeyPress;
