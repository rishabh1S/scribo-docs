import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";
import { Toaster, toast } from "sonner";

const SAVE_INTERVAL_MS = 3000;
const fontSizeArr = [
  "12px",
  "8px",
  "9px",
  "10px",
  "14px",
  "16px",
  "20px",
  "24px",
  "32px",
  "42px",
  "54px",
  "68px",
  "84px",
  "98px",
];

const Size = Quill.import("attributors/style/size");
Size.whitelist = fontSizeArr;
Quill.register(Size, true);
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, false] }],
  [{ font: [] }],
  [{ size: fontSizeArr }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block", "image"],
  ["clean"],
];

export default function TextEditor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [documentName, setDocumentName] = useState();

  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.on("update-document-name", (newName) => {
      setDocumentName(newName);
    });

    socket.emit("get-document", documentId);
  }, [socket, quill, documentId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  const copyToClipboard = () => {
    const currentURL = window.location.href;
    navigator.clipboard
      .writeText(currentURL)
      .then(() => {
        toast.success("URL copied to clipboard");
      })
      .catch((error) => {
        toast.error("Error copying to clipboard:", error);
      });
  };

  const handleDocumentNameChange = (event) => {
    const newName = event.target.value;
    setDocumentName(newName);

    // Send only the new name to the server
    socket.emit("update-document-name", newName);
  };

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.setText("Loading...");
    q.disable();
    setQuill(q);
  }, []);
  return (
    <div>
      <Toaster richColors position="top-center" />
      <div className="header">
        <img src="/icon-top.png" alt="header-img" />
        <div className="div-outer">
          <input
            className="text-input"
            type="text"
            value={documentName}
            onChange={handleDocumentNameChange}
          />
        </div>
        <button onClick={copyToClipboard} className="share-b">
          Share
          <FontAwesomeIcon
            icon={faClipboard}
            className="icon-s"
            style={{ color: "#001d35" }}
          />
        </button>
      </div>
      <div className="container" ref={wrapperRef}></div>
    </div>
  );
}
