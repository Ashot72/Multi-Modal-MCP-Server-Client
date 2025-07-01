import { z } from "zod";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import "dotenv/config";

const documentSchema = {
  prompt: z.string().describe("Prompt to retrive documents with links"),
};

export default function registerDocumentTool(server: McpServer) {
  server.tool(
    "Document Tool",
    documentSchema,
    {
      description: "Retrieves documents with links based on the given prompt",
    },
    async ({ prompt }: { prompt: string }) => {
      try {
        // Input validation
        if (!prompt || prompt.trim().length === 0) {
          throw new Error("Prompt cannot be empty");
        }

        // Check if Tavily API key is configured
        if (!process.env.TAVILY_API_KEY) {
          throw new Error("Tavily API key is not configured");
        }

        const retriever = new TavilySearchAPIRetriever({
          k: 3,
          apiKey: process.env.TAVILY_API_KEY,
        });

        console.log("Searching for documents with prompt:", prompt);

        const retrievedDocuments = await retriever.invoke(prompt);

        if (!retrievedDocuments || retrievedDocuments.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No documents found for the given prompt. Please try with different keywords.",
              },
            ],
          };
        }

        console.log(`Found ${retrievedDocuments.length} documents`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(retrievedDocuments),
            },
          ],
        };
      } catch (error) {
        console.error("Error in document tool:", error);
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving documents: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
            },
          ],
        };
      }
    }
  );
}

/*
Recent Microsoft Documents on AI
*/
