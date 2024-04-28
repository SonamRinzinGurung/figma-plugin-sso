import { useRef, useState, useEffect } from "react";
import logoPng from "./assets/logo.png";
import logoSvg from "./assets/logo.svg?raw";
import "./App.sass";
import codeGenerator from "./utils/codeGenerator";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { security_code } = codeGenerator(20);
    setVerifyCode(security_code);
  }, []);

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
        const token = event?.data?.pluginMessage?.accessToken;
        console.log("Access Tokens:", token);
        setIsAuthenticated(true);
        setIsLoading(false);
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
      {isAuthenticated && (
        <div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
      <header>
        <img src={logoPng} />
        &nbsp;
        <img src={`data:image/svg+xml;utf8,${logoSvg}`} />
        <h2>Hey there</h2>
      </header>
      {isAuthenticated ? (
        <div>
          <section>
            <input id="input" type="number" min="0" ref={inputRef} value={10} />
            <label htmlFor="input">Make Rectangles 🧱</label>
          </section>
          <div>
            <button className="brand" onClick={onCreate}>
              Create
            </button>
            <button onClick={onCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <h2>Not Authenticated</h2>
          <button disabled={isLoading} onClick={() => initiateLogin()}>
            Login with Figma
          </button>
        </div>
      )}
    </main>
  );
}

export default App;
