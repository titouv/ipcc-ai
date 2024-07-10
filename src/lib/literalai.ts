import { LiteralClient } from "@literalai/client";

export const literalClient = new LiteralClient(process.env["LITERAL_API_KEY"]); // This is the default and can be omitted
