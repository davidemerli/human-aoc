import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAoCData } from "../utils/aocData";
import { useLocalStorage } from "../utils/localStorage";
import { trpc } from "../utils/trpc";

import { subSeconds, format } from "date-fns";
import { useState } from "react";
import { date } from "zod";

export const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { day, year } = router.query;

  const [aocCookie, setAocCookie] = useLocalStorage("aocCookie", "");
  const { puzzleAnswers } = useAoCData(Number(day), Number(year));

  const [timer, setTimer] = useState<Date | null>(null);

  const timers = trpc.example.getTimers.useQuery(
    {
      day: Number(day),
      year: Number(year),
    },
    {
      onSuccess: (data) => {
        if (data) {
          const currentTimer = data.find((timer) => timer.stopTime === null);

          if (!currentTimer) return;

          // set recurring timer of 1 second
          const timer = setInterval(() => {
            // diff between now and currentTimer.initTime
            setTimer(new Date(Date.now() - currentTimer.initTime.getTime()));
          }, 1000);

          // clear timer when component unmounts
          return () => clearInterval(timer);
        }
      },
    }
  );

  return (
    <div className="navbar bg-base-100 px-4">
      <div className="navbar-start">
        <div
          className="text-2xl"
          style={{
            color: "#00cc00",
            textShadow: "0 0 6px #00cc00",
          }}
        >
          hAOC
        </div>
      </div>
      <div className="navbar-center relative">
        {year && day && (
          <>
            <a className="text-xl normal-case">
              {year} Day {day}
            </a>
            <div className="mt-2.5 ml-2">
              {new Array(puzzleAnswers.length).fill(0).map((_, i) => (
                <span
                  key={i}
                  className="text-4xl text-yellow-200"
                  style={{ textShadow: "0 0 4px" }}
                >
                  *
                </span>
              ))}
              {new Array(2 - puzzleAnswers.length).fill(0).map((_, i) => (
                <span key={i} className="text-4xl text-white text-opacity-20">
                  *
                </span>
              ))}
            </div>
          </>
        )}
        <div className="mx-2 flex flex-row gap-2">
          {timers.data
            ?.filter((t) => t.stopTime !== null)
            .map((timer, i) => (
              <Timer
                key={i}
                timer={
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  new Date(timer.stopTime!.getTime() - timer.initTime.getTime())
                }
              />
            ))}
          {timer && <Timer timer={timer} />}
        </div>
      </div>
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
                value={aocCookie}
                onChange={(e) => setAocCookie(e.target.value)}
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

const Timer = ({ timer }: { timer: Date }) => {
  return (
    <span className="countdown rounded-xl bg-base-300 p-2 font-mono text-xl">
      <span style={{ "--value": timer.getHours() }}></span>:
      <span style={{ "--value": timer.getMinutes() }}></span>:
      <span style={{ "--value": timer.getSeconds() }}></span>
    </span>
  );
};
