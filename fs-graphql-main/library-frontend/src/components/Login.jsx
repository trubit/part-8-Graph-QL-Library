import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN } from "../queries";

const Login = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);

  const [login] = useMutation(LOGIN, {
    onError: (err) => {
      console.error(err.graphQLErrors?.[0]?.message ?? err.message);
      setErrorMessage("login failed");
    },
  });

  if (!show) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = await login({ variables: { username, password } }).catch(
      () => null,
    );

    if (result?.data?.login?.value) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("library-user-token", token);
      setUsername("");
      setPassword("");
      setErrorMessage(null);
      setPage("books");
    }
  };

  return (
    <div>
      {errorMessage && <div>{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">name</label>{" "}
          <input
            id="username"
            aria-label="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">password</label>{" "}
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default Login;
