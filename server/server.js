import { Server } from "socket.io";
import supabase from "./supabase.js";

const io = new Server(3001, {
  cors: {
    origin: "https://scribo-docs-delta.vercel.app/",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    let documentData = "";
    let documentName = "Untitled document";

    const { data, error } = await supabase
      .from("documents")
      .select("data, name")
      .eq("id", documentId)
      .single();

    if (error) {
      console.error("Error fetching document:", error);
    }

    if (data) {
      documentData = data.data;
      documentName = data.name || documentName;
    } else {
      const { data: newData, error: createError } = await supabase
        .from("documents")
        .upsert([
          {
            id: documentId,
            data: "",
            name: documentName,
          },
        ]);

      if (createError) {
        console.error("Error creating document:", createError);
      }

      if (newData) {
        documentData = newData[0].data;
      }
    }

    socket.join(documentId);
    socket.emit("load-document", documentData);
    socket.emit("update-document-name", documentName);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      const { error: saveError } = await supabase.from("documents").upsert([
        {
          id: documentId,
          data: data,
        },
      ]);

      if (saveError) {
        console.error("Error saving document:", saveError);
      }
    });
    socket.on("update-document-name", async (newName) => {
      const { error: nameUpdateError } = await supabase
        .from("documents")
        .upsert([
          {
            id: documentId,
            name: newName,
          },
        ]);
      if (nameUpdateError) {
        console.error("Error updating document name:", nameUpdateError);
      } else {
        io.in(documentId).emit("update-document-name", newName);
      }
    });
  });
});
