import { NextResponse } from 'next/server';

// Helper function to generate bot responses using Atoma LLM
async function generateBotResponse(message: string, context: string) {
  try {
    const response = await fetch('https://api.atoma.network/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ATOMA_API_KEY || 'YOUR_ATOMA_API_KEY'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stream: false,
        model: "deepseek-ai/DeepSeek-R1",
        messages: [{
          role: "system",
          content: `You are W Bot, a helpful and encouraging language learning assistant in the RoboLingo app. 
          Always respond in a supportive, motivational way. Keep responses concise (under 100 words).
          
          If the user is writing in a foreign language, recognize their effort and provide gentle corrections if needed.
          When appropriate, suggest useful phrases, vocabulary, or learning tips.
          
          First think through your response, and put your thoughts after a <think> tag and before a </think> tag.
          Then provide your final response after the </think> tag. ONLY the content after the </think> tag will be shown to the user.
          
          Current context: ${context}`
        }, {
          role: "user",
          content: message
        }],
        max_tokens: 1024
      })
    });

    const data = await response.json();
    const fullContent = data.choices[0].message.content.trim();
    
    // Extract only the content after </think> tag
    const thinkEndIndex = fullContent.indexOf('</think>');
    if (thinkEndIndex !== -1) {
      return fullContent.substring(thinkEndIndex + 9).trim(); // 9 is the length of '</think>'
    }
    
    // If no </think> tag, return the full content
    return fullContent;
  } catch (error) {
    console.error('Error generating bot response:', error);
    return "Sorry, I'm having trouble connecting right now. Please try again later!";
  }
}

export async function POST(req: Request) {
  try {
    const { message, groupId, language } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create context based on group info
    let context = "This is a language learning chat group.";
    
    if (groupId === 'korean-gang') {
      context = "This is the Korean Gang group. The user is learning Korean in the Korean Basics challenge. Their progress is 18%, and they need to complete daily lessons.";
    } else if (groupId === 'samurai-squad') {
      context = "This is the Samurai Squad group. The user is learning Japanese in an immersive challenge. Their progress is 10%, and they're practicing 45 minutes daily.";
    } else if (language) {
      context = `This is a ${language} learning group. The user is just starting their ${language} language journey.`;
    }

    // Generate response
    const botResponse = await generateBotResponse(message, context);

    return NextResponse.json({
      success: true,
      response: botResponse
    });
    
  } catch (error) {
    console.error('Error in bot response endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
