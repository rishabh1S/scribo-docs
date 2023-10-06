import { Server } from "socket.io";
import supabase from "./supabase.js";

const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    let documentData = "";

    const { data, error } = await supabase
      .from("documents")
      .select("data")
      .eq("id", documentId)
      .single();

    if (error) {
      console.error("Error fetching document:", error);
    }

    if (data) {
      documentData = data.data;
    } else {
      const { data: newData, error: createError } = await supabase
        .from("documents")
        .upsert([
          {
            id: documentId,
            data: "",
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
  });
});
