import { useQuery } from "@apollo/client/react";
import { ALL_BOOKS, ME } from "../queries";

const Recommendations = ({ show }) => {
  const userResult = useQuery(ME, { skip: !show });
  const booksResult = useQuery(ALL_BOOKS, { skip: !show });

  if (!show) {
    return null;
  }

  if (userResult.loading || booksResult.loading) {
    return <div>loading recommendations...</div>;
  }

  if (userResult.error || booksResult.error) {
    return <div>error loading recommendations</div>;
  }

  const user = userResult.data?.me;

  if (!user) {
    return <div>please log in to see recommendations</div>;
  }

  const favoriteGenre = user.favoriteGenre;
  const books = booksResult.data?.allBooks || [];
  const recommendedBooks = books.filter((book) =>
    book.genres.includes(favoriteGenre),
  );

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <b>{favoriteGenre}</b>
      </p>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {recommendedBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author?.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommendations;
