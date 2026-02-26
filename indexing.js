import * as dotenv from 'dotenv';
dotenv.config();
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GeminiEmbedding768 } from './gemini-embedding-768.js';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';


async function indexing () {
    // Step -1 : File ko load karna
    const PDF_PATH = './1.pdf';
    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();
    // console.log(rawDocs.length);\
    //console.log()

    // Step -2 : Chunking create krna
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
    // console.log(chunkedDocs);

    // Step -3 : Embedding configure krna (768 dims for Pinecone spec: dimension 768, metric cosine)
    const embeddings = new GeminiEmbedding768({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'gemini-embedding-001',
    });

    // Sanity check: ensure embeddings work and get vector dimension
    const testVector = await embeddings.embedQuery('test');
    const dimension = testVector?.length ?? 0;
    if (dimension === 0) {
        throw new Error(
            'Embedding API returned empty vectors. Check GEMINI_API_KEY in .env and that gemini-embedding-001 is enabled for your key.'
        );
    }
    console.log('Embedding dimension:', dimension, '(Pinecone index must use this dimension)');

    // Step - 4 : Pinecone index configure krna
    // Index must be created with dimension 768 and metric cosine to match this embedding.
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    try {
        await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
            pineconeIndex,
            maxConcurrency: 5,
        });
        console.log('Documents indexed successfully.');
    } catch (err) {
        if (err.message?.includes('dimension') && err.message?.includes('does not match')) {
            console.error('\nPinecone dimension mismatch: your index was created with a different vector size.');
            console.error('Create a NEW index with dimension 768 and metric cosine at https://app.pinecone.io');
            console.error('Then set PINECONE_INDEX_NAME in .env to the new index name.\n');
        }
        throw err;
    }
}

indexing()