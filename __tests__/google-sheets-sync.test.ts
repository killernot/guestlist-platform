import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mocks ----

const mockSheets = vi.hoisted(() => ({
  spreadsheets: {
    create: vi.fn(),
    values: {
      append: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const mockSheetsMapping = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@googleapis/sheets", () => ({
  default: {
    sheets: vi.fn(() => mockSheets),
  },
  JWT: vi.fn(),
}));

vi.mock("../lib/google-sheets-config", () => ({
  getGoogleSheetsConfig: vi.fn(() => ({
    serviceAccountEmail: "test@test.iam.gserviceaccount.com",
    privateKey: "-----BEGIN RSA KEY-----\ntest\n-----END RSA KEY-----",
  })),
  isGoogleSheetsConfigured: vi.fn(() => true),
}));

vi.mock("../lib/prism", () => ({
  default: {
    googleSheetsMapping: mockSheetsMapping,
  },
}));

// Import after mocks are set up
import {
  createEventSheet,
  appendReservation,
  updateReservationStatus,
  setEventSheetMapping,
  getEventSheetMapping,
  removeEventSheetMapping,
} from "../lib/google-sheets";

// ---- Helpers ----

function setupEventMapping(eventId: string, spreadsheetId: string, sheetTitle: string) {
  mockSheetsMapping.findUnique.mockResolvedValue({
    id: "map1",
    eventId,
    spreadsheetId,
    sheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    sheetTitle,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// ---- Tests ----

describe("createEventSheet", () => {
  beforeEach(() => vi.resetAllMocks());

  it("creates a spreadsheet with correct title and writes headers", async () => {
    mockSheets.spreadsheets.create.mockResolvedValue({
      data: {
        spreadsheetId: "sheet123",
        spreadsheetUrl: "https://docs.google.com/spreadsheets/d/sheet123",
      },
    });
    mockSheets.spreadsheets.values.update.mockResolvedValue({ data: {} });

    const result = await createEventSheet("evt1", "Summer Party 2026");

    expect(result).toEqual({
      spreadsheetId: "sheet123",
      sheetUrl: "https://docs.google.com/spreadsheets/d/sheet123",
    });

    // Verify create call with title
    expect(mockSheets.spreadsheets.create).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({
          properties: expect.objectContaining({
            title: "Guestlist — Summer Party 2026",
          }),
        }),
      })
    );

    // Verify headers written
    expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: "sheet123",
        range: "Summer Party 2026!A1:I1",
        requestBody: {
          values: [
            ["Code", "Full Name", "Mobile", "Email", "Instagram", "Guests", "Status", "Created", "Checked In"],
          ],
        },
      })
    );
  });

  it("stores the sheet mapping after creation", async () => {
    mockSheets.spreadsheets.create.mockResolvedValue({
      data: {
        spreadsheetId: "sheet456",
        spreadsheetUrl: "https://docs.google.com/spreadsheets/d/sheet456",
      },
    });
    mockSheets.spreadsheets.values.update.mockResolvedValue({ data: {} });
    mockSheetsMapping.upsert.mockResolvedValue({
      id: "map2",
      eventId: "evt2",
      spreadsheetId: "sheet456",
      sheetUrl: "https://docs.google.com/spreadsheets/d/sheet456",
      sheetTitle: "Test Event",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createEventSheet("evt2", "Test Event");

    expect(mockSheetsMapping.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: "evt2" },
        create: expect.objectContaining({ eventId: "evt2", spreadsheetId: "sheet456" }),
        update: expect.objectContaining({ spreadsheetId: "sheet456" }),
      })
    );
  });
});

