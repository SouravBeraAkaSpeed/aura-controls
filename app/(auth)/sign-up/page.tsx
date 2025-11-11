"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClientSafeProvider,
  getProviders,
  LiteralUnion,
} from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/input";
import { BuiltInProviderType } from "next-auth/providers/index";
import { signUp } from "next-auth-sanity/client";
import { toast } from "@/components/ui/use-toast";
import { Session } from "next-auth";
import { useGoogleLogin } from "@react-oauth/google";
import { client } from "@/lib/sanity_client";
import Loader2 from "@/components/Loader2";
import LetterGlitch from "@/components/LetterGlitch";

const SignUp = () => {
  const [isEmbbeded, setIsEmbbeded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastname] = useState("");
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleLogin, setShowGoogleLogin] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const token = localStorage.getItem("sessionToken");
      if (token) {
        const sessionRes = await fetch(`/api/auth/getSession?token=${token}`);
        const data = await sessionRes.json();
        if (data.user) {
          setSession({
            user: data.user,
            expires: data.expires,
          });
        }
      }
    };
    getSession();
  }, []);

  useEffect(() => {
    const isEmbed = searchParams.get('isEmbedded');
    if (isEmbed && isEmbed === "true") {
      setShowGoogleLogin(false);
      setIsEmbbeded(true);
    } else {
      setShowGoogleLogin(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (session) {
      const redirect_url = searchParams.get("redirect_url");
      if (redirect_url) {
        router.push(redirect_url);
      } else {
        router.push("/");
      }
    }
  }, [session, router, searchParams]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );

        const userInfo = await userInfoResponse.json();
        const { email, name, sub: googleId } = userInfo;

        if (!email || !googleId) {
          throw new Error("Could not retrieve user information from Google.");
        }

        const query = `*[_type == "user" && email == "${email}"]`;
        const users = await client.fetch(query);

        if (users.length > 0) {
          toast({
            title: "User already exists",
            description: "Please sign in instead.",
            variant: "destructive",
            duration: 2000,
          });
          return;
        }

        await signUp({
          email: email,
          password: googleId,
          name: name,
          role: "user",
        });

        const response = await fetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: email, isoauth: true }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem("sessionToken", data.token);
          toast({
            title: "Signed Up & In!",
            description: "Welcome to ScribIQ!",
            variant: "default",
            duration: 2000,
          });
          const redirect_url = searchParams.get("redirect_url");
          if (redirect_url) {
            router.push(redirect_url);
          } else {
            router.push("/");
          }
        } else {
          throw new Error(data.error || "Sign in failed after Google sign up.");
        }
      } catch (error: any) {
        console.error("Error during Google sign-up:", error);
        toast({
          title: "Google Sign-Up Error",
          description: error.message || "An unknown error occurred.",
          variant: "destructive",
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      toast({
        title: "Google Sign-Up Error",
        description: "Sign-up failed. Please try again.",
        variant: "destructive",
        duration: 2000,
      });
    },
  });

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const query = `*[_type == "user" && email == "${email.toLowerCase()}"]`;
      const existingUsers = await client.fetch(query);

      if (existingUsers.length > 0) {
        toast({
          title: "User already exists",
          description: "Please sign in or use a different email address.",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }

      await signUp({
        email: email.toLowerCase(),
        password,
        name: `${firstname} ${lastname}`,
        role: "user",
      });

      toast({
        title: "Sign Up Successful!",
        description: "Now logging you in...",
        variant: "default",
        duration: 2000,
      });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.toLowerCase(), password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("sessionToken", data.token);
        const redirect_url = searchParams.get("redirect_url");
        if (redirect_url) {
          router.push(redirect_url);
        } else {
          router.push("/");
        }
      } else {
        throw new Error(data.error || "Login failed after sign up.");
      }
    } catch (error: any) {
      console.error("Error during sign-up:", error);
      toast({
        title: "Sign-Up Failed",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-black">
      <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-20 h-full w-full bg-black [mask-image:radial-gradient(transparent,white)]" />

      <div className="z-50 my-2 flex h-[200px] max-w-md flex-col items-center justify-center text-center">
        <h2 className="text-left text-2xl font-bold">Welcome To Aura Controls</h2>
        <h4 className="text-md my-2 text-left">
           The Future is in Your Hands.
        </h4>
      </div>
      <div className="z-50 flex h-fit w-[90%] flex-col items-center justify-center rounded-[14px] bg-transparent md:w-[32%]">
        <form onSubmit={handleSignUp} className="w-full p-6">
          <div className="my-4 flex space-x-2">
            <div className="w-1/2">
              <Label className="my-2 font-bold">First name</Label>
              <Input
                type="text"
                placeholder="Taylor"
                value={firstname}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>
            <div className="w-1/2">
              <Label className="my-2 font-bold">Last name</Label>
              <Input
                type="text"
                placeholder="Durden"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>
          <div className="my-4">
            <Label className="my-2 font-bold">Email</Label>
            <Input
              type="email"
              placeholder="projectweb@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div className="my-4">
            <Label className="my-2 font-bold">Password</Label>
            <Input
              type="password"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          {isLoading && (
            <div className="fixed inset-0 z-100 m-auto flex h-full w-full flex-1 flex-col items-center justify-center bg-white text-white">
              <Loader2 /> Loading
            </div>
          )}
          <button
            className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
          >
            Sign up &rarr;
            <BottomGradient />
          </button>
          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
          <button
            type="button"
            onClick={() => router.push(`/sign-in/?isEmbedded=${isEmbbeded}&redirect_url=https://aura-controls.toil-labs.com`)}
            className="w-full rounded-[15px] border-2 border-purple-600 py-2 text-white hover:bg-purple-800"
          >
            Sign In
            <BottomGradient />
          </button>

          {showGoogleLogin && (
            <button
              type="button"
              onClick={() => googleLogin()}
              className="my-4 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-white text-black transition-colors hover:bg-gray-200"
            >
              <svg
                className="h-6 w-6"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-69.2 69.2c-24.3-23.4-58.4-38.1-98.8-38.1-84.3 0-152.3 68.1-152.3 152.3s68 152.3 152.3 152.3c99.2 0 129.2-76.3 133.8-116.2H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              <span className="text-sm font-medium">Sign up with Google</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default SignUp;

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};