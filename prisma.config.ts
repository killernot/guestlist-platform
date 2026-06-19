import { defineConfig } from "@prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://guestlist:guestlist@localhost:5432/guestlist",
  },
});
