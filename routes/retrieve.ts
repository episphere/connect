import { Context as KoaContext } from 'koa'
import * as fs from 'fs'

export async function retrieveFiles(ctx: KoaContext): Promise<void> {
    // Return a (paginated?) list of all submissions corresponding to that API key.
    ctx.status = 200
}

export async function retrieveFile(ctx: KoaContext): Promise<void> {
    // Retrieve data based on the user's API Key, and depending on whether they passed in a submission ID, case ID or both.
    ctx.status = 200
}

export async function retrieveCase(ctx: KoaContext): Promise<void> {
    // Retrieve data of a specific case. The data returned should be the most recently updated submission for that case, or,
    // if the submission Id is passed in the REST call, the data of that case from that submission ID.
    ctx.status = 200
}