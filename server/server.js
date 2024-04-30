import express from "express";
import { firebase } from "./firebaseConfig.js";
import dotenv from "dotenv"; //to use environment variables
import morgan from "morgan";
import { fileURLToPath } from "url";
import path from "path";
import bodyParser from "body-parser";
import "express-async-errors";
import cors from "cors";
const app = express();
dotenv.config();

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, "./static/successPage.html");

/**
 * @description Shows the success page after the user has successfully authenticated
 */
app.get("/success", (req, res) => {
  res.sendFile(file);
});

/**
 * @description Route to redirect the user to Figma OAuth page and stores the verify code in the database
 */
app.get("/login", async (req, res) => {
  const { verify_code } = req.query;

  await firebase.firestore().collection("verify-code").doc().set(
    {
      verify_code,
    },
    { merge: true }
  );

  res.redirect(
    `https://www.figma.com/oauth?client_id=${process.env.FIGMA_CLIENT_ID}&redirect_uri=${process.env.FIGMA_REDIRECT_URI}&scope=file_read&state=${verify_code}&response_type=code`
  );
});

/**
 * @description Callback route for Figma OAuth - verifies the state and stores the access token in the database
 */
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  const response = await fetch("https://www.figma.com/api/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.FIGMA_CLIENT_ID,
      client_secret: process.env.FIGMA_CLIENT_SECRET,
      redirect_uri: process.env.FIGMA_REDIRECT_URI,
      code,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  const accessToken = data.access_token;

  //search for the state in the database and add the access token to the document
  const querySnapshot = await firebase
    .firestore()
    .collection("verify-code")
    .where("verify_code", "==", state)
    .get();

  if (!querySnapshot.empty) {
    querySnapshot.forEach((doc) => {
      const docRef = firebase.firestore().collection("verify-code").doc(doc.id);
      docRef.update({
        access_token: accessToken,
      });
    });
  } else {
    return res.status(401).send("Unauthorized");
  }

  res.redirect(`http://localhost:3000/success`);
});

/**
 * @description Route to get the access token from the database using the verify code
 */
app.post("/get-token", async (req, res) => {
  const { verify_code } = req.body;
  let accessToken;

  //search for the verify code in the database
  const querySnapshot = await firebase
    .firestore()
    .collection("verify-code")
    .where("verify_code", "==", verify_code)
    .get();

  if (!querySnapshot.empty) {
    let unauthorized = false;
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      if (data.access_token === undefined) {
        //if the access token is not present in the database
        unauthorized = true;
      } else {
        accessToken = data.access_token; // get the access token from the database
      }
    });

    if (unauthorized) {
      return res.status(401).send("Unauthorized");
    }

    //removing the token from the database after it has been used
    querySnapshot.forEach((doc) => {
      firebase.firestore().collection("verify-code").doc(doc.id).delete();
    });

    return res.status(200).json({ accessToken });
  } else {
    return res.status(401).send("Unauthorized");
  }
});

/**
 * @description Route to save the user's profile data in the database if it doesn't already exist

 */
app.post("/save-profile", async (req, res) => {
  const { profileData } = req.body;

  if (!profileData.id) {
    return res.status(400).send("Bad request");
  }

  const profileRef = firebase.firestore().collection("profile");
  const userQuery = await profileRef.where("id", "==", profileData.id).get();
  if (userQuery.empty) {
    //if the user does not exist in the database
    await profileRef.doc().set(profileData, { merge: true });
    console.log("User data saved successfully.");
  }
  res.json(profileData);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
