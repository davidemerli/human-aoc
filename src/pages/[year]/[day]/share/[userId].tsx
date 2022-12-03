import classNames from "classnames";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { FaEdit, FaSave, FaThumbsUp, FaTimes } from "react-icons/fa";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { toast } from "react-toastify";
import { Layout } from "../../../../components/Layout";
import type { RouterOutputs } from "../../../../utils/trpc";
import { trpc } from "../../../../utils/trpc";
import type { NextPageWithLayout } from "../../../_app";

const SolutionPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { userId, day, year, edit, star } = router.query as {
    userId: string;
    day: string;
    year: string;
    star: string;
    edit?: string;
  };

  const { data: session, status } = useSession();
  const {
    data: solution,
    isError,
    isLoading,
  } = trpc.share.get.useQuery({ userId, day, year, star });

  if (isLoading || status !== "authenticated") {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error</div>;
  }

  const isOwner = session.user?.id === userId;
  const editable = isOwner && edit === "true";

  return (
    <main className="flex h-full w-full flex-col items-center justify-center gap-2 p-2 md:items-start">
      <h2 className="ml-1 text-center text-2xl">
        {solution.user.name} solution for{" "}
        <span className="text-yellow-200" style={{ textShadow: "0 0 4px" }}>
          star {star}
        </span>{" "}
        on day {day.padStart(2, "0")}, {year}
      </h2>
      <div className="relative flex w-full flex-grow flex-col overflow-scroll">
        <SolutionComponent
          key={star}
          editable={editable}
          solution={solution}
          isOwner={isOwner}
        />
      </div>
    </main>
  );
};

SolutionPage.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

type SolutionType = RouterOutputs["share"]["get"];

const SolutionComponent = ({
  solution,
  editable,
  isOwner,
}: {
  solution: SolutionType;
  editable: boolean;
  isOwner: boolean;
}) => {
  const [code, setCode] = useState(solution.code);
  const [description, setDescription] = useState(solution?.description);
  const router = useRouter();

  const publish = trpc.share.publish.useMutation();

  const toggleLike = trpc.share.toggleLike.useMutation();
  const utils = trpc.useContext();

  const commentsWrapper = useRef<HTMLDivElement>(null);

  const likeButton = (
    <button
      className={classNames(
        "btn-sm btn-circle btn absolute top-0 right-2 shadow-xl",
        {
          "btn-accent": solution.liked,
        }
      )}
      onClick={() => {
        toggleLike.mutateAsync({ id: solution.id }).then(() => {
          utils.share.get.invalidate({
            userId: solution.userId,
            star: solution.star.toString(),
            day: solution.day.toString(),
            year: solution.year.toString(),
          });
        });
      }}
    >
      <FaThumbsUp />
    </button>
  );

  return (
    <div className="relative flex h-full w-full flex-col gap-2 lg:flex-row">
      <div className="w-full rounded-xl bg-base-300 lg:w-7/12 lg:overflow-scroll">
        {editable ? (
          <textarea
            disabled={!editable}
            spellCheck={false}
            className="input-bordered input h-full w-full resize-none p-0 font-mono text-lg"
            placeholder="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        ) : (
          <SyntaxHighlighter
            showLineNumbers
            customStyle={{ backgroundColor: "transparent" }}
            style={atomOneDark}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>

      <div className="relative flex w-full flex-grow flex-col gap-2 p-2 lg:w-5/12">
        <h2 className="mb-2 w-fit text-xl">Description</h2>

        <div className="input-bordered h-48 w-full overflow-y-scroll break-all rounded-lg bg-base-200 p-2">
          {editable ? (
            <textarea
              disabled={!editable}
              className="input-bordered input h-full w-full resize-none"
              onChange={(e) => setDescription(e.target.value)}
              value={description ?? ""}
              placeholder="Description"
            />
          ) : (
            description ?? "No description"
          )}
          {!isOwner && likeButton}
          {isOwner && !editable && (
            <button
              className="btn-primary btn-sm btn absolute top-0 right-4 gap-2"
              onClick={() => {
                router.push(`${window.location.href}&edit=true`);
              }}
            >
              edit
              <FaEdit />
            </button>
          )}

          {editable && (
            <button
              className="btn-primary btn-sm btn absolute top-0 right-4 gap-2"
              onClick={() => {
                if (!code) return;

                publish
                  .mutateAsync({
                    code: code,
                    description: description ?? undefined,
                    day: solution.day.toString(),
                    year: solution.year.toString(),
                    star: solution.star.toString(),
                  })
                  .then(() => {
                    toast.success("Published!");
                    router.push(
                      `/${solution.year}/${solution.day}/share/${solution.userId}?star=${solution.star}`
                    );
                  });
              }}
            >
              save solution
              <FaSave />
            </button>
          )}
        </div>

        <div
          ref={commentsWrapper}
          className="flex flex-grow flex-col overflow-y-scroll rounded-xl"
        >
          {solution.comments.length === 0 && (
            <h2 className="text-xl">No comments</h2>
          )}
          {solution.comments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))}
        </div>
        <CommentForm
          solution={solution}
          onComment={() => {
            //scroll to bottom
            commentsWrapper.current?.scrollTo({
              top: commentsWrapper.current.scrollHeight,
              behavior: "smooth",
            });
          }}
        />
      </div>
    </div>
  );
};

