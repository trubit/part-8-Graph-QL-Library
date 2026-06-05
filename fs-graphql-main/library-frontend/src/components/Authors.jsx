import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const Authors = ({ show, token }) => {
  const [name, setName] = useState("");
  const [born, setBorn] = useState("");

  const result = useQuery(ALL_AUTHORS);

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.error("Error editing author:", error);
    },
  });

  if (!show) {
    return null;
  }

  if (result.loading) {
    return <div>loading authors...</div>;
  }
  if (result.error) {
    return <div>error loading authors</div>;
  }

  const authors = result.data?.allAuthors ?? [];
  const selectedName = name || authors[0]?.name || "";

  const submit = async (event) => {
    event.preventDefault();

    if (!selectedName || !born) return;

    await editAuthor({
      variables: {
        name: selectedName,
        setBornTo: parseInt(born, 10),
      },
    });

    setBorn("");
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token && (
        <>
          <h2>Set birthyear</h2>
          <form onSubmit={submit}>
            <div>
              <label htmlFor="author-name">name</label>
              <select
                id="author-name"
                name="name"
                value={selectedName}
                onChange={({ target }) => setName(target.value)}
              >
                {authors.map((author) => (
                  <option key={author.name} value={author.name}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="born">born</label>
              <input
                id="born"
                type="number"
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button type="submit">update author</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Authors;
