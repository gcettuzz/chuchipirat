import React from "react";
import {
  Container,
  Typography,
  Card,
  CardHeader,
  CardContent,
} from "@material-ui/core";
import PageTitle from "../Shared/pageTitle";
import {
  TERM_OF_USE as TEXT_TERM_OF_USE,
  SMALL_PRINT as TEXT_SMALL_PRINT,
} from "../../constants/text";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const TermOfUsePage = () => {
  return (
    <React.Fragment>
      <PageTitle title={TEXT_TERM_OF_USE} subTitle={TEXT_SMALL_PRINT} />

      <Container component="main" maxWidth="md">
        <Card style={{marginTop: "2rem", marginBottom: "3rem"}}>
          <CardHeader title={TEXT_TERM_OF_USE} />
          <CardContent>
            <TermOfUseText />
          </CardContent>
        </Card>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ======================= Datenschutzerklärung ======================
// =================================================================== */
export const TermOfUseText = () => {
  return (
    <React.Fragment>
      <Typography>
        <strong>Kostenhinweis für die Nutzung</strong>
        <Typography>
          Aktuell ist die Nutzung des chuchipirat kostenlos. Die App-Betreiber
          schätzen jedoch eine freiwillige Spende in Höhe von Fr. 5.00 pro
          Anlass, um die laufenden Fixkosten der App zu decken und deren
          Fortbestand zu unterstützen.
        </Typography>
        <br />
        <Typography>
          Es wird darauf hingewiesen, dass diese Spende rein freiwillig ist und
          die App weiterhin kostenlos genutzt werden kann, unabhängig von
          finanziellen Beiträgen.
        </Typography>
        <br />
        <Typography>
          Zukünftige Kosten: Die Betreiber behalten sich das Recht vor, in
          Zukunft Kosten für die Nutzung der App zu erheben, wenn die laufenden
          Betriebskosten nicht mehr vollständig durch freiwillige Spenden
          gedeckt werden können. Jegliche Kostenänderungen werden den Nutzenden
          rechtzeitig mitgeteilt, und es liegt in der Verantwortung der
          Nutzenden, sich über die aktuellen Konditionen zu informieren.
        </Typography>
        <br />
        <Typography>
          Die Betreiber verpflichten sich, transparent über jegliche
          Kostenänderungen zu kommunizieren und die Nutzer*innen über mögliche
          Auswirkungen zu informieren.
        </Typography>
        <br />
        <Typography>
          Durch die Nutzung der App stimmst du diesem Kostenhinweis zu.
        </Typography>
        <br />
        <strong>Allgemeiner Haftungsausschluss</strong>
      </Typography>
      <Typography>
        Die Web-Applikation chuchipirat (nachfolgend «App») wurde von
        ehrenamtlichen Personen für den ehrenamtlichen Gebrauch entwickelt. Die
        Entwickler*innen haben nach bestem Wissen und Gewissen an der Erstellung
        der App gearbeitet.
      </Typography>
      <br />
      <Typography>
        Bitte beachte, dass die Nutzung der App auf eigene Verantwortung
        erfolgt. Die Betreiber übernehmen keine Gewähr für die Richtigkeit,
        Vollständigkeit oder Aktualität der in der App bereitgestellten
        Informationen. Es wird darauf hingewiesen, dass die App möglicherweise
        Fehler, Ungenauigkeiten oder technische Probleme enthalten kann.
      </Typography>
      <br />
      <Typography>
        Die Betreiber schliessen jegliche Haftung für Schäden, die direkt oder
        indirekt aus der Nutzung der App resultieren, aus. Dies schliesst, ist
        jedoch nicht beschränkt auf falsch berechnete Mengen, Schäden durch
        Verlust von Daten oder finanzielle Verluste ein.
      </Typography>
      <br />
      <Typography>
        Die App kann Links zu externen Websites oder Diensten enthalten, die
        nicht unter der Kontrolle der Betreiber stehen. Die Betreiber übernehmen
        keine Verantwortung für die Inhalte externer Websites oder Dienste.
      </Typography>
      <br />
      <Typography>
        Die Nutzenden werden dazu aufgefordert, die App verantwortungsbewusst
        und im Einklang mit den geltenden Gesetzen und Vorschriften zu nutzen.
        Bei Unsicherheiten oder Problemen wird empfohlen, professionellen Rat
        einzuholen.
      </Typography>
      <br />
      <Typography>
        Durch die Nutzung der App stimmst du diesem Haftungsausschluss zu. Die
        Betreiber behalten sich das Recht vor, den Inhalt der App und diesen
        Haftungsausschluss jederzeit und ohne vorherige Ankündigung zu ändern.
      </Typography>
      <br />
      <Typography>Stand, 1. März 2024.</Typography>
      <br />
    </React.Fragment>
  );
};

export default TermOfUsePage;
