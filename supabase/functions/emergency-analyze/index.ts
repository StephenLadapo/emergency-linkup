import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    for (let i = 0; i < binaryChunk.length; i++) bytes[i] = binaryChunk.charCodeAt(i);
    chunks.push(bytes);
    position += chunkSize;
  }
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

function classifyTranscript(text: string) {
  const normalized = (text || '').toLowerCase();
  const keywords = [
    'help', 'emergency', 'please help', 'call police', 'call the police', 'call security', 'i am in danger',
    "i'm in danger", 'attack', 'attacking me', 'rape', 'harass', 'kidnap', 'kidnapping', 'fire', 'gun', 'weapon',
    'stab', 'stabbing', 'bleeding', 'injured', 'ambulance', 'medical emergency', 'scream', 'screaming', 'crying'
  ];
  const matched: string[] = [];
  for (const k of keywords) { if (normalized.includes(k)) matched.push(k); }
  // Confidence heuristic: more matches = higher confidence
  const confidence = Math.min(0.2 + matched.length * 0.2, 0.99);
  const is_emergency = matched.length > 0 || /help|danger|emergency/.test(normalized);
  return { is_emergency, confidence, matched_keywords: matched };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, mimeType } = await req.json();
    if (!audio) throw new Error('No audio provided');

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

    const binaryAudio = processBase64Chunks(audio);
    const blob = new Blob([binaryAudio], { type: mimeType || 'audio/webm' });

    const form = new FormData();
    form.append('file', blob, 'audio.webm');
    form.append('model', 'whisper-1');

    const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: form,
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('OpenAI Whisper error:', errText);
      return new Response(JSON.stringify({ error: 'OpenAI error', details: errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await resp.json();
    const transcript: string = result?.text ?? '';
    const classification = classifyTranscript(transcript);

    console.log('Transcript:', transcript);
    console.log('Classification:', classification);

    return new Response(
      JSON.stringify({ transcript, ...classification }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('emergency-analyze error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
