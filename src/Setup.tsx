import {ReactNode} from "react";


export default function Setup({children}: { children: ReactNode }) {
    if (!import.meta.env.VITE_STYTCH_PUBLIC_TOKEN) {
        return (
            <div className="error-screen">
                <h1>Error: Stytch Not Configured Yet</h1>
                
                <div className="error-content">
                    <p className="error-intro">
                    Full setup instructions are available in the{' '}
                        <a href="https://github.com/stytchauth/mcp-stytch-b2b-okr-manager">README</a>.
                    </p>

                    <div className="error-section">
                        <h2>Required Environment Variables</h2>
                        <p>Make sure you have configured the following:</p>
                        <ul className="env-vars">
                            <li><code>VITE_STYTCH_PUBLIC_TOKEN</code> in your <code>.env.local</code></li>
                            <li><code>STYTCH_PROJECT_ID</code> in your <code>.dev.vars</code></li>
                            <li><code>STYTCH_PROJECT_SECRET</code> in your <code>.dev.vars</code></li>
                            <li><code>STYTCH_DOMAIN</code> in your <code>.dev.vars</code></li>
                        </ul>
                    </div>
                    <div className="error-section">
                        <h2>Required RBAC Policy</h2>
                        <p>
                            If you have not done so already, create a <a href="https://stytch.com/dashboard/settings/management-api">Management API Key</a> and run the following:
                        </p>
                        <div className="code-block">
                            <code>npm update-policy.js --project-id $STYTCH_PROJECT_ID --key-id $MANAGEMENT_API_KEY_ID --secret $MANAGEMENT_API_SECRET</code>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return children;
}