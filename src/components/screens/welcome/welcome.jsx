import React from "react";
import { useTranslation } from "react-i18next";
import AnimatedBackground from "../../AnimatedBackground";

export default function Welcome() {
  const { t } = useTranslation();
  return (
    <div
      className="text-slate-950 dark:text-white flex justify-center items-center pb-28"
      style={{ height: "calc(100vh - 72px)" }}
    >
      <AnimatedBackground />
      <div className="text-center">
        <h1 className="mb-5 text-6xl font-thin">{t("welcomeTo")}</h1>
        <h1 className="mb-5 text-8xl font-bold">{t("cryptoPulse")}</h1>
      </div>
    </div>
  );
}
