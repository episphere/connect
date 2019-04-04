import * as Koa from 'koa'

async function getValidKeys() : Promise<Array<string>> {
    /* Function should retrieve validated keys from somewhere, preferably from a DB behind authentication. 
    * Return array of all assigned keys, or maybe get key corresponding to the provided site ID if that is present in the request body.
    * Return a singleton with hardcoded key for now. */
   return ["Hello Mark"]
}

export async function isAPIKeyValid(ctx: Koa.Context) : Promise<boolean> {
    /* Return if the API key in the request is a valid one. */
    const { key } = ctx.request.headers
    if (!key) {
        return false
    }
    let isValid = false
    const createdKeys = await getValidKeys()
    if(createdKeys.includes(key)) {
        isValid = true
    }
    return isValid
}