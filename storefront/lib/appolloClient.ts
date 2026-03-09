import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getSession } from "next-auth/react";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL+'/graphql',
  fetch,
});

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();

  return {
    headers: {
      ...headers,
      Authorization: session?.accessToken
        ? `Bearer ${session.accessToken}`
        : "",
    },
  };
});

export const createApolloClient = () =>
  new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });