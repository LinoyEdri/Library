import "dotenv/config";
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg";
import { databaseUrl } from "../config/env.ts";

const adapter = new PrismaPg({ 
    connectionString: databaseUrl,
});

const prisma = new PrismaClient({adapter});

export default prisma;
