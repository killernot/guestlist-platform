-- AlterTable: Add event relation to GoogleSheetsMapping
ALTER TABLE "google_sheets_mappings" ADD CONSTRAINT "google_sheets_mappings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
