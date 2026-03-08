
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

export async function chatting(question) {
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

Context from the documentation (which may have mangled math due to PDF extraction OCR):
{context}

Question: {question}

Instructions:
- Give all relevant questions present in the given document using ONLY the information from the context above.
- If the topic is not in the context, say "There is no relevant question present in the given document."
- Be concise and clear.
- CRITICAL MATHEMATICS INSTRUCTION: The context text extracted from the PDF will often contain severely mangled and broken mathematical formulas (e.g. "lim x 1 2x 3 ->", "()() x2 x 1", "x0tan"). You are an expert at inferring the real mathematical meaning from this broken text.
- You MUST reconstruct all math expressions into beautifully formatted, perfectly valid LaTeX notation.
- NEVER use backticks formatting for math equations or variables. Use LaTeX.
- ALWAYS wrap inline math notation in single dollar signs like this: $f(x) = x^2$
- ALWAYS wrap block math equations in double dollar signs like this: $$ \lim_{{x \to 0}} \frac{{\sin x}}{{x}} = 1 $$
- CRITICAL FORMATTING: You MUST format the output as a Markdown bulleted list.
- Add an empty blank line between every single bullet point so the UI has proper vertical spacing.

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

    // Dynamically retrieve the exact PDF filename that Pinecone found the answer from
    const rawSources = searchResults.matches.map(m => m.metadata.source).filter(Boolean);
    const uniqueFiles = [...new Set(rawSources)].map(src => src.split(/[/\\]/).pop());

    return { answer, sources: uniqueFiles };
}