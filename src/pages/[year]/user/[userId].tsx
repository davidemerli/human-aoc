import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaChevronRight, FaStar } from "react-icons/fa";
import { AocInput } from "../../../components/AocInput";
import { AocText } from "../../../components/AocText";
import { Layout } from "../../../components/Layout";
import { useLocalStorage } from "../../../utils/localStorage";
import useMediaQuery from "../../../utils/mediaQuery";
import { trpc } from "../../../utils/trpc";
import type { NextPageWithLayout } from "../../_app";

type Tabs = "input" | "text";

const getDiffString = (date1: Date, date2: Date) => {
  const diff = date1.getTime() - date2.getTime();
  const diffInSeconds = Math.floor(diff / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0)
    return `${diffInDays}d ${diffInHours % 24}h ${diffInMinutes % 60}m ${
      diffInSeconds % 60
    }s`;
  if (diffInHours > 0)
    return `${diffInHours}h ${diffInMinutes % 60}m ${diffInSeconds % 60}s`;
  if (diffInMinutes > 0) return `${diffInMinutes}m ${diffInSeconds % 60}s`;
  if (diffInSeconds > 0) return `${diffInSeconds}s`;
};

const Home: NextPageWithLayout = () => {
  const router = useRouter();
  const { userId, year } = router.query as { userId: string; year: string };

  const {
    data: user,
    isLoading: isLoadingUser,
    isError: isErrorUser,
  } = trpc.scoring.userInfo.useQuery({ userId, year });

  const {
    data: leaderboard,
    isLoading: isLoadingLeaderboard,
    isError: isErrorLeaderboard,
  } = trpc.scoring.globalLeaderboard.useQuery({ year });

  if (isLoadingUser || isLoadingLeaderboard) return <div>Loading...</div>;

  if (isErrorUser || isErrorLeaderboard) return <div>Error</div>;

  return (
    <main className="relative flex h-full w-full flex-col items-center overflow-y-scroll">
      <div className="flex items-center gap-4 p-4">
        <div className="avatar h-12 w-12">
          <Image
            className="rounded-full"
            src={user.image ?? ""}
            alt={user.name ?? ""}
            layout="fill"
          />
        </div>
        <p>
          {/* put a small dot character name and score in between */}
          <span className="text-3xl font-bold">
            {user.name} ·{" "}
            {leaderboard.find((u) => u.id === user.id)?.score ?? 0} pt
          </span>
        </p>
        <div className="flex gap-2 text-4xl font-light">
          {leaderboard
            .find((u) => u.id === user.id)
            ?.medals.map((medal, i) => (
              <p
                className="flex flex-col items-center justify-center gap-1"
                key={i}
              >
                {i === 0 && <span>🥇</span>}
                {i === 1 && <span>🥈</span>}
                {i === 2 && <span>🥉</span>}
                <span>{medal}</span>
              </p>
            ))}
        </div>
      </div>
      <table className="table-zebra table table-auto">
        <thead>
          <tr>
            <th>Day</th>
            <th className="flex items-center gap-2">
              Star <FaStar />
            </th>
            <th>Start</th>
            <th>End</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {user.timers.map((timer) => (
            <tr key={timer.day} className="table-row">
              <td className="text-center font-bold">{timer.day}</td>
              <td className="text-center font-bold">{timer.star}</td>
              <td className="text-center">{timer.initTime.toLocaleString()}</td>
              <td className="text-center">
                {timer.stopTime!.toLocaleString()}
              </td>
              <td className="text-center text-lg font-bold">
                {getDiffString(timer.stopTime!, timer.initTime)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

Home.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default Home;
