import { GoogleGenerativeAI } from '@google/generative-ai';
import { Embeddings } from '@langchain/core/embeddings';
import { chunkArray } from '@langchain/core/utils/chunk_array';

/**
 * Gemini embeddings with outputDimensionality: 768 for Pinecone indexes
 * that use dimension 768 and cosine metric (e.g. Pinecone's recommended spec).
 */
export class GeminiEmbedding768 extends Embeddings {
    constructor({ apiKey, model = 'gemini-embedding-001', maxBatchSize = 100 } = {}) {
        super({});
        this.apiKey = apiKey;
        this.model = model?.replace(/^models\//, '') ?? 'gemini-embedding-001';
        this.maxBatchSize = maxBatchSize;
        this.client = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: this.model });
    }

    _request(text) {
        return {
            content: { role: 'user', parts: [{ text: text.replace(/\n/g, ' ') }] },
            outputDimensionality: 768,
        };
    }

    async embedQuery(text) {
        const req = this._request(text);
        const res = await this.client.embedContent(req);
        return res.embedding?.values ?? [];
    }

    async embedDocuments(documents) {
        const chunks = chunkArray(documents, this.maxBatchSize);
        const allEmbeddings = [];
        for (const chunk of chunks) {
            const requests = chunk.map((doc) => this._request(doc));
            const batch = await this.client.batchEmbedContents({ requests });
            const vectors = (batch.embeddings ?? []).map((e) => e.values ?? []);
            allEmbeddings.push(...vectors);
        }
        return allEmbeddings;
    }
}
