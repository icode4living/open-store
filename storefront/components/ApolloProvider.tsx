"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { createApolloClient } from "@/lib/appolloClient";
import { SessionProvider } from "next-auth/react";
export default function ApolloWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const clientRef = useRef(createApolloClient());

  /*useEffect(() => {
    // When user logs in/out → reset cache
    if (status === "authenticated" || status === "unauthenticated") {
      clientRef.current.clearStore();
    }
  }, [session?.accessToken, status]);
*/
  return (
    <ApolloProvider client={clientRef.current}>
      
      {children}
    </ApolloProvider>

  );
}
