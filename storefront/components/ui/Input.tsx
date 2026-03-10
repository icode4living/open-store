export type InputType = 'number' | 'text' | 'email' | 'search';

interface InputProps {
  type: InputType;
  label?: string;
  placeholder?: string;
  value: string | number;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
  classes?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  type,
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  classes = '',
  icon,
}) => (
  <div className={`input-wrap${error ? ' input-wrap--error' : ''} ${classes}`}>
    {label && <label className="input-label t-caption">{label}</label>}
    <div className="input-inner">
      {icon && <span className="input-icon">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`input-field${icon ? ' input-field--with-icon' : ''}`}
      />
    </div>
    {error && <p className="input-error t-body-sm">{error}</p>}
  </div>
);
