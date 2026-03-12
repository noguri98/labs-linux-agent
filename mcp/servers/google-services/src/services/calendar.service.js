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
        timeZone: "Asia/Seoul",
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
            `ID: ${event.id} | Summary: ${event.summary} (${event.start.dateTime || event.start.date})`,
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
          start: {
            dateTime: start,
            timeZone: "Asia/Seoul",
          },
          end: {
            dateTime: end,
            timeZone: "Asia/Seoul",
          },
        },
      });
      return {
        content: [
          {
            type: "text",
            text: `Event '${summary}' created successfully in KST.`,
          },
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

  async updateEvent(args = {}) {
    try {
      const { eventId, summary, location, description, start, end } = args;
      const requestBody = {};
      if (summary) requestBody.summary = summary;
      if (location) requestBody.location = location;
      if (description) requestBody.description = description;
      if (start)
        requestBody.start = { dateTime: start, timeZone: "Asia/Seoul" };
      if (end) requestBody.end = { dateTime: end, timeZone: "Asia/Seoul" };

      await this.calendar.events.patch({
        calendarId: "primary",
        eventId,
        requestBody,
      });
      return {
        content: [
          {
            type: "text",
            text: `Event ID '${eventId}' updated successfully in KST.`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error updating event: ${error.message}` },
        ],
        isError: true,
      };
    }
  }

  async deleteEvent(args = {}) {
    try {
      const { eventId } = args;
      await this.calendar.events.delete({
        calendarId: "primary",
        eventId,
      });
      return {
        content: [
          { type: "text", text: `Event ID '${eventId}' deleted successfully.` },
        ],
      };
    } catch (error) {
      return {
        content: [
          { type: "text", text: `Error deleting event: ${error.message}` },
        ],
        isError: true,
      };
    }
  }
}
