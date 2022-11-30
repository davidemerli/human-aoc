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
    <div>
      <h1>Scoreboard Day</h1>
      <p>Year: {year}</p>
      <p>Day: {day} </p>
      <pre>{JSON.stringify(timers, null, 2)}</pre>
      {/* {timers.map((timer, i) => {
        return <div key={i}>{<pre>{JSON.stringify(timer)}</pre>}</div>;
      })} */}
    </div>
  );
};

ScoreboardDay.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default ScoreboardDay;
