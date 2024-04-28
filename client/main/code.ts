figma.showUI(__html__, { themeColors: true, height: 300 });

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

  if (msg.type === "check-for-access-token") {
    let access_Token = figma.clientStorage.getAsync("accessToken");
    const accessToken = await access_Token;
    if (Object.keys(accessToken).length > 0) {
      const profileResponse = await fetch(
        `http://localhost:3000/get-profile?accessToken=${accessToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const profileData = await profileResponse.json();
      console.log("Profile Data:", profileData);

      if (profileResponse.status === 200) {
        figma.ui.postMessage({
          type: "access-token",
          accessToken,
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
        const data = await response.json();
        const accessToken = data.accessToken;

        const profileResponse = await fetch(
          `http://localhost:3000/get-profile?accessToken=${accessToken}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const profileData = await profileResponse.json();
        console.log("Profile Data:", profileData);

        if (profileResponse.status === 200) {
          figma.ui.postMessage({
            type: "access-token",
            accessToken,
          });
          figma.clientStorage.setAsync("accessToken", accessToken);
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
