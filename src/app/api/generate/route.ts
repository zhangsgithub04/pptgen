import { app } from "@/lib/graph";
import { NextRequest, NextResponse } from "next/server";
import { tokenTracker, generateSessionId } from "@/lib/tokenTracker";

export async function POST(req: NextRequest) {
  try {
    const { topic, template, theme, language, imageProvider } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Create a new tracking session
    const sessionId = generateSessionId();
    tokenTracker.createSession(sessionId);

    // This is the input for our graph.
    const inputs = {
      topic,
      template: template || 'modern', // Default to modern template
      theme: theme || null, // Theme information
      language: language || 'en', // Language preference
      imageProvider: imageProvider || 'huggingface', // Default to Hugging Face
      slides: [], // Start with empty slides
      current_slide: 0, // Start at the first slide
      sessionId, // Pass session ID for tracking
    };

    console.log(`Starting presentation generation for topic: ${topic}, template: ${template?.name}, theme: ${theme?.name}, language: ${language}, imageProvider: ${imageProvider}`);
    console.log(`📊 Tracking session: ${sessionId}`);

    // We will stream the output of the graph back to the client.
    const stream = await app.stream(inputs);

    // ReadableStream is a standard Web API. We can use it to stream the response.
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            // The events are JSON objects. We stringify them and encode them as UTF-8.
            const chunk = `data: ${JSON.stringify(event)}

`;
            console.log(`Streaming event: ${Object.keys(event)[0]}`);
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          
          // Send usage report at the end
          const usageReport = tokenTracker.getUsageReport(sessionId);
          console.log('\n' + usageReport);
          
          const usageChunk = `data: ${JSON.stringify({ 
            usage_report: usageReport,
            session_id: sessionId,
            usage_summary: tokenTracker.getSessionUsage(sessionId)
          })}

`;
          controller.enqueue(new TextEncoder().encode(usageChunk));
          
          console.log('Stream completed successfully');
        } catch (streamError: any) {
          console.error('Error in stream processing:', streamError);
          const errorChunk = `data: ${JSON.stringify({ error: { message: streamError.message || 'Stream processing error' } })}

`;
          controller.enqueue(new TextEncoder().encode(errorChunk));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (e: any) {
    console.error("Error in generate route:", e);
    return NextResponse.json({ 
      error: e.message || 'An unexpected error occurred'
    }, { status: 500 });
  }
}
