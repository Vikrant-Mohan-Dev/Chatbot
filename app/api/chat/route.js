import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = 'You are an AI chatbot designed to assist users with inquiries about Cobuildr, a platform that connects people to collaborate on projects. Cobuildr users can either host their own projects or join existing ones. Your primary function is to provide clear and informative responses to user queries about the platform, its features, and the signup process. Be patient, helpful, and empathetic in your interactions. Key points to address in your responses: 1.Clearly explain the concept of hosting and joining projects. 2.Provide information about the benefits of using Cobuildr.3.Guide users through the signup process.4.Offer troubleshooting assistance for common issues.5.Direct users to relevant resources or support channels when necessary.6.If you are unsure its ok to say so and offer to connect the user with a human representative'

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
            role: "system", content: systemPrompt
        },
        ...data,
    ],
    model: "gpt-4o-mini",
    stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch (err){
                controller.error(err)
            } finally{
                controller.close()
            }            
        }
        }
    )
    return new NextResponse(stream)
    }
    