describe("appendReservation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupEventMapping("evt1", "sheet123", "Test Event");
  });

  it("appends a row with correct values", async () => {
    mockSheets.spreadsheets.values.append.mockResolvedValue({ data: {} });

    await appendReservation("evt1", {
      code: "GL-ABC123",
      fullName: "Juan Dela Cruz",
      mobile: "09171234567",
      email: "juan@test.com",
      instagram: "@juan",
      guestCount: 3,
      status: "PENDING",
      createdAt: "2026-06-25T10:00:00.000Z",
    });

    expect(mockSheets.spreadsheets.values.append).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: "sheet123",
        range: "Test Event!A:I",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [
            ["GL-ABC123", "Juan Dela Cruz", "09171234567", "juan@test.com", "@juan", "3", "PENDING", "2026-06-25T10:00:00.000Z", ""],
          ],
        },
      })
    );
  });

  it("handles null email and instagram", async () => {
    mockSheets.spreadsheets.values.append.mockResolvedValue({ data: {} });

    await appendReservation("evt1", {
      code: "GL-NULL1",
      fullName: "Maria",
      mobile: "0918",
      email: null,
      instagram: null,
      guestCount: 1,
      status: "APPROVED",
      createdAt: new Date("2026-06-25"),
    });

    const callArg = mockSheets.spreadsheets.values.append.mock.calls[0][0];
    expect(callArg.requestBody.values[0][3]).toBe(""); // email
    expect(callArg.requestBody.values[0][4]).toBe(""); // instagram
    expect(callArg.requestBody.values[0][8]).toBe(""); // checked in (empty for new reservations)
  });

  it("throws when no sheet mapping exists for event", async () => {
    mockSheetsMapping.findUnique.mockResolvedValue(undefined);
    await expect(
      appendReservation("nonexistent", {
        code: "GL-X",
        fullName: "Test",
        mobile: "0900",
        guestCount: 1,
        status: "PENDING",
        createdAt: new Date(),
      })
    ).rejects.toThrow("No sheet mapping found for event nonexistent");
  });
});

describe("updateReservationStatus", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setupEventMapping("evt1", "sheet123", "Test Event");
  });

  it("finds the reservation by code and updates the Status column", async () => {
    mockSheets.spreadsheets.values.get.mockResolvedValue({
      data: {
        values: [
          ["Code", "Full Name", "Mobile", "Email", "Instagram", "Guests", "Status", "Created"],
          ["GL-ABC123", "Juan", "0917", "j@t.com", "@j", "2", "PENDING", "2026-06-25"],
          ["GL-DEF456", "Maria", "0918", "m@t.com", "@m", "1", "APPROVED", "2026-06-25"],
        ],
      },
    });
    mockSheets.spreadsheets.values.update.mockResolvedValue({ data: {} });

    await updateReservationStatus("evt1", "GL-ABC123", "APPROVED");

    // Should update row 2 (index 1 + 1 = row 2)
    expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: "sheet123",
        range: "Test Event!G2",
        requestBody: { values: [["APPROVED"]] },
      })
    );
  });

  it("returns silently when reservation code not found", async () => {
    mockSheets.spreadsheets.values.get.mockResolvedValue({
      data: {
        values: [
          ["Code", "Full Name", "Mobile", "Email", "Instagram", "Guests", "Status", "Created"],
          ["GL-ABC123", "Juan", "0917", "j@t.com", "@j", "2", "PENDING", "2026-06-25"],
        ],
      },
    });

    await updateReservationStatus("evt1", "GL-NOTFOUND", "APPROVED");

    // Should not call update
    expect(mockSheets.spreadsheets.values.update).not.toHaveBeenCalled();
  });

  it("returns silently when no data rows", async () => {
    mockSheets.spreadsheets.values.get.mockResolvedValue({
      data: { values: [["Code", "Full Name"]] },
    });

    await updateReservationStatus("evt1", "GL-ABC123", "APPROVED");

    expect(mockSheets.spreadsheets.values.update).not.toHaveBeenCalled();
  });

  it("throws when no sheet mapping exists", async () => {
    mockSheetsMapping.findUnique.mockResolvedValue(undefined);
    await expect(
      updateReservationStatus("no-event", "GL-X", "APPROVED")
    ).rejects.toThrow("No sheet mapping found for event no-event");
  });
});

