import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "styled-components";
import { useLocalStorage } from "../utils/localStorage";

export const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { day, year } = router.query as {
    day: string | undefined;
    year: string | undefined;
  };

  const [cookie, setCookie] = useLocalStorage("aocCookie", "");

  return (
    <div className="navbar bg-base-100 px-4">
      <div className="navbar-start">
        <Link
          className="btn-ghost btn text-2xl font-bold normal-case"
          href="/"
          style={{
            color: "#00ff00",
            textShadow: "0 0 4px #00cc00",
          }}
        >
          hAOC
        </Link>
      </div>
      {year && day && <ProgressDisplay year={year} day={day} />}
      <div className="navbar-end">
        <div className="dropdown-end dropdown">
          {session?.user && (
            <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
              <Image
                className="rounded-full"
                src={session.user.image ?? ""}
                alt="avatar"
                layout="fill"
              />
            </label>
          )}
          <ul
            tabIndex={0}
            className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-200 p-2 shadow"
          >
            <li>
              <input
                type="text"
                className="input input-sm w-full"
                placeholder="Your AoC cookie"
                value={cookie}
                onChange={(e) => setCookie(e.target.value)}
              />
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a onClick={() => signOut()}>Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const ProgressDisplay = ({ year, day }: { year: string; day: string }) => {
  const [cookie] = useLocalStorage("aocCookie", "");

  const {
    data: problemInfo,
    isLoading,
    isError,
  } = trpc.aoc.text.useQuery({ day, year, cookie: cookie });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <div className="navbar-center relative">
      <>
        <a className="text-xl normal-case">
          {year} Day {day}
        </a>
        <div className="mt-2.5 ml-2">
          {new Array(problemInfo.stars).fill(0).map((_, i) => (
            <span
              key={i}
              className="text-4xl text-yellow-200"
              style={{ textShadow: "0 0 4px" }}
            >
              *
            </span>
          ))}
          {new Array(2 - problemInfo.stars).fill(0).map((_, i) => (
            <span key={i} className="text-4xl text-white text-opacity-20">
              *
            </span>
          ))}
        </div>
      </>
      <div className="mx-2 flex flex-row gap-2">
        <Timers year={year} day={day} />
      </div>
    </div>
  );
};

const Timers = ({ day, year }: { day: string; year: string }) => {
  const newDate = useCallback(
    () =>
      new Date(
        new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000
      ),
    []
  );

  const [now, setNow] = useState(newDate());
  const {
    data: timers,
    isLoading,
    isError,
  } = trpc.aoc.timers.useQuery({
    day: day as string,
    year: year as string,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(newDate());
    }, 1000);

    return () => clearInterval(interval);
  }, [newDate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <>
      {timers.map((timer, i) => {
        const stopTime = timer.stopTime ?? now;
        const diff = new Date(stopTime.getTime() - timer.initTime.getTime());

        return <Timer key={i} timer={diff} />;
      })}
    </>
  );
};

const Timer = ({ timer }: { timer: Date }) => {
  return (
    <span className="countdown rounded-xl bg-base-300 p-2 font-mono text-xl">
      <span style={{ "--value": timer.getHours() } as CSSProperties}></span>:
      <span style={{ "--value": timer.getMinutes() } as CSSProperties}></span>:
      <span style={{ "--value": timer.getSeconds() } as CSSProperties}></span>
    </span>
  );
};
