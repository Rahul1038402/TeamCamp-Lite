import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, HelpCircle, X, CalendarArrowUp, CalendarArrowDown } from 'lucide-react';
import { useProjects } from '../../contexts/ProjectContext';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showMarkdownGuide, setShowMarkdownGuide] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'completed' | 'on-hold',
    start_date: '',
    end_date: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        setError('End date must be after start date');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      const newProject = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        status: formData.status,
      });

      // Navigate to the newly created project
      navigate(`/projects/${newProject.id}`);
    } catch (err: any) {
      console.error('Create error:', err);
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-3xl font-bold text-text-primary mb-2">Create New Project</h1>
          <p className="text-text-secondary">Set up a new project and start collaborating</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Project Name <span className='text-red-500'>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
              required
              disabled={submitting}
              autoFocus
            />
          </div>

          {/* Description */}
         <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-text-primary">
                Description
              </label>
              <button
                type="button"
                onClick={() => setShowMarkdownGuide(true)}
                className="flex items-center gap-1.5 text-xs text-primary"
                title="Markdown Guide"
              >
                <span>Markdown Guide</span>
                <HelpCircle size={14} />
              </button>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this project about? (Markdown supported)"
              rows={12}
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
              disabled={submitting}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={submitting}
            >
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <CalendarArrowUp size={16} className="inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-3 [color-scheme:dark] bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <CalendarArrowDown size={16} className="inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date}
                className="w-full px-4 py-3 [color-scheme:dark] bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              disabled={submitting}
              className="px-6 py-3 bg-background-secondary border border-border rounded-lg text-text-primary hover:bg-surface transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>

        {/* Markdown Guide Modal */}
        {showMarkdownGuide && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <div className="bg-background-secondary border border-border rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-background-secondary border-b border-border p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Markdown Guide</h3>
                <button
                  onClick={() => setShowMarkdownGuide(false)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Headings</h4>
                  <code className="block bg-surface px-3 py-2 rounded text-xs text-text-secondary font-mono">
                    # Heading 1<br />
                    ## Heading 2<br />
                    ### Heading 3
                  </code>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Text Formatting</h4>
                  <code className="block bg-surface px-3 py-2 rounded text-xs text-text-secondary font-mono">
                    **bold text**<br />
                    *italic text*<br />
                    ~~strikethrough~~
                  </code>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Lists</h4>
                  <code className="block bg-surface px-3 py-2 rounded text-xs text-text-secondary font-mono">
                    - Bullet item<br />
                    - Another item<br />
                    <br />
                    1. Numbered item<br />
                    2. Another item
                  </code>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Links</h4>
                  <code className="block bg-surface px-3 py-2 rounded text-xs text-text-secondary font-mono">
                    [Link text](https://example.com)
                  </code>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Code</h4>
                  <code className="block bg-surface px-3 py-2 rounded text-xs text-text-secondary font-mono">
                    `inline code`<br />
                    <br />
                    ```<br />
                    code block<br />
                    ```
                  </code>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-2">Quotes</h4>
                  <code className="block bg-surface px-3 py-2 rounded text-xs text-text-secondary font-mono">
                    &gt; Blockquote text
                  </code>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-background-secondary border-t border-border p-4">
                <button
                  onClick={() => setShowMarkdownGuide(false)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}