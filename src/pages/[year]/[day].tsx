import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { AocInput } from "../../components/AocInput";
import { AocText } from "../../components/AocText";
import { Layout } from "../../components/Layout";
import { useLocalStorage } from "../../utils/localStorage";
import useMediaQuery from "../../utils/mediaQuery";
import { trpc } from "../../utils/trpc";
import type { NextPageWithLayout } from "../_app";

type Tabs = "input" | "text";

const Home: NextPageWithLayout = () => {
  const router = useRouter();
  const { day, year } = router.query as { day: string; year: string };

  const [activeTab, setActiveTab] = useLocalStorage<Tabs>(
    "aocActiveTab",
    "text"
  );

  const lg = useMediaQuery("(min-width: 1024px)");

  if (typeof window === "undefined") return null;

  return (
    <main className="relative h-full overflow-scroll">
      <div className="tabs absolute w-full rounded-sm rounded-t-xl bg-base-200 pt-1 lg:hidden">
        {/* for every type in active tab */}
        {["text", "input"].map((tab) => (
          <button
            key={tab}
            className={classNames(
              "tab tab-lifted flex-grow text-lg capitalize",
              {
                "tab-active": activeTab === tab,
              }
            )}
            onClick={() => setActiveTab(tab as Tabs)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex h-full flex-row gap-4 overflow-scroll rounded-xl p-4 pt-16 lg:bg-base-100 lg:pt-4">
        {/* tabs with daisyui */}
        {(activeTab === "text" || lg) && <AocText year={year} day={day} />}
        {(activeTab === "input" || lg) && <AocInput year={year} day={day} />}
      </div>
      <ReactQueryDevtools />
    </main>
  );
};

Home.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default Home;
