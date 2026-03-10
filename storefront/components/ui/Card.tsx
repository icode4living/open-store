interface CardProps {
  children: React.ReactNode;
  classes?: string;
  elevated?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  classes = '',
  elevated = false,
  onClick,
}) => (
  <div
    className={`card${elevated ? ' card--elevated' : ''}${onClick ? ' card--clickable' : ''} ${classes}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    {children}
  </div>
);