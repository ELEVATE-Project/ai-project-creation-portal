import React, { useState, useEffect } from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import FileViewer from "../../components/file-viewer";
import { getEncodedLocalStorage } from "../../utils/storage_utils";
import { useParams } from "react-router-dom";
import BotMessage from "../shikshalokam-mitra/mitra-pages/components/chat-message/BotMessage";
import { DEFAULT_FILE_WIDTH } from "../../constants/file";
const ImprovementPlan = () => {
  const [media, setMedia] = useState([]);
  const { projectId } = useParams();
  useEffect(() => {
    const mediaItems = getEncodedLocalStorage("media") || [];
    setMedia(mediaItems);
  }, [projectId]);

  console.log("---------- media", media);

  return (
    <>
      <Header />
      <main className="w-full h-fit mb-10">
        <FileViewer url={media[0]?.url} fileType={media[0]?.media_type} />
      </main>
      <Footer />
    </>
  );
};

export default ImprovementPlan;
