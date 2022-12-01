import type { User } from "@prisma/client";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Layout } from "../../../components/Layout";
import { trpc } from "../../../utils/trpc";
import type { NextPageWithLayout } from "../../_app";

const ScoreboardDay: NextPageWithLayout = () => {
  const { day, year } = useRouter().query as {
    day: string;
    year: string;
  };

  const {
    data: timers,
    isError,
    isLoading,
  } = trpc.scoring.leaderboard.useQuery({ day, year });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <main className="flex w-full flex-col items-center justify-center gap-16 md:flex-row md:items-start">
      <div className="flex flex-col gap-2 p-2">
        <h1 className="sticky top-0 z-10 mb-4 rounded-xl bg-base-200 p-2 text-center text-4xl">
          Star 1
        </h1>
        {timers
          .filter((timer) => timer.star === 1)
          .sort((a, b) => a.duration - b.duration)
          .map((timer, i) => {
            return <TimeCard key={timer.userId} timer={timer} rank={i} />;
          })}
      </div>
      <div className="flex flex-col gap-2 p-2">
        <h1 className="sticky top-0 z-10 mb-4 rounded-xl bg-base-200 p-2 text-center text-4xl">
          Star 2
        </h1>
        {timers
          .filter((timer) => timer.star === 2)
          .sort((a, b) => a.duration - b.duration)
          .map((timer, i) => {
            return <TimeCard key={timer.userId} timer={timer} rank={i} />;
          })}
      </div>
    </main>
  );
};

ScoreboardDay.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

const TimeCard = ({
  timer,
  rank,
}: {
  timer: {
    initTime: Date;
    stopTime: Date | null;
    userId: string;
    day: number;
    year: number;
    star: number;
    user: User;
    duration: number;
  };
  rank: number;
}) => {
  const seconds = Math.floor(timer.duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return (
    <div className="flex h-fit w-96 flex-row items-center gap-4 rounded-xl bg-base-300 p-2 pl-4 shadow-xl">
      <label
        tabIndex={0}
        className="btn-ghost btn-circle avatar btn aspect-square"
      >
        <Image
          className={classNames("rounded-full", {
            "ring-2 ring-gold": rank === 0,
            "ring-2 ring-silver": rank === 1,
            "ring-2 ring-bronze": rank === 2,
          })}
          src={timer.user.image ?? ""}
          alt={timer.user.name ?? ""}
          layout="fill"
        />
      </label>
      <div>
        <p className="text-xl text-base-content">{timer.user.name}</p>
        <pre
          style={{ textShadow: rank < 3 ? "0 0 4px" : "none" }}
          className={classNames("mt-2 w-fit", {
            "text-gold": rank === 0,
            "text-silver": rank === 1,
            "text-bronze": rank === 2,
          })}
        >
          {hours}h {minutes % 60}m {seconds % 60}s
        </pre>
      </div>
    </div>
  );
};

export default ScoreboardDay;
