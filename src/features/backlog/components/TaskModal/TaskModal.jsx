import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { X, Trash2, Save } from 'lucide-react';
import { TaskStatus, TaskPriority, TaskStatusLabels, TaskPriorityLabels } from '../../constants';
import { validateTaskData } from '../../BacklogBoard.logic';
import { Button } from '../../../../shared-components/Button';
import { Input } from '../../../../shared-components/Input';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 0.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.theme.colors.border};
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.375rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.375rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ErrorText = styled.span`
  display: block;
  color: ${props => props.theme.colors.error};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.375rem;
  background: ${props => props.theme.colors.background};
  min-height: 42px;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
  border-radius: 0.25rem;
  font-size: 0.875rem;
`;

const TagRemove = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${props => props.theme.colors.primaryDark};
  }
`;

const TagInputField = styled.input`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
  min-width: 100px;
`;

export default function TaskModal({ mode, task, onSubmit, onDelete, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assignee: '',
    labels: [],
    dependencies: [],
    dueDate: ''
  });
  
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || TaskStatus.TODO,
        priority: task.priority || TaskPriority.MEDIUM,
        assignee: task.assignee || '',
        labels: task.labels || [],
        dependencies: task.dependencies || [],
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    }
  }, [mode, task]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.labels.includes(tagInput.trim())) {
        handleChange('labels', [...formData.labels, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    handleChange('labels', formData.labels.filter(t => t !== tag));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateTaskData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await onDelete();
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGroup>
              <Label>Title *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter task title"
                autoFocus
              />
              {errors.title && <ErrorText>{errors.title}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter task description"
              />
              {errors.description && <ErrorText>{errors.description}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Status</Label>
              <Select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {Object.entries(TaskStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                {Object.entries(TaskPriorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Assignee</Label>
              <Input
                type="text"
                value={formData.assignee}
                onChange={(e) => handleChange('assignee', e.target.value)}
                placeholder="Enter assignee name"
              />
            </FormGroup>

            <FormGroup>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
              {errors.dueDate && <ErrorText>{errors.dueDate}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <Label>Labels</Label>
              <TagInput>
                {formData.labels.map(tag => (
                  <Tag key={tag}>
                    {tag}
                    <TagRemove onClick={() => handleRemoveTag(tag)}>
                      <X size={14} />
                    </TagRemove>
                  </Tag>
                ))}
                <TagInputField
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={formData.labels.length === 0 ? "Add labels..." : ""}
                />
              </TagInput>
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <div>
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                >
                  <Trash2 size={14} />
                  Delete
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                <Save size={14} />
                {mode === 'create' ? 'Create Task' : 'Save Changes'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
}