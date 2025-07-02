import OpenAI from 'openai';
import type {Logger} from '@kit/logger/types';

export const handleGenerateSummary = async (
  messages: any[],
  logger: Logger,
): Promise<{summary: string}> => {
  logger.info('Generating summary for messages', {
    messageCount: messages.length,
    firstMessagePreview: messages[0]?.message?.content?.slice(0, 100) || messages[0]?.content?.slice(0, 100),
    messageTypes: messages.map(m => m.type || 'unknown').slice(0, 5),
  });
  
  // Extract actual message content from JSONL entries
  const extractedMessages = messages
    .filter(entry => entry.message && entry.message.role && entry.message.content)
    .map(entry => ({
      role: entry.message.role,
      content: entry.message.content
    }));
  
  logger.info('Extracted messages', {
    extractedCount: extractedMessages.length,
    firstExtracted: extractedMessages[0]?.content?.slice(0, 100),
  });
  
  // Filter out system messages with "Caveat:"
  const filteredMessages = extractedMessages.filter(
    (msg) => !(msg.role === 'system' && msg.content?.includes('Caveat:')),
  );

  // If no messages or only system messages, return a default
  if (filteredMessages.length === 0) {
    return {summary: 'New Session'};
  }

  // Find the first user message as a fallback
  const firstUserMessage = filteredMessages.find((msg) => msg.role === 'user');
  
  // Try to create a better fallback summary
  let fallbackSummary = 'New Session';
  if (firstUserMessage?.content) {
    const content = firstUserMessage.content.toLowerCase();
    
    // Try to extract key action words
    if (content.includes('fix') && content.includes('error')) {
      fallbackSummary = 'Fix errors';
    } else if (content.includes('fix') && content.includes('bug')) {
      fallbackSummary = 'Fix bug';
    } else if (content.includes('add') || content.includes('create')) {
      fallbackSummary = 'Add feature';
    } else if (content.includes('update') || content.includes('change')) {
      fallbackSummary = 'Update code';
    } else if (content.includes('refactor')) {
      fallbackSummary = 'Refactor code';
    } else if (content.includes('test')) {
      fallbackSummary = 'Add tests';
    } else if (content.includes('debug')) {
      fallbackSummary = 'Debug issue';
    } else if (content.includes('implement')) {
      fallbackSummary = 'Implement feature';
    } else {
      // If no clear action, use first few words
      const words = content.split(/\s+/).slice(0, 5).join(' ');
      fallbackSummary = words.length > 50 ? words.slice(0, 47) + '...' : words;
    }
  }

  // Check if we have OpenAI API key
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    logger.debug('No OpenAI API key found, using fallback summary');
    return {summary: fallbackSummary};
  }

  try {
    const openai = new OpenAI({apiKey});

    // Prepare messages for summarization - only include user and assistant messages
    const conversationMessages = filteredMessages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .slice(-10); // Take last 10 messages to get recent context
      
    const conversationText = conversationMessages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that creates concise, action-oriented titles for coding sessions. Create a title that describes what work is being done, similar to a git commit message. Use imperative mood (e.g., "Fix auth bug", "Add user dashboard", "Refactor API endpoints"). Keep it to 3-6 words maximum. Focus on the task or feature being worked on, not questions asked.',
        },
        {
          role: 'user',
          content: `Based on this conversation, create a short action-oriented title that describes what work is being done:\n\n${conversationText}`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const summary =
      response.choices[0]?.message?.content?.trim() || fallbackSummary;
    return {summary};
  } catch (error) {
    logger.error('Error generating summary with OpenAI', {error});
    return {summary: fallbackSummary};
  }
};
