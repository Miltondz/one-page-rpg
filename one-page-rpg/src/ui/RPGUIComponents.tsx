import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

/**
 * Declaración global para RPGUI
 */
declare global {
  interface Window {
    RPGUI: {
      create: (element: HTMLElement, type: string) => void;
      set_value: (element: HTMLElement, value: unknown) => void;
      get_value: (element: HTMLElement) => unknown;
    };
  }
}

/* ==================== CONTAINERS ==================== */

interface RPGUIContainerProps {
  children: ReactNode;
  frameType?: 'framed' | 'framed-golden' | 'framed-golden-2' | 'framed-grey' | 'none';
  draggable?: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

/**
 * Contenedor RPGUI - Equivalente a <div class="rpgui-container framed">
 */
export const RPGUIContainer: React.FC<RPGUIContainerProps> = ({
  children,
  frameType = 'framed',
  draggable = false,
  className = '',
  id,
  style,
}) => {
  const classes = [
    'rpgui-container',
    frameType !== 'none' ? frameType : '',
    draggable ? 'rpgui-draggable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div id={id} className={classes} style={style}>
      {children}
    </div>
  );
};

/**
 * Contenedor de contenido RPGUI principal
 * Debe envolver toda la aplicación RPGUI
 */
export const RPGUIContent: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <div className="rpgui-content">{children}</div>;
};

/* ==================== BUTTONS ==================== */

interface RPGUIButtonProps {
  children: ReactNode;
  onClick?: () => void;
  golden?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

/**
 * Botón RPGUI - Equivalente a <button class="rpgui-button"><p>Text</p></button>
 */
export const RPGUIButton: React.FC<RPGUIButtonProps> = ({
  children,
  onClick,
  golden = false,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  const classes = ['rpgui-button', golden ? 'golden' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      <p>{children}</p>
    </button>
  );
};

/* ==================== PROGRESS BARS ==================== */

interface RPGUIProgressProps {
  value: number; // 0.0 a 1.0
  color?: 'purple' | 'red' | 'green' | 'blue';
  className?: string;
  id?: string;
}

/**
 * Barra de progreso RPGUI - Equivalente a <div class="rpgui-progress red"></div>
 */
export const RPGUIProgress: React.FC<RPGUIProgressProps> = ({
  value,
  color = 'purple',
  className = '',
  id,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current && window.RPGUI) {
      window.RPGUI.set_value(progressRef.current, Math.max(0, Math.min(1, value)));
    }
  }, [value]);

  const classes = [
    'rpgui-progress',
    color !== 'purple' ? color : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div ref={progressRef} id={id} className={classes}></div>;
};

/* ==================== SLIDERS ==================== */

interface RPGUISliderProps {
  min?: number;
  max?: number;
  value: number;
  onChange?: (value: number) => void;
  golden?: boolean;
  className?: string;
}

/**
 * Slider RPGUI - Equivalente a <input class="rpgui-slider" type="range" />
 */
export const RPGUISlider: React.FC<RPGUISliderProps> = ({
  min = 0,
  max = 10,
  value,
  onChange,
  golden = false,
  className = '',
}) => {
  const classes = ['rpgui-slider', golden ? 'golden' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <input
      className={classes}
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange?.(Number(e.target.value))}
    />
  );
};

/* ==================== CHECKBOXES ==================== */

interface RPGUICheckboxProps {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  golden?: boolean;
  disabled?: boolean;
}

/**
 * Checkbox RPGUI - Equivalente a <input class="rpgui-checkbox" /><label>Text</label>
 */
export const RPGUICheckbox: React.FC<RPGUICheckboxProps> = ({
  label,
  checked,
  onChange,
  golden = false,
  disabled = false,
}) => {
  const classes = ['rpgui-checkbox', golden ? 'golden' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <input
        className={classes}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <label>{label}</label>
    </>
  );
};

/* ==================== RADIO BUTTONS ==================== */

interface RPGUIRadioProps {
  label: string;
  name: string;
  value: string;
  checked: boolean;
  onChange?: (value: string) => void;
  golden?: boolean;
  disabled?: boolean;
}

/**
 * Radio button RPGUI - Equivalente a <input class="rpgui-radio" /><label>Text</label>
 */
export const RPGUIRadio: React.FC<RPGUIRadioProps> = ({
  label,
  name,
  value,
  checked,
  onChange,
  golden = false,
  disabled = false,
}) => {
  const classes = ['rpgui-radio', golden ? 'golden' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <input
        className={classes}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
        disabled={disabled}
      />
      <label>{label}</label>
    </>
  );
};

/* ==================== ICONS ==================== */

type RPGUIIconType =
  | 'sword'
  | 'shield'
  | 'exclamation'
  | 'potion-red'
  | 'potion-green'
  | 'potion-blue'
  | 'weapon-slot'
  | 'shield-slot'
  | 'armor-slot'
  | 'helmet-slot'
  | 'ring-slot'
  | 'potion-slot'
  | 'magic-slot'
  | 'shoes-slot'
  | 'empty-slot';

interface RPGUIIconProps {
  icon: RPGUIIconType;
  className?: string;
}

/**
 * Icono RPGUI - Equivalente a <div class="rpgui-icon sword"></div>
 */
export const RPGUIIcon: React.FC<RPGUIIconProps> = ({ icon, className = '' }) => {
  return <div className={`rpgui-icon ${icon} ${className}`}></div>;
};

/* ==================== DROPDOWN ==================== */

interface RPGUIDropdownProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

/**
 * Dropdown RPGUI - Equivalente a <select class="rpgui-dropdown">
 */
export const RPGUIDropdown: React.FC<RPGUIDropdownProps> = ({
  options,
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <select
      className="rpgui-dropdown"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

/* ==================== HORIZONTAL RULE ==================== */

interface RPGUIHRProps {
  golden?: boolean;
}

/**
 * Línea horizontal RPGUI - Equivalente a <hr /> o <hr class="golden" />
 */
export const RPGUIHR: React.FC<RPGUIHRProps> = ({ golden = false }) => {
  return <hr className={golden ? 'golden' : ''} />;
};

/* ==================== INPUT & TEXTAREA ==================== */

interface RPGUIInputProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'password' | 'number';
}

/**
 * Input text RPGUI - Se estiliza automáticamente dentro de rpgui-content
 */
export const RPGUIInput: React.FC<RPGUIInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  type = 'text',
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

interface RPGUITextareaProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

/**
 * Textarea RPGUI - Se estiliza automáticamente dentro de rpgui-content
 */
export const RPGUITextarea: React.FC<RPGUITextareaProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  rows = 4,
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
    />
  );
};
