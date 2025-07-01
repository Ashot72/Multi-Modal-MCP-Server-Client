import shortid from "shortid";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const audioSchema = {
  prompt: z.string().describe("Prompt to generate audio"),
};

async function audioFile(prompt: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const uniqueID = shortid.generate();
      const gTTS = (await import("gtts")).default;
      const gtts = new gTTS(prompt, "en");

      gtts.save(`./mp3/${uniqueID}.mp3`, function (err: any) {
        if (err) {
          console.error("Error saving audio file:", err);
          reject(new Error(`Failed to save audio file: ${err.message}`));
        } else {
          resolve(uniqueID);
        }
      });
    } catch (error) {
      console.error("Error in audioFile function:", error);
      reject(
        new Error(
          `Failed to generate audio: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      );
    }
  });
}

export default function registerAudioTool(server: McpServer) {
  server.tool(
    "Audio Tool",
    audioSchema,
    {
      description: "Text content to convert into an audio file",
    },
    async ({ prompt }: { prompt: string }) => {
      try {
        if (!prompt || prompt.trim().length === 0) {
          throw new Error("Prompt cannot be empty");
        }

        const audioId = await audioFile(prompt);
        const port = process.env.PORT || 3001;
        const host = process.env.HOST || "localhost";
        const audioUrl = `http://${host}:${port}/mp3/${audioId}.mp3`;

        console.log("Audio URL:", audioUrl);

        return {
          content: [
            {
              type: "text",
              text: audioUrl,
            },
          ],
        };
      } catch (error) {
        console.error("Error in audio tool:", error);
        return {
          content: [
            {
              type: "text",
              text: `Error generating audio: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
            },
          ],
        };
      }
    }
  );
}
