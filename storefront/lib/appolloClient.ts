import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from "@apollo/client";

const httpLink = new HttpLink({
  uri: `/api/graphql`,
  credentials: "include", // sends cookies with every request
  fetch,
});

export const createApolloClient = () => {
  return new ApolloClient({
    link: from([httpLink]),
    cache: new InMemoryCache(),
  });
};