figma.showUI(__html__, { themeColors: true, height: 400, width: 400 });

const checkTokenValidity = async (accessToken: string) => {
  const profileResponse = await fetch("https://api.figma.com/v1/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return profileResponse;
};

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create-rectangles") {
    const nodes = [];

    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.2, b: 0.9 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
  if (msg.type === "cancel") {
    figma.closePlugin();
  }

  if (msg.type === "check-for-access-token") {
    let access_Token = figma.clientStorage.getAsync("accessToken");
    const accessToken = await access_Token;
    if (Object.keys(accessToken).length > 0) {
      // check if access token is not empty
      const profileResponse = await checkTokenValidity(accessToken);
      const profileData = await profileResponse.json();

      if (profileResponse.status === 200) {
        // if access token is valid
        figma.ui.postMessage({
          type: "access-token",
          profileData,
        });
        figma.clientStorage.setAsync("accessToken", accessToken);
      } else {
        console.log("Access Token is not valid. Please try again.");
      }
    } else {
      figma.ui.postMessage({ type: "no-access-token" });
    }
  }

  if (msg.type === "initiate-login") {
    const verify_code = msg.verify_code;

    // Poll server for access grant
    const intervalId = setInterval(async () => {
      const response = await fetch("http://localhost:3000/get-token/", {
        method: "POST",
        body: JSON.stringify({ verify_code }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        // if access granted
        const data = await response.json();
        const accessToken = data.accessToken;

        const profileResponse = await checkTokenValidity(accessToken);

        const profileData = await profileResponse.json();

        if (profileResponse.status === 200) {
          // if access token is valid
          figma.ui.postMessage({
            type: "access-token",
            profileData,
          });

          figma.clientStorage.setAsync("accessToken", accessToken);

          // Save profile data to server (no duplicates)
          await fetch("http://localhost:3000/save-profile", {
            method: "POST",
            body: JSON.stringify({ profileData }),
            headers: {
              "Content-Type": "application/json",
            },
          });

          clearInterval(intervalId);
        } else {
          console.log("Access Token is not valid. Please try again.");
          clearInterval(intervalId);
        }
      }
    }, 1000);
  }

  if (msg.type === "logout") {
    figma.clientStorage.setAsync("accessToken", {});
  }
};
