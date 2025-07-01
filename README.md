## Multi-Modal MCP Server/Client with SSE Transport Layer

MCP – Model Context Protocol is an open standard that simplifies how large language models (LLMs) access and interact with external data, tools, and services. It essentially acts as a universal interface, enabling AI applications to connect to various systems and resources in a standardized way. MCP utilizes a client-server model. Clients, embedded in LLMs, send requests to MCP servers, which handle the actual interaction with external systems. It simplifies the development of AI agents and workflows by providing a unified approach to connecting LLMs with various data sources, tools, and APIs.

![MCP Server/Client](https://github.com/Ashot72/Multi-Modal-MCP-Server-Client/blob/main/mcp.png)

This project connects to a Multi-Modal MCP server and demonstrates client-side integration with several powerful AI-driven tools.

---

### 🧠 Clients Used

We utilize three clients to interact with the MCP server:

- **MCP Inspector**  
  A developer tool for testing and debugging MCP servers.

- **React MCP Client**  
  A custom-built frontend written in React.

- **Cursor AI Tool Editor**  
  Integrates with MCP servers and allows invoking tools directly from the editor interface.

---

### 🔧 MCP Tools

The Multi-Modal MCP server provides the following tools:

- **🎧 Audio Tool**  
  Converts text into spoken audio using **Google Text-to-Speech**.

- **📊 Chart Tool**  
  Generates JSON chart data from user prompts and renders it with **Chart.js**.

- **📄 Document Tool**  
  Uses **Tavily Search** to retrieve relevant documents and links.

- **🖼️ Image Tool**  
  Leverages **DALL·E** to create images based on natural language descriptions.

- **🎥 Video Tool**  
  Uses the **YouTube Data API** to return video IDs, allowing video embedding in the UI.

### 🛠️ Setup Instructions

This project includes:

1. **MCP Server** – Backend logic and tool execution.
2. **React MCP Client** – Frontend interface.
3. **MCP Inspector** – Developer debug console for MCP.

### 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Ashot72/Multi-Modal-MCP-Server-Client

# 2. Start the MCP Server
cd backend/Multi-Modal-MCP-Server-Client

# 2.1 Create a .env file from env.example.txt and include:
# - OPENAI_API_KEY
# - TAVILY_API_KEY
# - YOUTUBE_API_KEY

# 2.2 Install backend dependencies
npm install

# 2.3 Start the MCP server (runs at http://localhost:3001)
npm start

# 3. Run the MCP Inspector (another terminal)
cd backend/Multi-Modal-MCP-Server-Client
npm run inspector

# After running this command, you'll see a link like the following in your terminal:
#
#   Open inspector with token pre-filled:
#   http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=your_generated_token_here
#
# Click on it to open the MCP Inspector in your browser with the authentication token automatically filled in.

# 4. Start the React MCP Client
cd frontend/Multi-Modal-MCP-Server-Client

# 4.1 Install frontend dependencies
npm install

# 4.2 Start the development server (runs at http://localhost:5173)
npm run dev

```

Go to [Multi-Modal MCP Server/Client with SSE Transport Layer Video](https://youtu.be/yP5qI0JJqNM) page

Go to [Multi-Modal MCP Server/Client with SSE Transport Layer Description](https://ashot72.github.io/Multi-Modal-MCP-Server-Client/doc.html) page
