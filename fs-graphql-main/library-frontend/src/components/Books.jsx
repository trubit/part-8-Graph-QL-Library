import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { ALL_BOOKS, BOOKS_BY_GENRE } from "../queries";

const Books = ({ show }) => {
  const [selectedGenre, setSelectedGenre] = useState(null);

  const allBooksResult = useQuery(ALL_BOOKS, { skip: !show });
  const booksResult = useQuery(BOOKS_BY_GENRE, {
    variables: { genre: selectedGenre },
    skip: !show,
  });

  const allBooks = allBooksResult.data?.allBooks || [];
  const genres = [
    ...new Set(allBooks.flatMap((book) => book.genres ?? []).filter(Boolean)),
  ];
  const books = booksResult.data?.allBooks || [];

  if (!show) {
    return null;
  }

  if (allBooksResult.loading || booksResult.loading) {
    return <div>loading books...</div>;
  }
  if (allBooksResult.error || booksResult.error) {
    return <div>error loading books</div>;
  }

  const selectGenre = (genre) => {
    setSelectedGenre(genre);
    booksResult.refetch({ genre });
  };

  return (
    <div>
      <h2>books</h2>
      {selectedGenre && (
        <div>
          in genre <strong>{selectedGenre}</strong>
        </div>
      )}
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author?.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        {genres.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => selectGenre(g)}
            style={{
              marginLeft: "5px",
              backgroundColor: selectedGenre === g ? "#1976d2" : "white",
              color: selectedGenre === g ? "white" : "black",
            }}
          >
            {g}
          </button>
        ))}
        <button type="button" onClick={() => selectGenre(null)}>
          all genres
        </button>
      </div>
    </div>
  );
};

export default Books;
