import { Navigate, useSearchParams } from 'react-router-dom';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const suffix = searchParams.toString();
  return <Navigate to={suffix ? `/search?${suffix}` : '/search'} replace />;
};

export default SearchResults;
