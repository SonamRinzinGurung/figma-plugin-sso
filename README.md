## Figma Plugin with SSO Login Flow

This is a simple Figma plugin that demonstrates how to implement a Single Sign-On (SSO) login flow in a Figma plugin. The plugin uses the OAuth 2.0 authorization code grant flow to authenticate users and a simple Node.js server to handle the OAuth 2.0 authorization code grant flow and exchange the authorization code for an access token to the Figma Plugin. The plugin is built with React and uses Vite as the build tool.

### Prerequisites
- A Figma account
- Figma Desktop app
- Node.js
- React

### Getting Started
1. Clone this repository
2. `cd server`, then run `npm install` to install the dependencies
3. Create a `.env` file in the `server` folder and add the following environment variables:
```bash
REACT_APP_FIGMA_CLIENT_ID=YOUR_CLIENT_ID
REACT_APP_FIGMA_CLIENT_SECRET=YOUR_CLIENT_SECRET
REACT_APP_REDIRECT_URI=http://localhost:3000/callback/
```
4. Run `npm start` to start the server
5. Open a new terminal window, then `cd client`, and run `npm install` to install the dependencies
6. Create a `.env` file in the `client` folder and add the following environment variables:
```bash
VITE_CLIENT_ID=YOUR_CLIENT_ID
VITE_REDIRECT_URI=http://localhost:3000/callback/
```
7. Run `npm run watch` to listen for changes in the `client` folder
8. Open the Figma Desktop app
9. Go to `Plugins` > `Development` > `Import plugin from manifest...`
10. Click on `Click to choose a manifest.json file` and select the `manifest.json` file in the `client` folder of this repository
11. Click on `Development` > `Figma Plugin for SSO` to run the plugin

***
![Model](https://github.com/SonamRinzinGurung/figma-plugin-sso/blob/26776542dfc92f728320f4231ad9529b4cc11006/client/src/assets/Figma%20SSO%20Flow.png)
***
### Author

[Sonam Rinzin Gurung](https://github.com/SonamRinzinGurung)
