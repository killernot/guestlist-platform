import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth";

export async function getSession(req?: any, res?: any) {
  return getServerSession(req, res, authOptions);
}
