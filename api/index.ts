import {OKRManagerMCP} from "./OKRManagerMCP.ts";
import {stytchBearerTokenAuthMiddleware} from "./lib/auth";
import {OKRAPI} from "./OKRAPI.ts";
import {cors} from "hono/cors";
import {Hono} from "hono";

// Export the OKRManagerMCP class so the Worker runtime can find it
export {OKRManagerMCP};

export default new Hono<{ Bindings: Env }>()
    .use(cors())

    // Mount the API underneath us
    .route('/api', OKRAPI)

    // Serve the OAuth Protected Resource metadata per the 6-18 Auth specification
    // Note: Certain clients will infer the OPR metadata endpoint instead of taking it from the WWW-Auth header
    // So we should support .well-known/OPR as well as .well-known/OPR/sse and .well-known/OPR/mcp
    .get('/.well-known/oauth-protected-resource/:transport?', async (c) => {
        const url = new URL(c.req.url);
        return c.json({
            resource: url.origin,
            authorization_servers: [`${c.env.STYTCH_DOMAIN}`],
        })
    })

    // Backwards compatibility for the 3-26 Auth Specification, which is still supported by some clients as a fallback
    // Serve the OAuth Authorization Server response for Dynamic Client Registration
    .get('/.well-known/oauth-authorization-server', async (c) => {
        const url = new URL(c.req.url);
        const metadata = {
            issuer: c.env.STYTCH_DOMAIN,
            // Link to the OAuth Authorization screen implemented within the React UI
            authorization_endpoint: `${url.origin}/oauth/authorize`,
            token_endpoint: `${c.env.STYTCH_DOMAIN}/v1/oauth2/token`,
            registration_endpoint: `${c.env.STYTCH_DOMAIN}/v1/oauth2/register`,
            scopes_supported: ['openid', 'email', 'profile', 'read:okrs', 'manage:objectives', 'manage:krs', 'report_kr_status'],
            response_types_supported: ['code'],
            response_modes_supported: ['query'],
            grant_types_supported: ['authorization_code', 'refresh_token'],
            token_endpoint_auth_methods_supported: ['none'],
            code_challenge_methods_supported: ['S256'],
        }
        return c.json(metadata);
    })

    // Let the MCP Server have a go at handling the request
    // This adds SSE Transport support, for backwards compatibility
    .use('/sse/*', stytchBearerTokenAuthMiddleware)
    .route('/sse', new Hono().mount('/', OKRManagerMCP.serveSSE('/sse').fetch))

    // This adds HTTP Streaming support (the new preferred transport)
    .use('/mcp', stytchBearerTokenAuthMiddleware)
    .route('/mcp', new Hono().mount('/', OKRManagerMCP.serve('/mcp').fetch))

    // Finally - serve static assets from Vite
    .mount('/', (req, env) => env.ASSETS.fetch(req))

