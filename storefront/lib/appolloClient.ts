import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getSession } from "next-auth/react";

const httpLink = new HttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  fetch,
});

// Accept an optional accessToken so server-side callers can pass a token directly.
// Avoid calling `getSession()` on the server to prevent internal HTTP calls
// to `/api/auth/session` which can return HTML and cause JSON parse errors.
export const createApolloClient = (opts?: { accessToken?: string }) => {
  const authLink = setContext(async (_, { headers }) => {
    // If an explicit token is provided, use it.
    if (opts?.accessToken) {
      return {
        headers: {
          ...headers,
          Authorization: `Bearer ${opts.accessToken}`,
        },
      };
    }

    // In server environments, avoid calling getSession() which performs
    // an HTTP fetch to the NextAuth session endpoint.
    if (typeof window === "undefined") {
      return { headers: { ...headers } };
    }

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

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
};