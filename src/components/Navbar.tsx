import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaBars,
  FaChartBar,
  FaCode,
  FaFileCode,
  FaHamburger,
  FaReadme,
} from "react-icons/fa";
import type { CSSProperties } from "styled-components";
import { useLocalStorage } from "../utils/localStorage";

const CenterButtons = ({ year, day }: { year: string; day: string }) => {
  const router = useRouter();

  return (
    <>
      {router.pathname.startsWith("/[year]/[day]") && year && day && (
        <li className="flex flex-col gap-2 sm:flex-row">
          <button
            disabled={router.pathname === "/[year]/[day]"}
            className="btn-ghost btn flex flex-row sm:btn-circle"
            onClick={() => router.push(`/${year}/${day}/`)}
          >
            <span className="sm:hidden">go to problem</span>
            <FaReadme className="h-6 w-6" />
          </button>

          <button
            disabled={router.pathname.includes("share")}
            className="btn-ghost btn flex flex-row sm:btn-circle"
            onClick={() => router.push(`/${year}/${day}/share`)}
          >
            <span className="sm:hidden">share code</span>
            <FaFileCode className="h-6 w-6" />
          </button>

          <button
            disabled={router.pathname.includes("scoreboard")}
            className="btn-ghost btn flex flex-row sm:btn-circle"
            onClick={() => router.push(`/${year}/${day}/scoreboard`)}
          >
            <span className="sm:hidden">scoreboard</span>
            <FaChartBar className="h-6 w-6" />
          </button>
        </li>
      )}
    </>
  );
};

const HomepageLink = () => {
  return (
    <div className="flex gap-6">
      <Link
        className="text-xl font-bold normal-case"
        href="/"
        style={{
          color: "#00ff00",
          textShadow: "0 0 4px #00cc00",
        }}
      >
        hAOC
      </Link>
      <Link
        className="text-xl font-bold normal-case"
        href="/2022"
        style={{
          color: "#00ff00",
          textShadow: "0 0 4px #00cc00",
        }}
      >
        2022
      </Link>
    </div>
  );
};

export const Navbar = () => {
  const { data: session } = useSession();

  const [cookie, setCookie] = useLocalStorage("aocCookie", "");

  const router = useRouter();
  const { day, year } = router.query as {
    day: string | undefined;
    year: string | undefined;
  };

  return (
    <div className="navbar bg-base-100 px-4">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn-ghost btn sm:hidden">
            <FaBars />
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-200 p-2 shadow"
          >
            <li className="flex flex-row items-center p-2 sm:hidden">
              <HomepageLink /> homepage
            </li>
            {year && day && <CenterButtons year={year} day={day} />}
          </ul>
        </div>
        <div className="hidden sm:inline-block">
          <HomepageLink />
        </div>
      </div>
      <div className="navbar-center relative flex flex-row gap-2 md:flex-row">
        {year && day && (
          <>
            <div className="hidden sm:inline-block">
              <CenterButtons year={year} day={day} />
            </div>
            <ProgressDisplay year={year} day={day} />
          </>
        )}
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
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

  if (isError) return <div>Error</div>;

  return (
    <>
      <div className="flex flex-row items-center">
        <a className="text-xl normal-case">
          {year} Day {day}
        </a>
        {isLoading ? (
          <span className="ml-2">Loading...</span>
        ) : (
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
        )}
      </div>
      {!isLoading && !isError && (
        <div className="mx-2 flex flex-col gap-1 sm:flex-row sm:gap-2">
          <Timers year={year} day={day} />
        </div>
      )}
    </>
  );
};

export const newUTCDate = (date = new Date()) => {
  return new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
};

//TODO: fix timer not visually updating correctly when correct solution is submitted
const Timers = ({ day, year }: { day: string; year: string }) => {
  const [now, setNow] = useState(newUTCDate());
  const {
    data: timers,
    isLoading,
    isError,
  } = trpc.aoc.timers.useQuery(
    { day, year },
    {
      onSuccess: () => setNow(newUTCDate()),
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(newUTCDate());
    }, 1000);

    return () => clearInterval(interval);
  }, [timers]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <>
      {timers.map((timer, i) => {
        const stopTime = timer.stopTime ? newUTCDate(timer.stopTime) : now;
        const diff = Math.max(
          0,
          stopTime.getTime() - newUTCDate(timer.initTime).getTime()
        );

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return (
          <Timer
            key={i}
            days={days}
            hours={hours}
            minutes={minutes}
            seconds={seconds}
          />
        );
      })}
    </>
  );
};

const Timer = ({
  days,
  hours,
  minutes,
  seconds,
}: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) => {
  return (
    <span className="countdown rounded-xl bg-base-300 p-2 font-mono">
      {days > 0 && (
        <>
          <span style={{ "--value": days } as CSSProperties} />:
        </>
      )}
      <span style={{ "--value": hours } as CSSProperties} />:
      <span style={{ "--value": minutes } as CSSProperties} />:
      <span style={{ "--value": seconds } as CSSProperties} />
    </span>
  );
};
