import OpenAI from 'openai';

export const handleGenerateSummary = async (
  messages: any[],
): Promise<{summary: string}> => {
  // Filter out system messages with "Caveat:"
  const filteredMessages = messages.filter(
    (msg) => !(msg.role === 'system' && msg.content?.includes('Caveat:')),
  );

  // If no messages or only system messages, return a default
  if (filteredMessages.length === 0) {
    return {summary: 'New Session'};
  }

  // Find the first user message as a fallback
  const firstUserMessage = filteredMessages.find((msg) => msg.role === 'user');
  const fallbackSummary =
    firstUserMessage?.content?.slice(0, 100) || 'New Session';

  // Check if we have OpenAI API key
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    console.log('No OpenAI API key found, using fallback summary');
    return {summary: fallbackSummary};
  }

  try {
    const openai = new OpenAI({apiKey});

    // Prepare messages for summarization
    const conversationText = filteredMessages
      .slice(0, 10) // Take first 10 messages to avoid token limits
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that creates concise summaries of conversations. Summarize the main topic or purpose of this conversation in 5-10 words.',
        },
        {
          role: 'user',
          content: `Please summarize this conversation:\n\n${conversationText}`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    const summary =
      response.choices[0]?.message?.content?.trim() || fallbackSummary;
    return {summary};
  } catch (error) {
    console.error('Error generating summary with OpenAI:', error);
    return {summary: fallbackSummary};
  }
};
