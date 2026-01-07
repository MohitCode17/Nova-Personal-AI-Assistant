import fs from "node:fs";
import path from "node:path";
import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import crypto from "crypto";
import { google } from "googleapis";
import { z } from "zod";

const CONTACT_PATH = path.join(process.cwd(), "contact.json");

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

const createEvent = tool(
  async ({ summary, date, startTime, endTime, timeZone, attendees }) => {
    try {
      let resolvedAttendees = [];

      if (attendees?.length) {
        let contacts = null;

        for (const a of attendees ?? []) {
          // Case 1: Email explicitly provided → trust user
          if (a.email) {
            resolvedAttendees.push({
              email: a.email,
              displayName: a.displayName,
            });
            continue;
          }
          // Case 2: Name only → now load contacts
          if (!contacts) {
            contacts = JSON.parse(fs.readFileSync(CONTACT_PATH, "utf-8"));
            console.log("Contacts", contacts);
          }
          const key = a.displayName.toLowerCase();

          if (contacts[key]) {
            resolvedAttendees.push({
              email: contacts[key].email,
              displayName: contacts[key].name,
            });
          } else {
            throw new Error(`MISSING_EMAIL:${a.displayName}`);
          }
        }
      }

      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      const response = await calendar.events.insert({
        calendarId: "primary",
        sendUpdates: "all",
        requestBody: {
          summary,
          start: {
            dateTime: startDateTime,
            timeZone,
          },
          end: {
            dateTime: endDateTime,
            timeZone,
          },
          attendees: resolvedAttendees,
        },
      });

      if (response.data?.id) {
        return `Meeting "${summary}" has been scheduled successfully.`;
      }

      return "Couldn't create a meeting!";
    } catch (error) {
      console.error("createEvent error:", error);
      return "Failed to create the meeting due to an internal error.";
    }
  },
  {
    name: "createEvent",
    description:
      "Create a calendar meeting using local date, time, and timezone.",
    schema: z.object({
      summary: z.string().describe("The title of the event"),
      date: z.string().describe("Event date in YYYY-MM-DD"),
      startTime: z.string().describe("Start time in HH:mm (24-hour)"),
      endTime: z.string().describe("End time in HH:mm (24-hour)"),
      timeZone: z.string().describe("IANA timezone string"),
      attendees: z
        .array(
          z.object({
            email: z.string().describe("The email of the attendee").optional(),
            displayName: z
              .string()
              .describe("Then name of the attendee.")
              .optional(),
          })
        )
        .optional(),
    }),
  }
);

export const tools = [webSearch, getEvents, createEvent];
