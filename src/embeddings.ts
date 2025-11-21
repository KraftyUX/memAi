import { pipeline, Pipeline } from '@xenova/transformers';

// Singleton to hold the pipeline
let extractor: any = null;

/**
 * Initialize the embedding pipeline
 */
async function getExtractor() {
    if (!extractor) {
        // Use a small, efficient model suitable for local execution
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
}

/**
 * Generate embedding for a text string
 * @param {string} text 
 * @returns {Promise<number[]>} Array of numbers representing the embedding
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return null;
    }

    try {
        const pipe = await getExtractor();
        const output = await pipe(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
}

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} Similarity score (-1 to 1)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
