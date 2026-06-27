const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Only allow POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      // Parse request body
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return new Response(
          JSON.stringify({ error: 'Invalid JSON' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { token } = body;

      if (!token) {
        return new Response(
          JSON.stringify({ error: 'Missing token' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate Turnstile token
      const validation = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      });

      // Check if the fetch itself succeeded
      if (!validation.ok) {
        const errorText = await validation.text();
        return new Response(
          JSON.stringify({ error: 'Turnstile API error', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const validationData = await validation.json();

      if (validationData.success) {
        // Success: detect request type and respond appropriately
        const acceptHeader = request.headers.get('accept') || '';
        const targetUrl = 'https://helen.tamtham.com';
        
        if (acceptHeader.includes('text/html')) {
          // Browser navigation - return 302 redirect
          return new Response(null, {
            status: 302,
            headers: {
              ...corsHeaders,
              'Location': targetUrl,
            }
          });
        } else {
          // Fetch API call - return JSON with redirectUrl
          return new Response(
            JSON.stringify({ success: true, redirectUrl: targetUrl }),
            { 
              status: 200, 
              headers: { 
                ...corsHeaders,
                'Content-Type': 'application/json' 
              } 
            }
          );
        }
      } else {
        // Failure: return 403
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Verification failed', 
            reasons: validationData['error-codes'] 
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error', message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
};
