import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FaComment, FaPlus, FaStar, FaThumbsUp } from "react-icons/fa";
import { Layout } from "../../../components/Layout";
import type { RouterOutputs } from "../../../utils/trpc";
import { trpc } from "../../../utils/trpc";
import type { NextPageWithLayout } from "../../_app";

const CodeShareDayPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { day, year } = router.query as {
    day: string;
    year: string;
  };

  const {
    data: solutions,
    isError,
    isLoading,
  } = trpc.share.list.useQuery({ day, year });

  if (isLoading || status !== "authenticated") {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <main className="flex h-full w-full flex-col items-center justify-center gap-16">
      <h1 className="rounded-xl bg-base-200 p-2 text-center text-4xl">
        Star 1
      </h1>
      <div className="flex flex-wrap gap-2 p-2">
        {solutions
          .filter((s) => s.star === 1)
          .map((s) => (
            <CodeShareCard key={s.id} solution={s} />
          ))}
        {solutions.filter((s) => s.star === 1).length === 0 && (
          <div className="flex items-center justify-center gap-2 p-2">
            <h1 className="text-2xl">No solutions yet!</h1>
            <button
              className="btn-primary btn"
              onClick={() =>
                router.push(
                  `/${year}/${day}/share/${session.user?.id}?edit=true`
                )
              }
            >
              <FaPlus className="mr-2 inline-block" />
              Add your solution
            </button>
          </div>
        )}
      </div>
      <h1 className="rounded-xl bg-base-200 p-2 text-center text-4xl">
        Star 2
      </h1>
      <div className="flex flex-wrap gap-2 p-2">
        {solutions
          .filter((s) => s.star === 2)
          .map((s) => (
            <CodeShareCard key={s.id} solution={s} />
          ))}
        {solutions.filter((s) => s.star === 2).length === 0 && (
          <div className="flex items-center justify-center gap-2 p-2">
            <h1 className="text-2xl">No solutions yet!</h1>
            <button
              className="btn-primary btn"
              onClick={() =>
                router.push(
                  `/${year}/${day}/share/${session.user?.id}?edit=true`
                )
              }
            >
              <FaPlus className="mr-2 inline-block" />
              Add your solution
            </button>
          </div>
        )}
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          className="btn-primary btn gap-2"
          onClick={() => {
            router.push(
              `/${year}/${day}/share/${session.user?.id}?star=1&edit=true`
            );
          }}
        >
          star 1
          <FaPlus />
        </button>
        <button
          className="btn-primary btn gap-2"
          onClick={() => {
            router.push(
              `/${year}/${day}/share/${session.user?.id}?star=2&edit=true`
            );
          }}
        >
          star 2
          <FaPlus />
        </button>
      </div>
    </main>
  );
};

CodeShareDayPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

type SolutionType = RouterOutputs["share"]["list"][0];

const CodeShareCard = ({ solution }: { solution: SolutionType }) => {
  const router = useRouter();

  return (
    <div
      className="flex w-48 cursor-pointer flex-col gap-2 rounded-xl bg-base-300 p-2 shadow-xl transition-all hover:scale-105"
      onClick={() => {
        router.push(
          `/${solution.year}/${solution.day}/share/${solution.user.id}?star=${solution.star}`
        );
      }}
    >
      <div className="flex items-start gap-4 pr-2">
        <div className="avatar h-10 w-10 flex-shrink-0">
          <Image
            className="rounded-full"
            src={solution.user.image ?? ""}
            alt={solution.user.id}
            layout="fill"
          />
        </div>
        <h2 className="pb-4 text-2xl leading-6">{solution.user.name}</h2>
      </div>
      <div className="mt-auto flex items-center gap-6">
        <span className="mr-auto flex items-center gap-2">
          <FaStar className="text-gold" /> {solution.star}
        </span>
        <span className="flex items-center gap-2">
          <FaThumbsUp /> {solution.likes}
        </span>
        <span className="flex items-center gap-2">
          <FaComment /> {solution.comments}
        </span>
      </div>
    </div>
  );
};

export default CodeShareDayPage;
