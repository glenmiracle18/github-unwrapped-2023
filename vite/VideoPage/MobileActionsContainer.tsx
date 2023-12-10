import { useNavigate } from "@tanstack/react-router";
import React, { useCallback, useEffect } from "react";
import { ShareIcon } from "../../icons/ShareIcon";
import { Button } from "../Button/Button";
import { useUserVideo } from "../context";
import { shareRoute, videoRoute } from "../routing";
import { FurtherActions } from "./Actions/FurtherActions";
import { DownloadButton } from "./Sidebar/DownloadButton";
import styles from "./styles.module.css";
import type { RenderStatus } from "./useVideo";

const getRenderDescription = (status: RenderStatus) => {
  switch (status.type) {
    case "querying":
      return <div>Querying user data from GitHub...</div>;
    case "render-running":
      return (
        <div>{`Generating Video... (${Math.floor(
          status.progress * 100,
        )}%)`}</div>
      );
    case "error-querying":
      return <div>An error occured</div>;
    case "video-available":
      return null;
    default:
      return null;
  }
};

export const MobileActionsContainer: React.FC = () => {
  const navigate = useNavigate({ from: videoRoute.id });
  const [file, setFile] = React.useState<File | null>(null);
  const { username } = videoRoute.useParams();
  const { compositionParams } = useUserVideo();
  const { status } = useUserVideo();

  // const status: {
  //   type: "render-running";
  //   renderId: string;
  //   progress: number;
  // } = {
  //   type: "render-running",
  //   renderId: "",
  //   progress: 0.47,
  // };

  const fetchFile = useCallback(async () => {
    if (status.type === "video-available") {
      const f = await fetch(status.url)
        .then((res) => res.blob())
        .then(
          (blob) =>
            new File([blob], "github_unwrapped.mp4", { type: "video/mp4" }),
        );
      setFile(f);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.type]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  return (
    <div className={styles.mobileActionsContainer}>
      {status.type === "video-available" && <FurtherActions />}

      {getRenderDescription(status)}

      <div style={{ display: "flex", gap: 16 }}>
        <DownloadButton style={{ flex: 1 }} />
        <Button
          hoverEffect
          style={{ flex: 1, gap: 8 }}
          onClick={() => {
            const sharable = Boolean(navigator.share);
            if (sharable && file) {
              navigator.share({
                files: [file],
                title: "Your GitHub Unwrapped 2023",
                text: "Check out my GitHub Unwrapped 2023! Get yours now on https://githubunwrapped.com",
              });
            } else {
              navigate({
                to: shareRoute.id,
                params: { username },
                search: {
                  platform: undefined,
                  accentColor: compositionParams.accentColor,
                },
              });
            }
          }}
        >
          <ShareIcon width={20} color="white" />
          Share
        </Button>
      </div>
    </div>
  );
};
