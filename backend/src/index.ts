require("dotenv").config()

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const main = async ()=>{
    anthropic.messages.stream({
        messages: [{role: 'user', content: "create a couter app"}],
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1024,
    }).on('text', (text) => {
        console.log(text);
    });
    
}

main()