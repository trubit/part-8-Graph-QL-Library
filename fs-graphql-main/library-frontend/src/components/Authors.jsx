import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const Authors = ({ show }) => {
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
  const submit = async (event) => {
    event.preventDefault();

    if (!name || !born) return;

    await editAuthor({
      variables: {
        name,
        setBornTo: parseInt(born),
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
          {result.data?.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <label>name</label>
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          <label>born</label>
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};

export default Authors;
