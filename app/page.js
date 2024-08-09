'use client'
import { Box, Button, Stack, TextField, createTheme, ThemeProvider } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'black',
          },
          '& .MuiInputBase-input': {
            color: 'black', // Text color
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#333',
          },
        },
      },
    },
  },
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
    role: 'assistant',
    content: "Hi, I'm the CoBuildr Support Agent, how can I assist you today?",
  },
])

  const [message, setMessage] = useState('')

  const sendMessage = async()=>{
    setMessage('')
    setMessages((messages)=>[
      ...messages,
      {role:"user", content: message},
      {role:"assistant", content:''},
    ])
    const response = fetch('/api/chat',{
      method: "POST",
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role:"user", content: message}]),
    }).then( async (res)=>{
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({done, value}){
        if (done){
          return result
        }
        const text = decoder.decode(value || new Int8Array(),{stream:true})
        setMessages((messages)=>{
          let lastMessage=messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          console.log([
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ])
        })
        return reader.read().then(processText)
      })
    })
  }
  
  return (
    <ThemeProvider theme={theme}>
  <Box className="w-full h-screen flex justify-center items-center">
    <Stack
    className="flex flex-col w-[50%] h-[80%] border-2 border-black rounded-xl p-2 space-y-3 justify-between bg-[#F8F8FF]">
      <Stack className="flex flex-col space-x-2 space-y-2 flex-grow-1 overflow-auto max-h-screen">
        {messages.map((messages, index)  =>  (
            <Box
            key = {index}
            display = "flex"
            justifyContent={
              message.role=== 'assistant' ? "flex-start" : "flex-end"
              }>
              <Box
              bgcolor={
                message.role === 'assistant' ? 'primary.main' : 'secondary.main'
              }
              color = "white"
              borderRadius={16}
              p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
      </Stack>
      <Stack className="flex flex-row space-x-2">
        <TextField
        className="text-black"
        label = "Message CoGPT"
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        InputLabelProps={{style: {color: 'black'}}}
        />
        <Button className="rounded-md bg-black" variant="contained" onClick={sendMessage}>Send</Button>
      </Stack>
    </Stack>
  </Box>
  </ThemeProvider>
)}
