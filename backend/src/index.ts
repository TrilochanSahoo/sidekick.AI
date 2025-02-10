require("dotenv").config()

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const main = async ()=>{
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      temperature: 1,
      messages: [{
        role: "user",
        content : "what is the capital of india?"
      }]
    });
    console.log(msg);
}

main()