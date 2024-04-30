import { useRef, useState, useEffect } from "react";
import "./app.css";
import codeGenerator from "./utils/codeGenerator";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const onCreate = () => {
    const count = Number(inputRef.current?.value || 0);
    parent.postMessage(
      { pluginMessage: { type: "create-rectangles", count } },
      "*"
    );
  };

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
  };

  //check for access token in figma client storage
  useEffect(() => {
    parent.postMessage(
      { pluginMessage: { type: "check-for-access-token" } },
      "*"
    );
  }, []);

  useEffect(() => {
    const handleAccessToken = (event: MessageEvent) => {
      if (event?.data?.pluginMessage?.type === "access-token") {
        setIsAuthenticated(true);
        setIsLoading(false);
        setProfileData(event?.data?.pluginMessage?.profileData);
      }
      if (event?.data?.pluginMessage?.type === "no-access-token") {
        console.log("No Access Token");
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };
    window.addEventListener("message", handleAccessToken);
    return () => {
      window.removeEventListener("message", handleAccessToken);
    };
  }, []);

  const initiateLogin = async () => {
    const { security_code: verifyCode } = codeGenerator(20);

    const url = `http://localhost:3000/login?verify_code=${verifyCode}`;
    window.open(url, "_blank");

    parent.postMessage(
      {
        pluginMessage: { type: "initiate-login", verify_code: verifyCode },
      },
      "*"
    );

    setIsLoading(true);
  };

  const handleLogout = () => {
    parent.postMessage({ pluginMessage: { type: "logout" } }, "*");
    setIsAuthenticated(false);
  };

  return (
    <main>
      <header>
        {isAuthenticated && (
          <>
            <div className="logoutBtn">
              <button onClick={handleLogout}>Logout</button>
            </div>

            <div className="profileName">
              {profileData && (
                <div>
                  <p>Hi, {(profileData as { handle: string })?.handle}</p>
                </div>
              )}
            </div>
          </>
        )}
      </header>
      {isAuthenticated ? (
        <div className="form">
          <h1>Create Rectangles</h1>
          <section className="inputForm">
            <label htmlFor="input">Number of rectangles</label>
            <input id="input" type="number" min="0" ref={inputRef} />
          </section>
          <div className="buttonGroup">
            <button className="brand" onClick={onCreate}>
              Create
            </button>
            <button onClick={onCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <h2>You are Not Authenticated</h2>
          <button disabled={isLoading} onClick={() => initiateLogin()}>
            {isLoading ? "Authenticating..." : "Login with Figma"}
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
