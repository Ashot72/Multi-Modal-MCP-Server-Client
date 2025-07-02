import React, { useState, useEffect } from "react";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { ChartJS } from "./chart";

interface Tool {
  name: string;
  description?: string;
  annotations?: {
    description: string;
  };
}

export function Index() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [transport, setTransport] = useState<SSEClientTransport | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [showTools, setShowTools] = useState(false);
  const [tool, setTool] = useState<string>();

  const connectToServer = async () => {
    setLoading(true);
    setError(null);
    const newClient = new Client(
      { name: "Multi Modal MCP Client", version: "1.0.0" },
      { capabilities: { tools: {} } }
    );
    const newtransport = new SSEClientTransport(new URL("/sse", "http://localhost:3001"), {
      requestInit: {
        headers: {
          Accept: "text/event-stream",
        },
      },
    });
    try {
      await newClient.connect(newtransport);
      setClient(newClient);
      setTransport(newtransport);
      console.log("Connected to MCP server");
      const capabilities = await newClient.listTools();
      console.log("capabilities===========>", capabilities);
      const availableTools = capabilities.tools.map((tool) => ({
        name: tool.name,
        description: String(tool.annotations?.description) || "No description available",
      }));
      setTools(availableTools);
    } catch (err) {
      setError(`Failed to connect to MCP server: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    connectToServer();
    return () => {
      transport?.close();
    };
  }, []);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) {
      setError("Client not connected");
      return;
    }

    if (!tool) {
      setError("No tool selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await client.callTool({
        name: tool,
        arguments: {
          prompt: query,
        },
      });

      if (response.content?.[0]?.text) {
        const result: string = response.content[0].text;
        setResults((prevResults) => [...prevResults, { tool, result }]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError(`Tool call failed: ${(err as Error).message}`);
      console.error("Tool call error:", err);
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  function renderOutput(toolName: string, searchResult: string) {
    switch (toolName) {
      case "Chart Tool":
        const parsed = JSON.parse(searchResult);
        const chartData = JSON.parse(parsed.content[0].text);
        return (
          <span>
            <ChartJS {...chartData} />
          </span>
        );
      case "Document Tool":
        let docs: {
          metadata: {
            source: string;
            title: string;
          };
          pageContent: string;
        }[] = [];
        try {
          docs = JSON.parse(searchResult);
        } catch (e) {
          return <span>Invalid document data</span>;
        }
        return (
          <div className="grid gap-4">
            {docs.map((doc, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <a
                    href={doc.metadata.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {doc.metadata.title}
                  </a>
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{doc.pageContent}</p>
              </div>
            ))}
          </div>
        );
      case "Video Tool":
        return (
          <span>
            <iframe
              width="594"
              height="334"
              src={`https://www.youtube.com/embed/${searchResult}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube Video"
            />
          </span>
        );
      case "Audio Tool":
        return (
          <span>
            <audio controls style={{ width: "100%" }}>
              <source src={searchResult} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </span>
        );
      case "Image Tool":
        return (
          <span>
            <img src={searchResult} alt="Image" />
          </span>
        );
      default:
        return <span>{searchResult}</span>;
    }
  }

  return (
    <div
      className={`w-full max-w-2xl mx-auto px-4 flex flex-col h-[90vh] ${
        results.length === 0 ? "justify-center" : ""
      }`}
    >
      <div className="flex-shrink-0">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Multi Modal MCP</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${client ? "bg-green-500" : "bg-red-500"}`} />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {client ? "Connected to MCP" : "Connecting to MCP..."}
              </p>
            </div>
            <button
              onClick={() => setShowTools(!showTools)}
              className="text-sm text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300 transition-colors p-2 rounded-full"
            >
              {showTools ? "Hide Tools" : "Show Tools"}
            </button>
          </div>
        </header>

        {showTools && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Available Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map((toolObj, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border transition-colors duration-200 \
                    ${
                      toolObj.name === tool
                        ? "bg-teal-100 dark:bg-teal-800 border-teal-400 dark:border-teal-500"
                        : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    }
                  `}
                >
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    {toolObj.name}
                  </h3>
                  <button
                    className="group flex items-center gap-2 text-sm text-teal-600 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-100 focus:outline-none text-left cursor-pointer"
                    onClick={() => setTool(toolObj.name)}
                  >
                    <span>{toolObj.description || "No description available"}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleChat} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full border h-12 shadow p-4 rounded-full dark:text-gray-800 dark:border-gray-700 dark:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <button
              type="submit"
              disabled={loading || !client}
              className="absolute top-1.5 right-2.5 transition-colors duration-200 bg-gray-200 dark:bg-gray-900 p-2 rounded-full"
            >
              <svg
                className={`h-5 w-5 fill-current ${
                  loading || !client
                    ? "text-gray-400"
                    : "text-teal-400 dark:text-teal-300 hover:text-teal-500 dark:hover:text-teal-400"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 56.966 56.966"
              >
                <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17s-17-7.626-17-17S14.61,6,23.984,6z" />
              </svg>
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-8 text-center">
            {error}
            <button
              onClick={connectToServer}
              className="ml-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
            >
              Reconnect
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-6 flex-grow">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              {renderOutput(result.tool, result.searchResult)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
