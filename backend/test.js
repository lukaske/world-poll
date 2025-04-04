import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";



const model = new ChatOpenAI({ model: "gpt-4" });

const messages = [
    new SystemMessage("Translate the following from English into Italian"),
    new HumanMessage("hi!"),
  ];
  
let res =  await model.invoke(messages);
console.log(res);
  