import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_BOOK, ALL_AUTHORS, ALL_BOOKS, BOOKS_BY_GENRE } from "../queries";

const NewBook = ({ show }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: [
      { query: ALL_BOOKS },
      { query: BOOKS_BY_GENRE, variables: { genre: null } },
      { query: ALL_AUTHORS },
    ],
    awaitRefetchQueries: true,
    onError: (error) => {
      console.error("Error creating book:", error);
    },
  });

  if (!show) {
    return null;
  }

  const submit = async (event) => {
    event.preventDefault();

    await createBook({
      variables: {
        title,
        author,
        published: parseInt(published),
        genres,
      },
    });

    /*console.log("add book...");*/

    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <h2>Add new book</h2>
      <form onSubmit={submit}>
        <div>
          <label htmlFor="title">title</label>
          <input
            id="title"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          <label htmlFor="author">author</label>
          <input
            id="author"
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          <label htmlFor="published">published</label>
          <input
            id="published"
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <label htmlFor="genre">genre</label>
          <input
            id="genre"
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
