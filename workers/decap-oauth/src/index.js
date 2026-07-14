const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const STATE_COOKIE = 'decap_oauth_state';
const CMS_ORIGIN = 'https://vanhuy.r2b.io.vn';

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
    const redirectUri = new URL('/callback', request.url).toString();

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
            code,
            redirect_uri: redirectUri
        })
    });

    const tokenBody = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenBody.access_token) {
        return fail(`GitHub token exchange failed: ${tokenBody.error_description || tokenBody.error || 'Unknown error'}`, 502);
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
    <p>Authorizing...</p>
    <script>
      (function () {
        var data = ${payload};
        var message = 'authorization:github:success:' + JSON.stringify(data);
        var sent = false;

        function finish(shouldClose) {
          if (!window.opener) {
            document.body.innerHTML = '<p>Authentication complete. You can close this window and return to the CMS.</p>';
            return;
          }

          window.opener.postMessage(message, '${CMS_ORIGIN}');
          sent = true;

          if (shouldClose) {
            window.setTimeout(function () {
              window.close();
            }, 300);
          }
        }

        function receiveMessage(event) {
          if (event.origin !== '${CMS_ORIGIN}') {
            return;
          }

          window.removeEventListener('message', receiveMessage, false);
          finish(true);
        }

        window.addEventListener('message', receiveMessage, false);

        if (window.opener) {
          window.opener.postMessage('authorizing:github', '*');
          var attempts = 0;
          var interval = window.setInterval(function () {
            attempts += 1;
            if (sent || attempts > 10) {
              window.clearInterval(interval);
              return;
            }
            finish(false);
          }, 500);
        } else {
          finish(false);
        }
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
