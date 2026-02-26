import readlineSync from 'readline-sync';
import { GeminiEmbedding768 } from './gemini-embedding-768.js';
import * as dotenv from 'dotenv';
dotenv.config();
import { Pinecone } from '@pinecone-database/pinecone';

import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',
    temperature: 0.3,
});




// configure gemini embedding
const embeddings = new GeminiEmbedding768({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-embedding-001',
});
// configure pinecone
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

async function chatting(question){
// Question ki embedding kro
   const queryVector = await embeddings.embedQuery(question); 
// Pinecone index se similar documents find kro

    const searchResults = await pineconeIndex.query({
        topK: 10,
        vector: queryVector,
        includeMetadata: true,
    });

    // console.log(searchResults);

 

// console.log(context + "--------------------------------");
// Similar documents ko combine kro
    const context = searchResults.matches
        .map(match => match.metadata.text)
        .join("\n\n---\n\n");

// Answer return kro
    // Step 4: Create a prompt template
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful assistant who gives questions related to the given question paper based on the provided documentation.

Context from the documentation:
{context}

Question: {question}

Instructions:
- Give all relevent questions present in the given document using ONLY the information from the context above
- If the topic is not in the context, say "There is no relevent question present in the given document."
- Be concise and clear
- Use code examples from the context if relevant

Answer:
        `);

    // Step 5: Create a chain (prompt → model → parser)
    const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
    ]);

    // Step 6: Invoke the chain and get the answer
    const answer = await chain.invoke({
        context: context,
        question: question,
    }); 

    console.log(answer);


}


async function main() {
    const userProblem = readlineSync.question("Ask me anything--> ");
    await chatting(userProblem);
    main();
}


main();