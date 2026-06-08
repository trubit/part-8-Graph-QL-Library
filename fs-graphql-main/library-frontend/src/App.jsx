import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Login from "./components/Login";
import NewBook from "./components/NewBook";
import Recommendations from "./components/Recommendations";
import { useApolloClient, useSubscription } from "@apollo/client/react";
import { ALL_BOOKS, BOOK_ADDED, BOOKS_BY_GENRE } from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(
    localStorage.getItem("library-user-token"),
  );
  const client = useApolloClient();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data?.bookAdded;

      if (!addedBook) {
        return;
      }

      window.alert(`New book added: ${addedBook.title}`);
      client.refetchQueries({
        include: [ALL_BOOKS, BOOKS_BY_GENRE],
      });
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.removeItem("library-user-token");
    client.resetStore();
    setPage("books");
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button onClick={() => setPage("recommend")}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} token={token} />

      <Books show={page === "books"} />

      <NewBook show={page === "add" && token} />

      <Login show={page === "login"} setToken={setToken} setPage={setPage} />

      <Recommendations show={page === "recommend" && token} />
    </div>
  );
};

export default App;
