# Nova – Personal AI Assistant

Nova is a **Production-ready reliable personal AI assistant** built to help manage your day-to-day tasks. It integrates **calendar management**, **web search**, and **meeting scheduling** with natural language commands, providing a seamless assistant experience.

This project was built from scratch as a **career-focused showcase**, proving real-world backend + AI agent skills — not just demos.

---

## Features

- **Personal Calendar Management**

  - Check your schedule: `Do I have any meeting tomorrow?`
  - Create meetings with attendees, date, time, and timezone.
  - Automatic contact resolution from `contact.json`.

- **Web Search**

  - Real-time information retrieval using integrated search.
  - Summarizes top results for quick answers.

- **Intelligent Conversations**
  - Understands multi-turn queries.
  - Handles clarification requests for missing info (e.g., attendee emails).
- **Agent Memory**

  - Maintains conversation context using threads.
  - Prevents repeated tool calls and keeps interactions concise.

- **Modern UI**
  - Clean chat interface with responsive design.
  - Supports multi-line input and smooth scrolling.
  - Cool dark mode aesthetic.

---

## Tech Stack

- **Backend:** Node.js, Express, Google Calendar API, LangChain, OpenAI
- **Frontend:** React, TailwindCSS, Framer Motion
- **AI Tools:** LangGraph, LangChain tools (createEvent, getEvents, webSearch)
- **Data Storage:** Local JSON for contacts and persistent agent memory

---

## Demo

![Nova Chat Demo](https://drive.google.com/drive/u/0/home)
![Nova Architectual Graph Demo](https://drive.google.com/drive/u/0/home)

---

## Getting Started

### Prerequisites

- Node.js >= 18
- Google Cloud project with Calendar API enabled
- OpenAI API Key

### Installation

```bash
git clone https://github.com/MohitCodes17/Nova-Personal-AI-Assistant.git
cd /server
npm install

cd /client
npm install
```

### Environment Variables

Create a .env file with the following:

```ini
PORT=3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:3001/callback
GOOGLE_ACCESS_TOKEN=your_google_access_token
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
OPENAI_API_KEY=your_openai_api_key
```

### Run the Server

```bash
npm run dev
```

### Run the Frontend

```bash
cd client
npm install
npm run dev
```

---

## Project Structure

```graphql
server/          # Backend Node.js server
client/          # React frontend
contact.json     # Local contact storage for attendees
tools.js         # Custom LangChain tools for Nova
agent/           # Agent logic and LangGraph state
memory.js        # Persistent conversation memory
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a branch (git checkout -b feature/YourFeature)
3. Commit your changes (git commit -m 'Add some feature')
4. Push to the branch (git push origin feature/YourFeature)
5. Open a Pull Request

---

## Author

**Mohit Gupta** – Creator of Nova AI Assistant

[LinkedIn](https://www.linkedin.com/in/mohit-gupta-519755245/) | [GitHub](https://github.com/MohitCode17)
