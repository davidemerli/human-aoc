import { useRouter } from "next/router";
import { Layout } from "../components/Layout";
import type { NextPageWithLayout } from "./_app";

const YearPage: NextPageWithLayout = () => {
  const { year } = useRouter().query as { year: string };

  return (
    <main className="flex h-full flex-col items-center justify-center overflow-scroll">
      {/* all days buttons */}
      <div className="flex max-w-md flex-col items-center justify-center gap-4">
        <div className="flex flex-row gap-2">
          <a href={`/${year}/1`} className="btn-primary btn">
            1
          </a>
        </div>
        <div className="flex flex-row gap-2">
          {[2, 3, 4].map((day) => (
            <a key={day} href={`/${year}/${day}`} className="btn-primary btn">
              {day}
            </a>
          ))}
        </div>
        <div className="flex flex-row gap-2">
          {[5, 6, 7, 8, 9].map((day) => (
            <a key={day} href={`/${year}/${day}`} className="btn-primary btn">
              {day}
            </a>
          ))}
        </div>
        <div className="flex flex-row gap-2">
          {[10, 11, 12, 13, 14, 15, 16].map((day) => (
            <a key={day} href={`/${year}/${day}`} className="btn-primary btn">
              {day}
            </a>
          ))}
        </div>
        <div className="flex flex-row gap-2">
          {[17, 18, 19, 20, 21, 22, 23, 24].map((day) => (
            <a key={day} href={`/${year}/${day}`} className="btn-primary btn">
              {day}
            </a>
          ))}
        </div>
        <a href={`/${year}/25`} className="btn-primary btn">
          25
        </a>
      </div>
      <a href={`/${year}/scoreboard`} className="btn-primary btn m-4">
        Leaderboard
      </a>
    </main>
  );
};

YearPage.getLayout = (page) => <Layout>{page}</Layout>;

export default YearPage;
