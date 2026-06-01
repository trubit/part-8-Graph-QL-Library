import { useQuery } from "@apollo/client/react";
import { ALL_AUTHORS } from "../queries";

const Authors = ({ show }) => {
  const result = useQuery(ALL_AUTHORS);

  if (!show) {
    return null;
  }

  if (result.loading) {
    return <div>loading authors...</div>;
  }
  if (result.error) {
    return <div>error loading authors</div>;
  }

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
    </div>
  );
};

export default Authors;
