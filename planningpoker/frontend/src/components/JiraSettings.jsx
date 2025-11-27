import { useState, useEffect } from 'react';
import { Check, Trash2, RefreshCw } from 'lucide-react';
import { jiraAPI } from '../lib/jira-api';
import useStore from '../store/useStore';


export default function JiraSettings() {
  const { user, setUser } = useStore();
  const [jiraSettings, setJiraSettings] = useState({
    jiraUrl: '',
    jiraEmail: '',
    jiraToken: '',
  });
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setJiraSettings({
        jiraUrl: user.jira_url || '',
        jiraEmail: user.jira_email || '',
        jiraToken: '', // We don't pre-fill the token for security reasons
      });
    }
  }, [user]);

  const handleValidate = async () => {
    if (!jiraSettings.jiraUrl || !jiraSettings.jiraEmail || !jiraSettings.jiraToken) {
      setError('All fields are required for validation');
      return;
    }

    setValidating(true);
    setError('');
    setSuccess('');

    try {
      const response = await jiraAPI.validateCredentials({
        ...jiraSettings,
        authType: 'pat',
      });
      setSuccess(`Credentials validated successfully! Connected as ${response.data.user.displayName}`);
    } catch (error) {
      // Check for specific SSL certificate errors
      if (error.response?.data?.error?.includes('SSL Certificate error') || 
          error.response?.data?.error?.includes('SELF_SIGNED_CERT_IN_CHAIN') ||
          error.response?.data?.error?.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE')) {
        setError(
          'SSL Certificate Error: Your Jira instance is using a self-signed certificate. ' +
          'Please ask your administrator to set JIRA_ALLOW_SELF_SIGNED=true in the backend .env file.'
        );
      } else {
        setError(error.response?.data?.error || 'Invalid Jira credentials');
      }
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (!jiraSettings.jiraUrl || !jiraSettings.jiraEmail || !jiraSettings.jiraToken) {
      setError('All fields are required');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await jiraAPI.saveSettings({
        ...jiraSettings,
        authType: 'pat',
      });
      setUser(response.data.user);
      setSuccess('Jira integration enabled successfully!');
      
      // Clear the token from the form for security
      setJiraSettings({
        ...jiraSettings,
        jiraToken: ''
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save Jira settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Jira integration? All saved settings will be removed.')) {
      return;
    }

    setDeleting(true);
    setError('');
    setSuccess('');

    try {
      await jiraAPI.deleteSettings();
      setUser({
        ...user,
        jira_url: null,
        jira_email: null,
        jira_integration_enabled: false,
        has_jira_token: false
      });
      setSuccess('Jira integration disabled successfully');
      
      // Reset the form
      setJiraSettings({
        jiraUrl: '',
        jiraEmail: '',
        jiraToken: ''
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to disconnect Jira');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Jira Integration</h2>
        
        {user?.jira_integration_enabled && (
          <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full">
            <Check size={14} />
            <span className="text-sm font-medium">Connected</span>
          </div>
        )}
      </div>

      {(error || success) && (
        <div className={`p-3 mb-4 rounded-lg ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {error || success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jira URL
          </label>
          <input
            type="url"
            placeholder="https://your-domain.atlassian.net"
            className="input"
            value={jiraSettings.jiraUrl}
            onChange={(e) => setJiraSettings({ ...jiraSettings, jiraUrl: e.target.value })}
          />
          {jiraSettings.jiraUrl?.includes('athenahealth.com') && (
            <p className="text-xs text-amber-600 mt-1">
              Athenahealth Jira detected. Make sure you're connected to the Athenahealth network/VPN.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jira Username/Email
          </label>
          <input
            type="text"
            placeholder="your-email@example.com or username"
            className="input"
            value={jiraSettings.jiraEmail}
            onChange={(e) => setJiraSettings({ ...jiraSettings, jiraEmail: e.target.value })}
          />
          {jiraSettings.jiraUrl?.includes('athenahealth.com') && (
            <p className="text-xs text-amber-600 mt-1">
              For Athenahealth Jira: Use your username without @athenahealth.com
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Personal Access Token
          </label>
          <input
            type="password"
            placeholder={user?.has_jira_token ? "••••••••••••••••" : "Enter your Personal Access Token"}
            className="input"
            value={jiraSettings.jiraToken}
            onChange={(e) => setJiraSettings({ ...jiraSettings, jiraToken: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">
            Personal Access Tokens are the supported authentication method for Jira integration in Planning Poker.
          </p>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="button"
            onClick={handleValidate}
            disabled={validating}
            className="btn btn-secondary flex items-center space-x-1"
          >
            {validating ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            <span>{validating ? 'Validating...' : 'Test Connection'}</span>
          </button>

          {user?.jira_integration_enabled ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex items-center space-x-1"
              >
                {saving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                <span>{saving ? 'Saving...' : 'Update Settings'}</span>
              </button>

              <button
                type="button"
                onClick={handleDisconnect}
                disabled={deleting}
                className="btn btn-danger flex items-center space-x-1"
              >
                {deleting ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                <span>{deleting ? 'Disconnecting...' : 'Disconnect'}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center space-x-1"
            >
              {saving ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              <span>{saving ? 'Saving...' : 'Enable Jira Integration'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
