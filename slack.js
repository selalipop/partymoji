import { readFileSync, writeFileSync } from 'fs';

const { WebClient } = require('@slack/client');

let token = readFileSync(".token", "utf8");

const clientId = process.env.SLACK_CLIENT_ID;
const clientSecret = process.env.SLACK_CLIENT_SECRET;
const web = new WebClient(token);

const aliasEmojiPrefix = "alias:"
export class SlackClient{
    constructor(){
        this.token = ""
    }

    setTokenFromOauthCode(code){
        return web.oauth.access({ 
            client_id: clientId,
            client_secret: clientSecret,
            code: code
        }).then(result=>{
            if(result.ok){
                console.log(result)
                token = result["access_token"]
                web.token = token
                writeFileSync(".token",token)
                Promise.resolve(result["access_token"])
            }else{
                Promise.reject(result.error)
            }
        })
    }

    
    
    getUrlForEmoji(emojiName){
        return web.emoji.list().then(result =>{
            let url = result["emoji"][emojiName]

            while(url.startsWith(aliasEmojiPrefix)){
                let aliasedEmoji = url.slice(aliasEmojiPrefix.length)
                url = result["emoji"][aliasedEmoji]
            }

            if (result.ok && url){
                return Promise.resolve(url)
            }else{
                return Promise.reject(result.error || "Emoji Not Found")
            }
        })
    }
}