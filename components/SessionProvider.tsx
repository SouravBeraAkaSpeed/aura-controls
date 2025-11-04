"use client";
import { ReactNode, useEffect, useState } from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { Session } from "next-auth";

interface SessionProviderProps {
  children: ReactNode;
}

const SessionProvider = ({ children }: SessionProviderProps) => {
  return <NextAuthSessionProvider >{children}</NextAuthSessionProvider>;
};

export default SessionProvider;
