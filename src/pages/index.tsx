import classNames from "classnames";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import { FaCheckCircle, FaGithub } from "react-icons/fa";
import { Layout } from "../components/Layout";
import { useLocalStorage } from "../utils/localStorage";
import type { NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
  const { data: session, status } = useSession();

  const [cookie, setCookie] = useLocalStorage("aocCookie", "");

  const validCookie = (() => {
    if (!cookie || !session) return false;

    // regex 128 hex characters
    const regex = new RegExp("^[0-9a-f]{128}$");
    if (!regex.test(cookie)) return false;

    const unhexlify = Buffer.from(cookie, "hex").toString("utf-8");

    // check if cookie starts with "Salted__"
    return unhexlify.startsWith("Salted__");
  })();

  const now = new Date();

  return (
    <main className="h-full">
      <Head>
        <title>Advent of Code</title>
      </Head>
      <div className="flex h-full w-full flex-col items-center py-2 px-2 pt-40 text-center">
        {/* welcome message for customly scored advent of code */}
        <h1 className="text-6xl font-bold">
          Welcome to
          <br />
          <span
            className="text-green-400"
            style={{ textShadow: "0 0 5px #00ff00" }}
          >
            Advent of Code {validCookie ? "🎉" : "🔒"}
          </span>
        </h1>
        {status === "authenticated" && (
          <>
            <h2 className="mt-8 font-bold">
              You are currently logged in as {session.user?.name}
            </h2>
            <h3 className="mt-16">
              Paste here your adventofcode.com cookie to begin playing
            </h3>
            <label className="input-group max-w-full p-2 lg:w-1/2">
              <input
                className="input-bordered input w-full rounded-lg p-2"
                type="text"
                value={cookie}
                onChange={(e) => setCookie(e.target.value)}
              />
              {validCookie && (
                <span className="border border-success bg-success-content">
                  <FaCheckCircle className="text-success" />
                </span>
              )}
            </label>

            {!validCookie && (
              <p className="mt-2 text-red-500">
                Invalid cookie format, please paste it again
              </p>
            )}
          </>
        )}
        {status === "unauthenticated" && (
          <>
            <h2 className="mt-8 text-2xl">You are not signed in. </h2>
            <button className="btn m-2 gap-2" onClick={() => signIn("github")}>
              <FaGithub size={20} />
              Sign in with GitHub
            </button>
          </>
        )}
        <div
          className={classNames(
            "mt-8 flex flex-wrap gap-2 transition-all duration-1000",
            {
              "cursor-default select-none opacity-0": !validCookie,
              "opacity-100": validCookie,
            }
          )}
        >
          {Array.from(
            { length: now.getFullYear() - 2015 + 1 },
            (_, i) => 2015 + i
          )
            .filter((year) => {
              return year < now.getFullYear() || now.getMonth() === 11;
            })

            .map((year) => (
              <Link
                key={year}
                href={`/${year}`}
                className={classNames("btn-xl btn-primary btn", {
                  "btn-disabled": !validCookie,
                })}
              >
                {year}
              </Link>
            ))}
        </div>
      </div>
    </main>
  );
};

Home.getLayout = (page) => <Layout>{page}</Layout>;

export default Home;
