import { IntegrationBase } from "@budibase/types"
import fetch from "node-fetch"

interface Query {
  method: string
  body?: string
  headers?: { [key: string]: string }
}

function buildUrl(baseUrl: string, params:object) {
  const query = Object.entries(params)
    .filter(([key, value]) => value != null && key != 'fields' && value != "")  // Filter out null or undefined values
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`) // Encode key and value
    .join('&'); // Join parameters with '&'

  return query ? `${baseUrl}?${query}` : baseUrl; // Append query string if there are parameters
}

class CustomIntegration implements IntegrationBase {
  private readonly url: string
  private readonly key: string

  constructor(config: { url: string; api_key: string, read:string }) {
    this.url = config.url
    this.key = config.api_key
  }

  async request(url: string, opts: Query) {
    const response = await fetch(url, opts)
    if (response.status <= 300) {
      try {
        const contentType = response.headers.get("content-type")
        if (contentType?.includes("json")) {
          return await response.json()
        } else {
          return await response.text()
        }
      } catch (err) {
        return await response.text()
      }
    } else {
      const err = await response.text()
      throw new Error(err)
    }
  }

  async read(query: {key:string, fields: string,input: string,place_id: string, sessiontoken: string,extra: { [key: string]: string } }) {
    const opts = {
      method: "GET",
    }
    
    if (query.extra.type === "autocompleter"){
      const opts = {
        method: "GET",
      }
      let concat_url = this.url.concat('autocomplete/json')
      query['key']=this.key
      return this.request(buildUrl(concat_url, query), opts)
    }
    else if (query.extra.type === "details"){
      const opts = {
        method: "GET",
      }
  
      let concat_url = this.url.concat('details/json')
      query['key']=this.key
      return this.request(buildUrl(concat_url, query), opts)
    }
    else {
      return "Select a valid type"
    }

    

  }

  async details(query: { place_id: string, sessiontoken: string, fields:string, key:string}) {
    const opts = {
      method: "GET",
    }

    let concat_url = this.url.concat('details/json')
    query['key']=this.key


    return this.request(buildUrl(concat_url, query), opts)
  }


}

export default CustomIntegration
