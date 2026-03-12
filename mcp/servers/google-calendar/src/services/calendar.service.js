import { google } from "googleapis";

export class CalendarService {
  constructor(authClient) {
    this.calendar = google.calendar({
      version: "v3",
      auth: authClient,
    });
  }

  async listEvents(args = {}) {
    try {
      const { calendarId = "primary", maxResults = 10 } = args;
      const res = await this.calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
      });
      const events = res.data.items;

      if (!events || events.length === 0) {
        return {
          content: [{ type: "text", text: "No upcoming events found." }],
        };
      }

      const eventList = events
        .map(
          (event) =>
            `${event.summary} (${event.start.dateTime || event.start.date})`
        )
        .join("\n");

      return {
        content: [{ type: "text", text: `Upcoming events:\n${eventList}` }],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error listing events: ${error.message}` },
        ],
        isError: true,
      };
    }
  }

  async createEvent(args = {}) {
    try {
      const { summary, location, description, start, end } = args;
      await this.calendar.events.insert({
        calendarId: "primary",
        requestBody: {
          summary,
          location,
          description,
          start: { dateTime: start },
          end: { dateTime: end },
        },
      });
      return {
        content: [
          { type: "text", text: `Event '${summary}' created successfully.` },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error creating event: ${error.message}` },
        ],
        isError: true,
      };
    }
  }
}