type CommentType = RouterOutputs["share"]["get"]["comments"][0];

const CommentComponent = ({ comment }: { comment: CommentType }) => {
  const { data: session, status } = useSession();
  const deleteComment = trpc.share.comment.delete.useMutation();
  const utils = trpc.useContext();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="group relative mb-2 flex flex-col gap-1 rounded-xl bg-base-200 px-3 pb-3">
      <div className="flex flex-row items-center gap-2">
        <div className="avatar mt-2 h-8 w-8">
          <Image
            className="rounded-full"
            src={comment.user.image ?? ""}
            alt="avatar"
            layout="fill"
          />
        </div>
        <div className="flex flex-col">
          <span className="pt-1 text-sm font-light text-gray-600">
            {comment.createdAt.toLocaleString()}
          </span>
          <span className="text-sm font-bold">{comment.user.name}</span>
        </div>
      </div>
      <span className="text-sm">{comment.content}</span>
      {session.user?.id === comment.user.id && (
        <button
          className="btn-ghost btn-sm btn-circle btn absolute top-0 right-0 hidden group-hover:flex"
          onClick={() => {
            deleteComment.mutateAsync({ commentId: comment.id });
            utils.share.get.setData((data) => {
              if (!data) return data;

              return {
                ...data,
                comments: data.comments.filter(
                  (comment) => comment.id !== comment.id
                ),
              };
            });
          }}
        >
          <FaTimes />
        </button>
      )}
    </div>
  );
};

export default SolutionPage;

const CommentForm = ({
  solution,
  onComment,
}: {
  solution: SolutionType;
  onComment: () => void;
}) => {
  const [comment, setComment] = useState("");
  const addComment = trpc.share.comment.add.useMutation();
  const utils = trpc.useContext();

  return (
    <form className="form-control w-full gap-2">
      <div className="input-group w-full">
        <input
          className="input-bordered input flex-grow"
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className="btn"
          onClick={(e) => {
            e.preventDefault();
            addComment
              .mutateAsync({ codeSolutionId: solution.id, comment })
              .then(() => {
                setComment("");
                setTimeout(() => onComment(), 100);
                utils.share.get.invalidate({
                  userId: solution.userId,
                  star: solution.star.toString(),
                  day: solution.day.toString(),
                  year: solution.year.toString(),
                });
              });
          }}
        >
          Comment
        </button>
      </div>
    </form>
  );
};
