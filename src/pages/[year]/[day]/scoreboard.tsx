import type { User } from "@prisma/client";
import classNames from "classnames";
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
    <main className="flex w-full justify-center gap-16">
      <div className="flex flex-col gap-2 p-2">
        <h1 className="mb-4 text-center text-4xl">Star 1</h1>
        {timers
          .filter((timer) => timer.star === 1)
          .sort((a, b) => a.duration - b.duration)
          .map((timer, i) => {
            return <TimeCard key={timer.userId} timer={timer} rank={i} />;
          })}
      </div>
      <div className="flex flex-col gap-2 p-2">
        <h1 className="mb-4 text-center text-4xl">Star 2</h1>
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
          className="rounded-full"
          src={timer.user.image ?? ""}
          alt={timer.user.name ?? ""}
          layout="fill"
        />
      </label>
      <div>
        <p className="text-xl text-base-content">{timer.user.name}</p>
        <pre
          className="mt-2 w-fit"
          style={{
            color:
              rank === 0
                ? "gold"
                : rank === 1
                ? "silver"
                : rank === 2
                ? "brown"
                : "gray",
            textShadow:
              rank === 0
                ? "0 0 4px gold"
                : rank === 1
                ? "0 0 4px silver"
                : rank === 2
                ? "0 0 4px brown"
                : "none",
          }}
        >
          {hours}h {minutes % 60}m {seconds % 60}s
        </pre>
      </div>
    </div>
  );
};

export default ScoreboardDay;
