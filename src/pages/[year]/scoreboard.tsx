import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaStar } from "react-icons/fa";
import { Layout } from "../../components/Layout";
import { trpc } from "../../utils/trpc";
import type { NextPageWithLayout } from "../_app";

const GlobalScoreboard: NextPageWithLayout = () => {
  const { year } = useRouter().query as { year: string };

  const {
    data: globalScoreboard,
    isLoading,
    isError,
  } = trpc.scoring.globalLeaderboard.useQuery({ year });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
      <table className="table-zebra table-compact table w-1/2">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
            <th>Stars</th>
          </tr>
        </thead>
        <tbody>
          {globalScoreboard.map((user, index) => (
            <tr key={user.id}>
              <td>
                <span className="flex justify-center text-lg">{index + 1}</span>
              </td>
              <td className="flex items-center gap-4">
                <div className="avatar h-8 w-8">
                  <Image
                    src={user.image ?? ""}
                    alt={user.name ?? ""}
                    layout="fill"
                    className="rounded-full"
                  />
                </div>
                <span
                  className={classNames("text-lg", {
                    "text-gold": index === 0,
                    "text-silver": index === 1,
                    "text-bronze": index === 2,
                  })}
                  style={{
                    textShadow: index < 3 ? "0 0 2px" : "none",
                  }}
                >
                  {user.name}
                </span>
              </td>
              <td
                className={classNames("text-2xl font-bold", {
                  "text-gold": index === 0,
                  "text-silver": index === 1,
                  "text-bronze": index === 2,
                })}
                style={{
                  textShadow: index < 3 ? "0 0 2px" : "none",
                }}
              >
                {user.score}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{user.stars}</span>
                  <FaStar className="h-4 w-4 text-yellow-200" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

GlobalScoreboard.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default GlobalScoreboard;