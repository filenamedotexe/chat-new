'use client';

import { useState, useEffect } from 'react';
import { Button } from '@chat/ui';
import { Settings2, ToggleLeft, ToggleRight, Plus, Users } from 'lucide-react';
import type { Feature } from '@chat/shared-types';

export function FeatureFlagsManager() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFeature, setNewFeature] = useState({
    name: '',
    description: '',
    enabled: false
  });

  useEffect(() => {
    loadFeatures();
  }, []);

  async function loadFeatures() {
    try {
      const response = await fetch('/api/admin/features');
      if (response.ok) {
        const data = await response.json();
        setFeatures(data);
      }
    } catch (error) {
      console.error('Failed to load features:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFeature(name: string) {
    try {
      const response = await fetch(`/api/admin/features/${name}/toggle`, {
        method: 'POST'
      });
      if (response.ok) {
        await loadFeatures();
      }
    } catch (error) {
      console.error('Failed to toggle feature:', error);
    }
  }

  async function createFeature() {
    try {
      const response = await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeature)
      });
      if (response.ok) {
        setShowCreateForm(false);
        setNewFeature({ name: '', description: '', enabled: false });
        await loadFeatures();
      }
    } catch (error) {
      console.error('Failed to create feature:', error);
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow" data-testid="feature-flags-manager">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Feature Flags
            </h3>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Create New Feature Flag
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Feature Name
              </label>
              <input
                type="text"
                value={newFeature.name}
                onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                placeholder="e.g., advancedAnalytics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
                rows={2}
                placeholder="Describe what this feature enables..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enabled"
                checked={newFeature.enabled}
                onChange={(e) => setNewFeature({ ...newFeature, enabled: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="enabled" className="text-sm text-gray-700 dark:text-gray-300">
                Enable immediately
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={createFeature} size="sm">
                Create Feature
              </Button>
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewFeature({ name: '', description: '', enabled: false });
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {features.map((feature) => (
          <div key={feature.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {feature.name}
                  </h4>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      feature.enabled
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {feature.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {feature.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {feature.description}
                  </p>
                )}
                {feature.enabledFor && feature.enabledFor.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="h-3 w-3" />
                    <span>Enabled for {feature.enabledFor.length} specific users</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleFeature(feature.name)}
                className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title={feature.enabled ? 'Disable feature' : 'Enable feature'}
                data-testid={`toggle-${feature.name}`}
              >
                {feature.enabled ? (
                  <ToggleRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {features.length === 0 && (
        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
          <Settings2 className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-sm">No feature flags configured yet.</p>
          <p className="text-sm mt-1">Create your first feature flag to get started.</p>
        </div>
      )}
    </div>
  );
}