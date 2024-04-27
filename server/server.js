import express from "express";
import axios from "axios";
import { firebase } from "./firebaseConfig.js";
import dotenv from "dotenv"; //to use environment variables
dotenv.config();
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";
import bodyParser from "body-parser";
const app = express();
import "express-async-errors";

app.use(morgan("dev"));

// app.use(express.static("/"));
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const file = path.join(__dirname, "successPage.html");

// app.get("/success", (req, res) => {
//   res.sendFile(file);
// });
app.use(bodyParser.json());

app.get("/login", async (req, res) => {
  const { verify_code } = req.query;

  await firebase.firestore().collection("verify-code").doc().set(
    {
      verify_code,
    },
    { merge: true }
  );
  console.log(verify_code);
  res.redirect(
    `https://www.figma.com/oauth?client_id=${process.env.FIGMA_CLIENT_ID}&redirect_uri=${process.env.FIGMA_REDIRECT_URI}&scope=file_read&state=${verify_code}&response_type=code`
  );
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const { data } = await axios.post("https://www.figma.com/api/oauth/token", {
    client_id: process.env.FIGMA_CLIENT_ID,
    client_secret: process.env.FIGMA_CLIENT_SECRET,
    redirect_uri: process.env.FIGMA_REDIRECT_URI,
    code,
    grant_type: "authorization_code",
  });
  const accessToken = data.access_token;

  //search for the state in the database and add the access token to the document
  const querySnapshot = await firebase
    .firestore()
    .collection("verify-code")
    .where("verify_code", "==", state)
    .get();

  if (!querySnapshot.empty) {
    // Iterate over the documents in the query result
    querySnapshot.forEach((doc) => {
      // Access the document data
      console.log(doc.id, " => ", doc.data());
      const docRef = firebase.firestore().collection("verify-code").doc(doc.id);
      docRef.update({
        access_token: accessToken,
      });
    });
  } else {
    return res.status(404).send("Not Found");
  }

  res.redirect(`http://localhost:3000/success`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
