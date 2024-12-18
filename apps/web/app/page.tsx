"use client";

import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";
import ApplicationBuilder from "../components/ApplicationBuilder";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return (
    <div className="flex justify-center">
      <main >
        <h1>Vercel 2.0</h1>
        <ApplicationBuilder />
      </main>
    </div>
  );
}
