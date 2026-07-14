const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const STATE_COOKIE = 'decap_oauth_state';

function randomState() {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
    const cookie = request.headers.get('Cookie') || '';
    const parts = cookie.split(';').map((part) => part.trim());
    const prefix = `${name}=`;
    const match = parts.find((part) => part.startsWith(prefix));
    return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}

function html(body, status = 200) {
    return new Response(body, {
        status,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
}

function fail(message, status = 400) {
    return html(`<!doctype html><meta charset="utf-8"><p>${message}</p>`, status);
}

async function handleAuth(request, env) {
    if (!env.CLIENT_ID) {
        return fail('Missing CLIENT_ID secret.', 500);
    }

    const state = randomState();
    const redirectUri = new URL('/callback', request.url).toString();
    const url = new URL(GITHUB_AUTHORIZE_URL);

    url.searchParams.set('client_id', env.CLIENT_ID);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', env.SCOPE || 'repo,user:email');
    url.searchParams.set('state', state);

    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString(),
            'Set-Cookie': `${STATE_COOKIE}=${encodeURIComponent(state)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
            'Cache-Control': 'no-store'
        }
    });
}

async function handleCallback(request, env) {
    if (!env.CLIENT_ID || !env.CLIENT_SECRET) {
        return fail('Missing CLIENT_ID or CLIENT_SECRET secret.', 500);
    }

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const storedState = readCookie(request, STATE_COOKIE);

    if (!code) {
        return fail('Missing GitHub code.');
    }

    if (!state || state !== storedState) {
        return fail('Invalid OAuth state.');
    }

    const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'decap-oauth-worker'
        },
        body: JSON.stringify({
            client_id: env.CLIENT_ID,
            client_secret: env.CLIENT_SECRET,
            code
        })
    });

    const tokenBody = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenBody.access_token) {
        return fail(tokenBody.error_description || tokenBody.error || 'GitHub token exchange failed.', 502);
    }

    const payload = JSON.stringify({
        token: tokenBody.access_token,
        provider: 'github'
    }).replace(/</g, '\\u003c');

    return html(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Authorizing</title>
  </head>
  <body>
    <script>
      (function () {
        var data = ${payload};
        function receiveMessage(event) {
          window.opener.postMessage('authorization:github:success:' + JSON.stringify(data), event.origin);
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
  </body>
</html>`, 200);
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        if (url.pathname === '/auth') {
            return handleAuth(request, env);
        }

        if (url.pathname === '/callback') {
            return handleCallback(request, env);
        }

        return new Response('Not found', { status: 404 });
    }
};
