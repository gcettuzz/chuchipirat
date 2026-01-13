import React from "react";
import {
  Container,
  Typography,
  Link,
  Card,
  CardHeader,
  CardContent,
  Box,
} from "@mui/material";
import {PRIVACY_POLICY as ROUTE_PRIVACY_POLICY} from "../../constants/routes";
import {useHistory} from "react-router";
import PageTitle from "../Shared/pageTitle";
import {
  PRIVACY_POLICY as TEXT_PRIVACY_POLICY,
  SMALL_PRINT as TEXT_SMALL_PRINT,
} from "../../constants/text";
/* ===================================================================
// ======================== globale Funktionen =======================
// =================================================================== */
const customStyles = {
  customOrderedList: {
    counterReset: "item",
    fontSize: "1rem",
    paddingLeft: "0",
  },
  listItem: {
    paddingLeft: "0rem",
    paddingTop: "0.5rem",
    paddingBottom: "1rem",
    display: "block",
    "&:before": {
      content: 'counters(item, ".") " "',
      counterIncrement: "item",
      width: "1.5em",
      display: "inline-block",
      fontWeight: "bold",
    },
  },
  subListItem: {
    // fontSize: "0.9rem",
    fontWeight: "normal",
    paddingBottom: "0.5rem",

    "&:before": {
      content: 'counters(item, ".") " "',
      counterIncrement: "item",
      width: "2em",
      display: "inline-block",
      fontWeight: "normal",
    },
  },
};
/* ===================================================================
// =============================== Page ==============================
// =================================================================== */
const PrivacyPolicyPage = () => {
  return (
    <React.Fragment>
      <PageTitle title={TEXT_PRIVACY_POLICY} subTitle={TEXT_SMALL_PRINT} />

      <Container component="main" maxWidth="md">
        <Card style={{marginTop: "2rem", marginBottom: "3rem"}}>
          <CardHeader title={TEXT_PRIVACY_POLICY} />
          <CardContent>
            <PrivacyPolicyText />
          </CardContent>
        </Card>
      </Container>
    </React.Fragment>
  );
};
/* ===================================================================
// ======================= Datenschutzerklärung ======================
// =================================================================== */
export const PrivacyPolicyText = () => {
  const {push} = useHistory();
  return (
    <React.Fragment>
      <Typography>Stand: 1. März 2024</Typography>

      <Box component="ol" sx={customStyles.customOrderedList}>
        <Box component="li" sx={customStyles.listItem}>
          <strong>Verantwortliche Stelle</strong>
          <br />
          Die Verantwortliche Stelle im Sinne der Datenschutzgesetze ist:
          <br />
          <br />
          Verein chuchipirat
          <br />
          <Link href="mailto:hallo@chuchipirat.ch">hallo@chuchipirat.ch</Link>
          <br />
        </Box>
        <Box component="li" sx={customStyles.listItem}>
          <strong>Datenschutzbeauftragte*r</strong>
          <br />
          Ein Datenschutzbeauftragter wurde nicht bestellt, da dies gesetzlich
          nicht erforderlich ist.
          <br />
        </Box>
        <Box component="li" sx={customStyles.listItem}>
          <strong>Erhebung und Verarbeitung von personenbezogenen Daten</strong>
          <Box component="ol" sx={customStyles.customOrderedList}>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Personenbezogene Daten umfassen alle Informationen, die sich auf
              eine identifizierte oder identifizierbare natürliche Person
              beziehen. Dazu gehören beispielsweise Name, Adresse,
              E-Mail-Adresse und Nutzerverhalten.
            </Box>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Die Nutzung der Webapp chuchipirat erfordert die Anmeldung über
              die E-Mail-Adresse. Hierbei werden personenbezogene Daten wie
              E-Mail-Adresse, Name und weitere erforderliche Informationen
              abgefragt. Die Angabe dieser Daten erfolgt auf freiwilliger Basis,
              jedoch ist für die Nutzung der Webapp eine Anmeldung erforderlich.
            </Box>
          </Box>
        </Box>
        <Box component="li" sx={customStyles.listItem}>
          <strong>
            Datenübermittlung und -protokollierung für interne und statistische
            Zwecke
          </strong>
          <br />
          <Box component="ol" sx={customStyles.customOrderedList}>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Die Webapp chuchipirat erhebt und speichert automatisch
              Informationen in sogenannten Server-Log-Dateien, die dein Browser
              automatisch an uns übermittelt. Dies sind:
              <br />
              <br />
              <ul>
                <Box component="li">Browsertyp und Browserversion</Box>
                <Box component="li">verwendetes Betriebssystem</Box>
                <Box component="li">Referrer URL</Box>
                <Box component="li">Hostname des zugreifenden Rechners</Box>
                <Box component="li">Uhrzeit der Serveranfrage</Box>
                <Box component="li">IP-Adresse</Box>
              </ul>
            </Box>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Diese Daten sind nicht bestimmten Personen zuordenbar. Eine
              Zusammenführung dieser Daten mit anderen Datenquellen wird nicht
              vorgenommen.
            </Box>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Diese Daten dienen ausschliesslich internen und statistischen
              Zwecken, um die Sicherheit und Stabilität der Webapp zu
              gewährleisten.
            </Box>
          </Box>
        </Box>
        <Box component="li" sx={customStyles.listItem}>
          <strong>Cookies</strong>
          <br />
          <Box component="ol" sx={customStyles.customOrderedList}>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Die Webapp chuchipirat verwendet Cookies. Cookies sind kleine
              Textdateien, die auf deinem Endgerät gespeichert werden. Sie
              richten keinen Schaden an und enthalten keine Viren.
            </Box>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Cookies dienen dazu, die Nutzung der Webapp benutzerfreundlicher,
              effektiver und sicherer zu machen. Einige Cookies sind
              «Session-Cookies», die nach Ende deiner Browser-Sitzung
              automatisch gelöscht werden. Andere Cookies bleiben auf deinem
              Endgerät gespeichert, bis du diese löschst.
            </Box>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Du kannst deinen Browser so einstellen, dass du über das Setzen
              von Cookies informiert wirst und Cookies nur im Einzelfall
              erlaubst, die Annahme von Cookies für bestimmte Fälle oder
              generell ausschliesst sowie das automatische Löschen der Cookies
              beim Schliessen des Browsers aktivierst. Bei der Deaktivierung von
              Cookies kann die Funktionalität der Webapp eingeschränkt sein.
            </Box>
          </Box>
        </Box>
        <Box component="li" sx={customStyles.listItem}>
          <strong>SSL-Verschlüsselung</strong>
          <br />
          Die Webapp chuchipirat nutzt aus Gründen der Sicherheit und zum Schutz
          der Übertragung vertraulicher Inhalte eine SSL-Verschlüsselung. Damit
          sind Daten, die du über diese Website übermittelst, für Dritte nicht
          mitlesbar. Du erkennst eine verschlüsselte Verbindung an der
          «https://» Adresszeile deines Browsers.
        </Box>
        <Box component="li" sx={customStyles.listItem}>
          <strong>Nutzung von Google Analytics</strong>
          <br />
          Die Webapp chuchipirat verwendet Google Analytics, einen
          Webanalysedienst der Google Inc. (
          <Link
            href="https://www.google.de/intl/de/policies/privacy"
            target="_blank"
          >
            Google Datenschutzerklärung
          </Link>
          ). Google Analytics verwendet Cookies, die auf deinem Computer
          gespeichert werden und die eine Analyse der Benutzung der Webapp durch
          dich ermöglichen. Die durch den Cookie erzeugten Informationen über
          deine Benutzung dieser Website werden in der Regel an einen Server von
          Google in den USA übertragen und dort gespeichert.
        </Box>
        <Box component="li" sx={customStyles.listItem}>
          <strong>Nutzung von Google Firebase</strong>
          <br />
          Die Webapp chuchipirat wird auf dem Serviceangebot von Google Firebase
          betrieben. Firebase bietet verschiedene Dienste, darunter Hosting,
          Datenbanken und Authentifizierung. Durch die Nutzung von Firebase
          können bestimmte personenbezogene Daten auf Servern von Google in den
          USA gespeichert werden. Weitere Informationen findest du in der{" "}
          <Link
            href="https://firebase.google.com/support/privacy"
            target="_blank"
          >
            Datenschutzerklärung von Firebase
          </Link>
          .
        </Box>
        <Box component="li" sx={customStyles.listItem}>
          <strong>Rechte der betroffenen Person</strong>
          <br />
          <Box component="ol" sx={customStyles.customOrderedList}>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Als Nutzer*in der Webapp chuchipirat hast du das Recht, auf Antrag
              unentgeltlich Auskunft über die personenbezogenen Daten zu
              erhalten, die über dich gespeichert wurden.
            </Box>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Darüber hinaus hast du das Recht auf Berichtigung unrichtiger
              Daten, Sperrung und Löschung deiner personenbezogenen Daten,
              soweit dem keine gesetzliche Aufbewahrungspflicht entgegensteht.
            </Box>
            <Box
              component="li"
              sx={[customStyles.listItem, customStyles.subListItem]}
            >
              Für Anfragen zur Auskunft, Berichtigung, Sperrung oder Löschung
              von personenbezogenen Daten sowie für weitergehende Fragen zum
              Datenschutz kannst du dich an{" "}
              <Link href="mailto:hallo@chuchipirat.ch">
                hallo@chuchipirat.ch
              </Link>{" "}
              wenden.
            </Box>
          </Box>
        </Box>
        <Box component="li" sx={customStyles.listItem}>
          <strong>Änderungen dieser Datenschutzerklärung</strong>
          <br />
          Diese Datenschutzerklärung kann sich aufgrund gesetzlicher Neuerungen
          oder Änderungen der Webapp chuchipirat ändern. Die jeweils aktuelle
          Datenschutzerklärung findest du jederzeit auf&nbsp;
          <Link onClick={() => push({pathname: ROUTE_PRIVACY_POLICY})}>
            chuchipirat.ch/privacypolicy
          </Link>
          .
        </Box>
        {/* <li className={customStyle.listItem}>
          <strong>X</strong>
          <br />
          <ol className={customStyle.customOrderedList}>
            <li className={customStyle.listItem}>xx</Box>
            <li className={customStyle.listItem}>xx</Box>
            <li className={customStyle.listItem}>xx</Box>
          </Box>
        </Box> */}
      </Box>
    </React.Fragment>
  );
};

export default PrivacyPolicyPage;
