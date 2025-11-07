import { Groq } from 'groq-sdk';
import { env } from './env';
import { db } from './db';
import { conversation, entry } from './db/schema';
import type { Entry } from './db/schema';
import { eq, desc, and } from 'drizzle-orm';

/**
 * AI Conversational Companion
 * Provides context-aware conversations about journal entries and mood patterns
 * Uses Groq API with llama-3.1-8b-instant model
 */

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

// Fixed configuration - Groq with llama-3.1-8b-instant
const MODEL = 'llama-3.1-8b-instant';

const FALLBACK_RESPONSE = "I'm here to listen.";
const FALLBACK_FOLLOW_UP = "How are you feeling about what you've written?";

/**
 * Initialize Groq client
 */
function getGroqClient(): Groq {
	const apiKey = env.GROQ_API_KEY;
	if (!apiKey) {
		throw new Error('Groq API key is not configured. Please set GROQ_API_KEY in your environment.');
	}
	return new Groq({ apiKey });
}

/**
 * Run chat completion with Groq
 */
async function runChatCompletion(
	messages: Message[],
	opts: {
		maxTokens: number;
		temperature: number;
	}
): Promise<string> {
	try {
		const groq = getGroqClient();
		
		const completion = await groq.chat.completions.create({
			model: MODEL,
			messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
			max_tokens: opts.maxTokens,
			temperature: opts.temperature
		});

		const content = completion.choices[0]?.message?.content?.trim();
		return content || FALLBACK_RESPONSE;
	} catch (error) {
		console.error('Groq API error:', error);
		if (error instanceof Error && error.message.includes('API key')) {
			throw new Error('Invalid or missing Groq API key. Please check your GROQ_API_KEY environment variable.');
		}
		throw new Error(`Failed to communicate with Groq: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Get conversation history for context
 */
export async function getConversationHistory(userId: string, entryId?: string, limit: number = 10) {
	const query = entryId
		? and(eq(conversation.userId, userId), eq(conversation.entryId, entryId))
		: eq(conversation.userId, userId);

	const messages = await db
		.select()
		.from(conversation)
		.where(query)
		.orderBy(desc(conversation.createdAt))
		.limit(limit)
		.all();

	return messages.reverse(); // Oldest first for context
}

/**
 * Save a conversation message
 */
export async function saveMessage(
	userId: string,
	role: 'user' | 'assistant',
	content: string,
	entryId?: string
) {
	await db.insert(conversation).values({
		id: crypto.randomUUID(),
		userId,
		entryId: entryId ?? null,
		role,
		content,
		createdAt: new Date()
	});
}

/**
 * Build context from recent journal entries
 */
async function buildJournalContext(userId: string, entryId?: string): Promise<string> {
	const recentEntries = await db
		.select()
		.from(entry)
		.where(eq(entry.userId, userId))
		.orderBy(desc(entry.createdAt))
		.limit(5)
		.all();

	if (recentEntries.length === 0) {
		return 'The user has not written any journal entries yet.';
	}

	// If specific entry is referenced, highlight it
	const currentEntry = entryId ? recentEntries.find((e) => e.id === entryId) : recentEntries[0];

	let context = `Recent journal entries:\n\n`;

	if (currentEntry) {
		const date = new Date(currentEntry.createdAt).toLocaleDateString();
		const sentiment =
			currentEntry.sentimentLabel === 'POSITIVE'
				? '😊 positive'
				: currentEntry.sentimentLabel === 'NEGATIVE'
					? '😔 negative'
					: '😐 neutral';

		context += `Most recent entry (${date}, ${sentiment}):\n"${currentEntry.content}"\n\n`;

		if (recentEntries.length > 1) {
			context += `Previous entries:\n`;
			recentEntries
				.filter((e) => e.id !== currentEntry.id)
				.forEach((e) => {
					const entryDate = new Date(e.createdAt).toLocaleDateString();
					const entrySentiment =
						e.sentimentLabel === 'POSITIVE' ? '😊' : e.sentimentLabel === 'NEGATIVE' ? '😔' : '😐';
					context += `- ${entryDate} ${entrySentiment}: "${e.content.substring(0, 100)}${e.content.length > 100 ? '...' : ''}"\n`;
				});
		}
	}

	return context;
}

/**
 * Generate a thoughtful follow-up question after entry creation
 */
export async function generateFollowUpQuestion(
	userId: string,
	entryId: string
): Promise<string> {
	try {
		const context = await buildJournalContext(userId, entryId);

		const systemPrompt = `You are a compassionate AI companion for a mood journal app. Your role is to ask ONE thoughtful, open-ended follow-up question after the user writes a journal entry. 

Guidelines:
- Be warm, empathetic, and non-judgmental
- Ask questions that encourage deeper reflection
- Keep questions concise (1-2 sentences max)
- Don't give advice unless explicitly asked
- Use the journal context to make questions relevant
- Avoid repetitive questions
- Focus on emotions, thoughts, or patterns you notice

${context}`;

		const promptMessage: Message = {
			role: 'user',
			content: 'I just finished writing this journal entry. Ask me one thoughtful follow-up question.'
		};

		return await runChatCompletion(
			[{ role: 'system', content: systemPrompt }, promptMessage],
			{ maxTokens: 100, temperature: 0.8 }
		);
	} catch (error) {
		console.error('Error generating follow-up question:', error);
		return FALLBACK_FOLLOW_UP;
	}
}

/**
 * Chat with the AI companion
 */
export async function chat(
	userId: string,
	userMessage: string,
	entryId?: string
): Promise<string> {
	try {
		// Save user message
		await saveMessage(userId, 'user', userMessage, entryId);

		// Get conversation history and journal context
		const history = await getConversationHistory(userId, entryId, 10);
		const journalContext = await buildJournalContext(userId, entryId);

		// Retrieve similar entries using RAG
		let ragContext = '';
		try {
			const similarEntries = await retrieveSimilarEntries(userMessage, userId, 3, entryId);
			if (similarEntries.length > 0) {
				ragContext =
					'\n\nRelevant past entries for additional context:\n' +
					similarEntries
						.map(({ entry, similarity }) => {
							const date = new Date(entry.createdAt).toLocaleDateString();
							const sentiment =
								entry.sentimentLabel === 'POSITIVE'
									? '😊'
									: entry.sentimentLabel === 'NEGATIVE'
										? '😔'
										: '😐';
							return `${date} ${sentiment} (relevance: ${(similarity * 100).toFixed(0)}%):\n"${entry.content}"`;
						})
						.join('\n\n');
			}
		} catch {
			// RAG is optional - continue without it if it fails
			console.log('Continuing without RAG context');
		}

		const systemPrompt = `You are a compassionate AI companion for a mood journal app. Your role is to help users reflect on their emotions, identify patterns, and gain insights from their journal entries.

Guidelines:
- Be warm, empathetic, and genuinely curious
- Listen actively and validate emotions
- Help identify patterns across entries
- Ask clarifying questions when appropriate
- Offer gentle insights, not advice
- Respect privacy and maintain confidentiality
- Keep responses conversational (2-4 sentences)
- Use the journal context and any relevant past entries to provide personalized support

${journalContext}${ragContext}`;

		// Build messages array
		const messages: Message[] = [
			{ role: 'system', content: systemPrompt },
			...history.map(
				(msg): Message => ({
					role: msg.role as 'user' | 'assistant',
					content: msg.content
				})
			),
			{ role: 'user', content: userMessage }
		];

		const assistantMessage = await runChatCompletion(messages, {
			maxTokens: 300,
			temperature: 0.7
		});

		// Save assistant response
		await saveMessage(userId, 'assistant', assistantMessage, entryId);

		return assistantMessage;
	} catch (error) {
		console.error('Error in chat:', error);
		// Save fallback response
		await saveMessage(userId, 'assistant', FALLBACK_RESPONSE, entryId);
		return FALLBACK_RESPONSE;
	}
}

/**
 * Clear conversation history
 */
export async function clearConversation(userId: string, entryId?: string) {
	const query = entryId
		? and(eq(conversation.userId, userId), eq(conversation.entryId, entryId))
		: eq(conversation.userId, userId);

	await db.delete(conversation).where(query);
}

/**
 * Store embedding for a journal entry (Disabled - requires separate embedding service)
 */
export async function storeEntryEmbedding(entryId: string): Promise<void> {
	// Embedding generation disabled - would require separate embedding API service
	console.log('Entry embedding storage skipped for entry:', entryId);
}

/**
 * Retrieve similar entries based on semantic similarity (Disabled - requires embeddings)
 */
export async function retrieveSimilarEntries(
	_query: string,
	_userId: string,
	_limit: number = 5,
	_entryIdToExclude?: string
): Promise<Array<{ entry: Entry; similarity: number }>> {
	// RAG disabled - would require embedding service
	return [];
}
