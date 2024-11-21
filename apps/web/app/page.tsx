"use client";

import Image, { type ImageProps } from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";

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
  async function upload(formData: FormData) {

    const repositoryUrl = formData.get("repositoryUrl");

    if (!repositoryUrl) return;

    await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({ repositoryUrl }),
    });
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Vercel 2.0</h1>
        <form action={upload}>
          <input type="url" name="repositoryUrl" />
          <button type="submit">Upload</button>
        </form>
      </main>
    </div>
  );
}
