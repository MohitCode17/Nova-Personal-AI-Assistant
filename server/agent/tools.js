import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import { google } from "googleapis";
import { z } from "zod";

const tavily = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

oauth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Create Calendar Client
const calendar = google.calendar({ version: "v3", auth: oauth2Client });

const webSearch = tool(
  async ({ query }) => {
    const response = await tavily.invoke({ query });
    console.log("Tavily Search Response:", response);

    // Format the response more clearly for the AI
    if (typeof response === "string") {
      return response;
    }

    // If it's an object with results, format it nicely
    if (response.results && Array.isArray(response.results)) {
      const formattedResults = response.results
        .slice(0, 3) // Limit to top 3 results
        .map((r) => `${r.title}: ${r.content}`)
        .join("\n\n");
      return `Search results for "${query}":\n\n${formattedResults}`;
    }

    return JSON.stringify(response);
  },
  {
    name: "webSearch",
    description: "Search the internet for real-time or unknown informations",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

const getEvents = tool(
  async (params) => {
    console.log("Calling getEvents with Params:", params);
    const { day, q } = params;

    const now = new Date();

    let start, end;

    if (day === "today") {
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      end = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );
    }

    if (day === "tomorrow") {
      const t = new Date(now);
      t.setDate(t.getDate() + 1);
      start = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, 0);
      end = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 23, 59, 59);
    }

    if (day === "this_week") {
      start = now;
      end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    try {
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        ...(q ? { q } : {}), // only add q if it's defined
      });

      const result = response.data.items?.map((e) => {
        return {
          id: e.id,
          summary: e.summary,
          status: e.status,
          organiser: e.organizer,
          start: e.start,
          end: e.end,
          attendees: e.attendees,
          meetingLink: e.hangoutLink,
          eventType: e.eventType,
        };
      });

      return JSON.stringify(result);
    } catch (error) {
      console.log("Error in tool of getting events:", error);
    }

    return "Failed to connect to the calendar!";
  },
  {
    name: "getEvents",
    description: "Call to get the calendar events",
    schema: z.object({
      day: z.enum(["today", "tomorrow", "this_week"]),
      q: z
        .string()
        .optional()
        .describe(
          "Optional keyword to filter events (e.g. Project, Interview)"
        ),
    }),
  }
);

export const tools = [webSearch, getEvents];
