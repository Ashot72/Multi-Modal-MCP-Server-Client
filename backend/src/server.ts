import express from "express";
import { config } from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import cors from "cors";
import path from "path";
import {
  registerChartTool,
  registerDocumentTool,
  registerVideoTool,
  registerAudioTool,
  registerImageTool,
} from "./tools/index.js";

config();

const server = new McpServer({
  name: "mcp-sse-server",
  version: "1.0.0",
});

registerChartTool(server);
registerDocumentTool(server);
registerVideoTool(server);
registerAudioTool(server);
registerImageTool(server);

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: false,
  })
);

// Serve static files from the mp3 folder
app.use("/mp3", express.static(path.join(process.cwd(), "mp3")));

app.get("/", (req, res) => {
  res.json({
    name: "MCP SSE Server",
    version: "1.0.0",
    status: "running",
    endpoints: {
      "/": "Server information (this response)",
      "/sse": "Server-Sent Events endpoint for MCP connection",
      "/messages": "POST endpoint for MCP messages",
    },
    tools: [
      { name: "Chart Tool", description: "Retrieves chart data based on the given prompt" },
      {
        name: "Document Tool",
        description: "Retrieves documents with links based on the given prompt",
      },
      { name: "Video Tool", description: "Retrieves a Youtube video based on the given prompt" },
      { name: "Audio Tool", description: "Text content to convert into an audio file." },
      {
        name: "Image Tool",
        description: "Generates an image based on the given text prompt using DALL-E.",
      },
    ],
  });
});

let transport: SSEServerTransport;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);

  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("MCP SSE Server is running on port", PORT);
});
