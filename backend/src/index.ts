require("dotenv").config()

import Anthropic from "@anthropic-ai/sdk";
import { getSystemPrompt } from "./prompts";
import express from "express"
import { TextBlock } from "@anthropic-ai/sdk/resources";
import {basePrompt as nodePrompt} from "./defaults/node"
import {basePrompt as reactPrompt} from "./defaults/react"

const anthropic = new Anthropic();

const app = express()
app.use(express.json())

app.post("/template", async (req,res)=>{
    const prompt = req.body.prompts

    const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 200,
        messages: [
          {"role": "user", "content": prompt}
        ],
        system : "Return node or react based on what you think the project should be. Don't return any other thing. Only return node if it is node project or react if it is react Project."
      });

    const projectType = (response.content[0] as TextBlock).text

    if(projectType === "node"){
        res.json({
            promts : `Project Files:\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n${nodePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json`
        })
        return
    }
    else if(projectType === "react"){
        res.json({
            promts : `Project Files:\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n${reactPrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n  - .bolt/prompt`,
            uiPrompts : "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags."
        })
        return 
    }
    res.status(403).json({"message" : "You can not access this."})
    return
})

app.listen(3000)

const main = async ()=>{
    anthropic.messages.stream({
        system : getSystemPrompt(),
        messages: [
            {
                role: 'user',
                content: `Project Files:\n\nThe following is a list of all project files and their complete contents that are currently visible and accessible to you.\n\n{basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n  - .bolt/prompt`

            },
            {
                role : "user",
                content : "For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags."

            }
        ],
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1024,
    }).on('text', (text) => {
        console.log(text);
    });
    
}

// main()