describe("withRetry (exponential backoff)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  it("retries on 429 errors with increasing delays", async () => {
    // Access withRetry indirectly through appendReservation
    setupEventMapping("evt1", "sheet123", "Test Event");

    const appendMock = mockSheets.spreadsheets.values.append;
    // Fail twice with 429, then succeed
    appendMock
      .mockRejectedValueOnce({ response: { status: 429 } })
      .mockRejectedValueOnce({ response: { status: 429 } })
      .mockResolvedValueOnce({ data: {} });

    const promise = appendReservation("evt1", {
      code: "GL-RETRY1",
      fullName: "Retry Test",
      mobile: "0900",
      guestCount: 1,
      status: "PENDING",
      createdAt: "2026-06-25T00:00:00Z",
    });

    // Advance timers to let retries complete (500ms + 1000ms + jitter)
    await vi.advanceTimersByTimeAsync(5000);

    await promise;

    expect(appendMock).toHaveBeenCalledTimes(3);
  }, 10000);

  it("gives up after max retries on persistent 429", async () => {
    setupEventMapping("evt1", "sheet123", "Test Event");

    const appendMock = mockSheets.spreadsheets.values.append;
    appendMock.mockRejectedValue({ response: { status: 429 } });

    const promise = appendReservation("evt1", {
      code: "GL-FAIL",
      fullName: "Fail Test",
      mobile: "0900",
      guestCount: 1,
      status: "PENDING",
      createdAt: "2026-06-25T00:00:00Z",
    });

    // Advance through all retries
    for (let i = 0; i < 15; i++) {
      await vi.advanceTimersByTimeAsync(30_000);
    }

    await expect(promise).rejects.toThrow(/failed after 5 attempts/);
    expect(appendMock).toHaveBeenCalledTimes(5);
  });

  it("does not retry on 400 client errors", async () => {
    setupEventMapping("evt1", "sheet123", "Test Event");

    const appendMock = mockSheets.spreadsheets.values.append;
    appendMock.mockRejectedValueOnce({ response: { status: 400 } });

    const promise = appendReservation("evt1", {
      code: "GL-400",
      fullName: "Bad Request",
      mobile: "0900",
      guestCount: 1,
      status: "PENDING",
      createdAt: "2026-06-25T00:00:00Z",
    });

    await expect(promise).rejects.toThrow();
    expect(appendMock).toHaveBeenCalledTimes(1); // no retry
  });
});

describe("Sheet mapping management", () => {
  beforeEach(() => {
    // Clear all mappings by removing known ones
    vi.resetAllMocks();
  });

  it("stores and retrieves sheet mapping", async () => {
    mockSheetsMapping.upsert.mockResolvedValue({
      id: "map1",
      eventId: "evt1",
      spreadsheetId: "sheet1",
      sheetUrl: "https://docs.google.com/s/sheet1",
      sheetTitle: "Event 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockSheetsMapping.findUnique.mockResolvedValue({
      id: "map1",
      eventId: "evt1",
      spreadsheetId: "sheet1",
      sheetUrl: "https://docs.google.com/s/sheet1",
      sheetTitle: "Event 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await setEventSheetMapping("evt1", "sheet1", "https://docs.google.com/s/sheet1", "Event 1");
    const mapping = await getEventSheetMapping("evt1");
    expect(mapping).toEqual({
      spreadsheetId: "sheet1",
      sheetUrl: "https://docs.google.com/s/sheet1",
      sheetTitle: "Event 1",
    });
  });

  it("returns undefined for unknown event", async () => {
    mockSheetsMapping.findUnique.mockResolvedValue(null);
    expect(await getEventSheetMapping("unknown")).toBeUndefined();
  });

  it("removes a mapping and returns true", async () => {
    mockSheetsMapping.upsert.mockResolvedValue({
      id: "map1",
      eventId: "evt1",
      spreadsheetId: "sheet1",
      sheetUrl: "url",
      sheetTitle: "Event 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await setEventSheetMapping("evt1", "sheet1", "url", "Event 1");
    mockSheetsMapping.delete.mockResolvedValue({
      id: "map1",
      eventId: "evt1",
      spreadsheetId: "sheet1",
      sheetUrl: "url",
      sheetTitle: "Event 1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(await removeEventSheetMapping("evt1")).toBe(true);
    mockSheetsMapping.findUnique.mockResolvedValue(null);
    expect(await getEventSheetMapping("evt1")).toBeUndefined();
  });

  it("returns false when removing non-existent mapping", async () => {
    const error: any = new Error("Record not found");
    error.code = "P2025";
    mockSheetsMapping.delete.mockRejectedValue(error);
    expect(await removeEventSheetMapping("nonexistent")).toBe(false);
  });
});
