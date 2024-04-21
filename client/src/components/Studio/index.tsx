import { useEffect, useState } from "react";
import GenerativeAudio from "../GenerativeAudio";
import styles from "./style.module.scss";
import Typography from "../Typography";
import AnimatedLogo from "../AnimatedLogo";
import { mergeIntoBlob } from "@/utils/crunker";
import { submitGame } from "@/api";
import { Socket } from "socket.io-client";

export interface AudioProps {
  prompt: string;
  loading: boolean;
  file: Blob | null;
}

export type Blobs = {
  one?: Blob;
  two?: Blob;
  three?: Blob;
  four?: Blob;
};

interface StudioProps {
  user?: string;
  uuid?: string;
  timer?: number;
  socket?: Socket;
}

const Studio = ({ user, uuid, timer, socket }: StudioProps) => {
  const [stop, setStop] = useState<boolean>(false);
  const [restart, setRestart] = useState<boolean>(false);
  const [blobs, setBlobs] = useState<Blobs>({});
  const [collect, setCollect] = useState<boolean>(false);

  const addBlob = (blob: Blob, key: "one" | "two" | "three" | "four") => {
    setBlobs((blobs) => {
      const newBlobs = { ...blobs };
      newBlobs[key] = blob;
      return newBlobs;
    });
  };

  const collectBlobs = async (): Promise<Blob> => {
    setCollect(true);
    setCollect(false);
    await new Promise(r => setTimeout(r, 2000));
    const validBlobs = [blobs.one, blobs.two, blobs.three, blobs.four].filter(
      (i) => i !== undefined,
    ) as Blob[];
    if (validBlobs.length === 0) {
      return new Blob();
    } else if (validBlobs.length === 1) {
      return validBlobs[0];
    } else {
      const blob = mergeIntoBlob(validBlobs);
      return blob;
    }
  };

  const submit = async () => {
    const blob = await collectBlobs();
    console.log(blob)
    await submitGame(user || "", uuid || "", blob);
    socket?.emit("judging");
  };

  useEffect(() => {
    if (timer === 0) {
      submit();
    }
  }, [timer]);

  return (
    <div className={styles.container}>
      <AnimatedLogo />
      <div className={styles.music}>
        <GenerativeAudio
          stop={stop}
          restart={restart}
          addBlob={(b: Blob) => addBlob(b, "one")}
          collect={collect}
        />
        <GenerativeAudio
          stop={stop}
          restart={restart}
          addBlob={(b: Blob) => addBlob(b, "two")}
          collect={collect}
        />
        <GenerativeAudio
          stop={stop}
          restart={restart}
          addBlob={(b: Blob) => addBlob(b, "three")}
          collect={collect}
        />
        <GenerativeAudio
          stop={stop}
          restart={restart}
          addBlob={(b: Blob) => addBlob(b, "four")}
          collect={collect}
        />
        <div className={styles.buttons}>
          <button
            type="button"
            onClick={() => setRestart((r) => !r)}
            className={styles.button}
          >
            <Typography variant="body" bold>
              replay all tracks.
            </Typography>
          </button>
          <button type="button" onClick={() => setStop((r) => !r)} className={styles.button}>
            <Typography variant="body" bold>
              stop all tracks.
            </Typography>
          </button>
          <button type="button" onClick={submit} className={styles.button}>
            <Typography variant="body" bold>
              Done
            </Typography>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Studio;
