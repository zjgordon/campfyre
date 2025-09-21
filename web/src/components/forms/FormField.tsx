import React from 'react';
import {
  TextField,
  FormControl,
  FormHelperText,
  FormControlLabel,
  Checkbox,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import { Controller, Control } from 'react-hook-form';

interface BaseFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  options: Array<{ value: string | number; label: string }>;
  multiple?: boolean;
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked?: boolean;
}

interface SwitchFieldProps extends BaseFieldProps {
  checked?: boolean;
}

// Text field component
export const FormTextField: React.FC<TextFieldProps> = ({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  helperText,
  fullWidth = true,
  multiline = false,
  rows,
  maxLength,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          type={type}
          label={label}
          placeholder={placeholder || ''}
          required={required}
          disabled={disabled}
          fullWidth={fullWidth}
          multiline={multiline}
          {...(rows && { rows })}
          inputProps={{ maxLength }}
          error={!!error}
          helperText={error?.message || helperText}
          variant="outlined"
          margin="normal"
        />
      )}
    />
  );
};

// Select field component
export const FormSelectField: React.FC<SelectFieldProps> = ({
  name,
  control,
  label,
  options,
  required = false,
  disabled = false,
  helperText,
  fullWidth = true,
  multiple = false,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl
          fullWidth={fullWidth}
          margin="normal"
          required={required}
          disabled={disabled}
          error={!!error}
        >
          <InputLabel>{label}</InputLabel>
          <Select
            {...field}
            label={label}
            multiple={multiple}
            value={field.value || (multiple ? [] : '')}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error?.message || helperText) && (
            <FormHelperText>{error?.message || helperText}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

// Checkbox field component
export const FormCheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  control,
  label,
  required = false,
  disabled = false,
  helperText,
  checked = false,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                {...field}
                checked={field.value || checked}
                disabled={disabled}
                required={required}
              />
            }
            label={label}
          />
          {(error?.message || helperText) && (
            <FormHelperText error={!!error}>
              {error?.message || helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
};

// Switch field component
export const FormSwitchField: React.FC<SwitchFieldProps> = ({
  name,
  control,
  label,
  required = false,
  disabled = false,
  helperText,
  checked = false,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box>
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={field.value || checked}
                disabled={disabled}
                required={required}
              />
            }
            label={label}
          />
          {(error?.message || helperText) && (
            <FormHelperText error={!!error}>
              {error?.message || helperText}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
};

// Form section component for grouping fields
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      {children}
    </Box>
  );
};

export default {
  FormTextField,
  FormSelectField,
  FormCheckboxField,
  FormSwitchField,
  FormSection,
};
