import classNames from "classnames";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Highlight from "react-highlight";
import { FaEdit, FaSave, FaThumbsUp } from "react-icons/fa";
import { toast } from "react-toastify";
import { Layout } from "../../../../components/Layout";
import type { RouterOutputs } from "../../../../utils/trpc";
import { trpc } from "../../../../utils/trpc";
import type { NextPageWithLayout } from "../../../_app";

const SolutionPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { userId, day, year, edit } = router.query as {
    userId: string;
    day: string;
    year: string;
    edit?: string;
  };
  const { data: session, status } = useSession();
  const {
    data: solutions,
    isError,
    isLoading,
  } = trpc.share.get.useQuery({ userId, day, year });

  if (isLoading || status !== "authenticated") {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  const isOwner = session.user?.id === userId;
  const editable = isOwner && edit === "true";

  return (
    <main className="flex h-full w-full flex-col items-center justify-center gap-2 md:flex-row md:items-start">
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="/atom-one-dark.css" />
      <div className="flex h-full w-full flex-grow-0 flex-col gap-2 p-2">
        <h1 className="sticky top-0 z-10 mb-4 rounded-xl bg-base-200 p-2 text-center text-4xl">
          Star 1
        </h1>
        <SolutionComponent
          star={1}
          editable={editable}
          likeable={!isOwner}
          solution={solutions.filter((s) => s.star === 1)[0]}
        />
      </div>
      <div className="flex h-full w-full flex-col gap-2  p-2">
        <h1 className="sticky top-0 z-10 mb-4 rounded-xl bg-base-200 p-2 text-center text-4xl">
          Star 2
        </h1>
        <SolutionComponent
          star={2}
          editable={editable}
          likeable={!isOwner}
          solution={solutions.filter((s) => s.star === 2)[0]}
        />
      </div>
      {isOwner && !editable && (
        <button
          className="btn-primary btn absolute bottom-2 right-2 gap-2"
          onClick={() => {
            router.push(`/${year}/${day}/share/${userId}?edit=true`);
          }}
        >
          edit your solution
          <FaEdit />
        </button>
      )}
    </main>
  );
};

SolutionPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

type SolutionType = RouterOutputs["share"]["get"][0] | undefined;

const SolutionComponent = ({
  solution,
  star,
  editable,
  likeable,
}: {
  solution: SolutionType;
  star: number;
  editable: boolean;
  likeable: boolean;
}) => {
  const { day, year } = useRouter().query as { day: string; year: string };

  const [code, setCode] = useState(solution?.code);
  const [description, setDescription] = useState(solution?.description);

  const publish = trpc.share.publish.useMutation();
  const toggleLike = trpc.share.toggleLike.useMutation();

  const utils = trpc.useContext();

  return (
    <div className="relative flex h-full w-full flex-grow-0 flex-col gap-4 overflow-scroll p-1">
      {editable ? (
        <textarea
          disabled={!editable}
          className="input-bordered input h-full w-full resize-none overflow-x-scroll p-2 font-mono text-lg"
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      ) : (
        <div className="h-full w-full rounded-lg bg-base-200 font-mono text-lg">
          <Highlight className="h-full w-full rounded-lg bg-base-200">
            {code}
          </Highlight>
        </div>
      )}

      {editable ? (
        <textarea
          disabled={!editable}
          className="input-bordered input mb-14 h-36 resize-none p-2"
          onChange={(e) => setDescription(e.target.value)}
          value={description ?? ""}
          placeholder="Description"
        />
      ) : (
        <div className="input-bordered h-48 w-full rounded-lg bg-base-200 p-2">
          {description}
        </div>
      )}

      {editable && (
        <button
          className="btn-primary btn absolute bottom-1 right-1 gap-4"
          onClick={() => {
            if (!code) return;

            publish
              .mutateAsync({
                code: code,
                description: description ?? undefined,
                day,
                year,
                star: star.toString(),
              })
              .then(() => {
                toast.success("Published!");
              });
          }}
        >
          save solution
          <FaSave />
        </button>
      )}
      {likeable && (
        <button
          className={classNames(
            "btn-circle btn absolute bottom-2 right-2 gap-4 shadow-xl",
            {
              "btn-accent": solution?.liked,
            }
          )}
          onClick={() => {
            if (!solution) return;
            console.log(solution);
            toggleLike.mutateAsync({ id: solution.id }).then(() => {
              utils.share.get.invalidate({
                userId: solution.userId,
                day,
                year,
              });
            });
          }}
        >
          <FaThumbsUp />
        </button>
      )}
    </div>
  );
};

export default SolutionPage;
